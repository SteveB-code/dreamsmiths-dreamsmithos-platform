import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Create a POST request to the sign-in endpoint (as BetterAuth expects)
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const signInReq = new Request(`${baseURL}/api/auth/sign-in/social`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: "microsoft",
      callbackURL: "/dashboard",
    }),
  });

  const response = await auth.handler(signInReq);
  const data = await response.json();

  if (data.url) {
    // Return a redirect response that also sets the cookies from BetterAuth
    const redirectResponse = new Response(null, {
      status: 302,
      headers: {
        Location: data.url,
      },
    });

    // Copy all Set-Cookie headers from BetterAuth's response
    const cookies = response.headers.getSetCookie?.() || [];
    for (const cookie of cookies) {
      redirectResponse.headers.append("Set-Cookie", cookie);
    }

    return redirectResponse;
  }

  return Response.json({ error: "Failed to get redirect URL" }, { status: 500 });
}
