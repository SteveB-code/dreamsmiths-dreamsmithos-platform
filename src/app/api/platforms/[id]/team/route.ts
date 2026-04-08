import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { platformAssignment } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// POST /api/platforms/:id/team — assign a person to a platform
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: platformId } = await params;
  const body = await request.json();

  const { personId, roleOnPlatform } = body;

  if (!personId || !roleOnPlatform) {
    return NextResponse.json(
      { error: "personId and roleOnPlatform are required" },
      { status: 400 },
    );
  }

  // Check for existing active assignment
  const [existing] = await db
    .select()
    .from(platformAssignment)
    .where(
      and(
        eq(platformAssignment.platformId, platformId),
        eq(platformAssignment.personId, personId),
        eq(platformAssignment.isActive, true),
      ),
    )
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "Person is already assigned to this platform" },
      { status: 409 },
    );
  }

  const [assignment] = await db
    .insert(platformAssignment)
    .values({
      platformId,
      personId,
      roleOnPlatform,
    })
    .returning();

  return NextResponse.json(assignment, { status: 201 });
}

// DELETE /api/platforms/:id/team — remove a person from a platform
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: platformId } = await params;
  const { searchParams } = request.nextUrl;
  const assignmentId = searchParams.get("assignmentId");

  if (!assignmentId) {
    return NextResponse.json(
      { error: "assignmentId is required" },
      { status: 400 },
    );
  }

  const [removed] = await db
    .update(platformAssignment)
    .set({ isActive: false, dateRemoved: new Date() })
    .where(
      and(
        eq(platformAssignment.id, assignmentId),
        eq(platformAssignment.platformId, platformId),
      ),
    )
    .returning();

  if (!removed) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
