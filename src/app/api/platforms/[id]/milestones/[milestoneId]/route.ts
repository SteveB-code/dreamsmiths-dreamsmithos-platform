import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { milestone } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/platforms/:id/milestones/:milestoneId — update a milestone
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> },
) {
  const { milestoneId } = await params;
  const body = await request.json();

  const { dueDate, ownerPersonId, notes, status } = body;

  const [updated] = await db
    .update(milestone)
    .set({
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(ownerPersonId !== undefined && { ownerPersonId }),
      ...(notes !== undefined && { notes }),
      ...(status !== undefined && { status }),
      updatedAt: new Date(),
    })
    .where(eq(milestone.id, milestoneId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/platforms/:id/milestones/:milestoneId — delete a milestone
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> },
) {
  const { milestoneId } = await params;

  const [deleted] = await db
    .delete(milestone)
    .where(eq(milestone.id, milestoneId))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
