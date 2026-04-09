import { Header } from "@/components/layout/header";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Header title="Contractor Onboarding" />
      <div className="p-6">
        <OnboardingForm journeyId={id} />
      </div>
    </div>
  );
}
