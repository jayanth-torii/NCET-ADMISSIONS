"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Briefcase, Clock, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { AngledSlider, type AngledSliderItem } from "@/components/lightswind/angled-slider";
import { programs, type Program } from "@/data/site";
import { cn } from "@/lib/utils";

type Filter = "all" | Program["level"];

const FILTERS: { value: Filter; label: string; shortLabel: string }[] = [
  { value: "all", label: "All programmes", shortLabel: "All Program" },
  { value: "UG", label: "Undergraduate", shortLabel: "UG" },
  { value: "PG", label: "Postgraduate", shortLabel: "PG" },
];

/**
 * Modern Redesigned Programmes Section using Angled 3D Slider.
 * Showcases programmes with interactive 3D perspective cards, filter controls,
 * and rich smooth hover interactions.
 */
export function ProgrammesSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const reduce = useReducedMotion();

  const visiblePrograms = useMemo(() => {
    return programs.filter((p) => filter === "all" || p.level === filter);
  }, [filter]);

  const sliderItems: AngledSliderItem[] = useMemo(() => {
    return visiblePrograms.map((p) => ({
      id: p.code,
      title: p.name,
    }));
  }, [visiblePrograms]);

  return (
    <section id="programmes" className="relative overflow-hidden bg-navy-50/60 py-24 sm:py-32">
      {/* Decorative subtle ambient glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-ember/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 size-96 rounded-full bg-navy/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Programmes"
            title="Choose the programme that defines your tomorrow."
            description="Every programme is industry-aligned and reviewed each year against current global tech trends — so what you study in year one still matters in year four."
            className="[&_p]:text-justify sm:[&_p]:text-left"
          />

          <div
            role="group"
            aria-label="Filter programmes by level"
            className="flex w-full shrink-0 gap-1 rounded-full border border-navy-100 bg-white p-1 shadow-sm sm:w-auto sm:p-1.5 sm:gap-1.5"
          >
            {FILTERS.map((option) => {
              const active = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "relative flex-1 rounded-full px-3 py-1.5 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold whitespace-nowrap transition-colors sm:flex-none cursor-pointer text-center",
                    active ? "text-white" : "text-navy-600 hover:text-navy"
                  )}
                >
                  {/* Shared pill animation */}
                  {active && (
                    <motion.span
                      layoutId="programme-filter-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-navy shadow-md"
                      transition={
                        reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  <span className="relative z-10 sm:hidden">{option.shortLabel}</span>
                  <span className="relative z-10 hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Screen-reader notice */}
        <p aria-live="polite" className="sr-only">
          Showing {visiblePrograms.length} programmes
        </p>
      </div>

      {/* 3D Angled Slider Showcase */}
      <div className="relative mt-12 w-full">
        <AngledSlider
          key={`angled-slider-${filter}`}
          items={sliderItems}
          cardWidth="340px"
          containerHeight="480px"
          gap="32px"
          angle={15}
          speed={35}
          hoverScale={1.06}
          className="mask-fade-x"
          renderItem={(item) => {
            const program = visiblePrograms.find((p) => p.code === item.id) || visiblePrograms[0];
            if (!program) return null;

            return (
              <div className="group/card relative flex h-full min-h-[380px] flex-col justify-between overflow-hidden rounded-3xl border border-navy-100/80 bg-white p-7 shadow-lg shadow-navy-900/5 transition-all duration-500 hover:border-ember/40 hover:shadow-2xl hover:shadow-ember/10">
                {/* Background ambient gradient flare on hover */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-ember-gradient opacity-0 blur-2xl transition-opacity duration-500 group-hover/card:opacity-25"
                />

                {/* Top header: Code & Degree Level Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-navy-50 px-2.5 py-1 font-mono text-xs font-bold tracking-tight text-ember-600 border border-navy-100/50">
                      <Sparkles className="size-3 text-ember" />
                      {program.code}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors",
                        program.level === "UG"
                          ? "bg-navy-50 text-navy group-hover/card:bg-navy group-hover/card:text-white"
                          : "bg-ember-50 text-ember-700 group-hover/card:bg-ember-gradient group-hover/card:text-white"
                      )}
                    >
                      {program.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 text-xl font-black leading-snug tracking-tight text-navy transition-colors group-hover/card:text-ember-600">
                    {program.name}
                  </h3>

                  {/* Duration & Campus info */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-navy-500">
                    <span className="inline-flex items-center gap-1.5 bg-navy-50/80 px-2.5 py-1 rounded-md">
                      <Clock className="size-3.5 text-ember" aria-hidden="true" />
                      {program.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-navy-50/80 px-2.5 py-1 rounded-md">
                      <ArrowUpRight className="size-3.5 text-ember" aria-hidden="true" />
                      {program.institution}
                    </span>
                  </div>

                  {/* Tags */}
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {program.tags.map((tag) => (
                      <li key={tag}>
                        <span className="inline-block rounded-lg bg-navy-50 px-2.5 py-1 text-[11px] font-semibold text-navy-700 border border-navy-100/60 transition-colors group-hover/card:bg-ember-50 group-hover/card:text-ember-700 group-hover/card:border-ember-200/50">
                          {tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Career Paths */}
                <div className="mt-6 border-t border-navy-50 pt-4">
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-navy-700/80">
                    <Briefcase
                      className="mt-0.5 size-3.5 shrink-0 text-ember"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="font-bold text-navy">Career paths: </strong>
                      {program.careers}
                    </span>
                  </p>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Subtle bottom helper hint */}
      <div className="mx-auto mt-4 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-medium text-navy-400">
          ✦ Hover over any card to inspect programme details in full view
        </p>
      </div>
    </section>
  );
}

