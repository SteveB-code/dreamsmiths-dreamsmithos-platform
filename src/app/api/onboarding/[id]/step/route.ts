import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  onboardingJourney,
  person,
  contractorProfile,
  contractorFinancial,
  legalAgreement,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

// Agreement types for each legal step
const STEP_AGREEMENT_TYPES: Record<number, string[]> = {
  4: ["nda"],
  5: ["ip_assignment", "non_circumvention", "non_solicitation"],
  6: ["data_protection"],
  7: ["playbook"],
};

// ---------------------------------------------------------------------------
// GET /api/onboarding/:id/step?step=N — load saved data for a specific step
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const stepParam = request.nextUrl.searchParams.get("step");

  if (!stepParam) {
    return NextResponse.json(
      { error: "Missing required query parameter: step" },
      { status: 400 },
    );
  }

  const step = parseInt(stepParam, 10);
  if (isNaN(step) || step < 1 || step > 7) {
    return NextResponse.json(
      { error: "step must be a number between 1 and 7" },
      { status: 400 },
    );
  }

  // Fetch the journey
  const [journey] = await db
    .select()
    .from(onboardingJourney)
    .where(eq(onboardingJourney.id, id))
    .limit(1);

  if (!journey) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  const personId = journey.personId;

  // Step 1: Personal details
  if (step === 1) {
    const [personRecord] = await db
      .select({
        phone: person.phone,
        address: person.address,
      })
      .from(person)
      .where(eq(person.id, personId))
      .limit(1);

    const [profile] = await db
      .select({
        nickname: contractorProfile.nickname,
        physicalAddress: contractorProfile.physicalAddress,
        idNumber: contractorProfile.idNumber,
        nextOfKinName: contractorProfile.nextOfKinName,
        nextOfKinPhone: contractorProfile.nextOfKinPhone,
        nextOfKinRelationship: contractorProfile.nextOfKinRelationship,
      })
      .from(contractorProfile)
      .where(eq(contractorProfile.personId, personId))
      .limit(1);

    return NextResponse.json({
      ...(personRecord || {}),
      ...(profile || {}),
    });
  }

  // Step 2: Uploads
  if (step === 2) {
    const [profile] = await db
      .select({
        idVerificationUrl: contractorProfile.idVerificationUrl,
        proofOfAddressUrl: contractorProfile.proofOfAddressUrl,
      })
      .from(contractorProfile)
      .where(eq(contractorProfile.personId, personId))
      .limit(1);

    return NextResponse.json(profile || {});
  }

  // Step 3: Financial
  if (step === 3) {
    const [financial] = await db
      .select({
        hourlyRate: contractorFinancial.hourlyRate,
        paymentMethod: contractorFinancial.paymentMethod,
        bankName: contractorFinancial.bankName,
        accountHolder: contractorFinancial.accountHolder,
        accountNumber: contractorFinancial.accountNumber,
        branchCode: contractorFinancial.branchCode,
      })
      .from(contractorFinancial)
      .where(eq(contractorFinancial.personId, personId))
      .limit(1);

    return NextResponse.json(financial || {});
  }

  // Steps 4-7: Legal agreements
  const agreementTypes = STEP_AGREEMENT_TYPES[step];
  if (agreementTypes) {
    const agreements = await db
      .select()
      .from(legalAgreement)
      .where(
        and(
          eq(legalAgreement.onboardingJourneyId, id),
          eq(legalAgreement.personId, personId),
        ),
      );

    // Filter to only the types relevant to this step
    const filtered = agreements.filter((a) =>
      agreementTypes.includes(a.agreementType),
    );

    return NextResponse.json({ agreements: filtered });
  }

  return NextResponse.json({ error: "Invalid step" }, { status: 400 });
}

