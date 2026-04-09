import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contract, platform } from "@/db/schema";
import { and, asc, eq, gte, lte, not } from "drizzle-orm";

// GET /api/contracts/renewals — upcoming contract renewals
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const months = parseInt(searchParams.get("months") || "4", 10);

  const now = new Date();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + months);

  const renewals = await db
    .select({
      id: contract.id,
      platformId: contract.platformId,
      title: contract.title,
      fileUrl: contract.fileUrl,
      fileName: contract.fileName,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      notes: contract.notes,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      platformName: platform.name,
      clientOrg: platform.clientOrg,
    })
    .from(contract)
    .innerJoin(platform, eq(contract.platformId, platform.id))
    .where(
      and(
        gte(contract.endDate, now),
        lte(contract.endDate, futureDate),
        not(eq(contract.status, "renewed")),
      ),
    )
    .orderBy(asc(contract.endDate));

  return NextResponse.json(renewals);
}
