"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card, Label, StepBadge } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { ChartView } from "@/components/ChartView";
import type { ChartHandle } from "@/components/ChartView";
import { DataTable } from "@/components/student/DataTable";
import { Segmented } from "@/components/student/Segmented";
import { SubmissionsPanel } from "@/components/student/SubmissionsPanel";
import {
  BarChartIcon,
  LineChartIcon,
  PieChartIcon,
  UploadIcon,
  LogoutIcon,
  ResetIcon,
  DataIcon,
  CheckIcon,
} from "@/components/student/icons";

import {
  parseCsv,
  isNumericColumn,
  dropMissing,
  applyFilter,
  sortRows,
  aggregateForChart,
  type ParsedData,
  type FilterOp,
} from "@/lib/data";
import { cn } from "@/lib/cn";
import type {
  ChartType,
  DatasetSummary,
  Dataset,
  SubmissionOwnerView,
} from "@/lib/types";

type Student = { name: string; studentNo: string; classCode: string };

type LoadState = "idle" | "loading" | "ready" | "error";

const FILTER_OPS: { value: FilterOp; label: string }[] = [
  { value: "eq", label: "같음" },
  { value: "neq", label: "다름" },
  { value: "gt", label: "초과" },
  { value: "gte", label: "이상" },
  { value: "lt", label: "미만" },
  { value: "lte", label: "이하" },
  { value: "contains", label: "포함" },
];

const CHART_OPTIONS: { value: ChartType; label: string; icon: React.ReactNode }[] =
  [
    { value: "bar", label: "막대", icon: <BarChartIcon className="size-5 sm:size-4" /> },
    {
      value: "line",
      label: "꺾은선",
      icon: <LineChartIcon className="size-5 sm:size-4" />,
    },
    { value: "pie", label: "원", icon: <PieChartIcon className="size-5 sm:size-4" /> },
  ];

async function readError(res: Response): Promise<string> {
  const fallback = "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
  try {
    const data = await res.json();
    if (data && typeof data.error === "string") return data.error;
  } catch {
    return fallback;
  }
  return fallback;
}

export default function StudentPage() {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/student/me");
        const data = (await res.json()) as { student: Student | null };
        if (cancelled) return;
        if (!data.student) {
          router.replace("/");
          return;
        }
        setStudent(data.student);
        setAuthChecked(true);
      } catch {
        if (!cancelled) router.replace("/");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!authChecked || !student) {
    return (
      <main className="grid min-h-dvh place-items-center bg-zinc-50 px-5">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <span
            className="size-6 animate-spin rounded-full border-2 border-zinc-300 border-t-teal-600"
            aria-hidden="true"
          />
          <p className="text-sm">불러오는 중이에요…</p>
        </div>
      </main>
    );
  }

  return <Workspace student={student} />;
}

