import { getSql } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/session";
import { jsonError, handleRouteError } from "@/lib/api-utils";
import type { Dataset } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const { id } = await ctx.params;
    const datasetId = Number(id);
    if (!Number.isInteger(datasetId)) {
      return jsonError("잘못된 데이터셋 번호입니다.");
    }

    const sql = getSql();
    const rows = (await sql`
      SELECT id, name, description, csv_content, created_at
      FROM datasets
      WHERE id = ${datasetId}
    `) as Dataset[];

    if (rows.length === 0) {
      return jsonError("데이터셋을 찾을 수 없습니다.", 404);
    }

    return Response.json({ dataset: rows[0] });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await ctx.params;
    const datasetId = Number(id);
    if (!Number.isInteger(datasetId)) {
      return jsonError("잘못된 데이터셋 번호입니다.");
    }

    const sql = getSql();
    await sql`DELETE FROM datasets WHERE id = ${datasetId}`;
    return Response.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
