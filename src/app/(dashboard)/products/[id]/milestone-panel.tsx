"use client";

import { useEffect, useState, useCallback } from "react";
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
import { ChevronDown, ChevronRight, Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import { MilestoneTimeline } from "./milestone-timeline";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MilestonePanelProps {
  platformId: string;
  financialYearStartDay: number | null;
  financialYearStartMonth: number | null;
  budgetPreparationMonth: number | null;
  strategicPlanningWindowStart: number | null;
  strategicPlanningWindowEnd: number | null;
}

interface MilestoneData {
  id: string;
  platformId: string;
  milestoneTypeId: string;
  financialYear: string;
  status: "scheduled" | "upcoming" | "due" | "overdue" | "complete";
  dueDate: string | null;
  completedDate: string | null;
  completedLate: boolean;
  ownerPersonId: string | null;
  notes: string | null;
  createdAt: string;
  typeName: string;
  typeCategory: string;
  typeFrequency: string;
  typeSchedulingRule: string;
  typeArtifactMode: string;
  typeArtifactRequired: boolean;
  ownerFirstName: string | null;
  ownerLastName: string | null;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFYLabel(startMonth: number): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fyStartYear = currentMonth >= startMonth ? currentYear : currentYear - 1;
  const fyEndYear = fyStartYear + 1;
  return `FY ${fyStartYear}/${String(fyEndYear).slice(2)}`;
}

function buildFYOptions(startMonth: number): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fyStartYear = currentMonth >= startMonth ? currentYear : currentYear - 1;
  const options: string[] = [];
  for (let y = fyStartYear - 1; y <= fyStartYear + 2; y++) {
    options.push(`FY ${y}/${String(y + 1).slice(2)}`);
  }
  return options;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    scheduled: "bg-gray-400",
    upcoming: "bg-amber-400",
    due: "bg-amber-500",
    overdue: "bg-red-500",
    complete: "bg-green-500",
  };
  return <div className={`h-2.5 w-2.5 rounded-full ${colors[status] || "bg-gray-400"}`} />;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    scheduled: "Scheduled",
    upcoming: "Upcoming",
    due: "Due",
    overdue: "Overdue",
    complete: "Complete",
  };
  return labels[status] || status;
}

