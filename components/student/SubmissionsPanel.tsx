import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CheckIcon } from "@/components/student/icons";
import { cn } from "@/lib/cn";
import type { SubmissionOwnerView } from "@/lib/types";

const CHART_TYPE_KO: Record<string, string> = {
  bar: "막대그래프",
  line: "꺾은선그래프",
  pie: "원그래프",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SubmissionCard({ item }: { item: SubmissionOwnerView }) {
  const graded = item.score !== null;
  return (
    <li className="rounded-xl bg-white p-4 ring-1 ring-black/5 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-zinc-900">
            {item.title}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500">
            {item.dataset_name} · {CHART_TYPE_KO[item.chart_type] ?? item.chart_type}
          </p>
        </div>
        {graded ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-600/15">
            <CheckIcon className="size-3.5" />
            채점 완료
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            채점 대기 중
          </span>
        )}
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-pretty text-zinc-700">
        {item.analysis_text}
      </p>

      {graded ? (
        <div className="mt-3 rounded-lg bg-teal-50/70 p-3 ring-1 ring-teal-600/10">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-teal-800">점수</span>
            <span className="text-lg font-semibold tabular-nums text-teal-700">
              {item.score}
            </span>
            <span className="text-sm text-teal-700/70">점</span>
          </div>
          {item.feedback ? (
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-teal-900/90">
              {item.feedback}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 text-xs tabular-nums text-zinc-400">
        {formatDate(item.created_at)} 제출
      </p>
    </li>
  );
}

export function SubmissionsPanel({
  submissions,
  loading,
  error,
  onRetry,
  className,
}: {
  submissions: SubmissionOwnerView[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          내 제출물
        </h2>
        {submissions.length > 0 ? (
          <span className="text-sm tabular-nums text-zinc-500">
            총 {submissions.length}개
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        내가 제출한 그래프만 볼 수 있어요. 선생님이 채점하면 점수와 의견이 함께 표시돼요.
      </p>

      <div className="mt-4">
        {loading ? (
          <ul className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1].map((i) => (
              <li
                key={i}
                className="h-28 animate-pulse rounded-xl bg-zinc-100 ring-1 ring-black/5"
              />
            ))}
          </ul>
        ) : error ? (
          <Alert tone="red" role="alert" title="목록을 불러오지 못했어요">
            <p>{error}</p>
            <div className="mt-2">
              <Button variant="secondary" size="sm" onClick={onRetry}>
                다시 시도
              </Button>
            </div>
          </Alert>
        ) : submissions.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 p-6 text-center ring-1 ring-black/5">
            <p className="text-sm text-zinc-600">
              아직 제출한 그래프가 없어요.
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              위 단계를 따라 첫 그래프를 만들어 제출해 보세요.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {submissions.map((s) => (
              <SubmissionCard key={s.id} item={s} />
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
