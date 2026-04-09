import { PlaybookItemDetail } from "./playbook-item-detail";

interface PlaybookItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaybookItemPage({ params }: PlaybookItemPageProps) {
  const { id } = await params;
  return <PlaybookItemDetail id={id} />;
}
