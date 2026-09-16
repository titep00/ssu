"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Label } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { readError } from "./shared";

export function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setPassword("");
        onSuccess();
        return;
      }
      if (res.status === 401) {
        setError("비밀번호가 올바르지 않습니다. 다시 확인해주세요.");
      } else if (res.status === 429) {
        setError("시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setError(await readError(res));
      }
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-xs">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            데이터 분석 교실
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">교사·관리자 로그인</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <Label htmlFor="admin-password">비밀번호</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "admin-password-error" : undefined}
                autoFocus
              />
              {error ? (
                <p
                  id="admin-password-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "확인 중…" : "로그인"}
            </Button>
          </form>
        </Card>

        <div className="mt-4">
          <Alert tone="zinc">
            관리자 비밀번호는 담당 교사만 알고 있어요. 학생은 학생용 화면을 이용해주세요.
          </Alert>
        </div>
      </div>
    </main>
  );
}
