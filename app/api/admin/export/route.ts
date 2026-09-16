import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { handleRouteError } from "@/lib/api-utils";

export const runtime = "nodejs";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  try {
    await requireAdmin();
    const sql = getSql();
    const rows = (await sql`
      SELECT st.class_code, st.student_no, st.name AS student_name,
             s.title, s.dataset_name, s.chart_type,
             s.analysis_text, s.score, s.feedback, s.created_at
      FROM submissions s
      JOIN students st ON st.id = s.student_id
      ORDER BY st.class_code, st.student_no, s.created_at
    `) as Record<string, unknown>[];

    const headers = [
      "반코드",
      "번호",
      "이름",
      "제목",
      "사용데이터",
      "그래프종류",
      "분석내용",
      "점수",
      "피드백",
      "제출시각",
    ];
    const keys = [
      "class_code",
      "student_no",
      "student_name",
      "title",
      "dataset_name",
      "chart_type",
      "analysis_text",
      "score",
      "feedback",
      "created_at",
    ];

    const lines = [headers.map(csvCell).join(",")];
    for (const row of rows) {
      lines.push(keys.map((k) => csvCell(row[k])).join(","));
    }
    const csv = "\uFEFF" + lines.join("\r\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="submissions.csv"`,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
