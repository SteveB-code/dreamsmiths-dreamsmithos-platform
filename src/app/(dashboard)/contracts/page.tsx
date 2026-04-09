import { Header } from "@/components/layout/header";
import { ContractsList } from "./contracts-list";

export default function ContractsPage() {
  return (
    <div>
      <Header title="Contracts" />
      <div className="p-6">
        <ContractsList />
      </div>
    </div>
  );
}
