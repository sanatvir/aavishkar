import { cn } from "@/lib/utils";

export function Avatar({
  name,
  initials,
  src,
  accent = "from-primary to-accent",
  size = "md",
  className,
}: {
  name?: string | undefined;
  initials: string;
  src?: string | undefined;
  accent?: string | undefined;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
  className?: string | undefined;
}) {
  const dims = {
    xs: "h-6 w-6 text-[0.55rem]",
    sm: "h-9 w-9 text-[0.7rem]",
    md: "h-11 w-11 text-xs",
    lg: "h-14 w-14 text-sm",
    xl: "h-20 w-20 text-lg",
  }[size];

  if (src) {
    return (
      <div
        title={name}
        className={cn("shrink-0 overflow-hidden rounded-full ring-2 ring-card", dims, className)}
      >
        <img src={src} alt={name ?? initials} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      title={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold tracking-wide text-primary-foreground ring-2 ring-card",
        accent,
        dims,
        className,
      )}
    >
      {initials}
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | undefined;
  className?: string | undefined;
}) {
  const tones = {
    neutral: "bg-secondary text-secondary-foreground border-border",
    accent: "bg-accent/12 text-primary border-accent/30",
    success: "bg-success/12 text-success border-success/30",
    warning: "bg-warning/15 text-warning-foreground border-warning/35",
    danger: "bg-destructive/10 text-destructive border-destructive/25",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium",
        tones,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  title,
  action,
  subtitle,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string | undefined }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string | undefined }) {
  return (
    <div className="surface grid place-items-center px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
