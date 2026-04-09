import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playbookItem } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/playbook/[id] — get a single playbook item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [item] = await db
    .select()
    .from(playbookItem)
    .where(eq(playbookItem.id, id));

  if (!item) {
    return NextResponse.json(
      { error: "Playbook item not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

// PATCH /api/playbook/[id] — update a playbook item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(playbookItem)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(playbookItem.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Playbook item not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

// DELETE /api/playbook/[id] — delete a playbook item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [deleted] = await db
    .delete(playbookItem)
    .where(eq(playbookItem.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { error: "Playbook item not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
