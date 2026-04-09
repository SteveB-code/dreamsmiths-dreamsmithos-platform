import { NextResponse } from "next/server";
import { db } from "@/db";
import { technology } from "@/db/schema";
import { asc } from "drizzle-orm";

// GET /api/technologies — list all technologies, grouped by category
export async function GET() {
  const techs = await db
    .select()
    .from(technology)
    .orderBy(asc(technology.category), asc(technology.name));

  return NextResponse.json(techs);
}
