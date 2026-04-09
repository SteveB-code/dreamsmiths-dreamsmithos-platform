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

function shortName(name: string): string {
  const shorts: Record<string, string> = {
    "Quarterly Product Report": "Report",
    "Annual Product Report": "Annual",
    "Annual Technical Review": "Tech Review",
    "User Research / Feedback": "Research",
    "Internal Roadmap Prep Workshop": "Roadmap Prep",
    "Client Roadmap Workshop": "Client Rdmap",
  };
  return shorts[name] || name.split(" ").slice(0, 2).join(" ");
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
    // Handle wrap-around (e.g. Nov to Feb)
    if (windowEndPos >= windowStartPos) {
      windowWidth = windowEndPos - windowStartPos + (1 / 12) * 100;
    } else {
      // Wraps around the year boundary
      windowWidth = (100 - windowStartPos) + windowEndPos + (1 / 12) * 100;
    }
    // Clamp to 100
    windowWidth = Math.min(windowWidth, 100);
  }

  // --- Budget preparation diamond ---
  let budgetPosition = 0;
  if (budgetPreparationMonth) {
    // Position at the middle of the month
    const monthsFromStart = ((budgetPreparationMonth - financialYearStartMonth + 12) % 12);
    budgetPosition = ((monthsFromStart + 0.5) / 12) * 100;
  }

  // --- Plottable milestones ---
  const plottable = milestones.filter((m) => m.dueDate);
  const positioned = plottable.map((m) => {
    const date = new Date(m.dueDate!);
    const daysSinceStart = (date.getTime() - fyStart.getTime()) / (1000 * 60 * 60 * 24);
    const position = Math.max(0, Math.min(100, (daysSinceStart / totalDays) * 100));
    return { ...m, position };
  });

  // For wrapping window we need two bands
  const windowWraps = hasWindow && monthToPosition(strategicPlanningWindowEnd!) < monthToPosition(strategicPlanningWindowStart!);

  return (
    <div className="relative py-8 px-4">
      {/* Strategic planning window band */}
      {hasWindow && !windowWraps && (
        <div
          className="absolute top-2 bottom-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded"
          style={{ left: `calc(${windowStartPos}% + 16px)`, width: `${windowWidth}%` }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-500 whitespace-nowrap">
            Client planning window
          </span>
        </div>
      )}
      {hasWindow && windowWraps && (
        <>
          {/* First part: from start to end of timeline */}
          <div
            className="absolute top-2 bottom-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-l"
            style={{
              left: `calc(${windowStartPos}% + 16px)`,
              width: `${100 - windowStartPos}%`,
            }}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-500 whitespace-nowrap">
              Client planning window
            </span>
          </div>
          {/* Second part: from beginning of timeline to end month */}
          <div
            className="absolute top-2 bottom-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-r"
            style={{
              left: "16px",
              width: `${monthToPosition(strategicPlanningWindowEnd!) + (1 / 12) * 100}%`,
            }}
          />
        </>
      )}

      {/* The timeline line */}
      <div className="relative h-px bg-border mx-4 my-8">
        {/* Today marker */}
        {todayInRange && (
          <div
            className="absolute -top-8 bottom-0 w-px bg-foreground/30"
            style={{ left: `${todayPosition}%` }}
          >
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-foreground/50">
              Today
            </span>
          </div>
        )}

        {/* Budget deadline diamond */}
        {budgetPreparationMonth && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-default"
            style={{ left: `${budgetPosition}%` }}
          >
            <div
              className="h-3.5 w-3.5 rotate-45 bg-blue-500 border-2 border-white dark:border-gray-900"
              title={`Budget deadline: ${MONTH_ABBR[budgetPreparationMonth - 1]}`}
            />
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-600 dark:text-blue-400 whitespace-nowrap">
              Budget
            </span>
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
              {/* The dot */}
              <div
                className={`h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${statusColor(ms.status)} transition-transform ${isHovered ? "scale-125" : ""}`}
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

              {/* Label below */}
              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap max-w-[60px] truncate text-center">
                {shortName(ms.typeName)}
              </span>

              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-popover border shadow-md rounded-lg p-3 min-w-[200px] z-50">
                  <p className="text-sm font-medium">{ms.typeName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusDot status={ms.status} />
                    <span className="text-xs text-muted-foreground">
                      {statusLabel(ms.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {ms.dueDate ? formatDate(ms.dueDate) : "Not set"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Owner:{" "}
                    {ms.ownerFirstName
                      ? `${ms.ownerFirstName} ${ms.ownerLastName}`
                      : "Unassigned"}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Month labels */}
      <div className="relative h-5 mx-4">
        {months.map((m) => (
          <span
            key={m.label + m.position}
            className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
            style={{ left: `${m.position}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
