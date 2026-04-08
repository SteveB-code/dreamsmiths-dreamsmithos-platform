export const dynamic = "force-dynamic";

export async function GET() {
  // Test if auth module can even be imported
  let authStatus = "unknown";
  let authError = "";
  try {
    const { auth } = await import("@/lib/auth");
    authStatus = auth ? "loaded" : "null";

    // Try to create a test request to the auth handler
    const testUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/ok`;
    const testReq = new Request(testUrl);
    const testRes = await auth.handler(testReq);
    authStatus = `loaded, handler returned ${testRes.status}`;
  } catch (e) {
    authStatus = "error";
    authError = String(e);
  }

  return Response.json({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "(not set)",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "(not set)",
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID ? "set" : "not set",
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID || "(not set)",
    expectedCallback: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/microsoft`,
    authStatus,
    authError,
  });
}
