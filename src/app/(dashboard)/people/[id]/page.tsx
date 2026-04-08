import { Header } from "@/components/layout/header";
import { PersonDetail } from "./person-detail";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Header title="Person Details" />
      <div className="p-6">
        <PersonDetail personId={id} />
      </div>
    </div>
  );
}
