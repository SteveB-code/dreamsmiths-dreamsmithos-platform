import { Header } from "@/components/layout/header";
import { PlaybookBrowser } from "./playbook-browser";

export default function PlaybookPage() {
  return (
    <div>
      <Header title="Playbook" />
      <div className="p-6">
        <PlaybookBrowser />
      </div>
    </div>
  );
}
