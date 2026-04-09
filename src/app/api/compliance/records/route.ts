import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  complianceRecord,
  complianceRequirement,
  person,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET /api/compliance/records — list compliance records, optionally filtered by personId
export async function GET(request: NextRequest) {
  const personId = request.nextUrl.searchParams.get("personId");
  const status = request.nextUrl.searchParams.get("status") as
    | "pending"
    | "submitted"
    | "verified"
    | "overdue"
    | "not_applicable"
    | null;

  const records = await db
    .select({
      id: complianceRecord.id,
      personId: complianceRecord.personId,
      firstName: person.firstName,
      lastName: person.lastName,
      requirementId: complianceRecord.requirementId,
      requirementName: complianceRequirement.name,
      frequency: complianceRequirement.frequency,
      status: complianceRecord.status,
      dueDate: complianceRecord.dueDate,
      submittedDate: complianceRecord.submittedDate,
      notes: complianceRecord.notes,
      createdAt: complianceRecord.createdAt,
    })
    .from(complianceRecord)
    .innerJoin(person, eq(complianceRecord.personId, person.id))
    .innerJoin(
      complianceRequirement,
      eq(complianceRecord.requirementId, complianceRequirement.id),
    )
    .orderBy(desc(complianceRecord.dueDate));

  let filtered = records;
  if (personId) {
    filtered = filtered.filter((r) => r.personId === personId);
  }
  if (status) {
    filtered = filtered.filter((r) => r.status === status);
  }

  return NextResponse.json(filtered);
}

// POST /api/compliance/records — create a compliance record for a person
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { personId, requirementId, dueDate, notes } = body;

  if (!personId || !requirementId || !dueDate) {
    return NextResponse.json(
      { error: "personId, requirementId, and dueDate are required" },
      { status: 400 },
    );
  }

  const [record] = await db
    .insert(complianceRecord)
    .values({
      personId,
      requirementId,
      dueDate: new Date(dueDate),
      notes: notes || null,
    })
    .returning();

  return NextResponse.json(record, { status: 201 });
}
