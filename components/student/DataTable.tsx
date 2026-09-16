import { cn } from "@/lib/cn";
import type { ParsedData } from "@/lib/data";

function looksNumeric(value: string): boolean {
  const v = (value ?? "").trim().replace(/,/g, "");
  if (v === "") return false;
  return !Number.isNaN(Number(v));
}

export function DataTable({
  data,
  maxRows = 8,
}: {
  data: ParsedData;
  maxRows?: number;
}) {
  const rows = data.rows.slice(0, maxRows);

  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-black/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 text-left">
            {data.columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="whitespace-nowrap px-3 py-2.5 font-medium text-zinc-600"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {rows.map((row, ri) => (
            <tr key={ri} className="align-top">
              {data.columns.map((c) => {
                const cell = row[c] ?? "";
                return (
                  <td
                    key={c}
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 text-zinc-800",
                      looksNumeric(cell) && "tabular-nums",
                    )}
                  >
                    {cell === "" ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      cell
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
