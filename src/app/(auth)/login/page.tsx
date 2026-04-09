"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "microsoft",
        callbackURL: "/dashboard",
      });
    } catch (e) {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-lg bg-emerald-700 flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            DreamsmithsOS
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your DreamSmiths account
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="inline-flex items-center justify-center gap-3 w-full h-11 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 21 21" className="h-5 w-5" aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          {loading ? "Redirecting..." : "Sign in with Microsoft"}
        </button>
      </div>
    </div>
  );
}
