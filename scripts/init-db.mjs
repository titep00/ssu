import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL 이 없습니다. .env.local 에 Neon 연결 문자열을 넣고 다시 실행하세요.",
  );
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      class_code TEXT NOT NULL,
      student_no TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (class_code, student_no)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS datasets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      csv_content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      dataset_name TEXT NOT NULL DEFAULT '',
      chart_type TEXT NOT NULL,
      chart_data_url TEXT NOT NULL,
      analysis_text TEXT NOT NULL DEFAULT '',
      score INTEGER,
      feedback TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      graded_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_student
      ON submissions (student_id)
  `;

  console.log("데이터베이스 테이블 준비 완료: students, datasets, submissions");
}

main().catch((err) => {
  console.error("초기화 실패:", err);
  process.exit(1);
});
