"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ContractorRedirect() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role === "contractor" && data.activeOnboarding) {
          router.replace(`/onboarding/${data.activeOnboarding.id}`);
        }
      })
      .catch(() => {
        // Silently fail — admin users won't be affected
      });
  }, [router]);

  return null;
}
