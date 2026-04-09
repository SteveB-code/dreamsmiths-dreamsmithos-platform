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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";

interface AddPlaybookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "getting_started", label: "Getting Started" },
  { value: "development", label: "Development" },
  { value: "client_work", label: "Client Work" },
  { value: "operations", label: "Operations" },
  { value: "design", label: "Design" },
  { value: "general", label: "General" },
];

const CONTENT_TYPES = [
  { value: "video", label: "Video" },
  { value: "sop", label: "SOP" },
  { value: "template", label: "Template" },
  { value: "guide", label: "Guide" },
  { value: "policy", label: "Policy" },
];

const AUDIENCES = [
  { value: "management", label: "Management" },
  { value: "product_lead", label: "Product Leads" },
  { value: "employee", label: "Employees" },
  { value: "contractor", label: "Contractors" },
];

export function AddPlaybookDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPlaybookDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [contentType, setContentType] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(
    AUDIENCES.map((a) => a.value)
  );

  const toggleAudience = (value: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(value)
        ? prev.filter((a) => a !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const body = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      category,
      contentType,
      externalUrl: (formData.get("externalUrl") as string) || null,
      markdownContent: (formData.get("markdownContent") as string) || null,
      audience: selectedAudiences.join(","),
    };

    if (!body.title) {
      setError("Title is required");
      setSaving(false);
      return;
    }

    if (!body.category) {
      setError("Please select a category");
      setSaving(false);
      return;
    }

    if (!body.contentType) {
      setError("Please select a content type");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create item");
        setSaving(false);
        return;
      }

      setSaving(false);
      setCategory("");
      setContentType("");
      setSelectedAudiences(AUDIENCES.map((a) => a.value));
      onSuccess();
    } catch {
      setError("Failed to create item");
      setSaving(false);
    }
  };

  const isVideo = contentType === "video";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. How to Set Up Your Dev Environment"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Brief description of this content"
            />
          </div>

          {/* Category + Content Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "general")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v ?? "guide")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content source — contextual */}
          {contentType && (
            <div className="space-y-3 rounded-md border p-4 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Content Source
              </p>

              {isVideo ? (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    name="externalUrl"
                    type="url"
                    placeholder="Paste YouTube or Vimeo URL"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="markdownContent">Content (Markdown)</Label>
                    <Textarea
                      id="markdownContent"
                      name="markdownContent"
                      rows={6}
                      placeholder="Write or paste content here using Markdown formatting..."
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>File Upload</Label>
                    <div className="flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-5 w-5 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground/50">
                          File upload coming soon
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can add text content, link to a file, or both.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* External URL (always visible when not video, or as secondary for video) */}
          {!isVideo && (
            <div className="space-y-2">
              <Label htmlFor="externalUrl">External URL (optional)</Label>
              <Input
                id="externalUrl"
                name="externalUrl"
                type="url"
                placeholder="Link to an external resource"
              />
            </div>
          )}

          {/* Audience */}
          <div className="space-y-2">
            <Label>Audience</Label>
            <p className="text-xs text-muted-foreground">
              Uncheck to restrict who can see this content.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {AUDIENCES.map((a) => (
                <label
                  key={a.value}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAudiences.includes(a.value)}
                    onChange={() => toggleAudience(a.value)}
                    className="rounded border-input"
                  />
                  {a.label}
                </label>
              ))}
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
