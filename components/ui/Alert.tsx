import { cn } from "@/lib/cn";

type Tone = "teal" | "red" | "zinc";

const tones: Record<Tone, { box: string; icon: string; title: string }> = {
  teal: {
    box: "bg-teal-50 ring-teal-600/15 text-teal-900",
    icon: "text-teal-600",
    title: "text-teal-900",
  },
  red: {
    box: "bg-red-50 ring-red-600/15 text-red-900",
    icon: "text-red-600",
    title: "text-red-900",
  },
  zinc: {
    box: "bg-zinc-50 ring-black/5 text-zinc-800",
    icon: "text-zinc-500",
    title: "text-zinc-900",
  },
};

function ToneIcon({ tone, className }: { tone: Tone; className?: string }) {
  if (tone === "teal") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <circle cx="10" cy="10" r="7.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 10.25l2 2 4.5-4.5" />
      </svg>
    );
  }
  if (tone === "red") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <circle cx="10" cy="10" r="7.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6.5v4.25" />
        <circle cx="10" cy="13.75" r="0.85" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    >
      <circle cx="10" cy="10" r="7.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9.25v4.25" />
      <circle cx="10" cy="6.5" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Alert({
  tone = "zinc",
  title,
  children,
  className,
  role = "status",
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  const t = tones[tone];
  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-2.5 rounded-lg p-3.5 text-sm ring-1 sm:p-3",
        t.box,
        className,
      )}
    >
      <ToneIcon tone={tone} className={cn("mt-0.5 size-5 shrink-0 sm:size-4", t.icon)} />
      <div className="min-w-0">
        {title ? (
          <p className={cn("font-semibold", t.title)}>{title}</p>
        ) : null}
        {children ? (
          <div className={cn(title ? "mt-0.5" : "", "text-pretty leading-relaxed")}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
