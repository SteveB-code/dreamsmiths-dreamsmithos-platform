import { NextResponse } from "next/server";
import { db } from "@/db";
import { milestoneType } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET /api/milestone-types — list all active milestone types
export async function GET() {
  const types = await db
    .select()
    .from(milestoneType)
    .where(eq(milestoneType.isActive, true))
    .orderBy(asc(milestoneType.name));

  return NextResponse.json(types);
}
