export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "(not set)",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "(not set)",
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID ? "set" : "not set",
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID || "(not set)",
    expectedCallback: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/microsoft`,
  });
}
