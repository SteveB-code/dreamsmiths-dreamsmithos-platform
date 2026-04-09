"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
}

interface AssignPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platformId: string;
  onSuccess: () => void;
}

const platformRoles = [
  "Product Lead",
  "Architect",
  "Lead Dev",
  "Senior Dev",
  "Developer",
  "UX Specialist",
  "QA",
];

export function AssignPersonDialog({
  open,
  onOpenChange,
  platformId,
  onSuccess,
}: AssignPersonDialogProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [roleOnPlatform, setRoleOnPlatform] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/people")
        .then((res) => res.json())
        .then(setPeople);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !roleOnPlatform) {
      setError("Please select a person and role");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch(`/api/platforms/${platformId}/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId: selectedPersonId,
        roleOnPlatform,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to assign person");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSelectedPersonId("");
    setRoleOnPlatform("");
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Person to Platform</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Person</Label>
            <Select value={selectedPersonId} onValueChange={(v) => setSelectedPersonId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Role on Platform</Label>
            <Select value={roleOnPlatform} onValueChange={(v) => setRoleOnPlatform(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {platformRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
