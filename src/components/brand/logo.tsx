import { cn } from "@/lib/utils";

// Geometric SaleMyCar mark — a rounded square containing a simplified
// car silhouette built from flat geometric shapes (one trapezoid for
// the roof/cabin, one rectangle for the body, two circles for wheels).
// All in `currentColor` so the mark inherits text color from its parent.

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  /** logo height in px (mark scales accordingly). default 32 */
  size?: number;
}

export function Logo({
  className,
  showWordmark = true,
  size = 32,
}: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-zinc-900",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* badge */}
        <rect width="32" height="32" rx="8" fill="currentColor" />
        {/* roof */}
        <path d="M11 12 L21 12 L23 18 L9 18 Z" fill="white" />
        {/* body */}
        <rect x="6" y="18" width="20" height="4" rx="1.5" fill="white" />
        {/* wheels (tire) */}
        <circle cx="10" cy="24" r="2.6" fill="white" />
        <circle cx="22" cy="24" r="2.6" fill="white" />
        {/* wheels (hub — dots back to badge color) */}
        <circle cx="10" cy="24" r="1" fill="currentColor" />
        <circle cx="22" cy="24" r="1" fill="currentColor" />
      </svg>
      {showWordmark ? (
        <span className="text-base font-semibold tracking-tight">
          <span>Sale</span>
          <span className="text-zinc-500">My</span>
          <span>Car</span>
        </span>
      ) : null}
    </span>
  );
}
