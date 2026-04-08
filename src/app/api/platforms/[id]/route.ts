import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { platform, platformAssignment, person } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/platforms/:id — get a single platform with team
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
      fullName: person.fullName,
      email: person.email,
      type: person.type,
      roleOnPlatform: platformAssignment.roleOnPlatform,
      isActive: platformAssignment.isActive,
    })
    .from(platformAssignment)
    .innerJoin(person, eq(platformAssignment.personId, person.id))
    .where(eq(platformAssignment.platformId, id));

  return NextResponse.json({ ...found, team });
}

// PATCH /api/platforms/:id — update a platform
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const { name, clientOrg, status, retainerTier, techStack, description } =
    body;

  const [updated] = await db
    .update(platform)
    .set({
      ...(name !== undefined && { name }),
      ...(clientOrg !== undefined && { clientOrg }),
      ...(status !== undefined && { status }),
      ...(retainerTier !== undefined && { retainerTier }),
      ...(techStack !== undefined && { techStack }),
      ...(description !== undefined && { description }),
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
