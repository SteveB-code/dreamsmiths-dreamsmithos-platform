"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface MilestoneTimelineProps {
  milestones: MilestoneData[];
  financialYearStartDay: number;
  financialYearStartMonth: number; // 1-12
  budgetPreparationMonth: number | null; // 1-12
  strategicPlanningWindowStart: number | null; // 1-12
  strategicPlanningWindowEnd: number | null; // 1-12
  selectedFY: string; // e.g. "FY 2026/27"
  onMilestoneClick: (milestone: MilestoneData) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: "bg-gray-400",
    upcoming: "bg-amber-400",
    due: "bg-amber-500",
    overdue: "bg-red-500",
    complete: "bg-green-500",
  };
  return colors[status] || "bg-gray-400";
}

function statusRing(status: string): string {
  const colors: Record<string, string> = {
    scheduled: "ring-gray-400/30",
    upcoming: "ring-amber-400/30",
    due: "ring-amber-500/30",
    overdue: "ring-red-500/30",
    complete: "ring-green-500/30",
  };
  return colors[status] || "ring-gray-400/30";
}

function StatusDot({ status }: { status: string }) {
  return <div className={`h-2.5 w-2.5 rounded-full ${statusColor(status)}`} />;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: "Scheduled",
    upcoming: "Upcoming",
    due: "Due",
    overdue: "Overdue",
    complete: "Complete",
  };
  return labels[status] || status;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    reporting: "Reporting",
    client: "Client",
    internal: "Internal",
  };
  return labels[cat] || cat;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MilestoneTimeline({
  milestones,
  financialYearStartDay,
  financialYearStartMonth,
  budgetPreparationMonth,
  strategicPlanningWindowStart,
  strategicPlanningWindowEnd,
  selectedFY,
  onMilestoneClick,
}: MilestoneTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // --- Calculate FY date range ---
  const fyMatch = selectedFY.match(/FY (\d{4})/);
  const fyStartYear = fyMatch ? parseInt(fyMatch[1]) : new Date().getFullYear();
  const fyStart = new Date(fyStartYear, financialYearStartMonth - 1, financialYearStartDay);
  const fyEnd = new Date(fyStartYear + 1, financialYearStartMonth - 1, financialYearStartDay);
  fyEnd.setDate(fyEnd.getDate() - 1);

  const totalDays = (fyEnd.getTime() - fyStart.getTime()) / (1000 * 60 * 60 * 24);

  // --- Month labels ---
  const months: { label: string; position: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (financialYearStartMonth - 1 + i) % 12;
    months.push({
      label: MONTH_ABBR[monthIndex],
      position: (i / 12) * 100,
    });
  }

  // --- Today indicator ---
  const today = new Date();
  const todayDays = (today.getTime() - fyStart.getTime()) / (1000 * 60 * 60 * 24);
  const todayPosition = Math.max(0, Math.min(100, (todayDays / totalDays) * 100));
  const todayInRange = today >= fyStart && today <= fyEnd;

  // --- Strategic planning window ---
  function monthToPosition(month: number): number {
    const monthsFromStart = ((month - financialYearStartMonth + 12) % 12);
    return (monthsFromStart / 12) * 100;
  }

  let windowStartPos = 0;
  let windowWidth = 0;
  const hasWindow = strategicPlanningWindowStart !== null && strategicPlanningWindowEnd !== null;

  if (hasWindow) {
    windowStartPos = monthToPosition(strategicPlanningWindowStart!);
    const windowEndPos = monthToPosition(strategicPlanningWindowEnd!);
    if (windowEndPos >= windowStartPos) {
      windowWidth = windowEndPos - windowStartPos + (1 / 12) * 100;
    } else {
      windowWidth = (100 - windowStartPos) + windowEndPos + (1 / 12) * 100;
    }
    windowWidth = Math.min(windowWidth, 100);
  }

  const windowWraps = hasWindow && monthToPosition(strategicPlanningWindowEnd!) < monthToPosition(strategicPlanningWindowStart!);

  // --- Budget preparation diamond ---
  let budgetPosition = 0;
  if (budgetPreparationMonth) {
    const monthsFromStart = ((budgetPreparationMonth - financialYearStartMonth + 12) % 12);
    budgetPosition = ((monthsFromStart + 0.5) / 12) * 100;
  }

  // --- Plottable milestones with positions ---
  const plottable = milestones.filter((m) => m.dueDate);
  const positioned = plottable
    .map((m) => {
      const date = new Date(m.dueDate!);
      const daysSinceStart = (date.getTime() - fyStart.getTime()) / (1000 * 60 * 60 * 24);
      const position = Math.max(0, Math.min(100, (daysSinceStart / totalDays) * 100));
      return { ...m, position };
    })
    .sort((a, b) => a.position - b.position);

  return (
    <div className="relative px-4">
      {/* ── Planning window band ── */}
      {hasWindow && !windowWraps && (
        <div
          className="absolute bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/30 rounded"
          style={{
            left: `calc(${windowStartPos}% + 16px)`,
            width: `${windowWidth}%`,
            top: "0",
            bottom: "20px",
          }}
        >
          <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 whitespace-nowrap">
            Client planning window
          </span>
        </div>
      )}
      {hasWindow && windowWraps && (
        <>
          <div
            className="absolute bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/30 rounded-l"
            style={{
              left: `calc(${windowStartPos}% + 16px)`,
              width: `${100 - windowStartPos}%`,
              top: "0",
              bottom: "20px",
            }}
          >
            <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 whitespace-nowrap">
              Client planning window
            </span>
          </div>
          <div
            className="absolute bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/30 rounded-r"
            style={{
              left: "16px",
              width: `${monthToPosition(strategicPlanningWindowEnd!) + (1 / 12) * 100}%`,
              top: "0",
              bottom: "20px",
            }}
          />
        </>
      )}

      {/* ── Spacer for planning window label ── */}
      <div className="h-8" />

      {/* ── The timeline line ── */}
      <div className="relative h-px bg-border mx-4">
        {/* Today vertical line */}
        {todayInRange && (
          <>
            <div
              className="absolute w-px bg-emerald-500/50"
              style={{
                left: `${todayPosition}%`,
                top: "-28px",
                bottom: "-20px",
              }}
            />
            <div
              className="absolute -translate-x-1/2"
              style={{
                left: `${todayPosition}%`,
                top: "-26px",
              }}
            >
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-background px-1">
                Today
              </span>
            </div>
          </>
        )}

        {/* Budget deadline diamond */}
        {budgetPreparationMonth && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${budgetPosition}%` }}
            onMouseEnter={() => setHoveredId("budget")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="h-3.5 w-3.5 rotate-45 bg-blue-500 border-2 border-white dark:border-gray-900 cursor-default" />
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-blue-500 whitespace-nowrap">
              Budget
            </span>
            {hoveredId === "budget" && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-popover border shadow-md rounded-lg p-3 min-w-[180px] z-50 pointer-events-none">
                <p className="text-sm font-medium">Budget Preparation Deadline</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {MONTH_ABBR[budgetPreparationMonth - 1]} — Client needs budget inputs finalised
                </p>
              </div>
            )}
          </div>
        )}

        {/* Milestone markers */}
        {positioned.map((ms) => {
          const isHovered = hoveredId === ms.id;
          return (
            <div
              key={ms.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10"
              style={{ left: `${ms.position}%` }}
              onMouseEnter={() => setHoveredId(ms.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onMilestoneClick(ms)}
            >
              {/* The dot — larger hit area with visible ring on hover */}
              <div
                className={`h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${statusColor(ms.status)} transition-all ${isHovered ? `scale-[1.4] ring-4 ${statusRing(ms.status)}` : ""}`}
              >
                {ms.status === "complete" && (
                  <svg
                    className="h-full w-full text-white p-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-popover border shadow-md rounded-lg p-3 min-w-[220px] z-50 pointer-events-none">
                  <p className="text-sm font-medium">{ms.typeName}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusDot status={ms.status} />
                    <span className="text-xs font-medium">
                      {statusLabel(ms.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {categoryLabel(ms.typeCategory)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {ms.dueDate ? formatDate(ms.dueDate) : "Not set"}
                  </p>
                  {ms.ownerFirstName && (
                    <p className="text-xs text-muted-foreground">
                      Owner: {ms.ownerFirstName} {ms.ownerLastName}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Month labels ── */}
      <div className="relative h-7 mx-4 mt-3">
        {months.map((m) => (
          <span
            key={m.label + m.position}
            className="absolute text-[11px] text-muted-foreground/60 -translate-x-1/2"
            style={{ left: `${m.position}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
