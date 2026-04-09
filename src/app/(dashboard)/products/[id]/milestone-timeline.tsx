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

function shortName(name: string): string {
  const shorts: Record<string, string> = {
    "Quarterly Product Report": "Report",
    "Annual Product Report": "Annual Report",
    "Annual Technical Review": "Tech Review",
    "User Research / Feedback": "Research",
    "Internal Roadmap Prep Workshop": "Roadmap Prep",
    "Client Roadmap Workshop": "Client Roadmap",
  };
  return shorts[name] || name.split(" ").slice(0, 2).join(" ");
}

// ---------------------------------------------------------------------------
// Non-linear timeline scaling
// ---------------------------------------------------------------------------
// The pre-planning-window period (where milestones cluster) gets more visual
// space; the post-planning-window period (quieter) gets compressed.

const PRE_WINDOW_VISUAL_SHARE = 0.7; // 70% of width for pre-window period
const POST_WINDOW_VISUAL_SHARE = 0.3; // 30% for post-window period

/**
 * Build a function that maps a linear 0-100 position to a scaled position,
 * giving more space to the period before the planning window ends.
 */
function buildScaler(
  windowEndLinear: number | null,
): (linearPos: number) => number {
  // If no planning window configured, use linear mapping
  if (windowEndLinear === null || windowEndLinear <= 0 || windowEndLinear >= 100) {
    return (pos) => pos;
  }

  const boundary = windowEndLinear;
  const visualBoundary = PRE_WINDOW_VISUAL_SHARE * 100;

  return (linearPos: number) => {
    if (linearPos <= boundary) {
      // Pre-window: stretch
      return (linearPos / boundary) * visualBoundary;
    } else {
      // Post-window: compress
      return visualBoundary + ((linearPos - boundary) / (100 - boundary)) * (POST_WINDOW_VISUAL_SHARE * 100);
    }
  };
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

  // --- Helper: date → linear 0-100 position ---
  function dateToLinear(date: Date): number {
    const daysSinceStart = (date.getTime() - fyStart.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (daysSinceStart / totalDays) * 100));
  }

  // --- Helper: month number → linear 0-100 position ---
  function monthToLinear(month: number): number {
    const monthsFromStart = ((month - financialYearStartMonth + 12) % 12);
    return (monthsFromStart / 12) * 100;
  }

  // --- Build the non-linear scaler based on planning window end ---
  const hasWindow = strategicPlanningWindowStart !== null && strategicPlanningWindowEnd !== null;
  const windowEndLinear = hasWindow
    ? monthToLinear(strategicPlanningWindowEnd!) + (1 / 12) * 100 // end of the window month
    : null;
  const scale = buildScaler(windowEndLinear);

  // --- Month labels (scaled) ---
  const months: { label: string; position: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (financialYearStartMonth - 1 + i) % 12;
    const linearPos = (i / 12) * 100;
    months.push({
      label: MONTH_ABBR[monthIndex],
      position: scale(linearPos),
    });
  }

  // --- Today indicator (scaled) ---
  const today = new Date();
  const todayLinear = dateToLinear(today);
  const todayPosition = scale(todayLinear);
  const todayInRange = today >= fyStart && today <= fyEnd;

  // --- Strategic planning window band (scaled) ---
  let windowStartScaled = 0;
  let windowEndScaled = 0;
  if (hasWindow) {
    const winStartLinear = monthToLinear(strategicPlanningWindowStart!);
    const winEndLinear = monthToLinear(strategicPlanningWindowEnd!) + (1 / 12) * 100;

    const wraps = monthToLinear(strategicPlanningWindowEnd!) < monthToLinear(strategicPlanningWindowStart!);

    if (!wraps) {
      windowStartScaled = scale(winStartLinear);
      windowEndScaled = scale(winEndLinear);
    } else {
      // Wrapping is rare with this layout but handle it
      windowStartScaled = scale(winStartLinear);
      windowEndScaled = 100;
    }
  }
  const windowWidthScaled = windowEndScaled - windowStartScaled;

  // Handle wrapping planning window
  const windowWraps = hasWindow && monthToLinear(strategicPlanningWindowEnd!) < monthToLinear(strategicPlanningWindowStart!);
  let windowWrapEndScaled = 0;
  if (windowWraps) {
    const wrapEndLinear = monthToLinear(strategicPlanningWindowEnd!) + (1 / 12) * 100;
    windowWrapEndScaled = scale(wrapEndLinear);
  }

  // --- Budget preparation diamond (scaled) ---
  let budgetPositionScaled = 0;
  if (budgetPreparationMonth) {
    const monthsFromStart = ((budgetPreparationMonth - financialYearStartMonth + 12) % 12);
    const linearPos = ((monthsFromStart + 0.5) / 12) * 100;
    budgetPositionScaled = scale(linearPos);
  }

  // --- Plottable milestones with scaled positions ---
  const plottable = milestones.filter((m) => m.dueDate);
  const positioned = plottable
    .map((m) => {
      const date = new Date(m.dueDate!);
      const linearPos = dateToLinear(date);
      const position = scale(linearPos);
      return { ...m, position };
    })
    .sort((a, b) => a.position - b.position);

  // --- Stagger labels above/below to prevent overlap ---
  // Greedy placement: check actual scaled distance between labels
  const MIN_GAP = 7; // minimum % gap between label centers on the same row
  const staggered = (() => {
    let lastAbovePos = -100;
    let lastBelowPos = -100;

    return positioned.map((ms) => {
      const aboveGap = ms.position - lastAbovePos;
      const belowGap = ms.position - lastBelowPos;

      let above: boolean;
      if (belowGap >= MIN_GAP && aboveGap >= MIN_GAP) {
        above = false; // prefer below when both fit
      } else if (belowGap >= MIN_GAP) {
        above = false;
      } else if (aboveGap >= MIN_GAP) {
        above = true;
      } else {
        above = aboveGap > belowGap;
      }

      if (above) {
        lastAbovePos = ms.position;
      } else {
        lastBelowPos = ms.position;
      }

      return { ...ms, labelAbove: above };
    });
  })();

  return (
    <div className="relative px-4 overflow-visible">
      {/* ── Planning window band ── */}
      {hasWindow && !windowWraps && (
        <div
          className="absolute bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/30 rounded"
          style={{
            left: `calc(${windowStartScaled}% + 16px)`,
            width: `${windowWidthScaled}%`,
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
              left: `calc(${windowStartScaled}% + 16px)`,
              width: `${100 - windowStartScaled}%`,
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
              width: `${windowWrapEndScaled}%`,
              top: "0",
              bottom: "20px",
            }}
          />
        </>
      )}

      {/* ── Above-line spacer — reserves vertical space for above labels + Today ── */}
      <div style={{ height: "48px" }} className="mx-4" />

      {/* ── The timeline line — everything is positioned from here ── */}
      <div className="relative h-px bg-border mx-4">
        {/* Today vertical line */}
        {todayInRange && (
          <div
            className="absolute w-px bg-emerald-500/40"
            style={{
              left: `${todayPosition}%`,
              top: "-48px",
              bottom: "-28px",
            }}
          />
        )}

        {/* Today label — positioned 44px above the line */}
        {todayInRange && (
          <div
            className="absolute -translate-x-1/2 z-20"
            style={{ left: `${todayPosition}%`, top: "-48px" }}
          >
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Today
            </span>
          </div>
        )}

        {/* Above-line milestone labels — positioned 30px above the line */}
        {staggered
          .filter((ms) => ms.labelAbove)
          .map((ms) => (
            <div
              key={ms.id + "-label-above"}
              className="absolute -translate-x-1/2"
              style={{ left: `${ms.position}%`, top: "-30px" }}
            >
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {shortName(ms.typeName)}
              </span>
            </div>
          ))}

        {/* Budget deadline diamond */}
        {budgetPreparationMonth && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${budgetPositionScaled}%` }}
            onMouseEnter={() => setHoveredId("budget")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="h-3.5 w-3.5 rotate-45 bg-blue-500 border-2 border-white dark:border-gray-900 cursor-default" />
            {hoveredId === "budget" && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-popover border shadow-md rounded-lg p-3 min-w-[180px] z-50 pointer-events-none">
                <p className="text-sm font-medium">Budget Preparation Deadline</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {MONTH_ABBR[budgetPreparationMonth - 1]} — Client needs budget inputs finalised
                </p>
              </div>
            )}
          </div>
        )}

        {/* Milestone markers */}
        {staggered.map((ms) => {
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
              {/* Stem line to label */}
              {ms.labelAbove && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-px bg-border/60"
                  style={{ bottom: "100%", height: "22px" }}
                />
              )}
              {!ms.labelAbove && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-px bg-border/60"
                  style={{ top: "100%", height: "18px" }}
                />
              )}

              {/* The dot */}
              <div
                className={`h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${statusColor(ms.status)} transition-all ${isHovered ? `scale-[1.3] ring-4 ${statusRing(ms.status)}` : ""}`}
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
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 bg-popover border shadow-md rounded-lg p-3 min-w-[220px] z-50 pointer-events-none">
                  <p className="text-sm font-medium">{ms.typeName}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusDot status={ms.status} />
                    <span className="text-xs font-medium">{statusLabel(ms.status)}</span>
                    <span className="text-xs text-muted-foreground">· {categoryLabel(ms.typeCategory)}</span>
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

      {/* ── Below-line labels zone ── */}
      <div className="relative h-10 mx-4">
        {/* Below-line milestone labels */}
        {staggered
          .filter((ms) => !ms.labelAbove)
          .map((ms) => (
            <div
              key={ms.id + "-label-below"}
              className="absolute top-4 -translate-x-1/2"
              style={{ left: `${ms.position}%` }}
            >
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {shortName(ms.typeName)}
              </span>
            </div>
          ))}

        {/* Budget label (below) */}
        {budgetPreparationMonth && (
          <div
            className="absolute top-4 -translate-x-1/2"
            style={{ left: `${budgetPositionScaled}%` }}
          >
            <span className="text-[10px] font-medium text-blue-500 whitespace-nowrap">
              Budget
            </span>
          </div>
        )}
      </div>

      {/* ── Month labels ── */}
      <div className="relative h-6 mx-4 border-t border-border/40">
        {months.map((m) => (
          <span
            key={m.label + m.position}
            className="absolute text-[11px] text-muted-foreground/60 -translate-x-1/2 pt-1"
            style={{ left: `${m.position}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
