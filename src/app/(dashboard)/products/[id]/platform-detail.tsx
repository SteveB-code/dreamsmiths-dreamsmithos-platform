"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Save, Trash2, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { AssignPersonDialog } from "./assign-person-dialog";
import { MilestonePanel } from "./milestone-panel";
import { TechSelect } from "@/components/tech-select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getFYLabel(startMonth: number): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fyStartYear = currentMonth >= startMonth ? currentYear : currentYear - 1;
  const fyEndYear = fyStartYear + 1;
  return `FY ${fyStartYear}/${String(fyEndYear).slice(2)}`;
}

function getFYDateRange(startMonth: number): string {
  const startName = MONTH_ABBR[startMonth - 1];
  const endMonthIndex = (startMonth - 2 + 12) % 12;
  const endName = MONTH_ABBR[endMonthIndex];
  return `${startName} – ${endName}`;
}

interface TeamMember {
  assignmentId: string;
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  type: "contractor" | "employee";
  roleOnPlatform: string;
  isActive: boolean;
}

interface Technology {
  id: string;
  name: string;
  category: string;
}

interface PlatformData {
  id: string;
  name: string;
  clientOrg: string;
  status: "active" | "paused" | "archived";
  retainerTier: string | null;
  techStack: string | null;
  description: string | null;
  dateOnboarded: string;
  team: TeamMember[];
  technologies: Technology[];
  financialYearStartDay: number | null;
  financialYearStartMonth: number | null;
  budgetPreparationMonth: number | null;
  strategicPlanningWindowStart: number | null;
  strategicPlanningWindowEnd: number | null;
  planningCycleNotes: string | null;
}

