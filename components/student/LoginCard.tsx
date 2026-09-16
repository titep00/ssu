"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Label } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

type Student = { name: string; studentNo: string; classCode: string };

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

export function LoginCard({ onSuccess }: { onSuccess: (student: Student) => void }) {
  const [classCode, setClassCode] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!classCode.trim() || !studentNo.trim() || !name.trim()) {
      setError("반 코드, 번호, 이름을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classCode: classCode.trim(),
          studentNo: studentNo.trim(),
          name: name.trim(),
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { student: Student };
        onSuccess(data.student);
        return;
      }
      setError(await readError(res));
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
          <p className="mt-1.5 text-sm text-zinc-500">학생 시작하기</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <Label htmlFor="student-class-code">반 코드</Label>
              <Input
                id="student-class-code"
                name="classCode"
                type="text"
                autoComplete="off"
                placeholder="예: 1-3"
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value);
                  if (error) setError(null);
                }}
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="student-no">번호</Label>
              <Input
                id="student-no"
                name="studentNo"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="예: 7"
                value={studentNo}
                onChange={(e) => {
                  setStudentNo(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            <div>
              <Label htmlFor="student-name">이름</Label>
              <Input
                id="student-name"
                name="name"
                type="text"
                autoComplete="off"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "확인 중…" : "시작하기"}
            </Button>
          </form>
        </Card>

        <div className="mt-4">
          <Alert tone="zinc">
            회원가입 없이 반 코드·번호·이름만으로 시작해요. 입력한 이름으로 제출물이
            저장되며, 다른 학생에게는 보이지 않아요.
          </Alert>
        </div>
      </div>
    </main>
  );
}
