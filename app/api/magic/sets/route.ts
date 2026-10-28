import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";

export async function GET(request: NextRequest) {
  try {
    // Using raw SQL since we don't have the schema object for mtg.sets 
    const [sets] = await db.execute(
      sql`SELECT code, name FROM \`mtg.sets\``
    );
    
    return NextResponse.json({ sets });
  } catch (error) {
    console.error('Error fetching sets from database:', error);
    return NextResponse.json({ 
      error: `Failed to fetch sets: ${error}` 
    }, { status: 500 });
  }
}