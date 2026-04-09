import { Header } from "@/components/layout/header";
import { DashboardCards } from "./dashboard-cards";
import { ContractorRedirect } from "./contractor-redirect";
import { Greeting } from "./greeting";

export default function DashboardPage() {
  return (
    <div>
      <ContractorRedirect />
      <Header title="Dashboard" />
      <div className="p-6 space-y-8">
        <Greeting />
        <DashboardCards />
      </div>
    </div>
  );
}
