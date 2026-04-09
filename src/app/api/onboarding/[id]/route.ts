import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingJourney, person } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/onboarding/:id — get a single onboarding journey
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [result] = await db
    .select({
      journey: onboardingJourney,
      firstName: person.firstName,
      lastName: person.lastName,
    })
    .from(onboardingJourney)
    .innerJoin(person, eq(onboardingJourney.personId, person.id))
    .where(eq(onboardingJourney.id, id))
    .limit(1);

  if (!result) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...result.journey,
    firstName: result.firstName,
    lastName: result.lastName,
  });
}

// PATCH /api/onboarding/:id — update journey status/step
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const { status, currentStep } = body;

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (status !== undefined) {
    updates.status = status;
    if (status === "in_progress" && !body.skipStartedDate) {
      updates.startedDate = new Date();
    }
    if (status === "completed") {
      updates.completedDate = new Date();
    }
  }

  if (currentStep !== undefined) {
    updates.currentStep = currentStep;
  }

  const [updated] = await db
    .update(onboardingJourney)
    .set(updates)
    .where(eq(onboardingJourney.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
