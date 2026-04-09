import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    // Build a manual redirect with the state cookie
    const setCookieHeader = response.headers.get("set-cookie");

    return new Response(
      `<html><head><meta http-equiv="refresh" content="0;url=${data.url}"></head><body>Redirecting to Microsoft...</body></html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          ...(setCookieHeader ? { "Set-Cookie": setCookieHeader } : {}),
        },
      }
    );
  } catch (error) {
    return Response.json(
      { error: "Login failed", details: String(error) },
      { status: 500 }
    );
  }
}
