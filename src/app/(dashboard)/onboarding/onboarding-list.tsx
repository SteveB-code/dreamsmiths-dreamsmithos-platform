"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OnboardingJourney {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  status: "invited" | "in_progress" | "completed";
  currentStep: number;
  createdAt: string;
  completedAt: string | null;
}

function statusBadge(status: OnboardingJourney["status"]) {
  switch (status) {
    case "invited":
      return <Badge variant="outline">Invited</Badge>;
    case "in_progress":
      return <Badge variant="default">In Progress</Badge>;
    case "completed":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
          Completed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function OnboardingList() {
  const [journeys, setJourneys] = useState<OnboardingJourney[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => setJourneys(data))
      .catch(() => setJourneys([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Onboarding journeys are started from a person&apos;s detail page.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Step</TableHead>
              <TableHead>Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : journeys.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No onboarding journeys yet. Start one from a person&apos;s
                  detail page.
                </TableCell>
              </TableRow>
            ) : (
              journeys.map((j) => (
                <TableRow
                  key={j.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    (window.location.href = `/onboarding/${j.id}`)
                  }
                >
                  <TableCell className="font-medium">
                    {j.firstName} {j.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {j.email}
                  </TableCell>
                  <TableCell>{statusBadge(j.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {j.status === "completed"
                      ? "Complete"
                      : `${j.currentStep} of 7`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(j.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
