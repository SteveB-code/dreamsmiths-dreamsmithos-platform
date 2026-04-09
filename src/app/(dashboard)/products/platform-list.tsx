"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { AddPlatformDialog } from "./add-platform-dialog";

interface Platform {
  id: string;
  name: string;
  clientOrg: string;
  status: "active" | "paused" | "archived";
  retainerTier: string | null;
  dateOnboarded: string;
}

export function PlatformList() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPlatforms = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/platforms?${params}`);
    const data = await res.json();
    setPlatforms(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const handlePlatformAdded = () => {
    setDialogOpen(false);
    fetchPlatforms();
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const;
      case "paused":
        return "secondary" as const;
      case "archived":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Retainer Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : platforms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No products found. Add your first client product.
                </TableCell>
              </TableRow>
            ) : (
              platforms.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => window.location.href = `/products/${p.id}`}
                >
                  <TableCell className="font-medium">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.clientOrg}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.retainerTier || "\u2014"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddPlatformDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handlePlatformAdded}
      />
    </div>
  );
}
