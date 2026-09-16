import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-3 gap-1.5 rounded-xl bg-zinc-100 p-1.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
              "transition-colors focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100 sm:py-2",
              active
                ? "bg-white text-teal-700 shadow-sm ring-1 ring-black/5"
                : "text-zinc-600 hover:text-zinc-900",
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
