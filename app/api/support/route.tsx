import db from '@/src/db/mysql';
import { supportTicketsData } from '@/src/db/schema/support';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();

    try {
        // Create support ticket record
        await db.insert(supportTicketsData).values({
            id: uuidv4(), // Generate a unique ID
            userId: session?.user?.email ? session.user.email : null,
            category: body.values.category,
            subject: body.values.subject,
            message: body.values.message,
            contactEmail: body.values.email || session?.user?.email || null,
            createdAt: new Date(),
            status: 'open',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        return NextResponse.json({ error: true, message: 'Failed to create support ticket' }, { status: 500 });
    }
}
