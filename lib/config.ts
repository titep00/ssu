import "server-only";

export function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    throw new Error(
      "ADMIN_PASSWORD 환경변수가 없습니다. .env.local 또는 Vercel 설정에 관리자 비밀번호를 넣어주세요.",
    );
  }
  return pw;
}

export function getAllowedClassCodes(): string[] {
  const raw = process.env.CLASS_CODES ?? "";
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export function isClassCodeAllowed(code: string): boolean {
  const allowed = getAllowedClassCodes();
  if (allowed.length === 0) return true;
  return allowed.includes(code.trim());
}
