import { Header } from "@/components/layout/header";
import { PeopleList } from "./people-list";

export default function PeoplePage() {
  return (
    <div>
      <Header title="People" />
      <div className="p-6">
        <PeopleList />
      </div>
    </div>
  );
}
