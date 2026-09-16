import type { ChartType } from "@/lib/types";

export type AdminListRow = {
  id: number;
  title: string;
  dataset_name: string;
  chart_type: ChartType;
  score: number | null;
  feedback: string | null;
  created_at: string;
  graded_at: string | null;
  class_code: string;
  student_no: string;
  student_name: string;
};

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bar: "막대그래프",
  line: "꺾은선그래프",
  pie: "원그래프",
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return dateFormatter.format(parsed);
}

export async function readError(
  res: Response,
  fallback = "요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.",
): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  } catch {
    return fallback;
  }
  return fallback;
}
