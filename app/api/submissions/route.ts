import { getSql } from "@/lib/db";
import { requireStudent } from "@/lib/session";
import { jsonError, handleRouteError } from "@/lib/api-utils";
import type { ChartType, SubmissionOwnerView } from "@/lib/types";

export const runtime = "nodejs";

const MAX_CHART_DATA_URL_LEN = 700_000;
const VALID_CHART_TYPES: ChartType[] = ["bar", "line", "pie"];

export async function GET() {
  try {
    const student = await requireStudent();
    const sql = getSql();

    const rows = (await sql`
      SELECT id, title, dataset_name, chart_type, analysis_text,
             score, feedback, created_at
      FROM submissions
      WHERE student_id = ${student.studentId}
      ORDER BY created_at DESC, id DESC
    `) as SubmissionOwnerView[];

    return Response.json({ submissions: rows });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const student = await requireStudent();
    const body = await request.json();

    const title = String(body.title ?? "").trim();
    const datasetName = String(body.datasetName ?? "").trim();
    const chartType = String(body.chartType ?? "") as ChartType;
    const chartDataUrl = String(body.chartDataUrl ?? "");
    const analysisText = String(body.analysisText ?? "").trim();

    if (!title) return jsonError("제목을 입력해주세요.");
    if (title.length > 100) return jsonError("제목이 너무 깁니다.");
    if (!VALID_CHART_TYPES.includes(chartType)) {
      return jsonError("올바른 그래프 종류를 선택해주세요.");
    }
    if (!chartDataUrl.startsWith("data:image/png;base64,")) {
      return jsonError("그래프 이미지를 먼저 생성해주세요.");
    }
    if (chartDataUrl.length > MAX_CHART_DATA_URL_LEN) {
      return jsonError("그래프 이미지 용량이 너무 큽니다.");
    }
    if (!analysisText) return jsonError("분석 내용을 작성해주세요.");
    if (analysisText.length > 5000) {
      return jsonError("분석 내용이 너무 깁니다.");
    }

    const sql = getSql();
    const rows = (await sql`
      INSERT INTO submissions
        (student_id, title, dataset_name, chart_type, chart_data_url, analysis_text)
      VALUES
        (${student.studentId}, ${title}, ${datasetName}, ${chartType},
         ${chartDataUrl}, ${analysisText})
      RETURNING id
    `) as { id: number }[];

    return Response.json({ ok: true, id: rows[0].id });
  } catch (err) {
    return handleRouteError(err);
  }
}
