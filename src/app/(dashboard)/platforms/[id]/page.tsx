import { Header } from "@/components/layout/header";
import { PlatformDetail } from "./platform-detail";

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Header title="Platform Details" />
      <div className="p-6">
        <PlatformDetail platformId={id} />
      </div>
    </div>
  );
}
