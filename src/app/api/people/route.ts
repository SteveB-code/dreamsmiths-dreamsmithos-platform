import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { person, personTechnology, technology } from "@/db/schema";
import { desc, eq, ilike, or, inArray } from "drizzle-orm";

// GET /api/people — list all people, with optional search and tech filter
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const type = searchParams.get("type") as "contractor" | "employee" | null;
  const techId = searchParams.get("technology");

  let query = db.select().from(person).orderBy(desc(person.createdAt)).$dynamic();

  if (search) {
    query = query.where(
      or(
        ilike(person.firstName, `%${search}%`),
        ilike(person.lastName, `%${search}%`),
        ilike(person.email, `%${search}%`),
      ),
    );
  }

  if (type) {
    query = query.where(eq(person.type, type));
  }

  let people = await query;

  // Filter by technology if specified
  if (techId) {
    const personIds = await db
      .select({ personId: personTechnology.personId })
      .from(personTechnology)
      .where(eq(personTechnology.technologyId, techId));
    const ids = personIds.map((p) => p.personId);
    people = people.filter((p) => ids.includes(p.id));
  }

  return NextResponse.json(people);
}

// POST /api/people — create a new person
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { firstName, lastName, email, phone, type, address, technologyIds } = body;

  if (!firstName || !lastName || !email || !type) {
    return NextResponse.json(
      { error: "firstName, lastName, email, and type are required" },
      { status: 400 },
    );
  }

  const [newPerson] = await db
    .insert(person)
    .values({
      firstName,
      lastName,
      email,
      phone: phone || null,
      address: address || null,
      type,
    })
    .returning();

  // Link technologies if provided
  if (technologyIds?.length) {
    await db.insert(personTechnology).values(
      technologyIds.map((tid: string) => ({
        personId: newPerson.id,
        technologyId: tid,
      })),
    );
  }

  return NextResponse.json(newPerson, { status: 201 });
}
