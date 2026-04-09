"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Renewal {
  id: string;
  title: string;
  platformName: string;
  clientOrg: string;
  endDate: string;
  ownerFirstName: string | null;
  ownerLastName: string | null;
}

function daysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function indicatorColor(days: number) {
  if (days < 0 || days < 30) return "bg-red-400";
  if (days <= 60) return "bg-amber-400";
  return "bg-green-400";
}

export function UpcomingRenewals() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts/renewals?months=4")
      .then((res) => res.json())
      .then((data) => setRenewals(data))
      .catch(() => setRenewals([]))
      .finally(() => setLoading(false));
  }, []);

  const displayed = renewals.slice(0, 5);
  const hasMore = renewals.length > 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Renewals</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : renewals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contracts due for renewal in the next 4 months
          </p>
        ) : (
          <div className="space-y-3">
            {displayed.map((r) => {
              const days = daysUntil(r.endDate);
              const label =
                days >= 0
                  ? `in ${days} days`
                  : `${Math.abs(days)} days overdue`;

              return (
                <Link
                  key={r.id}
                  href={`/contracts/${r.id}`}
                  className="flex items-start gap-3 rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${indicatorColor(days)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight truncate">
                      {r.platformName}{" "}
                      <span className="text-muted-foreground font-normal">
                        · {r.clientOrg}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {r.title}
                      {r.ownerFirstName && (
                        <span className="ml-1">· {r.ownerFirstName} {r.ownerLastName}</span>
                      )}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${days < 0 ? "text-red-600" : days <= 30 ? "text-amber-600" : "text-muted-foreground"}`}
                    >
                      {new Date(r.endDate).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      — {label}
                    </p>
                  </div>
                </Link>
              );
            })}
            {hasMore && (
              <Link
                href="/contracts"
                className="block text-center text-sm text-muted-foreground hover:text-foreground pt-1"
              >
                View all
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
