import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  platform,
  platformAssignment,
  person,
  platformTechnology,
  technology,
} from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/platforms/:id — get a single platform with team and technologies
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [found] = await db
    .select()
    .from(platform)
    .where(eq(platform.id, id))
    .limit(1);

  if (!found) {
    return NextResponse.json(
      { error: "Platform not found" },
      { status: 404 },
    );
  }

  // Get team members
  const team = await db
    .select({
      assignmentId: platformAssignment.id,
      personId: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      type: person.type,
      roleOnPlatform: platformAssignment.roleOnPlatform,
      isActive: platformAssignment.isActive,
    })
    .from(platformAssignment)
    .innerJoin(person, eq(platformAssignment.personId, person.id))
    .where(eq(platformAssignment.platformId, id));

  // Get technologies
  const techs = await db
    .select({
      id: technology.id,
      name: technology.name,
      category: technology.category,
    })
    .from(platformTechnology)
    .innerJoin(
      technology,
      eq(platformTechnology.technologyId, technology.id),
    )
    .where(eq(platformTechnology.platformId, id));

  return NextResponse.json({ ...found, team, technologies: techs });
}

// PATCH /api/platforms/:id — update a platform
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const {
    name, clientOrg, status, retainerTier, description, technologyIds,
    financialYearStartDay, financialYearStartMonth, budgetPreparationMonth,
    strategicPlanningWindowStart, strategicPlanningWindowEnd, planningCycleNotes,
  } = body;

  const [updated] = await db
    .update(platform)
    .set({
      ...(name !== undefined && { name }),
      ...(clientOrg !== undefined && { clientOrg }),
      ...(status !== undefined && { status }),
      ...(retainerTier !== undefined && { retainerTier }),
      ...(description !== undefined && { description }),
      ...(financialYearStartDay !== undefined && { financialYearStartDay }),
      ...(financialYearStartMonth !== undefined && { financialYearStartMonth }),
      ...(budgetPreparationMonth !== undefined && { budgetPreparationMonth }),
      ...(strategicPlanningWindowStart !== undefined && { strategicPlanningWindowStart }),
      ...(strategicPlanningWindowEnd !== undefined && { strategicPlanningWindowEnd }),
      ...(planningCycleNotes !== undefined && { planningCycleNotes }),
      updatedAt: new Date(),
    })
    .where(eq(platform.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Platform not found" },
      { status: 404 },
    );
  }

  // Update technologies if provided
  if (technologyIds !== undefined) {
    await db
      .delete(platformTechnology)
      .where(eq(platformTechnology.platformId, id));

    if (technologyIds.length > 0) {
      await db.insert(platformTechnology).values(
        technologyIds.map((tid: string) => ({
          platformId: id,
          technologyId: tid,
        })),
      );
    }
  }

  return NextResponse.json(updated);
}

// DELETE /api/platforms/:id — delete a platform
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [deleted] = await db
    .delete(platform)
    .where(eq(platform.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { error: "Platform not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
