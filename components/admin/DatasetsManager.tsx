"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Label } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import type { DatasetSummary } from "@/lib/types";
import { readError } from "./shared";

export function DatasetsManager() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/datasets");
      if (!res.ok) {
        setListError(await readError(res, "데이터셋 목록을 불러오지 못했어요."));
        return;
      }
      const data: { datasets: DatasetSummary[] } = await res.json();
      setDatasets(data.datasets ?? []);
    } catch {
      setListError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCsvContent(typeof reader.result === "string" ? reader.result : "");
      if (fieldError) setFieldError(null);
    };
    reader.onerror = () => {
      setFieldError("파일을 읽지 못했어요. 다른 파일로 다시 시도해주세요.");
    };
    reader.readAsText(file);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setCsvContent("");
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) return;
    setFieldError(null);
    setUploadError(null);
    setUploadSuccess(null);

    if (!name.trim()) {
      setFieldError("데이터 이름을 입력해주세요.");
      return;
    }
    if (!csvContent.trim()) {
      setFieldError("CSV 파일을 선택하거나 내용을 붙여넣어 주세요.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          csvContent,
        }),
      });
      if (!res.ok) {
        setUploadError(await readError(res, "데이터셋을 등록하지 못했어요."));
        return;
      }
      setUploadSuccess(`"${name.trim()}" 데이터를 등록했어요.`);
      resetForm();
      await load();
    } catch {
      setUploadError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (deletingId !== null) return;
    setRowError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/datasets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setRowError(await readError(res, "데이터셋을 삭제하지 못했어요."));
        return;
      }
      setPendingDelete(null);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setRowError("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h3 className="mb-3 text-base font-semibold tracking-tight text-zinc-900">
          등록된 데이터셋
        </h3>
        {rowError ? (
          <div className="mb-3">
            <Alert tone="red" role="alert">
              {rowError}
            </Alert>
          </div>
        ) : null}
        {listError ? (
          <Alert tone="red" title="목록을 불러오지 못했어요" role="alert">
            <div className="flex flex-col items-start gap-2">
              <span>{listError}</span>
              <Button variant="secondary" size="sm" onClick={load}>
                다시 시도
              </Button>
            </div>
          </Alert>
        ) : loading ? (
          <div className="flex flex-col gap-2" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        ) : datasets.length === 0 ? (
          <Alert tone="zinc" title="데이터셋이 없어요">
            아직 등록된 데이터가 없어요. 오른쪽에서 첫 데이터를 올려보세요.
          </Alert>
        ) : (
          <ul role="list" className="divide-y divide-black/5 rounded-xl ring-1 ring-black/5">
            {datasets.map((d) => (
              <li key={d.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900">{d.name}</p>
                  {d.description ? (
                    <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">{d.description}</p>
                  ) : (
                    <p className="mt-0.5 text-sm text-zinc-400">설명 없음</p>
                  )}
                </div>
                <div className="shrink-0">
                  {pendingDelete === d.id ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(null)}
                        disabled={deletingId === d.id}
                      >
                        취소
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(d.id)}
                        disabled={deletingId === d.id}
                      >
                        {deletingId === d.id ? "삭제 중…" : "삭제 확인"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setRowError(null);
                        setPendingDelete(d.id);
                      }}
                    >
                      삭제
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold tracking-tight text-zinc-900">
          새 데이터셋 올리기
        </h3>
        <Card>
          <form onSubmit={handleUpload} noValidate className="flex flex-col gap-4">
            <div>
              <Label htmlFor="ds-name">데이터 이름</Label>
              <Input
                id="ds-name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
                placeholder="예: 우리 반 키·몸무게"
                aria-invalid={fieldError && !name.trim() ? true : undefined}
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="ds-desc">설명 (선택)</Label>
              <Input
                id="ds-desc"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="어떤 데이터인지 간단히 적어주세요."
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="ds-file">CSV 파일</Label>
              <input
                ref={fileInputRef}
                id="ds-file"
                name="csvFile"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              />
              {fileName ? (
                <p className="mt-1.5 text-sm text-zinc-500">
                  선택한 파일: <span className="text-zinc-700">{fileName}</span>
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="ds-csv">또는 CSV 내용 붙여넣기</Label>
              <Textarea
                id="ds-csv"
                name="csvContent"
                rows={6}
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value);
                  setFileName(null);
                  if (fieldError) setFieldError(null);
                }}
                placeholder={"이름,키,몸무게\n김하늘,158,48\n..."}
                className="font-mono text-[13px]"
                aria-invalid={fieldError && !csvContent.trim() ? true : undefined}
                aria-describedby={fieldError ? "ds-form-error" : undefined}
              />
            </div>

            {fieldError ? (
              <p id="ds-form-error" role="alert" className="-mt-2 text-sm text-red-600">
                {fieldError}
              </p>
            ) : null}
            {uploadError ? (
              <Alert tone="red" role="alert">
                {uploadError}
              </Alert>
            ) : null}
            {uploadSuccess ? (
              <Alert tone="teal" role="status">
                {uploadSuccess}
              </Alert>
            ) : null}

            <div>
              <Button type="submit" variant="primary" disabled={uploading}>
                {uploading ? "등록 중…" : "데이터셋 등록"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
