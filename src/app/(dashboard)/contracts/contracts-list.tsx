"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { AddContractDialog } from "./add-contract-dialog";

interface Contract {
  id: string;
  title: string;
  platformName: string;
  clientOrg: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring_soon" | "expired" | "renewed";
  ownerFirstName: string | null;
  ownerLastName: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusBadge(status: string, endDate: string) {
  const days = daysUntil(endDate);

  switch (status) {
    case "active":
      return <Badge variant="outline" className="border-green-300 text-green-700">Active</Badge>;
    case "expiring_soon": {
      const label = days >= 0 ? `Expiring in ${days}d` : `${Math.abs(days)}d overdue`;
      return <Badge variant="outline" className="border-amber-300 text-amber-700">{label}</Badge>;
    }
    case "expired": {
      const label = days >= 0 ? `Expires in ${days}d` : `Expired ${Math.abs(days)}d ago`;
      return <Badge variant="outline" className="border-red-300 text-red-700">{label}</Badge>;
    }
    case "renewed":
      return <Badge variant="outline" className="border-gray-300 text-gray-500">Renewed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function ContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/contracts");
    const data = await res.json();
    setContracts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleContractAdded = () => {
    setDialogOpen(false);
    fetchContracts();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contract
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : contracts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No contracts found. Add your first contract.
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => (window.location.href = `/contracts/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.clientOrg}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.platformName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.startDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.endDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.ownerFirstName
                      ? `${c.ownerFirstName} ${c.ownerLastName}`
                      : "—"}
                  </TableCell>
                  <TableCell>{statusBadge(c.status, c.endDate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddContractDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleContractAdded}
      />
    </div>
  );
}
