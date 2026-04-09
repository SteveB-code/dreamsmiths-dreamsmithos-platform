import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingJourney, person } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET /api/onboarding — list all onboarding journeys
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") as
    | "invited"
    | "in_progress"
    | "completed"
    | null;

  const journeys = await db
    .select({
      id: onboardingJourney.id,
      personId: onboardingJourney.personId,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      type: person.type,
      status: onboardingJourney.status,
      currentStep: onboardingJourney.currentStep,
      inviteSentDate: onboardingJourney.inviteSentDate,
      startedDate: onboardingJourney.startedDate,
      completedDate: onboardingJourney.completedDate,
      isRetrofit: onboardingJourney.isRetrofit,
      createdAt: onboardingJourney.createdAt,
    })
    .from(onboardingJourney)
    .innerJoin(person, eq(onboardingJourney.personId, person.id))
    .orderBy(desc(onboardingJourney.createdAt));

  const filtered = status
    ? journeys.filter((j) => j.status === status)
    : journeys;

  return NextResponse.json(filtered);
}

// POST /api/onboarding — start an onboarding journey for a person
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { personId, isRetrofit } = body;

  if (!personId) {
    return NextResponse.json(
      { error: "personId is required" },
      { status: 400 },
    );
  }

  // Check for existing active journey
  const [existing] = await db
    .select()
    .from(onboardingJourney)
    .where(eq(onboardingJourney.personId, personId))
    .limit(1);

  if (existing && existing.status !== "completed") {
    return NextResponse.json(
      { error: "Person already has an active onboarding journey" },
      { status: 409 },
    );
  }

  const [journey] = await db
    .insert(onboardingJourney)
    .values({
      personId,
      isRetrofit: isRetrofit || false,
      inviteSentDate: new Date(),
    })
    .returning();

  return NextResponse.json(journey, { status: 201 });
}
