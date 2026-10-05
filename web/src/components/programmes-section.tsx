"use client";

import { useState } from "react";

import { BlurFade, SpotlightCard } from "@/components/animated/spotlight-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { programs, type Program } from "@/data/site";
import { cn } from "@/lib/utils";

type Filter = "all" | Program["level"];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All programmes" },
  { value: "UG", label: "Undergraduate" },
  { value: "PG", label: "Postgraduate" },
];

export function ProgrammesSection() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = programs.filter((p) => filter === "all" || p.level === filter);

  return (
    <section id="programmes" className="bg-navy-50/50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Programmes"
            title="Choose the programme that defines your tomorrow."
            description="Every programme is industry-aligned and reviewed each year against current global tech trends — so what you study in year one still matters in year four."
          />

          <div
            role="group"
            aria-label="Filter programmes by level"
            className="flex w-full shrink-0 flex-wrap gap-1 rounded-xl border border-navy-100 bg-white p-1 sm:w-auto lg:flex-nowrap"
          >
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={cn(
                  "flex-1 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors sm:flex-none",
                  filter === option.value
                    ? "bg-navy text-white"
                    : "text-navy-600 hover:bg-navy-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Announced politely so screen-reader users hear the result of a filter. */}
        <p aria-live="polite" className="sr-only">
          Showing {visible.length} programmes
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((program, i) => (
            <BlurFade key={program.code} delay={i * 60}>
              <SpotlightCard className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-navy-50 font-mono text-[11px] text-navy"
                  >
                    {program.code}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-[11px]",
                      program.level === "UG"
                        ? "bg-navy text-white hover:bg-navy-800"
                        : "bg-ember-gradient text-white hover:opacity-90"
                    )}
                  >
                    {program.level}
                  </Badge>
                </div>

                <h3 className="mt-4 text-base leading-snug font-extrabold text-navy">
                  {program.name}
                </h3>

                <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                  {program.duration} · {program.institution}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {program.tags.map((tag) => (
                    <li key={tag}>
                      <span className="rounded-md bg-ember-50 px-2 py-1 text-[11px] font-semibold text-ember-700">
                        {tag}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-auto pt-5 text-xs leading-relaxed text-navy-700/70">
                  <span className="font-bold">Career paths: </span>
                  {program.careers}
                </p>
              </SpotlightCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
