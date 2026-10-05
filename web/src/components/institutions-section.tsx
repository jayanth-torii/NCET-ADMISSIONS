import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GraduationCap, MapPin } from "lucide-react";

import { BlurFade } from "@/components/animated/spotlight-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { institutions } from "@/data/site";
import { cn } from "@/lib/utils";

export function InstitutionsSection() {
  return (
    <section id="institutions" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Group"
          title="Six institutions. One governing body."
          description="The Nagarjuna Group of Institutions unites six units under the Nagarjuna Education Society, Yelahanka, Bengaluru — each autonomous in its curriculum, united by the same standard of teaching and placement support."
        />

        {/* The "Wings of Nagarjuna" graphic from the official HR Conclave 2026 deck. */}
        <BlurFade className="mt-12">
          <figure className="overflow-hidden rounded-3xl border border-navy-100 bg-navy-50/40">
            <Image
              src="/ngi-wings.png"
              alt="The six wings of the Nagarjuna Group of Institutions"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
            <figcaption className="px-6 py-4 text-sm text-muted-foreground">
              All six units, governed by the Nagarjuna Education Society, Yelahanka,
              Bengaluru.
            </figcaption>
          </figure>
        </BlurFade>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((institution, i) => (
            <BlurFade key={institution.slug} delay={i * 70}>
              <Card
                className={cn(
                  "h-full border-navy-100 shadow-sm transition-shadow hover:shadow-lg",
                  institution.featured && "ring-1 ring-ember/30"
                )}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 items-center justify-center rounded-xl bg-navy text-white"
                    >
                      <GraduationCap className="size-5" />
                    </span>
                    {institution.featured && (
                      <Badge className="bg-ember-gradient text-white hover:opacity-90">
                        Flagship
                      </Badge>
                    )}
                  </div>

                  <h3 className="mt-4 text-base leading-snug font-extrabold text-navy">
                    {institution.name}
                  </h3>

                  {institution.location && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {institution.location}
                    </p>
                  )}

                  {institution.about && (
                    <p className="mt-3 text-sm leading-relaxed text-navy-700/80">
                      {institution.about}
                    </p>
                  )}

                  {institution.programmes?.length ? (
                    <div className="mt-5">
                      <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        Programmes
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {institution.programmes.slice(0, 6).map((programme) => (
                          <li
                            key={programme}
                            className="flex items-start gap-1.5 text-sm text-navy-700"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2 size-1 shrink-0 rounded-full bg-ember"
                            />
                            {programme}
                          </li>
                        ))}
                        {institution.programmes.length > 6 && (
                          <li className="text-xs font-medium text-muted-foreground">
                            +{institution.programmes.length - 6} more
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-muted-foreground italic">
                      Programme details to be confirmed.
                    </p>
                  )}

                  {institution.website && (
                    <Link
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/cta mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ember-600 hover:text-ember-700"
                    >
                      Visit {institution.shortName} website
                      <ArrowUpRight
                        className="size-4 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                        aria-hidden="true"
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
