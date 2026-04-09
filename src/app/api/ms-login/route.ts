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
      return Response.json({ error: "No redirect URL", data }, { status: 500 });
    }

    // Build redirect response, preserving all set-cookie headers from BetterAuth
    // (includes the oauth_state cookie needed for callback verification)
    const redirectResponse = new Response(null, {
      status: 302,
      headers: { Location: data.url },
    });

    // Use getSetCookie() to properly handle multiple set-cookie headers
    // without joining them (which corrupts cookie values)
    const setCookies = response.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookies) {
      redirectResponse.headers.append("set-cookie", cookie);
    }

    // Fallback for environments without getSetCookie
    if (setCookies.length === 0) {
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        redirectResponse.headers.set("set-cookie", setCookieHeader);
      }
    }

    return redirectResponse;
  } catch (error) {
    return Response.json(
      { error: "Login failed", details: String(error) },
      { status: 500 }
    );
  }
}
