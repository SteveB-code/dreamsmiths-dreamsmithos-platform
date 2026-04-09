import { Header } from "@/components/layout/header";
import { ContractDetail } from "./contract-detail";

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Header title="Contract Details" />
      <div className="p-6">
        <ContractDetail contractId={id} />
      </div>
    </div>
  );
}
