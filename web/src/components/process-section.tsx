import { BlurFade } from "@/components/animated/spotlight-card";
import { SectionHeading } from "@/components/section-heading";
import { processSteps } from "@/data/site";

export function ProcessSection() {
  return (
    <section id="process" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="A simple, transparent, merit-based journey."
          description="Five clear stages from enquiry to enrolment. No hidden steps, no last-minute surprises."
          className="[&_p]:text-justify sm:[&_p]:text-left"
        />

        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {processSteps.map((step, i) => (
            <BlurFade key={step.step} delay={i * 90}>
              <li className="group relative">
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-2xl bg-navy text-lg font-black text-white transition-colors group-hover:bg-ember"
                >
                  {step.step}
                </span>
                <h3 className="mt-5 text-base font-extrabold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-justify sm:text-left">
                  {step.description}
                </p>
              </li>
            </BlurFade>
          ))}
        </ol>
      </div>
    </section>
  );
}
