import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { milestone, milestoneType, person } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

// GET /api/platforms/:id/milestones — list milestones for a platform
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const fy = searchParams.get("fy");

  const conditions = fy
    ? and(eq(milestone.platformId, id), eq(milestone.financialYear, fy))
    : eq(milestone.platformId, id);

  const rows = await db
    .select({
      id: milestone.id,
      platformId: milestone.platformId,
      milestoneTypeId: milestone.milestoneTypeId,
      financialYear: milestone.financialYear,
      status: milestone.status,
      dueDate: milestone.dueDate,
      completedDate: milestone.completedDate,
      completedLate: milestone.completedLate,
      ownerPersonId: milestone.ownerPersonId,
      notes: milestone.notes,
      createdAt: milestone.createdAt,
      // Joined fields
      typeName: milestoneType.name,
      typeCategory: milestoneType.category,
      typeFrequency: milestoneType.frequency,
      typeSchedulingRule: milestoneType.schedulingRule,
      typeArtifactMode: milestoneType.artifactMode,
      typeArtifactRequired: milestoneType.artifactRequired,
      ownerFirstName: person.firstName,
      ownerLastName: person.lastName,
    })
    .from(milestone)
    .innerJoin(milestoneType, eq(milestone.milestoneTypeId, milestoneType.id))
    .leftJoin(person, eq(milestone.ownerPersonId, person.id))
    .where(conditions)
    .orderBy(asc(milestone.dueDate));

  return NextResponse.json(rows);
}

// POST /api/platforms/:id/milestones — create a single milestone
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const { milestoneTypeId, financialYear, dueDate, ownerPersonId, notes } =
    body;

  if (!milestoneTypeId || !financialYear) {
    return NextResponse.json(
      { error: "milestoneTypeId and financialYear are required" },
      { status: 400 },
    );
  }

  const [created] = await db
    .insert(milestone)
    .values({
      platformId: id,
      milestoneTypeId,
      financialYear,
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(ownerPersonId && { ownerPersonId }),
      ...(notes && { notes }),
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
