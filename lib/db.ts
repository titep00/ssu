import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cachedSql: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (cachedSql) return cachedSql;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 환경변수가 없습니다. 로컬은 .env.local, 배포는 Vercel 프로젝트 설정에 Neon 연결 문자열을 넣어주세요.",
    );
  }

  cachedSql = neon(connectionString);
  return cachedSql;
}
