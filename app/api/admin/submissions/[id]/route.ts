import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { jsonError, handleRouteError } from "@/lib/api-utils";
import type { SubmissionAdminRow } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const submissionId = Number(id);
    if (!Number.isInteger(submissionId)) {
      return jsonError("잘못된 제출물 번호입니다.");
    }

    const sql = getSql();
    const rows = (await sql`
      SELECT s.*, st.class_code, st.student_no, st.name AS student_name
      FROM submissions s
      JOIN students st ON st.id = s.student_id
      WHERE s.id = ${submissionId}
    `) as SubmissionAdminRow[];

    if (rows.length === 0) {
      return jsonError("제출물을 찾을 수 없습니다.", 404);
    }
    return Response.json({ submission: rows[0] });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const submissionId = Number(id);
    if (!Number.isInteger(submissionId)) {
      return jsonError("잘못된 제출물 번호입니다.");
    }

    const body = await request.json();
    const hasScore = body.score !== undefined && body.score !== null && body.score !== "";
    const score = hasScore ? Number(body.score) : null;
    const feedback =
      body.feedback === undefined || body.feedback === null
        ? null
        : String(body.feedback).trim();

    if (score !== null && (!Number.isFinite(score) || score < 0 || score > 100)) {
      return jsonError("점수는 0~100 사이의 숫자여야 합니다.");
    }
    if (feedback !== null && feedback.length > 2000) {
      return jsonError("피드백이 너무 깁니다.");
    }

    const sql = getSql();
    const rows = (await sql`
      UPDATE submissions
      SET score = ${score},
          feedback = ${feedback},
          graded_at = now()
      WHERE id = ${submissionId}
      RETURNING id
    `) as { id: number }[];

    if (rows.length === 0) {
      return jsonError("제출물을 찾을 수 없습니다.", 404);
    }
    return Response.json({ ok: true });
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
    const submissionId = Number(id);
    if (!Number.isInteger(submissionId)) {
      return jsonError("잘못된 제출물 번호입니다.");
    }
    const sql = getSql();
    await sql`DELETE FROM submissions WHERE id = ${submissionId}`;
    return Response.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
