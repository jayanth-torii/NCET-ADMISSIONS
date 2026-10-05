"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Motion UI primitives, following the motion.dev/ui pattern: declarative
 * scroll-triggered staggers with considered hover micro-interactions.
 *
 * Everything here degrades to a plain, fully visible element when the visitor
 * prefers reduced motion — `useReducedMotion` short-circuits the offsets rather
 * than relying on CSS overrides, so nothing is left half-faded.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Shared "hidden" state for staggered children. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Container that reveals its children one after another when scrolled into view. */
export function Stagger({
  children,
  className,
  stagger = 0.07,
  delayChildren = 0.05,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds between each child. */
  stagger?: number;
  delayChildren?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: reduce
            ? { duration: 0 }
            : { staggerChildren: stagger, delayChildren },
        },
      }}
    >
      {children}
    </Component>
  );
}

/** A single item inside a `Stagger`. Inherits the parent's variant state. */
export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      variants={
        reduce
          ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
          : fadeUp
      }
    >
      {children}
    </Component>
  );
}

/**
 * A single element that fades up into place the first time it scrolls into
 * view. Use for one-off blocks such as section headings.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  as?: "div" | "figure" | "section";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.55, ease: EASE, delay }
      }
    >
      {children}
    </Component>
  );
}