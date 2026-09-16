import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-teal-600 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-teal-600 text-white hover:bg-teal-700",
  secondary:
    "bg-white text-zinc-800 ring-1 ring-black/10 hover:bg-zinc-50",
  ghost: "text-zinc-700 hover:bg-zinc-100",
  danger:
    "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-base sm:py-2 sm:text-sm",
  sm: "px-3 py-2 text-sm sm:py-1.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
