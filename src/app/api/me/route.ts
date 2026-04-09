import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { person, onboardingJourney } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = session.user;

  // Find the person record linked to this user, or matching email
  const [personRecord] = await db
    .select()
    .from(person)
    .where(
      user.id
        ? or(
            eq(person.userId, user.id),
            eq(person.email, user.email),
          )
        : eq(person.email, user.email),
    )
    .limit(1);

  let activeOnboarding = null;

  if (personRecord) {
    // Check for active onboarding journey
    const [journey] = await db
      .select()
      .from(onboardingJourney)
      .where(
        and(
          eq(onboardingJourney.personId, personRecord.id),
          or(
            eq(onboardingJourney.status, "invited"),
            eq(onboardingJourney.status, "in_progress"),
          ),
        ),
      )
      .limit(1);

    if (journey) {
      activeOnboarding = journey;
    }
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: (user as Record<string, unknown>).role || "contractor",
    },
    person: personRecord || null,
    activeOnboarding,
  });
}
