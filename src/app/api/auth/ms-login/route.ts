import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  try {
    const signInReq = new Request(`${baseURL}/api/auth/sign-in/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "microsoft",
        callbackURL: "/dashboard",
      }),
    });

    const response = await auth.handler(signInReq);
    const data = await response.json();

    if (!data.url) {
      return NextResponse.json({ error: "No redirect URL returned" }, { status: 500 });
    }

    // Build redirect response with cookies from BetterAuth
    const redirectResponse = NextResponse.redirect(data.url);

    // Forward all Set-Cookie headers (contains the state cookie needed for callback)
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      redirectResponse.headers.set("set-cookie", setCookieHeader);
    }

    return redirectResponse;
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed", details: String(error) },
      { status: 500 }
    );
  }
}
