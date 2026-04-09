import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complianceRecord } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/compliance/records/:id — update a compliance record (status, notes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const { status, notes, submittedDate, verifiedBy, evidenceDocumentId } = body;

  const [updated] = await db
    .update(complianceRecord)
    .set({
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(submittedDate !== undefined && {
        submittedDate: new Date(submittedDate),
      }),
      ...(verifiedBy !== undefined && { verifiedBy }),
      ...(evidenceDocumentId !== undefined && { evidenceDocumentId }),
      updatedAt: new Date(),
    })
    .where(eq(complianceRecord.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
