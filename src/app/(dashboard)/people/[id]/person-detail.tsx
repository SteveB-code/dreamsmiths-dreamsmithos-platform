"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { TechSelect } from "@/components/tech-select";

interface PlatformAssignment {
  assignmentId: string;
  platformId: string;
  platformName: string;
  clientOrg: string;
  roleOnPlatform: string;
  isActive: boolean;
}

interface Technology {
  id: string;
  name: string;
  category: string;
}

interface OnboardingJourney {
  id: string;
  status: "invited" | "in_progress" | "completed";
  currentStep: number;
  completedAt: string | null;
}

interface PersonData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  type: "contractor" | "employee";
  status: "active" | "inactive" | "offboarded";
  dateJoined: string;
  platforms: PlatformAssignment[];
  technologies: Technology[];
  onboarding: OnboardingJourney | null;
}

export function PersonDetail({ personId }: { personId: string }) {
  const router = useRouter();
  const [person, setPerson] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [technologyIds, setTechnologyIds] = useState<string[]>([]);
  const [startingOnboarding, setStartingOnboarding] = useState(false);

  useEffect(() => {
    fetch(`/api/people/${personId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setPerson(data);
        setTechnologyIds(data.technologies?.map((t: Technology) => t.id) || []);
      })
      .catch(() => setError("Person not found"))
      .finally(() => setLoading(false));
  }, [personId]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      address: formData.get("address") || null,
      type: formData.get("type"),
      status: formData.get("status"),
      technologyIds,
    };

    const res = await fetch(`/api/people/${personId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setError("Failed to save changes");
    } else {
      const updated = await res.json();
      setPerson((prev) => (prev ? { ...prev, ...updated } : prev));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this person?")) return;

    const res = await fetch(`/api/people/${personId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/people");
    }
  };

  const handleStartOnboarding = async () => {
    setStartingOnboarding(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId }),
      });
      if (!res.ok) throw new Error("Failed to start onboarding");
      const journey = await res.json();
      router.push(`/onboarding/${journey.id}`);
    } catch {
      setError("Failed to start onboarding");
      setStartingOnboarding(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (error && !person) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!person) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/people"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to People
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{person.firstName} {person.lastName}</span>
            <div className="flex gap-2">
              <Badge variant={person.type === "employee" ? "default" : "secondary"}>
                {person.type}
              </Badge>
              <Badge
                variant={
                  person.status === "active"
                    ? "default"
                    : person.status === "inactive"
                      ? "secondary"
                      : "destructive"
                }
              >
                {person.status}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={person.firstName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={person.lastName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={person.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={person.phone || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={person.address || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={person.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={person.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="offboarded">Offboarded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Technologies</Label>
              <TechSelect
                selectedIds={technologyIds}
                onChange={setTechnologyIds}
              />
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

      {/* Product Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {person.platforms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Not assigned to any products yet.
            </p>
          ) : (
            <div className="space-y-3">
              {person.platforms.map((pa) => (
                <div
                  key={pa.assignmentId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <Link
                      href={`/products/${pa.platformId}`}
                      className="font-medium hover:underline"
                    >
                      {pa.platformName}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {pa.clientOrg}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pa.roleOnPlatform.split(", ").map((role: string) => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))}
                    {!pa.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboarding */}
      {person.type === "contractor" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Contractor Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!person.onboarding ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  No onboarding journey started yet.
                </p>
                <Button
                  onClick={handleStartOnboarding}
                  disabled={startingOnboarding}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  {startingOnboarding
                    ? "Starting..."
                    : "Start Onboarding"}
                </Button>
              </div>
            ) : person.onboarding.status === "completed" ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    Completed
                  </Badge>
                  {person.onboarding.completedAt && (
                    <span className="text-sm text-muted-foreground">
                      Completed on{" "}
                      {new Date(
                        person.onboarding.completedAt
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Link href={`/onboarding/${person.onboarding.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="default">In Progress</Badge>
                  <span className="text-sm text-muted-foreground">
                    Step {person.onboarding.currentStep} of 7
                  </span>
                </div>
                <Link href={`/onboarding/${person.onboarding.id}`}>
                  <Button size="sm">Continue</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
