"use client";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleMicrosoftLogin = () => {
    // Full page navigation — ensures cookies are set properly
    window.location.href = "/api/auth/microsoft";
  };

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

        <Button
          onClick={handleMicrosoftLogin}
          className="w-full h-11 gap-3"
          variant="outline"
          disabled={loading}
        >
          <svg viewBox="0 0 21 21" className="h-5 w-5" aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          Sign in with Microsoft
        </Button>
      </div>
    </div>
  );
}