function Workspace({ student }: { student: Student }) {
  const router = useRouter();
  const chartRef = useRef<ChartHandle>(null);

  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [datasetsState, setDatasetsState] = useState<LoadState>("idle");
  const [datasetsError, setDatasetsError] = useState<string | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [datasetLoadState, setDatasetLoadState] = useState<LoadState>("idle");
  const [datasetLoadError, setDatasetLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [original, setOriginal] = useState<ParsedData | null>(null);
  const [working, setWorking] = useState<ParsedData | null>(null);
  const [sourceName, setSourceName] = useState<string>("");

  const [dropCols, setDropCols] = useState<Set<string>>(new Set());
  const [filterCol, setFilterCol] = useState<string>("");
  const [filterOp, setFilterOp] = useState<FilterOp>("eq");
  const [filterValue, setFilterValue] = useState<string>("");
  const [filterError, setFilterError] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [labelCol, setLabelCol] = useState<string>("");
  const [valueCol, setValueCol] = useState<string>("");
  const [chartTitle, setChartTitle] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [analysisText, setAnalysisText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    analysis?: string;
  }>({});

  const [submissions, setSubmissions] = useState<SubmissionOwnerView[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState<string | null>(null);

  const loadDatasetList = useCallback(async () => {
    setDatasetsState("loading");
    setDatasetsError(null);
    try {
      const res = await fetch("/api/datasets");
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as { datasets: DatasetSummary[] };
      setDatasets(data.datasets);
      setDatasetsState("ready");
    } catch (err) {
      setDatasetsError(err instanceof Error ? err.message : "목록을 불러오지 못했어요.");
      setDatasetsState("error");
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    setSubsLoading(true);
    setSubsError(null);
    try {
      const res = await fetch("/api/submissions");
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as { submissions: SubmissionOwnerView[] };
      setSubmissions(data.submissions);
    } catch (err) {
      setSubsError(err instanceof Error ? err.message : "목록을 불러오지 못했어요.");
    } finally {
      setSubsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatasetList();
    loadSubmissions();
  }, [loadDatasetList, loadSubmissions]);

  const resetTransforms = useCallback(() => {
    setDropCols(new Set());
    setFilterCol("");
    setFilterOp("eq");
    setFilterValue("");
    setFilterError(null);
    setSortCol("");
    setSortDir("asc");
  }, []);

  const applyLoadedData = useCallback(
    (data: ParsedData, name: string) => {
      setOriginal(data);
      setWorking(data);
      setSourceName(name);
      resetTransforms();
      setLabelCol(data.columns[0] ?? "");
      const numeric = data.columns.find((c) => isNumericColumn(data.rows, c));
      setValueCol(numeric ?? data.columns[data.columns.length - 1] ?? "");
      setSubmitSuccess(false);
    },
    [resetTransforms],
  );

  const selectTeacherDataset = useCallback(
    async (id: number) => {
      setSelectedDatasetId(id);
      setUploadError(null);
      setDatasetLoadState("loading");
      setDatasetLoadError(null);
      try {
        const res = await fetch(`/api/datasets/${id}`);
        if (!res.ok) throw new Error(await readError(res));
        const data = (await res.json()) as { dataset: Dataset };
        const parsed = parseCsv(data.dataset.csv_content);
        if (parsed.columns.length === 0 || parsed.rows.length === 0) {
          throw new Error("이 데이터에는 사용할 수 있는 내용이 없어요.");
        }
        applyLoadedData(parsed, data.dataset.name);
        setDatasetLoadState("ready");
      } catch (err) {
        setDatasetLoadError(
          err instanceof Error ? err.message : "데이터를 불러오지 못했어요.",
        );
        setDatasetLoadState("error");
      }
    },
    [applyLoadedData],
  );

  const onUpload = useCallback(
    (file: File | null) => {
      if (!file) return;
      setUploadError(null);
      setDatasetLoadError(null);
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setUploadError("CSV(.csv) 파일만 올릴 수 있어요. 다른 파일을 선택해 주세요.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "");
          const parsed = parseCsv(text);
          if (parsed.columns.length === 0 || parsed.rows.length === 0) {
            setUploadError(
              "파일에서 표를 읽지 못했어요. 첫 줄에 열 이름이 있는 CSV인지 확인해 주세요.",
            );
            return;
          }
          setSelectedDatasetId(null);
          applyLoadedData(parsed, file.name);
        } catch {
          setUploadError("파일을 읽는 중 문제가 생겼어요. 다른 파일로 다시 시도해 주세요.");
        }
      };
      reader.onerror = () => {
        setUploadError("파일을 읽지 못했어요. 다시 시도해 주세요.");
      };
      reader.readAsText(file);
    },
    [applyLoadedData],
  );

  useEffect(() => {
    if (!original) return;
    let data: ParsedData = original;
    if (dropCols.size > 0) {
      data = dropMissing(data, [...dropCols]);
    }
    if (filterCol && filterValue.trim() !== "") {
      data = applyFilter(data, filterCol, filterOp, filterValue);
    }
    if (sortCol) {
      data = sortRows(data, sortCol, sortDir);
    }
    setWorking(data);
  }, [original, dropCols, filterCol, filterOp, filterValue, sortCol, sortDir]);

  const toggleDropCol = useCallback((col: string) => {
    setDropCols((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }, []);

  const chartData = useMemo(() => {
    if (!working || !labelCol || !valueCol) return null;
    return aggregateForChart(working, labelCol, valueCol);
  }, [working, labelCol, valueCol]);

  const valueColNumeric = useMemo(() => {
    if (!working || !valueCol) return true;
    return isNumericColumn(working.rows, valueCol);
  }, [working, valueCol]);

  const canRenderChart =
    chartData !== null && chartData.labels.length > 0 && chartData.values.length > 0;

  const logout = useCallback(async () => {
    try {
      await fetch("/api/student/me", { method: "DELETE" });
    } finally {
      router.push("/");
    }
  }, [router]);

  const onSubmit = useCallback(async () => {
    setSubmitError(null);
    setSubmitSuccess(false);

    const nextFieldErrors: { title?: string; analysis?: string } = {};
    if (title.trim() === "") {
      nextFieldErrors.title = "제목을 입력해 주세요.";
    } else if (title.trim().length > 100) {
      nextFieldErrors.title = "제목은 100자까지 쓸 수 있어요.";
    }
    if (analysisText.trim() === "") {
      nextFieldErrors.analysis = "그래프를 보고 알게 된 점을 적어 주세요.";
    }
    setFieldErrors(nextFieldErrors);
    if (nextFieldErrors.title || nextFieldErrors.analysis) return;

    if (!canRenderChart) {
      setSubmitError("먼저 3단계에서 그래프를 완성해 주세요.");
      return;
    }

    const dataUrl = chartRef.current?.toPng() ?? null;
    if (!dataUrl || !dataUrl.startsWith("data:image/png")) {
      setSubmitError("그래프 이미지를 만들지 못했어요. 3단계에서 그래프를 확인한 뒤 다시 제출해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          datasetName: sourceName,
          chartType,
          chartDataUrl: dataUrl,
          analysisText: analysisText.trim(),
        }),
      });
      if (!res.ok) throw new Error(await readError(res));
      setSubmitSuccess(true);
      setTitle("");
      setAnalysisText("");
      setFieldErrors({});
      await loadSubmissions();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "제출하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    title,
    analysisText,
    canRenderChart,
    sourceName,
    chartType,
    loadSubmissions,
  ]);

  const hasData = original !== null && working !== null;

  return (
    <div className="min-h-dvh bg-zinc-50">
      <TopBar student={student} onLogout={logout} />

      <main className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5 sm:gap-6">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              데이터로 그래프 만들기
            </h1>
            <p className="mt-1.5 text-base text-pretty text-zinc-600 sm:text-sm">
              아래 네 단계를 따라 데이터를 고르고, 정리하고, 그래프로 나타낸 뒤 제출해 보세요.
            </p>
          </header>

          {/* Step 1 */}
          <Card>
            <StepBadge n={1} label="데이터 고르기" />
            <p className="mt-2 text-sm text-zinc-500">
              선생님이 올린 데이터를 고르거나, 내 CSV 파일을 직접 올릴 수 있어요.
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <DataIcon className="size-4 text-zinc-400" />
                  선생님이 올린 데이터
                </h3>
                {datasetsState === "loading" ? (
                  <ul className="flex flex-col gap-2" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <li
                        key={i}
                        className="h-14 animate-pulse rounded-lg bg-zinc-100 ring-1 ring-black/5"
                      />
                    ))}
                  </ul>
                ) : datasetsState === "error" ? (
                  <Alert tone="red" role="alert" title="목록을 불러오지 못했어요">
                    <p>{datasetsError}</p>
                    <div className="mt-2">
                      <Button variant="secondary" size="sm" onClick={loadDatasetList}>
                        다시 시도
                      </Button>
                    </div>
                  </Alert>
                ) : datasets.length === 0 ? (
                  <div className="rounded-lg bg-zinc-50 p-4 text-center text-sm text-zinc-500 ring-1 ring-black/5">
                    아직 선생님이 올린 데이터가 없어요. 아래에서 내 파일을 올려 보세요.
                  </div>
                ) : (
                  <ul
                    role="radiogroup"
                    aria-label="선생님이 올린 데이터 목록"
                    className="flex flex-col gap-2"
                  >
                    {datasets.map((d) => {
                      const active = selectedDatasetId === d.id;
                      return (
                        <li key={d.id}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => selectTeacherDataset(d.id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-lg p-3.5 text-left ring-1 transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
                              active
                                ? "bg-teal-50 ring-teal-600/30"
                                : "bg-white ring-black/10 hover:bg-zinc-50",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2",
                                active
                                  ? "border-teal-600 bg-teal-600 text-white"
                                  : "border-zinc-300",
                              )}
                              aria-hidden="true"
                            >
                              {active ? <CheckIcon className="size-3" /> : null}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-medium text-zinc-900">
                                {d.name}
                              </span>
                              {d.description ? (
                                <span className="mt-0.5 block text-sm text-pretty text-zinc-500">
                                  {d.description}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="h-px flex-1 bg-black/5" />
                또는
                <span className="h-px flex-1 bg-black/5" />
              </div>

              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <UploadIcon className="size-4 text-zinc-400" />
                  내 파일 올리기
                </h3>
                <Label htmlFor="csv-upload">CSV 파일 선택</Label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
                  className={cn(
                    "block w-full cursor-pointer rounded-lg text-sm text-zinc-600 ring-1 ring-black/10",
                    "file:mr-3 file:cursor-pointer file:border-0 file:bg-zinc-100 file:px-4 file:py-2.5",
                    "file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
                  )}
                />
                {uploadError ? (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {uploadError}
                  </p>
                ) : null}
              </section>

              {datasetLoadState === "loading" ? (
                <Alert tone="zinc" role="status">
                  데이터를 불러오는 중이에요…
                </Alert>
              ) : null}
              {datasetLoadState === "error" && datasetLoadError ? (
                <Alert tone="red" role="alert" title="데이터를 불러오지 못했어요">
                  {datasetLoadError}
                </Alert>
              ) : null}

              {hasData && working ? (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-700">
                      미리 보기{" "}
                      <span className="font-normal text-zinc-400">
                        (앞 {Math.min(8, working.rows.length)}행)
                      </span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      선택한 데이터:{" "}
                      <span className="font-medium text-zinc-700">{sourceName}</span>
                    </p>
                  </div>
                  <DataTable data={working} />
                </div>
              ) : null}
            </div>
          </Card>

          {/* Step 2 */}
          <Card className={cn(!hasData && "opacity-60")}>
            <div className="flex items-center justify-between gap-3">
              <StepBadge n={2} label="데이터 정리하기" />
              {hasData && working ? (
                <span className="text-sm tabular-nums text-zinc-500">
                  현재 {working.rows.length.toLocaleString("ko-KR")}행
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              필요하면 빈 값을 없애거나, 조건으로 걸러내거나, 순서를 바꿀 수 있어요. 안 해도 괜찮아요.
            </p>

            {!hasData ? (
              <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-center text-sm text-zinc-500 ring-1 ring-black/5">
                먼저 1단계에서 데이터를 골라 주세요.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-5">
                <section>
                  <p className="text-sm font-medium text-zinc-700">
                    1. 빈 값이 있는 행 제거
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    고른 열에 빈 칸이 있는 행을 표에서 빼요.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {original?.columns.map((c) => {
                      const checked = dropCols.has(c);
                      return (
                        <label
                          key={c}
                          className={cn(
                            "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 transition-colors sm:min-h-0 sm:py-1.5",
                            checked
                              ? "bg-teal-50 text-teal-800 ring-teal-600/30"
                              : "bg-white text-zinc-700 ring-black/10 hover:bg-zinc-50",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDropCol(c)}
                            className="size-4 accent-teal-600"
                          />
                          {c}
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <p className="text-sm font-medium text-zinc-700">2. 조건으로 걸러내기</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="filter-col">열</Label>
                      <Select
                        id="filter-col"
                        value={filterCol}
                        onChange={(e) => {
                          setFilterCol(e.target.value);
                          setFilterError(null);
                        }}
                      >
                        <option value="">선택 안 함</option>
                        {original?.columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-op">조건</Label>
                      <Select
                        id="filter-op"
                        value={filterOp}
                        onChange={(e) => setFilterOp(e.target.value as FilterOp)}
                        disabled={!filterCol}
                      >
                        {FILTER_OPS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-value">값</Label>
                      <Input
                        id="filter-value"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        onBlur={() => {
                          const numericOp = ["gt", "gte", "lt", "lte"].includes(
                            filterOp,
                          );
                          if (
                            filterCol &&
                            numericOp &&
                            filterValue.trim() !== "" &&
                            Number.isNaN(Number(filterValue.trim().replace(/,/g, "")))
                          ) {
                            setFilterError(
                              "‘초과·이상·미만·이하’ 조건에는 숫자를 입력해 주세요.",
                            );
                          } else {
                            setFilterError(null);
                          }
                        }}
                        placeholder="예: 3 또는 서울"
                        disabled={!filterCol}
                      />
                    </div>
                  </div>
                  {filterError ? (
                    <p className="mt-1.5 text-sm text-red-600" role="alert">
                      {filterError}
                    </p>
                  ) : null}
                </section>

                <section>
                  <p className="text-sm font-medium text-zinc-700">3. 순서 바꾸기 (정렬)</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="sort-col">기준 열</Label>
                      <Select
                        id="sort-col"
                        value={sortCol}
                        onChange={(e) => setSortCol(e.target.value)}
                      >
                        <option value="">선택 안 함</option>
                        {original?.columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sort-dir">방향</Label>
                      <Select
                        id="sort-dir"
                        value={sortDir}
                        onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
                        disabled={!sortCol}
                      >
                        <option value="asc">오름차순 (작은 값부터)</option>
                        <option value="desc">내림차순 (큰 값부터)</option>
                      </Select>
                    </div>
                  </div>
                </section>

                <div>
                  <Button variant="secondary" size="sm" onClick={resetTransforms}>
                    <ResetIcon className="size-4" />
                    처음으로 되돌리기
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Step 3 */}
          <Card className={cn(!hasData && "opacity-60")}>
            <StepBadge n={3} label="그래프 만들기" />
            <p className="mt-2 text-sm text-zinc-500">
              그래프 종류를 고르고, 분류 열과 값 열을 정하면 그래프가 나타나요.
            </p>

            {!hasData ? (
              <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-center text-sm text-zinc-500 ring-1 ring-black/5">
                먼저 1단계에서 데이터를 골라 주세요.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <Label>그래프 종류</Label>
                  <Segmented
                    label="그래프 종류"
                    options={CHART_OPTIONS}
                    value={chartType}
                    onChange={setChartType}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="label-col">분류(라벨) 열</Label>
                    <Select
                      id="label-col"
                      value={labelCol}
                      onChange={(e) => setLabelCol(e.target.value)}
                    >
                      {working?.columns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value-col">값(숫자) 열</Label>
                    <Select
                      id="value-col"
                      value={valueCol}
                      onChange={(e) => setValueCol(e.target.value)}
                      aria-describedby={!valueColNumeric ? "value-col-hint" : undefined}
                    >
                      {working?.columns.map((c) => {
                        const numeric = working
                          ? isNumericColumn(working.rows, c)
                          : false;
                        return (
                          <option key={c} value={c}>
                            {c}
                            {numeric ? " (숫자)" : ""}
                          </option>
                        );
                      })}
                    </Select>
                    {!valueColNumeric ? (
                      <p
                        id="value-col-hint"
                        className="mt-1.5 text-sm text-amber-700"
                        role="status"
                      >
                        이 열은 숫자가 아니어서 그래프에 합계가 나오지 않을 수 있어요. 숫자 열을 고르는 게 좋아요.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <Label htmlFor="chart-title">그래프 제목</Label>
                  <Input
                    id="chart-title"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="예: 반별 평균 키"
                    maxLength={80}
                  />
                </div>

                <div>
                  {canRenderChart && chartData ? (
                    <ChartView
                      ref={chartRef}
                      type={chartType}
                      labels={chartData.labels}
                      values={chartData.values}
                      title={chartTitle}
                      valueLabel={valueCol}
                    />
                  ) : (
                    <div className="grid h-72 place-items-center rounded-lg bg-zinc-50 text-center ring-1 ring-black/5 sm:h-80">
                      <div className="px-6">
                        <p className="text-sm font-medium text-zinc-600">
                          아직 그래프를 만들 수 없어요
                        </p>
                        <p className="mt-1 text-sm text-pretty text-zinc-400">
                          분류 열과 숫자 값 열을 고르면 그래프가 나타나요. 걸러낸 뒤 남은 데이터가 없으면 조건을 바꿔 보세요.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Step 4 */}
          <Card className={cn(!hasData && "opacity-60")}>
            <StepBadge n={4} label="제출하기" />
            <p className="mt-2 text-sm text-zinc-500">
              제목과 함께, 그래프를 보고 알게 된 점을 적어서 제출해요.
            </p>

            {!hasData ? (
              <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-center text-sm text-zinc-500 ring-1 ring-black/5">
                먼저 1단계에서 데이터를 골라 주세요.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <Label htmlFor="submit-title">제목</Label>
                  <Input
                    id="submit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 우리 반 데이터로 알아본 것"
                    maxLength={100}
                    aria-invalid={fieldErrors.title ? true : undefined}
                    aria-describedby={fieldErrors.title ? "title-error" : undefined}
                  />
                  {fieldErrors.title ? (
                    <p id="title-error" className="mt-1.5 text-sm text-red-600" role="alert">
                      {fieldErrors.title}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="analysis">이 그래프에서 무엇을 알 수 있나요?</Label>
                  <Textarea
                    id="analysis"
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    rows={4}
                    placeholder="예: 3반의 평균 키가 가장 크고, 반마다 차이가 크지 않았어요."
                    aria-invalid={fieldErrors.analysis ? true : undefined}
                    aria-describedby={
                      fieldErrors.analysis ? "analysis-error" : undefined
                    }
                  />
                  {fieldErrors.analysis ? (
                    <p
                      id="analysis-error"
                      className="mt-1.5 text-sm text-red-600"
                      role="alert"
                    >
                      {fieldErrors.analysis}
                    </p>
                  ) : null}
                </div>

                {submitError ? (
                  <Alert tone="red" role="alert" title="제출하지 못했어요">
                    {submitError}
                  </Alert>
                ) : null}
                {submitSuccess ? (
                  <Alert tone="teal" role="status" title="제출 완료!">
                    제출되었어요. 아래 ‘내 제출물’에서 확인할 수 있어요.
                  </Alert>
                ) : null}

                <div>
                  <Button onClick={onSubmit} disabled={submitting} aria-busy={submitting}>
                    {submitting ? (
                      <>
                        <span
                          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                          aria-hidden="true"
                        />
                        제출하는 중…
                      </>
                    ) : (
                      "제출하기"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <SubmissionsPanel
            submissions={submissions}
            loading={subsLoading}
            error={subsError}
            onRetry={loadSubmissions}
          />
        </div>
      </main>
    </div>
  );
}

function TopBar({
  student,
  onLogout,
}: {
  student: Student;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-600 text-white">
            <BarChartIcon className="size-5" />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight text-zinc-900">
            데이터 분석 교실
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-zinc-900">
              {student.name}
            </p>
            <p className="text-xs leading-tight text-zinc-500">
              {student.classCode} · {student.studentNo}번
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogoutIcon className="size-4" />
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