export function PlatformDetail({ platformId }: { platformId: string }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [technologyIds, setTechnologyIds] = useState<string[]>([]);

  // Planning cycle state (separate from main form)
  const [fyStartDay, setFyStartDay] = useState<string>("");
  const [fyStartMonth, setFyStartMonth] = useState<string>("");
  const [budgetPrepMonth, setBudgetPrepMonth] = useState<string>("");
  const [planningWindowStart, setPlanningWindowStart] = useState<string>("");
  const [planningWindowEnd, setPlanningWindowEnd] = useState<string>("");
  const [planningNotes, setPlanningNotes] = useState<string>("");
  const [savingPlanning, setSavingPlanning] = useState(false);
  const [planningError, setPlanningError] = useState("");

  const fetchPlatform = useCallback(async () => {
    try {
      const res = await fetch(`/api/platforms/${platformId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setPlatform(data);
      setTechnologyIds(data.technologies?.map((t: Technology) => t.id) || []);
      setFyStartDay(data.financialYearStartDay?.toString() || "");
      setFyStartMonth(data.financialYearStartMonth?.toString() || "");
      setBudgetPrepMonth(data.budgetPreparationMonth?.toString() || "");
      setPlanningWindowStart(data.strategicPlanningWindowStart?.toString() || "");
      setPlanningWindowEnd(data.strategicPlanningWindowEnd?.toString() || "");
      setPlanningNotes(data.planningCycleNotes || "");
    } catch {
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  }, [platformId]);

  useEffect(() => {
    fetchPlatform();
  }, [fetchPlatform]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      clientOrg: formData.get("clientOrg"),
      status: formData.get("status"),
      retainerTier: formData.get("retainerTier") || null,
      description: formData.get("description") || null,
      technologyIds,
    };

    const res = await fetch(`/api/platforms/${platformId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setError("Failed to save changes");
    } else {
      const updated = await res.json();
      setPlatform((prev) => (prev ? { ...prev, ...updated } : prev));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/platforms/${platformId}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/products");
  };

  const handleRemoveMember = async (assignmentId: string) => {
    const res = await fetch(
      `/api/platforms/${platformId}/team?assignmentId=${assignmentId}`,
      { method: "DELETE" },
    );
    if (res.ok) fetchPlatform();
  };

  const handlePersonAssigned = () => {
    setAssignDialogOpen(false);
    fetchPlatform();
  };

  const handleSavePlanning = async () => {
    setSavingPlanning(true);
    setPlanningError("");

    const body = {
      financialYearStartDay: fyStartDay ? parseInt(fyStartDay) : null,
      financialYearStartMonth: fyStartMonth ? parseInt(fyStartMonth) : null,
      budgetPreparationMonth: budgetPrepMonth ? parseInt(budgetPrepMonth) : null,
      strategicPlanningWindowStart: planningWindowStart ? parseInt(planningWindowStart) : null,
      strategicPlanningWindowEnd: planningWindowEnd ? parseInt(planningWindowEnd) : null,
      planningCycleNotes: planningNotes || null,
    };

    try {
      const res = await fetch(`/api/platforms/${platformId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setPlanningError("Failed to save planning cycle settings");
      } else {
        const updated = await res.json();
        setPlatform((prev) => (prev ? { ...prev, ...updated } : prev));
      }
    } catch {
      setPlanningError("Failed to save planning cycle settings");
    } finally {
      setSavingPlanning(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error && !platform) return <p className="text-destructive">{error}</p>;
  if (!platform) return null;

  const activeTeam = platform.team.filter((m) => m.isActive);
  const fyConfigured = platform.financialYearStartMonth !== null;

  return (
    <div className="space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      {/* ── Hero: Product header + key details ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{platform.name}</h1>
          <p className="text-muted-foreground mt-0.5">
            {platform.clientOrg}
            {fyConfigured && (
              <>
                <span className="mx-2">·</span>
                <span>{getFYLabel(platform.financialYearStartMonth!)}</span>
                <span className="ml-1 text-xs">({getFYDateRange(platform.financialYearStartMonth!)})</span>
              </>
            )}
          </p>
        </div>
        <Badge
          variant={
            platform.status === "active"
              ? "default"
              : platform.status === "paused"
                ? "secondary"
                : "destructive"
          }
          className="mt-1"
        >
          {platform.status}
        </Badge>
      </div>

      {/* ── Timeline + Milestones (hero position) ── */}
      <MilestonePanel
        platformId={platformId}
        financialYearStartDay={platform.financialYearStartDay}
        financialYearStartMonth={platform.financialYearStartMonth}
        budgetPreparationMonth={platform.budgetPreparationMonth}
        strategicPlanningWindowStart={platform.strategicPlanningWindowStart}
        strategicPlanningWindowEnd={platform.strategicPlanningWindowEnd}
      />

      {/* ── Product Details ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={platform.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientOrg">Client Organisation</Label>
                <Input
                  id="clientOrg"
                  name="clientOrg"
                  defaultValue={platform.clientOrg}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={platform.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retainerTier">Retainer Tier</Label>
                <Input
                  id="retainerTier"
                  name="retainerTier"
                  defaultValue={platform.retainerTier || ""}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Tech Stack</Label>
                <TechSelect
                  selectedIds={technologyIds}
                  onChange={setTechnologyIds}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                  defaultValue={platform.description || ""}
                />
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
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Client Planning Cycle ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Planning Cycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Financial Year Start</Label>
            <div className="grid grid-cols-2 gap-4">
              <Select value={fyStartDay} onValueChange={(v) => setFyStartDay(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={fyStartMonth} onValueChange={(v) => setFyStartMonth(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {fyStartMonth && (
              <p className="text-sm text-muted-foreground">
                Current financial year: {getFYLabel(parseInt(fyStartMonth))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Budget Preparation Deadline</Label>
            <Select value={budgetPrepMonth} onValueChange={(v) => setBudgetPrepMonth(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Month by which the client needs budget inputs finalised
            </p>
          </div>

          <div className="space-y-2">
            <Label>Strategic Planning Window</Label>
            <div className="grid grid-cols-2 gap-4">
              <Select value={planningWindowStart} onValueChange={(v) => setPlanningWindowStart(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Start month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={planningWindowEnd} onValueChange={(v) => setPlanningWindowEnd(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="End month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              When the client is actively doing strategic planning
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planningNotes">Planning Cycle Notes</Label>
            <Textarea
              id="planningNotes"
              rows={2}
              value={planningNotes}
              onChange={(e) => setPlanningNotes(e.target.value)}
              placeholder="Additional context about client's planning process..."
            />
          </div>

          {planningError && <p className="text-sm text-destructive">{planningError}</p>}

          <div className="flex justify-end pt-2">
            <Button type="button" onClick={handleSavePlanning} disabled={savingPlanning}>
              <Save className="h-4 w-4 mr-2" />
              {savingPlanning ? "Saving..." : "Save Planning Cycle"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Team ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Team</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAssignDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Person
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTeam.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No team members assigned yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activeTeam.map((member) => (
                <div
                  key={member.assignmentId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <Link
                      href={`/people/${member.personId}`}
                      className="font-medium hover:underline"
                    >
                      {member.firstName} {member.lastName}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.roleOnPlatform.split(", ").map((role: string) => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))}
                    <Badge
                      variant={
                        member.type === "employee" ? "default" : "secondary"
                      }
                    >
                      {member.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(member.assignmentId)}
                      title="Remove from product"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignPersonDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        platformId={platformId}
        onSuccess={handlePersonAssigned}
      />
    </div>
  );
}
