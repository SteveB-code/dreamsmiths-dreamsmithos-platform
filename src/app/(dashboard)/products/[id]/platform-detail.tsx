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
import { TechSelect } from "@/components/tech-select";

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
}

export function PlatformDetail({ platformId }: { platformId: string }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [technologyIds, setTechnologyIds] = useState<string[]>([]);

  const fetchPlatform = useCallback(async () => {
    try {
      const res = await fetch(`/api/platforms/${platformId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setPlatform(data);
      setTechnologyIds(data.technologies?.map((t: Technology) => t.id) || []);
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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error && !platform) return <p className="text-destructive">{error}</p>;
  if (!platform) return null;

  const activeTeam = platform.team.filter((m) => m.isActive);

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{platform.name}</span>
            <Badge
              variant={
                platform.status === "active"
                  ? "default"
                  : platform.status === "paused"
                    ? "secondary"
                    : "destructive"
              }
            >
              {platform.status}
            </Badge>
          </CardTitle>
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

      {/* Team */}
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
