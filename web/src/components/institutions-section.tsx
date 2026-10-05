import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GraduationCap, MapPin } from "lucide-react";

import { Reveal, Stagger, StaggerItem } from "@/components/animated/motion-ui";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { institutions } from "@/data/site";

/**
 * The Group, presented as a Motion UI bento grid: the flagship institution
 * takes a double-width tile so the grid reads as a composition rather than a
 * uniform list, and each unit reveals in a scroll-triggered stagger.
 */
export function InstitutionsSection() {
  const [featured, ...rest] = institutions;

  return (
    <section id="institutions" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Group"
          title="Six institutions. One governing body."
          description="The Nagarjuna Group of Institutions unites six units under the Nagarjuna Education Society, Yelahanka, Bengaluru — each autonomous in its curriculum, united by the same standard of teaching and placement support."
        />

        {/* The "Wings of Nagarjuna" graphic from the official HR Conclave 2026 deck. */}
        <Reveal as="figure" className="mt-12" delay={0.05}>
          <div className="overflow-hidden rounded-3xl border border-navy-100 bg-navy-50/40">
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
          </div>
        </Reveal>

        <Stagger
          as="ul"
          className="mt-10 grid auto-rows-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* --- Flagship tile: spans two columns, inverted to navy --- */}
          <StaggerItem as="li" className="sm:col-span-2">
            <article className="group relative h-full overflow-hidden rounded-3xl bg-navy p-7 text-white transition-shadow duration-300 hover:shadow-2xl hover:shadow-navy-900/25 sm:p-8">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-ember-gradient opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-45"
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-colors group-hover:bg-white/20"
                  >
                    <GraduationCap className="size-5" />
                  </span>
                  <Badge className="bg-ember-gradient text-white hover:opacity-90">
                    Flagship
                  </Badge>
                </div>

                <h3 className="mt-5 text-xl leading-snug font-extrabold sm:text-2xl">
                  {featured.name}
                </h3>

                {featured.location && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-navy-200">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {featured.location}
                  </p>
                )}

                {featured.about && (
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-navy-100/90">
                    {featured.about}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {featured.programmes?.map((programme) => (
                    <span
                      key={programme}
                      className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-navy-100 ring-1 ring-white/10 transition-colors group-hover:bg-white/15"
                    >
                      {programme}
                    </span>
                  ))}
                </div>

                {featured.website && (
                  <Link
                    href={featured.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ember underline-offset-4 hover:underline"
                  >
                    Visit {featured.shortName} website
                    <ArrowUpRight
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </Link>
                )}
              </div>
            </article>
          </StaggerItem>

          {/* --- Supporting units --- */}
          {rest.map((institution) => (
            <StaggerItem as="li" key={institution.slug}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-navy-300 hover:shadow-xl hover:shadow-navy-900/5">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-14 -right-14 size-36 rounded-full bg-ember-gradient opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 items-center justify-center rounded-xl bg-navy text-white transition-colors group-hover:bg-ember"
                  >
                    <GraduationCap className="size-5" />
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-navy-400">
                    {institution.shortName}
                  </span>
                </div>

                <h3 className="relative mt-4 text-base leading-snug font-extrabold text-navy">
                  {institution.name}
                </h3>

                {institution.location && (
                  <p className="relative mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {institution.location}
                  </p>
                )}

                {institution.about && (
                  <p className="relative mt-3 text-sm leading-relaxed text-navy-700/80">
                    {institution.about}
                  </p>
                )}

                {institution.programmes?.length ? (
                  <ul className="relative mt-5 flex flex-wrap gap-1.5">
                    {institution.programmes.map((programme) => (
                      <li
                        key={programme}
                        className="rounded-md bg-navy-50 px-2 py-1 text-[11px] font-semibold text-navy-700 transition-colors group-hover:bg-ember-50 group-hover:text-ember-700"
                      >
                        {programme}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="relative mt-4 text-xs text-muted-foreground italic">
                    Programme details to be confirmed.
                  </p>
                )}

                {institution.website && (
                  <Link
                    href={institution.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ember-600 hover:text-ember-700"
                  >
                    Visit website
                    <ArrowUpRight
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                    <span className="sr-only">
                      for {institution.shortName} (opens in a new tab)
                    </span>
                  </Link>
                )}
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}