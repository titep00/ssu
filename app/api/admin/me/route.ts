import { getSession, clearSession } from "@/lib/session";
import { handleRouteError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    return Response.json({ isAdmin: session?.role === "admin" });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE() {
  try {
    await clearSession();
    return Response.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
