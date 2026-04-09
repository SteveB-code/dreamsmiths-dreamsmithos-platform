"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  PlayCircle,
  FileText,
  LayoutTemplate,
  BookOpen,
  Shield,
  ExternalLink,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";

interface PlaybookItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  contentType: string;
  externalUrl: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  markdownContent: string | null;
  audience: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  getting_started: "Getting Started",
  development: "Development",
  client_work: "Client Work",
  operations: "Operations",
  design: "Design",
  general: "General",
};

const CONTENT_TYPE_CONFIG: Record<
  string,
  { icon: typeof PlayCircle; badge: string; label: string }
> = {
  video: {
    icon: PlayCircle,
    badge: "border-blue-300 text-blue-700 dark:text-blue-400",
    label: "Video",
  },
  sop: {
    icon: FileText,
    badge: "border-green-300 text-green-700 dark:text-green-400",
    label: "SOP",
  },
  template: {
    icon: LayoutTemplate,
    badge: "border-purple-300 text-purple-700 dark:text-purple-400",
    label: "Template",
  },
  guide: {
    icon: BookOpen,
    badge: "border-amber-300 text-amber-700 dark:text-amber-400",
    label: "Guide",
  },
  policy: {
    icon: Shield,
    badge: "border-slate-300 text-slate-700 dark:text-slate-400",
    label: "Policy",
  },
};

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

function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

function renderSimpleMarkdown(text: string): string {
  return text
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      // Headings
      if (trimmed.startsWith("### ")) {
        const content = formatInline(trimmed.slice(4));
        return `<h3 class="text-lg font-semibold mt-6 mb-2">${content}</h3>`;
      }
      if (trimmed.startsWith("## ")) {
        const content = formatInline(trimmed.slice(3));
        return `<h2 class="text-xl font-semibold mt-8 mb-3">${content}</h2>`;
      }
      if (trimmed.startsWith("# ")) {
        const content = formatInline(trimmed.slice(2));
        return `<h1 class="text-2xl font-bold mt-8 mb-4">${content}</h1>`;
      }

      // Bullet lists
      const lines = trimmed.split("\n");
      if (lines.every((l) => /^[-*]\s/.test(l.trim()))) {
        const items = lines
          .map((l) => `<li>${formatInline(l.trim().replace(/^[-*]\s/, ""))}</li>`)
          .join("");
        return `<ul class="list-disc pl-6 space-y-1 my-3">${items}</ul>`;
      }

      // Numbered lists
      if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
        const items = lines
          .map((l) => `<li>${formatInline(l.trim().replace(/^\d+\.\s/, ""))}</li>`)
          .join("");
        return `<ol class="list-decimal pl-6 space-y-1 my-3">${items}</ol>`;
      }

      // Paragraph
      const content = formatInline(trimmed.replace(/\n/g, "<br/>"));
      return `<p class="my-3 leading-relaxed">${content}</p>`;
    })
    .join("");
}

function formatInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface PlaybookItemDetailProps {
  id: string;
}

