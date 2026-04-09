import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { milestone, milestoneType, platform } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function getQuarterEndDates(
  fyStartDay: number,
  fyStartMonth: number,
  fyStartYear: number,
) {
  const quarters: Date[] = [];
  for (let q = 1; q <= 3; q++) {
    const monthOffset = q * 3;
    const endMonth = (fyStartMonth - 1 + monthOffset) % 12; // 0-indexed
    const endYear =
      fyStartYear + Math.floor((fyStartMonth - 1 + monthOffset) / 12);
    // Last day of that month
    const lastDay = new Date(endYear, endMonth + 1, 0).getDate();
    quarters.push(new Date(endYear, endMonth, lastDay));
  }
  return quarters;
}

function getFYEndDate(
  fyStartDay: number,
  fyStartMonth: number,
  fyStartYear: number,
) {
  // End of FY is the day before the next FY start
  const nextFYStart = new Date(
    fyStartYear + 1,
    fyStartMonth - 1,
    fyStartDay,
  );
  nextFYStart.setDate(nextFYStart.getDate() - 1);
  return nextFYStart;
}

// POST /api/platforms/:id/milestones/generate — generate annual cycle of milestones
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { financialYear } = body;

  if (!financialYear) {
    return NextResponse.json(
      { error: "financialYear is required (e.g. 'FY 2026/27')" },
      { status: 400 },
    );
  }

  // 1. Fetch the platform to get FY start config
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

  if (!found.financialYearStartDay || !found.financialYearStartMonth) {
    return NextResponse.json(
      {
        error:
          "Financial year start not configured for this platform. Set financialYearStartDay and financialYearStartMonth first.",
      },
      { status: 400 },
    );
  }

  const fyStartDay = found.financialYearStartDay;
  const fyStartMonth = found.financialYearStartMonth;

  // Parse FY start year from financialYear string (e.g. "FY 2026/27")
  const fyMatch = financialYear.match(/FY (\d{4})/);
  const fyStartYear = fyMatch
    ? parseInt(fyMatch[1])
    : new Date().getFullYear();

  // 2. Fetch all active milestone types
  const types = await db
    .select()
    .from(milestoneType)
    .where(eq(milestoneType.isActive, true));

  if (types.length === 0) {
    return NextResponse.json(
      { error: "No active milestone types found" },
      { status: 400 },
    );
  }

  // 3. Check existing milestones for this platform + FY
  const existing = await db
    .select()
    .from(milestone)
    .where(
      and(
        eq(milestone.platformId, id),
        eq(milestone.financialYear, financialYear),
      ),
    );

  // Group existing by milestoneTypeId to check counts
  const existingByType = new Map<string, number>();
  for (const m of existing) {
    const count = existingByType.get(m.milestoneTypeId) || 0;
    existingByType.set(m.milestoneTypeId, count + 1);
  }

  // 4. Generate milestones
  const quarterEndDates = getQuarterEndDates(
    fyStartDay,
    fyStartMonth,
    fyStartYear,
  );
  const fyEndDate = getFYEndDate(fyStartDay, fyStartMonth, fyStartYear);

  const toInsert: {
    platformId: string;
    milestoneTypeId: string;
    financialYear: string;
    dueDate: Date | null;
    notes: string | null;
  }[] = [];

  for (const type of types) {
    const existingCount = existingByType.get(type.id) || 0;

    switch (type.schedulingRule) {
      case "auto_quarterly": {
        // Need 3 instances (Q1, Q2, Q3)
        if (existingCount >= 3) break;
        const needed = 3 - existingCount;
        // Generate from the end to fill missing quarters
        const startQ = 3 - needed;
        for (let q = startQ; q < 3; q++) {
          toInsert.push({
            platformId: id,
            milestoneTypeId: type.id,
            financialYear,
            dueDate: quarterEndDates[q],
            notes: `Q${q + 1}`,
          });
        }
        break;
      }
      case "auto_annual": {
        if (existingCount >= 1) break;
        toInsert.push({
          platformId: id,
          milestoneTypeId: type.id,
          financialYear,
          dueDate: fyEndDate,
          notes: null,
        });
        break;
      }
      case "manual": {
        if (existingCount >= 1) break;
        toInsert.push({
          platformId: id,
          milestoneTypeId: type.id,
          financialYear,
          dueDate: null,
          notes: null,
        });
        break;
      }
    }
  }

  if (toInsert.length === 0) {
    return NextResponse.json({
      message: "All milestones already exist for this financial year",
      created: [],
    });
  }

  const created = await db.insert(milestone).values(toInsert).returning();

  return NextResponse.json(
    {
      message: `Generated ${created.length} milestones`,
      created,
    },
    { status: 201 },
  );
}
