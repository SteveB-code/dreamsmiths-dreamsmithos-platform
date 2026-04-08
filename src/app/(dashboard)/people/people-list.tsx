"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { AddPersonDialog } from "./add-person-dialog";

interface Person {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  type: "contractor" | "employee";
  status: "active" | "inactive" | "offboarded";
  dateJoined: string;
}

export function PeopleList() {
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/people?${params}`);
    const data = await res.json();
    setPeople(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handlePersonAdded = () => {
    setDialogOpen(false);
    fetchPeople();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : people.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No people found. Add your first team member.
                </TableCell>
              </TableRow>
            ) : (
              people.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/people/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.type === "employee" ? "default" : "secondary"}>
                      {p.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "active"
                          ? "default"
                          : p.status === "inactive"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.phone || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddPersonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handlePersonAdded}
      />
    </div>
  );
}
