import { SectionGeometry } from "@/components/section-geometry";
import { BookOpen, Cpu, HeartPulse, Sparkles } from "lucide-react";

import { BlurFade } from "@/components/animated/spotlight-card";
import { SectionHeading } from "@/components/section-heading";
import { campusHighlights } from "@/data/site";

const ICONS = [BookOpen, Cpu, Sparkles, HeartPulse];

/** Learning ecosystem — figures from the HR Conclave 2026 deck, slide 8. */
export function CampusSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <SectionGeometry shape="blob" size={260} className="-right-12 -top-16 text-navy-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Learning ecosystem"
          title="Where teaching, study and hands-on work take place."
          description="A single 60-acre campus in Devanahalli carrying the library, laboratories, innovation spaces and student welfare that a full engineering programme needs."
          className="[&_p]:text-justify sm:[&_p]:text-left"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {campusHighlights.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <BlurFade key={item.title} delay={i * 90}>
                <div className="flex h-full gap-4 rounded-2xl border border-navy-100 bg-navy-50/40 p-6">
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-ember shadow-sm"
                  >
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-navy">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-justify sm:text-left">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
