import { createSession } from "@/lib/session";
import { getAdminPassword } from "@/lib/config";
import { jsonError, handleRouteError } from "@/lib/api-utils";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 0, firstAt: now });
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const rec = attempts.get(key);
  if (rec) rec.count += 1;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

    if (tooManyAttempts(ip)) {
      return jsonError(
        "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
        429,
      );
    }

    const body = await request.json();
    const password = String(body.password ?? "");

    if (password !== getAdminPassword()) {
      recordFailure(ip);
      return jsonError("비밀번호가 올바르지 않습니다.", 401);
    }

    await createSession({ role: "admin" });
    return Response.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
