import { NextResponse } from "next/server";
import { db } from "@/db";
import { person, platform } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  const [peopleCount] = await db
    .select({ count: count() })
    .from(person)
    .where(eq(person.status, "active"));

  const [contractorCount] = await db
    .select({ count: count() })
    .from(person)
    .where(eq(person.type, "contractor"));

  const [employeeCount] = await db
    .select({ count: count() })
    .from(person)
    .where(eq(person.type, "employee"));

  const [platformCount] = await db
    .select({ count: count() })
    .from(platform)
    .where(eq(platform.status, "active"));

  return NextResponse.json({
    totalPeople: peopleCount.count,
    contractors: contractorCount.count,
    employees: employeeCount.count,
    activePlatforms: platformCount.count,
  });
}