export function PlaybookItemDetail({ id }: PlaybookItemDetailProps) {
  const router = useRouter();
  const [item, setItem] = useState<PlaybookItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContentType, setEditContentType] = useState("");
  const [editExternalUrl, setEditExternalUrl] = useState("");
  const [editMarkdownContent, setEditMarkdownContent] = useState("");

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/playbook/${id}`);
      if (!res.ok) {
        setItem(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setItem(data);
    } catch {
      setItem(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setRole(data.user?.role || "contractor"))
      .catch(() => setRole("contractor"));
    fetchItem();
  }, [fetchItem]);

  const isAdmin = role === "admin" || role === "product_lead";

  const startEditing = () => {
    if (!item) return;
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditCategory(item.category);
    setEditContentType(item.contentType);
    setEditExternalUrl(item.externalUrl || "");
    setEditMarkdownContent(item.markdownContent || "");
    setEditing(true);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/playbook/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          category: editCategory,
          contentType: editContentType,
          externalUrl: editExternalUrl || null,
          markdownContent: editMarkdownContent || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        setSaving(false);
        return;
      }
      setEditing(false);
      fetchItem();
    } catch {
      setError("Failed to update");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/playbook/${id}`, { method: "DELETE" });
      router.push("/playbook");
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Item not found.</p>
        <Link href="/playbook">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playbook
          </Button>
        </Link>
      </div>
    );
  }

  const config = CONTENT_TYPE_CONFIG[item.contentType] || CONTENT_TYPE_CONFIG.guide;
  const Icon = config.icon;

  const embedUrl =
    item.externalUrl && item.contentType === "video"
      ? getVideoEmbedUrl(item.externalUrl)
      : null;

  const isNonVideoExternalUrl =
    item.externalUrl && item.contentType !== "video";

  const audienceLabels: Record<string, string> = {
    management: "Management",
    product_lead: "Product Leads",
    employee: "Employees",
    contractor: "Contractors",
  };

  // Edit mode
  if (editing) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/playbook"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Playbook
        </Link>

        <h2 className="text-xl font-semibold">Edit Content</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editTitle">Title</Label>
            <Input
              id="editTitle"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editDescription">Description</Label>
            <Textarea
              id="editDescription"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editCategory} onValueChange={(v) => setEditCategory(v ?? "general")}>
                <SelectTrigger>
                  <SelectValue />
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
              <Select value={editContentType} onValueChange={(v) => setEditContentType(v ?? "guide")}>
                <SelectTrigger>
                  <SelectValue />
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
          <div className="space-y-2">
            <Label htmlFor="editExternalUrl">External URL</Label>
            <Input
              id="editExternalUrl"
              value={editExternalUrl}
              onChange={(e) => setEditExternalUrl(e.target.value)}
              placeholder={
                editContentType === "video"
                  ? "YouTube or Vimeo URL"
                  : "External resource URL"
              }
            />
          </div>
          {editContentType !== "video" && (
            <div className="space-y-2">
              <Label htmlFor="editMarkdownContent">Content (Markdown)</Label>
              <Textarea
                id="editMarkdownContent"
                value={editMarkdownContent}
                onChange={(e) => setEditMarkdownContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <div className="flex-1" />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/playbook"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Playbook
        </Link>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil className="h-3 w-3 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">
            {CATEGORY_LABELS[item.category] || item.category}
          </Badge>
          <Badge variant="outline" className={config.badge}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          {item.audience && (
            <span className="text-xs text-muted-foreground">
              {item.audience
                .split(",")
                .map((a) => audienceLabels[a.trim()] || a.trim())
                .join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* Video embed */}
      {embedUrl && (
        <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-black" style={{ maxWidth: "800px" }}>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.title}
            />
          </div>
        </div>
      )}

      {/* Description */}
      {item.description && (
        <p className="text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Markdown content */}
      {item.markdownContent && (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: renderSimpleMarkdown(item.markdownContent),
          }}
        />
      )}

      {/* File info card */}
      {item.fileUrl && item.fileName && (
        <div className="rounded-lg border p-4 flex items-center gap-4">
          <div className="rounded-md bg-muted p-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{item.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {item.mimeType}
              {item.fileSize ? ` — ${formatFileSize(item.fileSize)}` : ""}
            </p>
          </div>
          <a href={item.fileUrl} download={item.fileName}>
            <Button variant="outline" size="sm">
              <Download className="h-3 w-3 mr-2" />
              Download
            </Button>
          </a>
        </div>
      )}

      {/* External URL (non-video) */}
      {isNonVideoExternalUrl && (
        <div className="rounded-lg border p-4 flex items-center gap-4">
          <div className="rounded-md bg-muted p-3">
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">External Resource</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.externalUrl}
            </p>
          </div>
          <a
            href={item.externalUrl!}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              Open Resource
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </a>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground pt-4">
        Last updated{" "}
        {new Date(item.updatedAt).toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