function categoryBadgeClass(category: string) {
  switch (category) {
    case "reporting":
      return "border-blue-300 text-blue-700";
    case "client":
      return "border-purple-300 text-purple-700";
    case "internal":
      return "border-slate-300 text-slate-700";
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MilestonePanel({
  platformId,
  financialYearStartDay,
  financialYearStartMonth,
  budgetPreparationMonth,
  strategicPlanningWindowStart,
  strategicPlanningWindowEnd,
}: MilestonePanelProps) {
  const fyConfigured = financialYearStartMonth !== null;
  const defaultFY = fyConfigured ? getFYLabel(financialYearStartMonth!) : "";

  const [selectedFY, setSelectedFY] = useState(defaultFY);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Inline edit state
  const [editDueDate, setEditDueDate] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [deletingMilestone, setDeletingMilestone] = useState(false);

  // Update default FY if props change
  useEffect(() => {
    if (fyConfigured) {
      const label = getFYLabel(financialYearStartMonth!);
      setSelectedFY(label);
    }
  }, [financialYearStartMonth, fyConfigured]);

  const fetchMilestones = useCallback(async () => {
    if (!selectedFY) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/platforms/${platformId}/milestones?fy=${encodeURIComponent(selectedFY)}`
      );
      if (res.ok) {
        const data = await res.json();
        setMilestones(data);
      }
    } catch {
      // Silently handle — the API may not be deployed yet
    } finally {
      setLoading(false);
    }
  }, [platformId, selectedFY]);

  const fetchPeople = useCallback(async () => {
    try {
      const res = await fetch("/api/people");
      if (res.ok) {
        const data = await res.json();
        setPeople(data);
      }
    } catch {
      // Silently handle
    }
  }, []);

  useEffect(() => {
    if (fyConfigured && selectedFY) {
      fetchMilestones();
    }
  }, [fyConfigured, selectedFY, fetchMilestones]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/platforms/${platformId}/milestones/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financialYear: selectedFY }),
      });
      if (res.ok) {
        await fetchMilestones();
      }
    } catch {
      // Silently handle
    } finally {
      setGenerating(false);
    }
  };

  const handleExpandRow = (milestone: MilestoneData) => {
    if (expandedId === milestone.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(milestone.id);
    setEditDueDate(milestone.dueDate ? milestone.dueDate.split("T")[0] : "");
    setEditOwner(milestone.ownerPersonId || "");
    setEditNotes(milestone.notes || "");
  };

  const handleSaveMilestone = async (milestoneId: string) => {
    setSavingMilestone(true);
    try {
      const res = await fetch(
        `/api/platforms/${platformId}/milestones/${milestoneId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dueDate: editDueDate || null,
            ownerPersonId: editOwner || null,
            notes: editNotes || null,
          }),
        }
      );
      if (res.ok) {
        setExpandedId(null);
        await fetchMilestones();
      }
    } catch {
      // Silently handle
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm("Delete this milestone?")) return;
    setDeletingMilestone(true);
    try {
      const res = await fetch(
        `/api/platforms/${platformId}/milestones/${milestoneId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setExpandedId(null);
        await fetchMilestones();
      }
    } catch {
      // Silently handle
    } finally {
      setDeletingMilestone(false);
    }
  };

  const fyOptions = fyConfigured ? buildFYOptions(financialYearStartMonth!) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Product Milestones</CardTitle>
          {fyConfigured && (
            <Select value={selectedFY} onValueChange={(v) => setSelectedFY(v ?? defaultFY)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fyOptions.map((fy) => (
                  <SelectItem key={fy} value={fy}>
                    {fy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!fyConfigured ? (
          <p className="text-sm text-muted-foreground">
            Configure the client&apos;s financial year above to enable milestones.
          </p>
        ) : loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading milestones...
          </div>
        ) : milestones.length === 0 ? (
          <div className="space-y-3 text-center py-4">
            <p className="text-sm text-muted-foreground">
              No milestones for {selectedFY} yet.
            </p>
            <Button onClick={handleGenerate} disabled={generating}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : `Generate ${selectedFY} Cycle`}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline visualization */}
            <MilestoneTimeline
              milestones={milestones}
              financialYearStartDay={financialYearStartDay!}
              financialYearStartMonth={financialYearStartMonth!}
              budgetPreparationMonth={budgetPreparationMonth}
              strategicPlanningWindowStart={strategicPlanningWindowStart}
              strategicPlanningWindowEnd={strategicPlanningWindowEnd}
              selectedFY={selectedFY}
              onMilestoneClick={(ms) => handleExpandRow(ms)}
            />

            {/* Divider */}
            <div className="border-t" />

            {/* Milestone list */}
            <div className="space-y-1">
            {milestones.map((ms) => (
              <div key={ms.id} className="rounded-md border">
                {/* Row header */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => handleExpandRow(ms)}
                >
                  {expandedId === ms.id ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <StatusDot status={ms.status} />
                  <span className="flex-1 text-sm font-medium truncate">
                    {ms.typeName}
                  </span>
                  <Badge variant="outline" className={`text-xs ${categoryBadgeClass(ms.typeCategory)}`}>
                    {ms.typeCategory}
                  </Badge>
                  <span className="text-xs text-muted-foreground w-[100px] text-right">
                    {ms.dueDate ? formatDate(ms.dueDate) : "Date not set"}
                  </span>
                  <span className="text-xs text-muted-foreground w-[100px] text-right truncate">
                    {ms.ownerFirstName
                      ? `${ms.ownerFirstName} ${ms.ownerLastName}`
                      : "Unassigned"}
                  </span>
                </button>

                {/* Expanded inline edit */}
                {expandedId === ms.id && (
                  <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
                    <div className="flex items-center gap-2 text-xs">
                      <StatusDot status={ms.status} />
                      <span className="font-medium">{statusLabel(ms.status)}</span>
                      {ms.typeFrequency !== "annual" && (
                        <span className="text-muted-foreground">
                          ({ms.typeFrequency})
                        </span>
                      )}
                      {ms.completedDate && (
                        <span className="text-muted-foreground">
                          Completed {formatDate(ms.completedDate)}
                          {ms.completedLate && " (late)"}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Due Date</Label>
                        <Input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Owner</Label>
                        <Select value={editOwner} onValueChange={(v) => setEditOwner(v ?? "")}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {people.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.firstName} {p.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Milestone notes..."
                      />
                    </div>

                    <div className="flex justify-between pt-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMilestone(ms.id)}
                        disabled={deletingMilestone}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveMilestone(ms.id)}
                        disabled={savingMilestone}
                      >
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        {savingMilestone ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
