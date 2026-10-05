import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { NgiLogo } from "@/components/ngi-logo";
import { fallbackCounselor, institutions, site } from "@/data/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <NgiLogo invert />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy-300">
              Established by the Nagarjuna Education Society, Bengaluru. NAAC A+ accredited,
              autonomous and consistently placed.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              Our campuses
            </h2>
            <ul className="mt-4 space-y-2">
              {institutions.map((institution) => (
                <li key={institution.slug}>
                  <Link
                    href={institution.website ?? "#institutions"}
                    target={institution.website ? "_blank" : undefined}
                    rel={institution.website ? "noopener noreferrer" : undefined}
                    className="text-sm text-navy-300 hover:text-ember"
                  >
                    {institution.shortName}
                    <span className="text-navy-500"> — {institution.location}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              Admissions desk
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
                <a
                  href={`tel:+91${fallbackCounselor.phones[0]}`}
                  className="hover:text-ember"
                >
                  {fallbackCounselor.phones[0]}
                </a>
                <span aria-hidden="true" className="text-navy-500">/</span>
                <a
                  href={`tel:+91${fallbackCounselor.phones[1]}`}
                  className="hover:text-ember"
                >
                  {fallbackCounselor.phones[1]}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
                <a href={`mailto:${site.email}`} className="hover:text-ember">
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
                <span>{fallbackCounselor.officeAddress}</span>
              </li>
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
