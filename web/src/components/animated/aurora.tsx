import { cn } from "@/lib/utils";

/**
 * Decorative aurora glow — two slowly drifting radial blobs over the brand
 * colours. Purely presentational, so it is hidden from assistive tech.
 */
export function Aurora({
  className,
  intensity = 0.55,
}: {
  className?: string;
  intensity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="animate-aurora absolute -top-1/4 -left-1/4 h-[70vmax] w-[70vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(246,135,42,0.55) 0%, rgba(246,135,42,0) 65%)",
          opacity: intensity,
        }}
      />
      <div
        className="animate-aurora absolute -right-1/4 -bottom-1/4 h-[65vmax] w-[65vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(43,68,120,0.55) 0%, rgba(43,68,120,0) 65%)",
          opacity: intensity,
          animationDelay: "-9s",
          animationDirection: "reverse",
        }}
      />
    </div>
  );
}

/** Slow-drifting conic sheen, used behind the hero headline. */
export function AuroraBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-navy-grid",
        className
      )}
    >
      <div
        className="animate-aurora absolute top-[-20%] left-[20%] h-[60vmax] w-[60vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "conic-gradient(from 0deg, #f6872a, #2b4478, #0a1f44, #f6872a)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/40 via-navy/70 to-navy" />
    </div>
  );
}
