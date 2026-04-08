import { Header } from "@/components/layout/header";
import { PlatformList } from "./platform-list";

export default function PlatformsPage() {
  return (
    <div>
      <Header title="Platforms" />
      <div className="p-6">
        <PlatformList />
      </div>
    </div>
  );
}
