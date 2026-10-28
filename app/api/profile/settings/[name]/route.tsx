import db from '@/src/db/mysql';
import { profileData, profileSettingsData } from '@/src/db/schema/user';
import { eq, and, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ name: string }> }) {
    const params = await props.params;
    const name = params.name;
    const session = await getServerSession();
    const email = session?.user.email;

    if (!email) {
        return NextResponse.json({ error: true }, { status: 500 });
    }

    try {
        let userRows = null;
        [userRows] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));
        const userId = userRows.id;
        if (!userId) {
            return NextResponse.json({ error: true }, { status: 500 });
        }

        const [rows] = await db
            .select()
            .from(profileSettingsData)
            .where(and(eq(profileSettingsData.name, name as string), eq(profileSettingsData.userId, userId)));
        return NextResponse.json({ value: (rows as any).value, success: true });
    } catch (error) {
        return NextResponse.json({ error: true }, { status: 500 });
    }
}

export async function POST(request: NextRequest, props: { params: Promise<{ name: string }> }) {
    const params = await props.params;
    const name = params.name;
    const body = await request.json();
    const value = body.value;
    const session = await getServerSession();
    const email = session?.user.email;

    if (!email) {
        return NextResponse.json({ error: true }, { status: 500 });
    }

    try {
        let rows = null;
        [rows] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));
        const userId = rows.id;
        if (!userId) {
            return NextResponse.json({ error: true }, { status: 500 });
        }

        const exists = await db
            .select()
            .from(profileSettingsData)
            .where(and(eq(profileSettingsData.name, name as string), eq(profileSettingsData.userId, userId)));
        if (exists.length === 0) {
            await db.insert(profileSettingsData).values({ userId: userId, name: name, value: value });
        } else {
            await db
                .update(profileSettingsData)
                .set({ value: value })
                .where(and(eq(profileSettingsData.name, name as string), eq(profileSettingsData.userId, userId)));
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: true }, { status: 500 });
    }
}
