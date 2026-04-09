"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  clientOrg: string;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
}

interface AddContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddContractDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddContractDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/platforms")
        .then((res) => res.json())
        .then((data) => setPlatforms(data))
        .catch(() => setPlatforms([]));
      fetch("/api/people")
        .then((res) => res.json())
        .then((data) => setPeople(data.filter((p: Person) => p.type === "employee")))
        .catch(() => setPeople([]));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      platformId: selectedPlatformId,
      title: formData.get("title"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      notes: formData.get("notes") || null,
      ownerId: selectedOwnerId || null,
    };

    if (!body.platformId) {
      setError("Please select a platform");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create contract");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSelectedPlatformId("");
    setSelectedOwnerId("");
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformId">Platform</Label>
            <Select value={selectedPlatformId} onValueChange={(v) => setSelectedPlatformId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.clientOrg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. Annual Retainer Agreement 2026"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerId">Owner</Label>
            <Select value={selectedOwnerId} onValueChange={(v) => setSelectedOwnerId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select contract owner" />
              </SelectTrigger>
              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Person responsible for managing this contract&apos;s renewal
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Optional notes about this contract"
            />
          </div>
          <div className="space-y-2">
            <Label>Document</Label>
            <div className="flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 p-6">
              <div className="text-center">
                <Upload className="mx-auto h-5 w-5 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground/50">
                  PDF upload coming soon
                </p>
              </div>
            </div>
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
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
