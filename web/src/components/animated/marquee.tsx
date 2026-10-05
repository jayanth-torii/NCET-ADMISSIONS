import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee. The children are rendered twice and the track is
 * translated -50%, which makes the loop seamless without measuring anything.
 * Decorative and paused for reduced-motion users via the global CSS override.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("group relative w-full overflow-hidden", className)}
    >
      <div
        className={cn(
          "animate-marquee flex w-max items-center",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
