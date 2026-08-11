import { PLATFORM_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const logoSrc = "/aavishkar-logo-full.png";
const markSrc = "/favicon.png";

const logoSizes = {
  sm: "h-10 w-auto max-w-[128px]",
  md: "h-12 w-auto max-w-[156px]",
  lg: "h-auto w-[200px] max-w-full sm:w-[240px]",
} as const;

const logoReadable =
  "drop-shadow-[0_1px_0_rgba(255,255,255,0.65)] drop-shadow-[0_0_1px_rgba(0,0,0,0.12)]";

/** AAVISHKAR mark — favicon for tight spaces. */
export function AavishkarMark({ className }: { className?: string | undefined }) {
  return (
    <img
      src={markSrc}
      alt=""
      aria-hidden="true"
      width={40}
      height={40}
      className={cn(
        "h-9 w-9 shrink-0 bg-transparent object-contain",
        logoReadable,
        className,
      )}
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
      alt={`AAVISHKAR — ${PLATFORM_TAGLINE}`}
      width={611}
      height={277}
      className={cn(
        "bg-transparent object-contain object-left",
        logoReadable,
        logoSizes[size],
        className,
      )}
      decoding="async"
      fetchPriority={size === "lg" ? "high" : undefined}
    />
  );
}
