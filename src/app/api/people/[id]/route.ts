import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { person, platformAssignment, platform } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/people/:id — get a single person with platform assignments
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [found] = await db
    .select()
    .from(person)
    .where(eq(person.id, id))
    .limit(1);

  if (!found) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  // Get platform assignments
  const assignments = await db
    .select({
      assignmentId: platformAssignment.id,
      platformId: platform.id,
      platformName: platform.name,
      clientOrg: platform.clientOrg,
      roleOnPlatform: platformAssignment.roleOnPlatform,
      isActive: platformAssignment.isActive,
    })
    .from(platformAssignment)
    .innerJoin(platform, eq(platformAssignment.platformId, platform.id))
    .where(eq(platformAssignment.personId, id));

  return NextResponse.json({ ...found, platforms: assignments });
}

// PATCH /api/people/:id — update a person
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const { fullName, email, phone, type, status, address } = body;

  const [updated] = await db
    .update(person)
    .set({
      ...(fullName !== undefined && { fullName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(address !== undefined && { address }),
      updatedAt: new Date(),
    })
    .where(eq(person.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/people/:id — delete a person
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [deleted] = await db
    .delete(person)
    .where(eq(person.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
