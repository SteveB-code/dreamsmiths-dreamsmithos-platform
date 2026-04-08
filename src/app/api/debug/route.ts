export const dynamic = "force-dynamic";

export async function GET() {
  const { auth } = await import("@/lib/auth");

  // Test the social sign-in endpoint directly
  let signInResult = "unknown";
  try {
    const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const testReq = new Request(`${baseURL}/api/auth/sign-in/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "microsoft",
        callbackURL: "/dashboard",
      }),
    });
    const testRes = await auth.handler(testReq);
    const body = await testRes.text();
    signInResult = `status: ${testRes.status}, headers: ${JSON.stringify(Object.fromEntries(testRes.headers.entries()))}, body: ${body.substring(0, 500)}`;
  } catch (e) {
    signInResult = `error: ${String(e)}`;
  }

  return Response.json({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "(not set)",
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID ? "set" : "not set",
    signInResult,
  });
}
