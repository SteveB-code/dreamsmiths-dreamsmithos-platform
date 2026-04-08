import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { person } from "@/db/schema";
import { desc, eq, ilike, or } from "drizzle-orm";

// GET /api/people — list all people, with optional search
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const type = searchParams.get("type") as "contractor" | "employee" | null;

  let query = db.select().from(person).orderBy(desc(person.createdAt)).$dynamic();

  if (search) {
    query = query.where(
      or(
        ilike(person.fullName, `%${search}%`),
        ilike(person.email, `%${search}%`),
      ),
    );
  }

  if (type) {
    query = query.where(eq(person.type, type));
  }

  const people = await query;
  return NextResponse.json(people);
}

// POST /api/people — create a new person
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { fullName, email, phone, type, address } = body;

  if (!fullName || !email || !type) {
    return NextResponse.json(
      { error: "fullName, email, and type are required" },
      { status: 400 },
    );
  }

  const [newPerson] = await db
    .insert(person)
    .values({
      fullName,
      email,
      phone: phone || null,
      address: address || null,
      type,
    })
    .returning();

  return NextResponse.json(newPerson, { status: 201 });
}
