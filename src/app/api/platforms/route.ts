import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { platform } from "@/db/schema";
import { desc, ilike, eq, or } from "drizzle-orm";

// GET /api/platforms — list all platforms, with optional search
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const status = searchParams.get("status") as
    | "active"
    | "paused"
    | "archived"
    | null;

  let query = db
    .select()
    .from(platform)
    .orderBy(desc(platform.createdAt))
    .$dynamic();

  if (search) {
    query = query.where(
      or(
        ilike(platform.name, `%${search}%`),
        ilike(platform.clientOrg, `%${search}%`),
      ),
    );
  }

  if (status) {
    query = query.where(eq(platform.status, status));
  }

  const platforms = await query;
  return NextResponse.json(platforms);
}

// POST /api/platforms — create a new platform
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { name, clientOrg, retainerTier, techStack, description } = body;

  if (!name || !clientOrg) {
    return NextResponse.json(
      { error: "name and clientOrg are required" },
      { status: 400 },
    );
  }

  const [newPlatform] = await db
    .insert(platform)
    .values({
      name,
      clientOrg,
      retainerTier: retainerTier || null,
      techStack: techStack || null,
      description: description || null,
    })
    .returning();

  return NextResponse.json(newPlatform, { status: 201 });
}
