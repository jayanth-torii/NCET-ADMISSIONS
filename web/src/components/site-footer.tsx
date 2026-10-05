import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { NgiLogo } from "@/components/ngi-logo";
import { fallbackCounselor, institutions, site } from "@/data/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)]">
          {/* Left Column: Nagarjuna Group branding + Admissions Desk below it */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2.5">
                <NgiLogo invert />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-navy-300 text-justify">
                Established by the Nagarjuna Education Society, Bengaluru. NAAC A+ accredited,
                autonomous and consistently placed.
              </p>
            </div>

            {/* Admissions desk placed directly below Nagarjuna Group */}
            <div className="pt-2 border-t border-white/10">
              <h2 className="text-xs font-black tracking-wider text-white uppercase">
                Admissions Desk
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
                  <div className="flex flex-wrap items-center gap-x-2">
                    <a
                      href={`tel:+91${fallbackCounselor.phones[0]}`}
                      className="hover:text-ember font-medium"
                    >
                      +91 {fallbackCounselor.phones[0]}
                    </a>
                    <span aria-hidden="true" className="text-navy-500">/</span>
                    <a
                      href={`tel:+91${fallbackCounselor.phones[1]}`}
                      className="hover:text-ember font-medium"
                    >
                      +91 {fallbackCounselor.phones[1]}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
                  <a href={`mailto:${site.email}`} className="hover:text-ember font-medium">
                    {site.email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
                  <span className="text-navy-300">{fallbackCounselor.officeAddress}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Our Campuses with full names & active links */}
          <div>
            <h2 className="text-xs font-black tracking-wider text-white uppercase">
              Our Campuses
            </h2>
            <ul className="mt-4 space-y-3">
              {institutions.map((institution) => (
                <li key={institution.slug}>
                  <Link
                    href={institution.website ?? "#"}
                    target={institution.website ? "_blank" : undefined}
                    rel={institution.website ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-start gap-2 text-sm text-navy-300 hover:text-ember no-underline hover:no-underline transition-colors"
                  >
                    <span className="mt-1.5 size-1.5 rounded-full bg-ember/60 shrink-0 group-hover:bg-ember transition-colors" />
                    <span>
                      <strong className="font-semibold text-white/90 group-hover:text-ember transition-colors">{institution.name}</strong>
                      {institution.location && (
                        <span className="text-navy-400"> — {institution.location}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>
            Admissions {site.tagline} · Managed by the regional admissions office, Kurnool.
          </p>
        </div>
      </div>
    </footer>
  );
}
