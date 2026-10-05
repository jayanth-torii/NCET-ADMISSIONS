import Image from "next/image";

import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * The official NGI mark, lifted from the HR Conclave 2026 deck.
 *
 * `wordmark` renders the text lockup beside the mark instead of the image, which
 * reads better than a small raster logo against the navy header.
 */
export function NgiLogo({
  className,
  wordmark = true,
  invert = false,
  priority = false,
}: {
  className?: string;
  wordmark?: boolean;
  /** Use light text (for dark surfaces). */
  invert?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={site.logo}
        alt={`${site.shortName} logo`}
        width={447}
        height={447}
        priority={priority}
        className="h-10 w-10 shrink-0 object-contain"
      />
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-sm font-bold",
              invert ? "text-white" : "text-navy"
            )}
          >
            Nagarjuna Group
          </span>
          <span
            className={cn(
              "text-[11px] font-medium",
              invert ? "text-navy-300" : "text-muted-foreground"
            )}
          >
            of Institutions
          </span>
        </span>
      )}
    </span>
  );
}
