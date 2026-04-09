"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Technology {
  id: string;
  name: string;
  category: string;
}

interface TechSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TechSelect({ selectedIds, onChange }: TechSelectProps) {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/technologies")
      .then((res) => res.json())
      .then(setTechnologies);
  }, []);

  const selected = technologies.filter((t) => selectedIds.includes(t.id));
  const available = technologies.filter((t) => !selectedIds.includes(t.id));

  // Group available by category
  const grouped = available.reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    },
    {} as Record<string, Technology[]>,
  );

  const categoryLabels: Record<string, string> = {
    frontend: "Frontend",
    backend: "Backend",
    mobile: "Mobile",
    cloud: "Cloud",
    database: "Database",
    other: "Other",
  };

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((t) => (
            <Badge key={t.id} variant="secondary" className="gap-1 pr-1">
              {t.name}
              <button
                type="button"
                onClick={() => toggle(t.id)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add button / dropdown */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
        >
          + Add technology
        </Button>

        {open && (
          <div className="absolute z-50 mt-1 w-64 max-h-60 overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
            {Object.entries(grouped).map(([category, techs]) => (
              <div key={category} className="mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                  {categoryLabels[category] || category}
                </p>
                {techs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent"
                    onClick={() => {
                      toggle(t.id);
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            ))}
            {available.length === 0 && (
              <p className="text-sm text-muted-foreground px-2 py-1">
                All technologies selected
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
