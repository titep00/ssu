import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Label({
  className,
  children,
  htmlFor,
}: {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-sm font-medium text-zinc-700", className)}
    >
      {children}
    </label>
  );
}

export function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white tabular-nums">
        {n}
      </span>
      <span className="text-base font-semibold tracking-tight text-zinc-900">
        {label}
      </span>
    </div>
  );
}
