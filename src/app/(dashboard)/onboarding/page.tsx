import { Header } from "@/components/layout/header";
import { OnboardingList } from "./onboarding-list";

export default function OnboardingPage() {
  return (
    <div>
      <Header title="Onboarding" />
      <div className="p-6">
        <OnboardingList />
      </div>
    </div>
  );
}
