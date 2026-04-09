"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { X } from "lucide-react";

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
  "Product Administrator",
  "Product Lead",
  "Business Analyst",
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
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetch("/api/people")
        .then((res) => res.json())
        .then(setPeople);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target as Node)
      ) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const removeRole = (role: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== role));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || selectedRoles.length === 0) {
      setError("Please select a person and at least one role");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch(`/api/platforms/${platformId}/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId: selectedPersonId,
        roleOnPlatform: selectedRoles.join(", "),
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
    setSelectedRoles([]);
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
          <div className="space-y-2" ref={roleDropdownRef}>
            <Label>Roles on Platform</Label>
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedRoles.map((role) => (
                  <Badge key={role} variant="secondary" className="gap-1">
                    {role}
                    <button
                      type="button"
                      onClick={() => removeRole(role)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-sm font-normal"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            >
              {selectedRoles.length === 0
                ? "Select roles..."
                : `${selectedRoles.length} role${selectedRoles.length > 1 ? "s" : ""} selected`}
            </Button>
            {roleDropdownOpen && (
              <div className="rounded-md border bg-popover p-1 shadow-md">
                {platformRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent ${
                      selectedRoles.includes(role) ? "bg-accent" : ""
                    }`}
                    onClick={() => toggleRole(role)}
                  >
                    <span
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        selectedRoles.includes(role)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedRoles.includes(role) && (
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <path
                            d="M1.5 5L4 7.5L8.5 2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
                      )}
                    </span>
                    {role}
                  </button>
                ))}
              </div>
            )}
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
