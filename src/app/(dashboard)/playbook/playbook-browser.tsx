"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  PlayCircle,
  FileText,
  LayoutTemplate,
  BookOpen,
  Shield,
  BookOpenCheck,
} from "lucide-react";
import { AddPlaybookDialog } from "./add-playbook-dialog";

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

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "getting_started", label: "Getting Started" },
  { value: "development", label: "Development" },
  { value: "client_work", label: "Client Work" },
  { value: "operations", label: "Operations" },
  { value: "design", label: "Design" },
  { value: "general", label: "General" },
] as const;

const CONTENT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "video", label: "Videos" },
  { value: "sop", label: "SOPs" },
  { value: "template", label: "Templates" },
  { value: "guide", label: "Guides" },
  { value: "policy", label: "Policies" },
] as const;

const CONTENT_TYPE_CONFIG: Record<
  string,
  { icon: typeof PlayCircle; accent: string; bg: string; badge: string; label: string }
> = {
  video: {
    icon: PlayCircle,
    accent: "border-l-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    badge: "border-blue-300 text-blue-700 dark:text-blue-400",
    label: "Video",
  },
  sop: {
    icon: FileText,
    accent: "border-l-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    badge: "border-green-300 text-green-700 dark:text-green-400",
    label: "SOP",
  },
  template: {
    icon: LayoutTemplate,
    accent: "border-l-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    badge: "border-purple-300 text-purple-700 dark:text-purple-400",
    label: "Template",
  },
  guide: {
    icon: BookOpen,
    accent: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    badge: "border-amber-300 text-amber-700 dark:text-amber-400",
    label: "Guide",
  },
  policy: {
    icon: Shield,
    accent: "border-l-slate-500",
    bg: "bg-slate-50 dark:bg-slate-950/30",
    badge: "border-slate-300 text-slate-700 dark:text-slate-400",
    label: "Policy",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  getting_started: "Getting Started",
  development: "Development",
  client_work: "Client Work",
  operations: "Operations",
  design: "Design",
  general: "General",
};

function getYouTubeThumbnail(url: string | null): string | null {
  if (!url) return null;
  // YouTube URL patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  let videoId: string | null = null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v");
      if (!videoId && parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split(/[?&]/)[0] || null;
      }
    } else if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1).split(/[?&]/)[0] || null;
    }
  } catch {
    return null;
  }
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function mapRoleToAudience(role: string): string {
  switch (role) {
    case "admin":
      return "management";
    case "product_lead":
      return "product_lead";
    case "contractor":
      return "contractor";
    default:
      return "employee";
  }
}

export function PlaybookBrowser() {
  const router = useRouter();
  const [items, setItems] = useState<PlaybookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeContentType, setActiveContentType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/playbook");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setRole(data.user?.role || "contractor"))
      .catch(() => setRole("contractor"));
    fetchItems();
  }, [fetchItems]);

  const isAdmin = role === "admin" || role === "product_lead";
  const userAudience = role ? mapRoleToAudience(role) : "employee";

  // Filter items by audience
  const audienceFiltered = items.filter((item) => {
    if (!item.audience) return true;
    const audiences = item.audience.split(",").map((a) => a.trim());
    return audiences.includes(userAudience);
  });

  // Determine which categories have content
  const categoriesWithContent = new Set(audienceFiltered.map((i) => i.category));

  // Filter categories: hide Operations from non-management
  const visibleCategories = CATEGORIES.filter((cat) => {
    if (cat.value === "all") return true;
    if (cat.value === "operations" && role !== "admin") return false;
    return categoriesWithContent.has(cat.value);
  });

  // Apply filters
  const filtered = audienceFiltered.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (activeContentType !== "all" && item.contentType !== activeContentType) return false;
    return true;
  });

  // Determine which content types have items in the current category view
  const contentTypesInView = new Set(
    audienceFiltered
      .filter((i) => activeCategory === "all" || i.category === activeCategory)
      .map((i) => i.contentType)
  );

  const visibleContentTypes = CONTENT_TYPES.filter((ct) => {
    if (ct.value === "all") return true;
    return contentTypesInView.has(ct.value);
  });

  const handleContentAdded = () => {
    setDialogOpen(false);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      {/* Top bar: title area + add button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            Browse guides, SOPs, videos, and templates for the team.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        )}
      </div>

      {/* Category tabs */}
      {visibleCategories.length > 1 && (
        <div className="flex gap-1 border-b">
          {visibleCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeCategory === cat.value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
              {activeCategory === cat.value && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content type pills */}
      {visibleContentTypes.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {visibleContentTypes.map((ct) => (
            <button
              key={ct.value}
              onClick={() => setActiveContentType(ct.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                activeContentType === ct.value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/30"
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      )}

      {/* Content grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpenCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-1">
            {items.length === 0
              ? "No content in the Playbook yet"
              : "No items match your filters"}
          </h3>
          <p className="text-sm text-muted-foreground/70 mb-4">
            {items.length === 0 && isAdmin
              ? "Add the first piece of content to get started."
              : items.length === 0
                ? "Content will appear here once it has been added."
                : "Try changing your category or content type filter."}
          </p>
          {items.length === 0 && isAdmin && (
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const config = CONTENT_TYPE_CONFIG[item.contentType] || CONTENT_TYPE_CONFIG.guide;
            const Icon = config.icon;
            const isVideo = item.contentType === "video";
            const thumbnail = isVideo ? getYouTubeThumbnail(item.externalUrl) : null;

            return (
              <button
                key={item.id}
                onClick={() => router.push(`/playbook/${item.id}`)}
                className={`group relative text-left rounded-lg border border-l-4 ${config.accent} overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5`}
              >
                {/* Video thumbnail area */}
                {isVideo && (
                  <div className="relative bg-slate-900 flex items-center justify-center h-36 overflow-hidden">
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                    <div className="relative rounded-full bg-black/40 p-3 group-hover:bg-black/50 transition-colors backdrop-blur-sm">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-600/80 text-white border-0 text-[10px]"
                      >
                        Video
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Card body */}
                <div className="p-4 space-y-3">
                  {/* Icon + title row (non-video) */}
                  {!isVideo && (
                    <div className="flex items-start gap-3">
                      <div className={`rounded-md p-2 ${config.bg} shrink-0`}>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-sm leading-snug pt-1 group-hover:text-foreground">
                        {item.title}
                      </h3>
                    </div>
                  )}

                  {/* Title for video cards */}
                  {isVideo && (
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-foreground">
                      {item.title}
                    </h3>
                  )}

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {CATEGORY_LABELS[item.category] || item.category}
                    </Badge>
                    {!isVideo && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${config.badge}`}
                      >
                        {config.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <AddPlaybookDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleContentAdded}
      />
    </div>
  );
}
