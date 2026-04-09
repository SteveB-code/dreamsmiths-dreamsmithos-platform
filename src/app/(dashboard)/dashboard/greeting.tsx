"use client";

import { useEffect, useState } from "react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.name) {
          // Use first name only
          setName(data.user.name.split(" ")[0]);
        }
      })
      .catch(() => {});
  }, []);

  if (!name) return null;

  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-tight">
        {getGreeting()}, {name}
      </h2>
      <p className="text-sm text-muted-foreground">
        Here&apos;s what&apos;s happening across Dreamsmiths today.
      </p>
    </div>
  );
}
