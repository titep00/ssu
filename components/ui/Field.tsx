import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-lg bg-white px-3 py-2.5 text-base sm:py-2 sm:text-sm " +
  "text-zinc-900 ring-1 ring-black/10 placeholder:text-zinc-400 " +
  "focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "disabled:opacity-50 disabled:bg-zinc-50";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(fieldBase, "resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(fieldBase, "appearance-none pr-9", className)}
        {...props}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 8l4 4 4-4"
        />
      </svg>
    </div>
  );
}
