import { getSql } from "@/lib/db";
import { requireStudent } from "@/lib/session";
import { jsonError, handleRouteError } from "@/lib/api-utils";
import type { Submission } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const student = await requireStudent();
    const { id } = await ctx.params;
    const submissionId = Number(id);
    if (!Number.isInteger(submissionId)) {
      return jsonError("잘못된 제출물 번호입니다.");
    }

    const sql = getSql();
    const rows = (await sql`
      SELECT id, title, dataset_name, chart_type, chart_data_url,
             analysis_text, score, feedback, created_at
      FROM submissions
      WHERE id = ${submissionId}
        AND student_id = ${student.studentId}
    `) as Submission[];

    if (rows.length === 0) {
      return jsonError("제출물을 찾을 수 없습니다.", 404);
    }

    return Response.json({ submission: rows[0] });
  } catch (err) {
    return handleRouteError(err);
  }
}
