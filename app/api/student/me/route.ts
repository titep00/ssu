import { getSession, clearSession } from "@/lib/session";
import { handleRouteError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return Response.json({ student: null });
    }
    return Response.json({
      student: {
        name: session.name,
        studentNo: session.studentNo,
        classCode: session.classCode,
      },
    });
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
