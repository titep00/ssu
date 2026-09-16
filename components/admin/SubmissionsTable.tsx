"use client";

import { useCallback, useEffect, useState } from "react";
import { Select } from "@/components/ui/Field";
import { Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  CHART_TYPE_LABELS,
  formatDateTime,
  readError,
  type AdminListRow,
} from "./shared";
import { GradingPanel } from "./GradingPanel";

const ALL_CLASSES = "__all__";

export function SubmissionsTable() {
  const [rows, setRows] = useState<AdminListRow[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState<string>(ALL_CLASSES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRow, setOpenRow] = useState<AdminListRow | null>(null);

  const load = useCallback(async (classCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs =
        classCode && classCode !== ALL_CLASSES
          ? `?classCode=${encodeURIComponent(classCode)}`
          : "";
      const res = await fetch(`/api/admin/submissions${qs}`);
      if (!res.ok) {
        setError(await readError(res, "제출물 목록을 불러오지 못했어요."));
        return;
      }
      const data: { submissions: AdminListRow[]; classes: string[] } = await res.json();
      setRows(data.submissions ?? []);
      setClasses(data.classes ?? []);
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(classFilter);
  }, [classFilter, load]);

  function handleSaved(
    id: number,
    result: { score: number | null; feedback: string | null; graded_at: string },
  ) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, score: result.score, feedback: result.feedback, graded_at: result.graded_at }
          : r,
      ),
    );
  }

  function handleDeleted(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setOpenRow(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-[14rem]">
          <Label htmlFor="class-filter">반 선택</Label>
          <Select
            id="class-filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            disabled={loading && rows.length === 0}
          >
            <option value={ALL_CLASSES}>전체 반</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-sm text-zinc-500 tabular-nums">
          {loading ? "불러오는 중…" : `제출물 ${rows.length}건`}
        </p>
      </div>

      {error ? (
        <Alert tone="red" title="목록을 불러오지 못했어요" role="alert">
          <div className="flex flex-col items-start gap-2">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={() => load(classFilter)}>
              다시 시도
            </Button>
          </div>
        </Alert>
      ) : loading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Alert tone="zinc" title="제출물이 없어요">
          {classFilter === ALL_CLASSES
            ? "아직 학생이 제출한 작업이 없어요."
            : "선택한 반에는 아직 제출물이 없어요. 다른 반을 선택해보세요."}
        </Alert>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-black/5">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-zinc-500">
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">반</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">번호</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">이름</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">제목</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">사용 데이터</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">그래프</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">제출 시각</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-medium">점수</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${r.class_code} ${r.student_no}번 ${r.student_name} — ${r.title} 채점하기`}
                  onClick={() => setOpenRow(r)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenRow(r);
                    }
                  }}
                  className="cursor-pointer border-b border-black/5 transition-colors last:border-0 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
                >
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-700">{r.class_code}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-700">{r.student_no}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-900">{r.student_name}</td>
                  <td className="max-w-[16rem] truncate px-4 py-3 text-zinc-900" title={r.title}>{r.title}</td>
                  <td className="max-w-[12rem] truncate px-4 py-3 text-zinc-600" title={r.dataset_name}>{r.dataset_name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{CHART_TYPE_LABELS[r.chart_type]}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-600">{formatDateTime(r.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {r.score === null || r.score === undefined ? (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                        미채점
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-sm font-semibold tabular-nums text-teal-700 ring-1 ring-teal-600/15">
                        {r.score}점
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openRow ? (
        <GradingPanel
          row={openRow}
          onClose={() => setOpenRow(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      ) : null}
    </div>
  );
}
