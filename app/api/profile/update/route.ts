import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";
import { profileData } from "../../../../src/db/schema/user";
import { fundsData } from "@/src/db/schema/funds";
import { createSession, getServerSession, payloadFromProfile } from "@/src/lib/auth/session";

/**
 * Profile completion and later edits.
 *
 * Since registration creates the `profiledata` row (src/lib/auth/actions.ts),
 * this is always an UPDATE. It used to INSERT when the client sent
 * `firstSet: true` - a client-controlled, unauthenticated row creation that
 * would now collide with the row registration already made.
 *
 * The row is addressed by `session.userId`, not by the email string, so the
 * request cannot be pointed at somebody else's profile.
 */
export async function POST(
    request: NextRequest
) {
    const body = await request.json();
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
    }

    const userName = body.userName;
    const firstName = body.firstName;
    const lastName = body.lastName;
    const company = body.company;
    const address = body.address;
    const country = body.country;

    try {
        const rows = await db
            .select({ id: profileData.id, userName: profileData.userName })
            .from(profileData)
            .where(eq(profileData.id, session.userId));

        const existing = rows[0];
        if (!existing) {
            return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
        }

        // The username is claimed once and then fixed - the profile form
        // disables the field afterwards, and other users link to it by name.
        const claimsUserName = !existing.userName && Boolean(userName);

        await db
            .update(profileData)
            .set({
                firstName: firstName,
                lastName: lastName,
                company: company,
                address: address,
                country: country,
                ...(claimsUserName ? { userName: userName } : {}),
            })
            .where(eq(profileData.id, existing.id));

        // Registration creates this; kept for rows that predate local login.
        const funds = await db
            .select({ id: fundsData.id })
            .from(fundsData)
            .where(eq(fundsData.userId, existing.id));

        if (funds.length === 0) {
            await db.insert(fundsData).values({ userId: existing.id, funds: "0" });
        }

        if (claimsUserName) {
            // `userName` is part of the session cookie, so the cookie has to be
            // re-issued or the client would keep seeing the old null and the
            // onboarding redirect would fire forever.
            const updated = await db
                .select({
                    id: profileData.id,
                    eMail: profileData.eMail,
                    userName: profileData.userName,
                    roles: profileData.roles,
                })
                .from(profileData)
                .where(eq(profileData.id, existing.id));

            if (updated[0]) {
                await createSession(payloadFromProfile(updated[0]));
            }
        }

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        console.error('[profile] update failed', error);
        return NextResponse.json({
            success: false,
            error: true
        }, { status: 500 })
    }
}
