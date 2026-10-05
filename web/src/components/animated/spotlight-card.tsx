"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Card with a cursor-following spotlight and an accent border that lights up on
 * hover (Lightswind "spotlight card"). Purely decorative; the card's content is
 * unaffected for keyboard and touch users.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(246,135,42,0.18)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -400, y: -400 });
  const [visible, setVisible] = useState(false);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-navy-100 bg-white transition-colors duration-300 hover:border-navy-300",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: visible ? 1 : 0,
          background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Bento tile that lifts and reveals a highlighted corner accent on hover.
 */
export function PointerTile({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 transition-all duration-300",
        "hover:-translate-y-1 hover:border-navy-300 hover:shadow-lg",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rounded-full bg-ember-gradient opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Blur-fades content in the first time it scrolls into view. */
export function BlurFade({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [shown, setShown] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Callback ref so the observer is created once, against the real DOM node.
  const attach = (node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;

    // Reduced-motion users are handled in CSS (`[data-reveal]` is forced
    // visible), so no observer or state change is needed.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observerRef.current.observe(node);
  };

  return (
    <div
      ref={attach}
      data-reveal=""
      className={cn(
        "transition-all duration-700 ease-out",
        shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-4 opacity-0 blur-[5px]",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
