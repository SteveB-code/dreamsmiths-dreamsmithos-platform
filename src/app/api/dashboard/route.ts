import { NextResponse } from "next/server";
import { db } from "@/db";
import { person, platform, complianceRecord, onboardingJourney } from "@/db/schema";
import { eq, count, or } from "drizzle-orm";

export async function GET() {
  const [peopleCount] = await db
    .select({ count: count() })
    .from(person)
    .where(eq(person.status, "active"));

  const [contractorCount] = await db
    .select({ count: count() })
    .from(person)
    .where(eq(person.type, "contractor"));

  const [platformCount] = await db
    .select({ count: count() })
    .from(platform)
    .where(eq(platform.status, "active"));

  const [overdueCount] = await db
    .select({ count: count() })
    .from(complianceRecord)
    .where(eq(complianceRecord.status, "overdue"));

  const [pendingCount] = await db
    .select({ count: count() })
    .from(complianceRecord)
    .where(
      or(
        eq(complianceRecord.status, "pending"),
        eq(complianceRecord.status, "submitted"),
      ),
    );

  const [onboardingActiveCount] = await db
    .select({ count: count() })
    .from(onboardingJourney)
    .where(
      or(
        eq(onboardingJourney.status, "invited"),
        eq(onboardingJourney.status, "in_progress"),
      ),
    );

  return NextResponse.json({
    totalPeople: peopleCount.count,
    contractors: contractorCount.count,
    activePlatforms: platformCount.count,
    complianceOverdue: overdueCount.count,
    compliancePending: pendingCount.count,
    onboardingActive: onboardingActiveCount.count,
  });
}
