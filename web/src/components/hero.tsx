import { ArrowRight, Sparkles } from "lucide-react";

import { AuroraBackdrop } from "@/components/animated/aurora";
import { TextReveal } from "@/components/animated/text-reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { site } from "@/data/site";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden bg-navy pt-24 pb-16"
    >
      <AuroraBackdrop />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge className="mb-6 gap-2 border-ember/40 bg-ember/15 text-ember-200 hover:bg-ember/20">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Admissions {site.tagline} are open
          </Badge>

          <h1 className="text-4xl font-black tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
            <TextReveal
              as="span"
              text="Admissions to the Nagarjuna Group of Institutions"
              className="block"
              delayMs={45}
            />
          </h1>

          <TextReveal
            text="NAAC A+ accredited, autonomous and consistently placed — one application, every campus, and a regional counsellor who calls you back."
            className="mt-6 max-w-2xl text-base leading-relaxed text-navy-100 sm:text-lg"
            delayMs={25}
          />

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink
              href="#apply"
              size="lg"
              className="group h-12 bg-ember-gradient px-7 text-base text-white hover:opacity-90"
            >
              Start your application
              <ArrowRight
                className="ml-2 size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </ButtonLink>
            <ButtonLink
              href="#counsellor"
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-white/5 px-7 text-base text-white backdrop-blur hover:bg-white/10 hover:text-white"
            >
              Talk to a counsellor
            </ButtonLink>
          </div>

          <p className="mt-6 text-sm text-navy-200">
            Or call the admissions desk at{" "}
            <a
              href={`tel:${site.helpline.replace(/\s/g, "")}`}
              className="font-semibold text-ember underline-offset-4 hover:underline"
            >
              {site.helpline}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
