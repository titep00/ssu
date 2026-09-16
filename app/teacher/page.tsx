"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LoginCard } from "@/components/admin/LoginCard";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { DatasetsManager } from "@/components/admin/DatasetsManager";
import { readError } from "@/components/admin/shared";
import { cn } from "@/lib/cn";

type Tab = "submissions" | "datasets";

export default function TeacherPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);

  const checkMe = useCallback(async () => {
    setCheckFailed(false);
    try {
      const res = await fetch("/api/admin/me");
      if (!res.ok) {
        setIsAdmin(false);
        return;
      }
      const data: { isAdmin: boolean } = await res.json();
      setIsAdmin(Boolean(data.isAdmin));
    } catch {
      setCheckFailed(true);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    checkMe();
  }, [checkMe]);

  if (isAdmin === null && !checkFailed) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-white">
        <p className="text-sm text-zinc-500" role="status">
          불러오는 중…
        </p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <>
        {checkFailed ? (
          <div className="mx-auto max-w-xs px-4 pt-6">
            <Alert tone="red" role="alert">
              로그인 상태를 확인하지 못했어요. 다시 로그인해주세요.
            </Alert>
          </div>
        ) : null}
        <LoginCard onSuccess={checkMe} />
      </>
    );
  }

  return <Dashboard onLoggedOut={() => setIsAdmin(false)} />;
}

function Dashboard({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [tab, setTab] = useState<Tab>("submissions");
  const [loggingOut, setLoggingOut] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  async function handleLogout() {
    if (loggingOut) return;
    setTopError(null);
    setLoggingOut(true);
    try {
      const res = await fetch("/api/admin/me", { method: "DELETE" });
      if (!res.ok) {
        setTopError(await readError(res, "로그아웃하지 못했어요."));
        return;
      }
      onLoggedOut();
    } catch {
      setTopError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleExport() {
    if (exporting) return;
    setTopError(null);
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) {
        setTopError(await readError(res, "CSV를 내보내지 못했어요."));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      anchor.download = `제출물_${stamp}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setTopError("CSV를 내보내지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-50">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-900">
              데이터 분석 교실
            </h1>
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-teal-600/15">
              관리자
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? "내보내는 중…" : "제출물 CSV 내보내기"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? "로그아웃 중…" : "로그아웃"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {topError ? (
          <div className="mb-5">
            <Alert tone="red" role="alert">
              {topError}
            </Alert>
          </div>
        ) : null}

        <div
          role="tablist"
          aria-label="관리 화면"
          className="mb-6 flex gap-1 border-b border-black/10"
        >
          <TabButton
            active={tab === "submissions"}
            controls="panel-submissions"
            id="tab-submissions"
            onClick={() => setTab("submissions")}
          >
            제출물 채점
          </TabButton>
          <TabButton
            active={tab === "datasets"}
            controls="panel-datasets"
            id="tab-datasets"
            onClick={() => setTab("datasets")}
          >
            데이터셋 관리
          </TabButton>
        </div>

        {tab === "submissions" ? (
          <section id="panel-submissions" role="tabpanel" aria-labelledby="tab-submissions">
            <SubmissionsTable />
          </section>
        ) : (
          <section id="panel-datasets" role="tabpanel" aria-labelledby="tab-datasets">
            <DatasetsManager />
          </section>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  id,
  controls,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  id: string;
  controls: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
        active
          ? "border-teal-600 text-teal-700"
          : "border-transparent text-zinc-500 hover:text-zinc-800",
      )}
    >
      {children}
    </button>
  );
}
