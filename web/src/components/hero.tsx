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
        <div className="max-w-4xl lg:max-w-5xl">
          <Badge className="mb-6 inline-flex items-center gap-2 border-ember/40 bg-ember/15 text-ember-200 hover:bg-ember/20 px-3.5 py-1 text-xs font-bold rounded-full">
            <Sparkles className="size-3.5 text-ember" aria-hidden="true" />
            Admissions {site.tagline} are open
          </Badge>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.12]">
            <span className="block whitespace-normal sm:whitespace-nowrap">
              <TextReveal
                as="span"
                text="Admissions to the Nagarjuna"
                className="inline"
                delayMs={40}
              />
            </span>
            <span className="block">
              <TextReveal
                as="span"
                text="Group of Institutions"
                className="inline"
                delayMs={40}
              />
            </span>
          </h1>

          <TextReveal
            text="NAAC A+ accredited, autonomous and consistently placed — one application, every campus, and a regional counsellor who calls you back."
            className="mt-6 max-w-2xl text-base leading-relaxed text-navy-100/90 sm:text-lg block"
            delayMs={20}
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
