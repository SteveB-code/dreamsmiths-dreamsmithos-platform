import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contract, platform } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

// GET /api/contracts — list all contracts with platform info
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") as
    | "active"
    | "expiring_soon"
    | "expired"
    | "renewed"
    | null;

  let query = db
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
      uploadedBy: contract.uploadedBy,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      platformName: platform.name,
      clientOrg: platform.clientOrg,
    })
    .from(contract)
    .innerJoin(platform, eq(contract.platformId, platform.id))
    .orderBy(asc(contract.endDate))
    .$dynamic();

  if (status) {
    query = query.where(eq(contract.status, status));
  }

  const contracts = await query;

  return NextResponse.json(contracts);
}

// POST /api/contracts — create a new contract
export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    platformId,
    title,
    startDate,
    endDate,
    notes,
    fileName,
    fileUrl,
    fileSize,
    mimeType,
  } = body;

  if (!platformId || !title || !startDate || !endDate) {
    return NextResponse.json(
      { error: "platformId, title, startDate, and endDate are required" },
      { status: 400 },
    );
  }

  const [newContract] = await db
    .insert(contract)
    .values({
      platformId,
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes: notes || null,
      fileName: fileName || null,
      fileUrl: fileUrl || null,
      fileSize: fileSize || null,
      mimeType: mimeType || null,
    })
    .returning();

  return NextResponse.json(newContract, { status: 201 });
}
