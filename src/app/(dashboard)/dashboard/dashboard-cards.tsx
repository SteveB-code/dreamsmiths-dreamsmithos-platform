"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Monitor, ShieldCheck, Briefcase, AlertTriangle, UserPlus, FileText } from "lucide-react";

interface DashboardData {
  totalPeople: number;
  contractors: number;
  activePlatforms: number;
  complianceOverdue: number;
  compliancePending: number;
  onboardingActive: number;
  contractsExpiringSoon: number;
}

const cards = [
  { key: "totalPeople", label: "Total People", sub: "Active team members", icon: Users, href: "/people" },
  { key: "contractors", label: "Contractors", sub: "External contractors", icon: Briefcase, href: "/people" },
  { key: "activePlatforms", label: "Active Platforms", sub: "Client platforms managed", icon: Monitor, href: "/platforms" },
  { key: "compliancePending", label: "Compliance", sub: "Pending reviews", icon: ShieldCheck, href: null },
  { key: "complianceOverdue", label: "Overdue", sub: "Compliance items overdue", icon: AlertTriangle, href: null },
  { key: "onboardingActive", label: "Onboarding", sub: "Active onboarding journeys", icon: UserPlus, href: "/onboarding" },
  { key: "contractsExpiringSoon", label: "Contracts", sub: "Expiring within 4 months", icon: FileText, href: "/contracts" },
] as const;

export function DashboardCards() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const val = (key: string) => {
    if (!data) return "--";
    const n = data[key as keyof DashboardData];
    return n !== undefined ? String(n) : "--";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.key}
          className={card.href ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
          onClick={card.href ? () => router.push(card.href) : undefined}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{val(card.key)}</div>
            <p className="text-xs text-muted-foreground">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
