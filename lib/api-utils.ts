import { SessionError } from "./session";

export function jsonError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function handleRouteError(err: unknown): Response {
  if (err instanceof SessionError) {
    return jsonError(err.message, 401);
  }
  console.error("API 오류:", err);
  return jsonError("서버 오류가 발생했습니다.", 500);
}
