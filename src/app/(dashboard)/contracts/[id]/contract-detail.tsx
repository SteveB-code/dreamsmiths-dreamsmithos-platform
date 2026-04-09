"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, FileText } from "lucide-react";
import Link from "next/link";

interface ContractData {
  id: string;
  title: string;
  platformId: string;
  platformName: string;
  clientOrg: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring_soon" | "expired" | "renewed";
  notes: string | null;
  ownerId: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calculateDuration(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remaining = days % 365;
    const months = Math.floor(remaining / 30);
    return months > 0 ? `${years}y ${months}m` : `${years}y`;
  }
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months}m`;
  }
  return `${days}d`;
}

function daysRemaining(endDate: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(endDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "border-green-300 text-green-700";
    case "expiring_soon":
      return "border-amber-300 text-amber-700";
    case "expired":
      return "border-red-300 text-red-700";
    case "renewed":
      return "border-gray-300 text-gray-500";
    default:
      return "";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "expiring_soon":
      return "Expiring Soon";
    case "expired":
      return "Expired";
    case "renewed":
      return "Renewed";
    default:
      return status;
  }
}

export function ContractDetail({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [people, setPeople] = useState<Person[]>([]);

  const fetchContract = useCallback(async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setContract(data);
      setStatus(data.status);
      setNotes(data.notes || "");
      setOwnerId(data.ownerId || "");
    } catch {
      setError("Contract not found");
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchContract();
    fetch("/api/people")
      .then((res) => res.json())
      .then((data) => setPeople(data.filter((p: Person) => p.type === "employee")))
      .catch(() => setPeople([]));
  }, [fetchContract]);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const res = await fetch(`/api/contracts/${contractId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes: notes || null, ownerId: ownerId || null }),
    });

    if (!res.ok) {
      setError("Failed to save changes");
    } else {
      const updated = await res.json();
      setContract((prev) => (prev ? { ...prev, ...updated } : prev));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contract?")) return;
    const res = await fetch(`/api/contracts/${contractId}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/contracts");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error && !contract) return <p className="text-destructive">{error}</p>;
  if (!contract) return null;

  const days = daysRemaining(contract.endDate);
  const daysLabel =
    days >= 0 ? `${days} days remaining` : `${Math.abs(days)} days overdue`;

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/contracts"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contracts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{contract.title}</span>
            <Badge
              variant="outline"
              className={statusBadgeVariant(contract.status)}
            >
              {statusLabel(contract.status)}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <Link
              href={`/products/${contract.platformId}`}
              className="hover:underline"
            >
              {contract.platformName}
            </Link>
            <span>·</span>
            <span>{contract.clientOrg}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date range */}
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Start</p>
                <p className="font-medium">{formatDate(contract.startDate)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">
                  {calculateDuration(contract.startDate, contract.endDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">End</p>
                <p className="font-medium">{formatDate(contract.endDate)}</p>
              </div>
            </div>
            <p
              className={`mt-3 text-center text-sm ${days < 0 ? "text-red-600" : days <= 30 ? "text-amber-600" : "text-muted-foreground"}`}
            >
              {daysLabel}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Status</p>
            <Select value={status} onValueChange={(v) => setStatus(v ?? "active")}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="renewed">Renewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Owner */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Owner</p>
            {people.length > 0 ? (
              <Select value={ownerId} onValueChange={(v) => setOwnerId(v ?? "")}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Assign an owner" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            <p className="text-xs text-muted-foreground">
              Responsible for managing this contract&apos;s renewal
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Notes</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this contract..."
            />
          </div>

          {/* File section */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Document</p>
            <div className="flex items-center gap-3 rounded-md border border-dashed p-4 text-muted-foreground/50">
              <FileText className="h-5 w-5" />
              <span className="text-sm">
                No file uploaded — PDF upload coming soon
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
