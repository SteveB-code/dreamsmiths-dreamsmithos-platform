import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complianceRequirement } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/compliance/requirements/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [found] = await db
    .select()
    .from(complianceRequirement)
    .where(eq(complianceRequirement.id, id))
    .limit(1);

  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(found);
}

// PATCH /api/compliance/requirements/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const { name, description, frequency, appliesTo, evidenceType } = body;

  const [updated] = await db
    .update(complianceRequirement)
    .set({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(frequency !== undefined && { frequency }),
      ...(appliesTo !== undefined && { appliesTo }),
      ...(evidenceType !== undefined && { evidenceType }),
      updatedAt: new Date(),
    })
    .where(eq(complianceRequirement.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/compliance/requirements/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [deleted] = await db
    .delete(complianceRequirement)
    .where(eq(complianceRequirement.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
