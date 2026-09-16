import { getSql } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/session";
import { jsonError, handleRouteError } from "@/lib/api-utils";
import type { DatasetSummary } from "@/lib/types";

export const runtime = "nodejs";

const MAX_CSV_LEN = 2_000_000;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const sql = getSql();
    const rows = (await sql`
      SELECT id, name, description
      FROM datasets
      ORDER BY created_at DESC, id DESC
    `) as DatasetSummary[];

    return Response.json({ datasets: rows });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const csvContent = String(body.csvContent ?? "");

    if (!name) return jsonError("데이터 이름을 입력해주세요.");
    if (name.length > 100) return jsonError("데이터 이름이 너무 깁니다.");
    if (description.length > 500) return jsonError("설명이 너무 깁니다.");
    if (!csvContent.trim()) return jsonError("CSV 내용이 비어 있습니다.");
    if (csvContent.length > MAX_CSV_LEN) {
      return jsonError("CSV 파일이 너무 큽니다.");
    }

    const sql = getSql();
    const rows = (await sql`
      INSERT INTO datasets (name, description, csv_content)
      VALUES (${name}, ${description}, ${csvContent})
      RETURNING id
    `) as { id: number }[];

    return Response.json({ ok: true, id: rows[0].id });
  } catch (err) {
    return handleRouteError(err);
  }
}
