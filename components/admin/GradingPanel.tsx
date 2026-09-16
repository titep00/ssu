"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import type { SubmissionAdminRow } from "@/lib/types";
import {
  CHART_TYPE_LABELS,
  formatDateTime,
  readError,
  type AdminListRow,
} from "./shared";

type SaveResult = { score: number | null; feedback: string | null; graded_at: string };

export function GradingPanel({
  row,
  onClose,
  onSaved,
  onDeleted,
}: {
  row: AdminListRow;
  onClose: () => void;
  onSaved: (id: number, result: SaveResult) => void;
  onDeleted: (id: number) => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [detail, setDetail] = useState<SubmissionAdminRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    fetch(`/api/admin/submissions/${row.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res, "제출물을 불러오지 못했어요."));
        return res.json();
      })
      .then((data: { submission: SubmissionAdminRow }) => {
        if (!active) return;
        const s = data.submission;
        setDetail(s);
        setScore(s.score === null || s.score === undefined ? "" : String(s.score));
        setFeedback(s.feedback ?? "");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "제출물을 불러오지 못했어요.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [row.id]);

  const handleClose = useCallback(() => {
    if (saving || deleting) return;
    onClose();
  }, [saving, deleting, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose]);

  useEffect(() => {
    closeBtnRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  function onKeyDownTrap(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFieldError(null);
    setSaveError(null);

    const trimmed = score.trim();
    let scorePayload: number | "" | null = "";
    if (trimmed !== "") {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        setFieldError("점수는 0에서 100 사이의 숫자로 입력해주세요. 비워 두면 미채점으로 저장됩니다.");
        return;
      }
      scorePayload = n;
    }

    const feedbackTrimmed = feedback.trim();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/submissions/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: scorePayload,
          feedback: feedbackTrimmed === "" ? null : feedbackTrimmed,
        }),
      });
      if (!res.ok) {
        setSaveError(await readError(res, "채점을 저장하지 못했어요."));
        return;
      }
      const result: SaveResult = {
        score: scorePayload === "" ? null : scorePayload,
        feedback: feedbackTrimmed === "" ? null : feedbackTrimmed,
        graded_at: new Date().toISOString(),
      };
      onSaved(row.id, result);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2500);
    } catch {
      setSaveError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/submissions/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setDeleteError(await readError(res, "제출물을 삭제하지 못했어요."));
        return;
      }
      onDeleted(row.id);
    } catch {
      setDeleteError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-center overflow-y-auto bg-zinc-900/40 p-0 sm:items-start sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDownTrap}
        className="relative flex min-h-dvh w-full max-w-2xl flex-col bg-white shadow-xl ring-1 ring-black/5 sm:min-h-0 sm:rounded-xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/5 bg-white px-5 py-4 sm:rounded-t-xl sm:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="truncate text-lg font-semibold tracking-tight text-zinc-900"
            >
              제출물 채점
            </h2>
            <p className="mt-0.5 truncate text-sm text-zinc-500">
              {row.class_code} · {row.student_no}번 · {row.student_name}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="-mr-1.5 -mt-1.5 flex size-11 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>
        </header>

        <div className="flex-1 px-5 py-5 sm:px-6">
          {loading ? (
            <div className="flex flex-col gap-4" aria-busy="true">
              <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />
              <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-24 w-full animate-pulse rounded bg-zinc-100" />
            </div>
          ) : loadError ? (
            <Alert tone="red" title="불러오기 실패" role="alert">
              {loadError}
            </Alert>
          ) : detail ? (
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-1">
                <h3 className="text-base font-semibold tracking-tight text-zinc-900">
                  {detail.title}
                </h3>
                <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
                  <div className="flex gap-1.5">
                    <dt className="text-zinc-400">사용 데이터</dt>
                    <dd>{detail.dataset_name}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-zinc-400">그래프</dt>
                    <dd>{CHART_TYPE_LABELS[detail.chart_type]}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-zinc-400">제출 시각</dt>
                    <dd className="tabular-nums">{formatDateTime(detail.created_at)}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-medium text-zinc-700">그래프</h3>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-50 outline outline-1 -outline-offset-1 outline-black/5">
                  {detail.chart_data_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.chart_data_url}
                      alt={`${detail.student_name} 학생이 만든 ${CHART_TYPE_LABELS[detail.chart_type]} — ${detail.title}`}
                      className="size-full object-contain"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm text-zinc-400">
                      그래프 이미지가 없어요.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-medium text-zinc-700">분석 내용</h3>
                {detail.analysis_text?.trim() ? (
                  <p className="whitespace-pre-wrap text-pretty rounded-lg bg-zinc-50 p-4 text-[15px] leading-relaxed text-zinc-800 ring-1 ring-black/5">
                    {detail.analysis_text}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400">작성된 분석 내용이 없어요.</p>
                )}
              </section>

              <form onSubmit={handleSave} noValidate className="flex flex-col gap-4 border-t border-black/5 pt-6">
                <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                  <div>
                    <Label htmlFor="grade-score">점수 (0–100)</Label>
                    <Input
                      id="grade-score"
                      name="score"
                      type="number"
                      min={0}
                      max={100}
                      inputMode="numeric"
                      placeholder="미채점"
                      value={score}
                      onChange={(e) => {
                        setScore(e.target.value);
                        if (fieldError) setFieldError(null);
                      }}
                      aria-invalid={fieldError ? true : undefined}
                      aria-describedby={fieldError ? "grade-score-error" : "grade-score-hint"}
                      className="tabular-nums"
                    />
                  </div>
                  <div className="sm:pt-7">
                    <p id="grade-score-hint" className="text-sm text-zinc-500">
                      비워 두면 미채점 상태로 저장돼요.
                    </p>
                  </div>
                </div>
                {fieldError ? (
                  <p id="grade-score-error" role="alert" className="-mt-2 text-sm text-red-600">
                    {fieldError}
                  </p>
                ) : null}

                <div>
                  <Label htmlFor="grade-feedback">피드백</Label>
                  <Textarea
                    id="grade-feedback"
                    name="feedback"
                    rows={4}
                    placeholder="학생에게 전할 피드백을 적어주세요."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                {saveError ? (
                  <Alert tone="red" role="alert">
                    {saveError}
                  </Alert>
                ) : null}
                {savedFlash ? (
                  <Alert tone="teal" role="status">
                    채점 내용을 저장했어요.
                  </Alert>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" variant="primary" disabled={saving || deleting}>
                    {saving ? "저장 중…" : "채점 저장"}
                  </Button>
                  <div className="ml-auto">
                    {confirmDelete ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-600">정말 삭제할까요?</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(false)}
                          disabled={deleting}
                        >
                          취소
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? "삭제 중…" : "삭제 확인"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmDelete(true)}
                        disabled={saving}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                </div>
                {deleteError ? (
                  <Alert tone="red" role="alert">
                    {deleteError}
                  </Alert>
                ) : null}
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
