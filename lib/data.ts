import Papa from "papaparse";

export type Row = Record<string, string>;

export type ParsedData = {
  columns: string[];
  rows: Row[];
};

export function parseCsv(text: string): ParsedData {
  const result = Papa.parse<Row>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  const columns = result.meta.fields?.map((f) => f.trim()).filter(Boolean) ?? [];
  const rows = (result.data ?? []).filter((r) =>
    columns.some((c) => (r[c] ?? "").trim() !== ""),
  );
  return { columns, rows };
}

export function isNumericColumn(rows: Row[], column: string): boolean {
  let seen = 0;
  for (const row of rows) {
    const v = (row[column] ?? "").trim();
    if (v === "") continue;
    seen++;
    if (Number.isNaN(Number(v.replace(/,/g, "")))) return false;
  }
  return seen > 0;
}

export function toNumber(value: string): number | null {
  const v = (value ?? "").trim().replace(/,/g, "");
  if (v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function dropMissing(
  data: ParsedData,
  columns: string[],
): ParsedData {
  const rows = data.rows.filter((row) =>
    columns.every((c) => (row[c] ?? "").trim() !== ""),
  );
  return { columns: data.columns, rows };
}

export type FilterOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains";

export function applyFilter(
  data: ParsedData,
  column: string,
  op: FilterOp,
  value: string,
): ParsedData {
  const numeric = ["gt", "gte", "lt", "lte"].includes(op);
  const target = value.trim();
  const targetNum = toNumber(target);

  const rows = data.rows.filter((row) => {
    const cell = (row[column] ?? "").trim();
    if (numeric) {
      const cellNum = toNumber(cell);
      if (cellNum === null || targetNum === null) return false;
      if (op === "gt") return cellNum > targetNum;
      if (op === "gte") return cellNum >= targetNum;
      if (op === "lt") return cellNum < targetNum;
      if (op === "lte") return cellNum <= targetNum;
    }
    if (op === "eq") return cell === target;
    if (op === "neq") return cell !== target;
    if (op === "contains") return cell.includes(target);
    return true;
  });
  return { columns: data.columns, rows };
}

export function sortRows(
  data: ParsedData,
  column: string,
  direction: "asc" | "desc",
): ParsedData {
  const numeric = isNumericColumn(data.rows, column);
  const sorted = [...data.rows].sort((a, b) => {
    const av = (a[column] ?? "").trim();
    const bv = (b[column] ?? "").trim();
    if (numeric) {
      const an = toNumber(av) ?? 0;
      const bn = toNumber(bv) ?? 0;
      return direction === "asc" ? an - bn : bn - an;
    }
    return direction === "asc"
      ? av.localeCompare(bv, "ko")
      : bv.localeCompare(av, "ko");
  });
  return { columns: data.columns, rows: sorted };
}

export function aggregateForChart(
  data: ParsedData,
  labelColumn: string,
  valueColumn: string,
): { labels: string[]; values: number[] } {
  const groups = new Map<string, number>();
  for (const row of data.rows) {
    const label = (row[labelColumn] ?? "").trim();
    if (label === "") continue;
    const num = toNumber(row[valueColumn] ?? "");
    if (num === null) continue;
    groups.set(label, (groups.get(label) ?? 0) + num);
  }
  const labels = [...groups.keys()];
  const values = labels.map((l) => groups.get(l) ?? 0);
  return { labels, values };
}
