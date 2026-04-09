"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TechSelect } from "@/components/tech-select";

interface AddPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddPlatformDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPlatformDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [technologyIds, setTechnologyIds] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      clientOrg: formData.get("clientOrg"),
      retainerTier: formData.get("retainerTier") || null,
      description: formData.get("description") || null,
      technologyIds,
    };

    const res = await fetch("/api/platforms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create platform");
      setSaving(false);
      return;
    }

    setSaving(false);
    setTechnologyIds([]);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Platform</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Platform Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Client Portal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientOrg">Client Organisation</Label>
            <Input
              id="clientOrg"
              name="clientOrg"
              required
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retainerTier">Retainer Tier</Label>
            <Input
              id="retainerTier"
              name="retainerTier"
              placeholder="e.g. Growth, Enterprise"
            />
          </div>
          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <TechSelect
              selectedIds={technologyIds}
              onChange={setTechnologyIds}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Brief description of the platform"
            />
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
              {saving ? "Adding..." : "Add Platform"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
