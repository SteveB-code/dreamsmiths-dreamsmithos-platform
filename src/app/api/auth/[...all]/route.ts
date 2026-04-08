import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error("Auth GET error:", error);
    return Response.json(
      { error: "Auth handler failed", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error("Auth POST error:", error);
    return Response.json(
      { error: "Auth handler failed", message: String(error) },
      { status: 500 }
    );
  }
}
