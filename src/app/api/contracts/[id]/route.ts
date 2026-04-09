import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contract, platform, person } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/contracts/:id — get a single contract with platform and owner info
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [found] = await db
    .select({
      id: contract.id,
      platformId: contract.platformId,
      title: contract.title,
      fileUrl: contract.fileUrl,
      fileName: contract.fileName,
      fileSize: contract.fileSize,
      mimeType: contract.mimeType,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      notes: contract.notes,
      ownerId: contract.ownerId,
      ownerFirstName: person.firstName,
      ownerLastName: person.lastName,
      uploadedBy: contract.uploadedBy,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      platformName: platform.name,
      clientOrg: platform.clientOrg,
    })
    .from(contract)
    .innerJoin(platform, eq(contract.platformId, platform.id))
    .leftJoin(person, eq(contract.ownerId, person.id))
    .where(eq(contract.id, id))
    .limit(1);

  if (!found) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json(found);
}

// PATCH /api/contracts/:id — update a contract
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const {
    title,
    startDate,
    endDate,
    notes,
    status,
    ownerId,
    fileUrl,
    fileName,
    fileSize,
    mimeType,
  } = body;

  const [updated] = await db
    .update(contract)
    .set({
      ...(title !== undefined && { title }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(notes !== undefined && { notes }),
      ...(status !== undefined && { status }),
      ...(ownerId !== undefined && { ownerId: ownerId || null }),
      ...(fileUrl !== undefined && { fileUrl }),
      ...(fileName !== undefined && { fileName }),
      ...(fileSize !== undefined && { fileSize }),
      ...(mimeType !== undefined && { mimeType }),
      updatedAt: new Date(),
    })
    .where(eq(contract.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/contracts/:id — delete a contract
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [deleted] = await db
    .delete(contract)
    .where(eq(contract.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
