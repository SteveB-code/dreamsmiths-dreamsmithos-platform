import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complianceRequirement } from "@/db/schema";
import { asc } from "drizzle-orm";

// GET /api/compliance/requirements — list all compliance requirements
export async function GET() {
  const requirements = await db
    .select()
    .from(complianceRequirement)
    .orderBy(asc(complianceRequirement.name));

  return NextResponse.json(requirements);
}

// POST /api/compliance/requirements — create a new requirement
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, frequency, appliesTo, evidenceType } = body;

  if (!name || !frequency || !evidenceType) {
    return NextResponse.json(
      { error: "name, frequency, and evidenceType are required" },
      { status: 400 },
    );
  }

  const [requirement] = await db
    .insert(complianceRequirement)
    .values({
      name,
      description: description || null,
      frequency,
      appliesTo: appliesTo || null,
      evidenceType,
    })
    .returning();

  return NextResponse.json(requirement, { status: 201 });
}
