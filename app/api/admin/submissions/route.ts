import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { handleRouteError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const classCode = new URL(request.url).searchParams.get("classCode")?.trim();

    const sql = getSql();
    const rows =
      classCode && classCode.length > 0
        ? await sql`
            SELECT s.id, s.title, s.dataset_name, s.chart_type,
                   s.score, s.feedback, s.created_at, s.graded_at,
                   st.class_code, st.student_no, st.name AS student_name
            FROM submissions s
            JOIN students st ON st.id = s.student_id
            WHERE st.class_code = ${classCode}
            ORDER BY st.class_code, st.student_no, s.created_at DESC
          `
        : await sql`
            SELECT s.id, s.title, s.dataset_name, s.chart_type,
                   s.score, s.feedback, s.created_at, s.graded_at,
                   st.class_code, st.student_no, st.name AS student_name
            FROM submissions s
            JOIN students st ON st.id = s.student_id
            ORDER BY st.class_code, st.student_no, s.created_at DESC
          `;

    const classes = (await sql`
      SELECT DISTINCT class_code FROM students ORDER BY class_code
    `) as { class_code: string }[];

    return Response.json({
      submissions: rows,
      classes: classes.map((c) => c.class_code),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
