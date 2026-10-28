import db from '@/src/db/mysql';
import { profileData } from '@/src/db/schema/user';
import { WishlistData, WishlistItemData } from '@/src/db/schema/wishlist';
import { like, eq, and, inArray, SQL, sql } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const email = session?.user.email;
    const body = await request.json();
    const id = body.id;
    const selectedIds = body.selectedIds;
    const values = body.values;

    let rows = null;
    [rows] = await db
        .select()
        .from(profileData)
        .where(like(profileData.eMail, email as string));
    const userId = rows.id;

    if (!userId) {
        return NextResponse.json(
            {
                error: true,
            },
            { status: 500 }
        );
    }

    [rows] = await db
        .select()
        .from(WishlistData)
        .where(and(eq(WishlistData.userId, userId), eq(WishlistData.id, id)));
    const wishlistId = rows.id;

    if (!wishlistId) {
        return NextResponse.json(
            {
                error: true,
            },
            { status: 500 }
        );
    }

    if (selectedIds.length === 0) {
        return NextResponse.json(
            {
                error: true,
            },
            { status: 500 }
        );
    }

    try {
        const sqlChunks: SQL[] = [];

        sqlChunks.push(sql`UPDATE \`mtg.wishlistitems\` SET`);

        let first = true;
        if (values.price) {
            first = false;
            sqlChunks.push(sql`price = ${values.price}`);
        }

        if (values.quantity) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            sqlChunks.push(sql`quantity = ${values.quantity}`);
        }

        if (values.language) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            let languages: string[] = [];
            values.language.map((language: any) => {
                languages.push(language.code);
            });
            sqlChunks.push(sql`language = ${languages.join(',')}`);
        }

        if (values.quality) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            sqlChunks.push(sql`quality = ${values.quality}`);
        }

        if (values.comment) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            sqlChunks.push(sql`comment = ${values.comment}`);
        }

        if (values.isFoil) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            if (values.isFoil === 'true') {
                sqlChunks.push(sql`isFoil = 1`);
            } else {
                sqlChunks.push(sql`isFoil = 0`);
            }
        }

        if (values.isAltered) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            if (values.isAltered === 'true') {
                sqlChunks.push(sql`isAltered = 1`);
            } else {
                sqlChunks.push(sql`isAltered = 0`);
            }
        }

        if (values.isSigned) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            if (values.isSigned === 'true') {
                sqlChunks.push(sql`isSigned = 1`);
            } else {
                sqlChunks.push(sql`isSigned = 0`);
            }
        }

        if (values.isMisprint) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            if (values.isMisprint === 'true') {
                sqlChunks.push(sql`isMisprint = 1`);
            } else {
                sqlChunks.push(sql`isMisprint = 0`);
            }
        }

        if (values.isGraded) {
            if (!first) {
                sqlChunks.push(sql`, `);
            } else {
                first = false;
            }
            if (values.isGraded === 'true') {
                sqlChunks.push(sql`isGraded = 1`);
            } else {
                sqlChunks.push(sql`isGraded = 0`);
            }
        }

        sqlChunks.push(sql` WHERE wishlistId = ${wishlistId} AND id IN ${selectedIds};`);

        const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
        const [result] = await db.execute(finalSql);

        return NextResponse.json({ success: true, count: result.affectedRows });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error,
            },
            { status: 500 }
        );
    }
}