// ---------------------------------------------------------------------------
// PATCH /api/onboarding/:id/step — save data for a specific step
// Body: { step: number, data: { ...step-specific fields } }
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { step, data } = body;

  if (!step || !data) {
    return NextResponse.json(
      { error: "Missing required fields: step, data" },
      { status: 400 },
    );
  }

  if (typeof step !== "number" || step < 1 || step > 7) {
    return NextResponse.json(
      { error: "step must be a number between 1 and 7" },
      { status: 400 },
    );
  }

  // Fetch the journey
  const [journey] = await db
    .select()
    .from(onboardingJourney)
    .where(eq(onboardingJourney.id, id))
    .limit(1);

  if (!journey) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  const personId = journey.personId;

  // ---- Step 1: Personal Details ----
  if (step === 1) {
    const { phone, address, nickname, idNumber, physicalAddress, nextOfKinName, nextOfKinPhone, nextOfKinRelationship } = data;

    // Update person table
    await db
      .update(person)
      .set({
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        updatedAt: new Date(),
      })
      .where(eq(person.id, personId));

    // Upsert contractor profile
    const [existingProfile] = await db
      .select()
      .from(contractorProfile)
      .where(eq(contractorProfile.personId, personId))
      .limit(1);

    if (existingProfile) {
      await db
        .update(contractorProfile)
        .set({
          ...(nickname !== undefined && { nickname }),
          ...(idNumber !== undefined && { idNumber }),
          ...(physicalAddress !== undefined && { physicalAddress }),
          ...(nextOfKinName !== undefined && { nextOfKinName }),
          ...(nextOfKinPhone !== undefined && { nextOfKinPhone }),
          ...(nextOfKinRelationship !== undefined && { nextOfKinRelationship }),
          updatedAt: new Date(),
        })
        .where(eq(contractorProfile.personId, personId));
    } else {
      await db.insert(contractorProfile).values({
        personId,
        nickname: nickname || null,
        idNumber: idNumber || null,
        physicalAddress: physicalAddress || null,
        nextOfKinName: nextOfKinName || null,
        nextOfKinPhone: nextOfKinPhone || null,
        nextOfKinRelationship: nextOfKinRelationship || null,
      });
    }
  }

  // ---- Step 2: Uploads ----
  if (step === 2) {
    const { idVerificationUrl, proofOfAddressUrl } = data;

    const [existingProfile] = await db
      .select()
      .from(contractorProfile)
      .where(eq(contractorProfile.personId, personId))
      .limit(1);

    if (existingProfile) {
      await db
        .update(contractorProfile)
        .set({
          ...(idVerificationUrl !== undefined && { idVerificationUrl }),
          ...(proofOfAddressUrl !== undefined && { proofOfAddressUrl }),
          updatedAt: new Date(),
        })
        .where(eq(contractorProfile.personId, personId));
    } else {
      await db.insert(contractorProfile).values({
        personId,
        idVerificationUrl: idVerificationUrl || null,
        proofOfAddressUrl: proofOfAddressUrl || null,
      });
    }
  }

  // ---- Step 3: Financial ----
  if (step === 3) {
    const { hourlyRate, paymentMethod, bankName, accountHolder, accountNumber, branchCode } = data;

    const [existingFinancial] = await db
      .select()
      .from(contractorFinancial)
      .where(eq(contractorFinancial.personId, personId))
      .limit(1);

    if (existingFinancial) {
      await db
        .update(contractorFinancial)
        .set({
          ...(hourlyRate !== undefined && { hourlyRate }),
          ...(paymentMethod !== undefined && { paymentMethod }),
          ...(bankName !== undefined && { bankName }),
          ...(accountHolder !== undefined && { accountHolder }),
          ...(accountNumber !== undefined && { accountNumber }),
          ...(branchCode !== undefined && { branchCode }),
          updatedAt: new Date(),
        })
        .where(eq(contractorFinancial.personId, personId));
    } else {
      await db.insert(contractorFinancial).values({
        personId,
        hourlyRate: hourlyRate || null,
        paymentMethod: paymentMethod || null,
        bankName: bankName || null,
        accountHolder: accountHolder || null,
        accountNumber: accountNumber || null,
        branchCode: branchCode || null,
      });
    }
  }

  // ---- Steps 4-7: Legal Agreements ----
  const agreementTypes = STEP_AGREEMENT_TYPES[step];
  if (agreementTypes) {
    const now = new Date();
    const ipAddress = data.ipAddress || request.headers.get("x-forwarded-for") || null;

    for (const agreementType of agreementTypes) {
      await db.insert(legalAgreement).values({
        onboardingJourneyId: id,
        personId,
        agreementType,
        agreedAt: now,
        ipAddress,
      });
    }
  }

  // ---- Update journey progress ----
  const journeyUpdates: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (step === 1) {
    // Set in_progress and startedDate if not already set
    if (journey.status === "invited") {
      journeyUpdates.status = "in_progress";
    }
    if (!journey.startedDate) {
      journeyUpdates.startedDate = new Date();
    }
    journeyUpdates.currentStep = step + 1;
  } else if (step === 7) {
    // Mark journey complete
    journeyUpdates.status = "completed";
    journeyUpdates.completedDate = new Date();
    journeyUpdates.currentStep = 7;
  } else {
    journeyUpdates.currentStep = step + 1;
  }

  const [updatedJourney] = await db
    .update(onboardingJourney)
    .set(journeyUpdates)
    .where(eq(onboardingJourney.id, id))
    .returning();

  return NextResponse.json(updatedJourney);
}
