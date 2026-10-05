"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Word-by-word blur/fade reveal (Animata-style "text generate").
 *
 * Words are real text nodes so the sentence stays selectable, searchable and
 * readable by screen readers — only per-word opacity and blur are animated.
 *
 * NOTE ON LAYOUT: words are laid out with `inline` rather than `flex`. Flex
 * strips the whitespace between items, which renders "AdmissionstotheNagarjuna"
 * as one run — so spacing is restored with a real space text node instead.
 */
export function TextReveal({
  text,
  className,
  wordClassName,
  delayMs = 60,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delayMs?: number;
  as?: "p" | "h1" | "h2" | "h3" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced-motion users are handled in CSS (`[data-reveal]` is forced
    // visible), so there is nothing to observe and no state to set here.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn("inline", className)}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span
            data-reveal=""
            className={cn(
              "inline-block transition-all duration-700 ease-out will-change-[opacity,filter,transform]",
              wordClassName,
              started
                ? "translate-y-0 opacity-100 blur-0"
                : "translate-y-3 opacity-0 blur-[6px]"
            )}
            style={{ transitionDelay: `${i * delayMs}ms` }}
          >
            {word}
          </span>
          {/* A real space, so collapsed whitespace never eats the word gap. */}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
