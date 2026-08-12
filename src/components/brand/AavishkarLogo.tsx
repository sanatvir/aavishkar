import { cn } from "@/lib/utils";

const logoSrc = "/aavishkar-logo-full.png";
const markSrc = "/favicon.png";

const logoSizes = {
  sm: "h-8 w-auto max-w-[104px]",
  md: "h-10 w-auto max-w-[132px]",
  lg: "h-auto w-[168px] max-w-full sm:w-[200px]",
} as const;

/** ATL mark — favicon for tight spaces. */
export function AavishkarMark({ className }: { className?: string | undefined }) {
  return (
    <img
      src={markSrc}
      alt=""
      aria-hidden="true"
      width={32}
      height={32}
      className={cn("h-7 w-7 shrink-0 object-contain", className)}
      decoding="async"
    />
  );
}

export function AavishkarLogo({
  className,
  size = "md",
}: {
  className?: string | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  /** @deprecated Text is baked into the logo image. Kept for call-site compatibility. */
  subtitle?: string | null | undefined;
}) {
  return (
    <img
      src={logoSrc}
      alt="ATL TAPSITE Innovation"
      width={400}
      height={400}
      className={cn("object-contain object-left rounded-md", logoSizes[size], className)}
      decoding="async"
      fetchPriority={size === "lg" ? "high" : undefined}
    />
  );
}
