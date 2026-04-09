import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playbookItem } from "@/db/schema";
import { asc, eq, like } from "drizzle-orm";

// GET /api/playbook — list playbook items with optional filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") as
    | "getting_started"
    | "development"
    | "client_work"
    | "operations"
    | "design"
    | "general"
    | null;
  const contentType = searchParams.get("contentType") as
    | "video"
    | "sop"
    | "template"
    | "guide"
    | "policy"
    | null;
  const audience = searchParams.get("audience");

  let query = db
    .select()
    .from(playbookItem)
    .orderBy(
      asc(playbookItem.category),
      asc(playbookItem.sortOrder),
      asc(playbookItem.title),
    )
    .$dynamic();

  if (category) {
    query = query.where(eq(playbookItem.category, category));
  }

  if (contentType) {
    query = query.where(eq(playbookItem.contentType, contentType));
  }

  if (audience) {
    query = query.where(like(playbookItem.audience, `%${audience}%`));
  }

  const items = await query;

  return NextResponse.json(items);
}

// POST /api/playbook — create a new playbook item
export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    title,
    description,
    category,
    contentType,
    externalUrl,
    fileUrl,
    fileName,
    fileSize,
    mimeType,
    markdownContent,
    audience,
    sortOrder,
    createdBy,
  } = body;

  if (!title || !category || !contentType) {
    return NextResponse.json(
      { error: "title, category, and contentType are required" },
      { status: 400 },
    );
  }

  const [newItem] = await db
    .insert(playbookItem)
    .values({
      title,
      description: description || null,
      category,
      contentType,
      externalUrl: externalUrl || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      mimeType: mimeType || null,
      markdownContent: markdownContent || null,
      audience: audience || "management,product_lead,employee,contractor",
      sortOrder: sortOrder ?? 0,
      createdBy: createdBy || null,
    })
    .returning();

  return NextResponse.json(newItem, { status: 201 });
}
