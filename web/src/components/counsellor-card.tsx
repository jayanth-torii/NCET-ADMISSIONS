"use client";

import { Mail, MapPin, MessageCircle, Phone, UserRound } from "lucide-react";
import useSWR from "swr";

import { ButtonLink } from "@/components/ui/button-link";
import { fallbackCounselor } from "@/data/site";
import { API_URL, fetcher } from "@/lib/fetcher";

export type Counselor = {
  name: string;
  designation: string;
  region: string;
  phones: readonly string[];
  email: string;
  officeAddress?: string;
  message?: string;
  languages?: string[];
};

type CounselorResponse = { success: boolean; counselors: Counselor[] };

const dial = (phone: string) => `tel:+91${phone.replace(/\D/g, "").slice(-10)}`;
const waLink = (phone: string) =>
  `https://wa.me/91${phone.replace(/\D/g, "").slice(-10)}`;

/**
 * Regional counsellor card.
 *
 * Data comes from GET /api/counselors. If the API is unreachable the component
 * falls back to the hard-coded contact from the official visiting card, so the
 * page always offers a way to reach a human.
 */
export function CounsellorCard() {
  const { data, isLoading } = useSWR<CounselorResponse>(
    `${API_URL}/api/counselors`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const counselor: Counselor = data?.counselors?.[0] ?? {
    ...fallbackCounselor,
    message:
      "Call or WhatsApp for programme guidance, eligibility clarification and campus visit scheduling.",
    languages: ["Telugu", "English", "Kannada", "Hindi"],
  };

  // True only when we fell back because the API failed, not before it loads.
  const usingFallback = !data && !isLoading;

  return (
    <div className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Identity panel */}
        <div className="relative flex flex-col items-center gap-5 border-b border-navy-100 bg-navy-50/60 p-8 text-center sm:p-10 lg:border-r lg:border-b-0">
          <span
            aria-hidden="true"
            className="flex size-28 items-center justify-center rounded-3xl bg-ember-gradient text-white shadow-xl"
          >
            <UserRound className="size-12" />
          </span>

          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-ember-600 uppercase">
              {counselor.region}
            </p>
            <h3 className="mt-2 text-2xl font-black text-navy">{counselor.name}</h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {counselor.designation}
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              Nagarjuna Group of Institutions
            </p>
          </div>

          {counselor.languages?.length ? (
            <ul className="flex flex-wrap justify-center gap-1.5">
              {counselor.languages.map((language) => (
                <li
                  key={language}
                  className="rounded-md border border-navy-100 bg-white px-2.5 py-1 text-xs font-medium text-navy-700"
                >
                  {language}
                </li>
              ))}
            </ul>
          ) : null}

          {usingFallback && (
            <p className="text-xs text-muted-foreground">
              Live directory unavailable — showing the regional desk number.
            </p>
          )}
        </div>

        {/* Contact panel */}
        <div className="p-8 sm:p-10">
          {counselor.message && (
            <p className="text-sm leading-relaxed text-navy-700">{counselor.message}</p>
          )}

          <div className="mt-6 space-y-4">
            {counselor.phones.map((phone) => (
              <div key={phone}>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Call / WhatsApp
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <ButtonLink
                    href={dial(phone)}
                    external
                    size="sm"
                    className="bg-ember-gradient text-white hover:opacity-90"
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {phone}
                  </ButtonLink>
                  <ButtonLink
                    href={waLink(phone)}
                    external
                    newTab
                    srSuffix={`${phone} (opens in a new tab)`}
                    size="sm"
                    variant="outline"
                    className="border-navy-200 bg-white text-navy hover:bg-navy-50"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    WhatsApp
                  </ButtonLink>
                </div>
              </div>
            ))}

            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Email
              </p>
              <a
                href={`mailto:${counselor.email}`}
                className="mt-1.5 inline-flex items-center gap-2 text-sm font-semibold text-ember-600 underline-offset-4 hover:underline"
              >
                <Mail className="size-4" aria-hidden="true" />
                {counselor.email}
              </a>
            </div>

            {counselor.officeAddress && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Regional office
                </p>
                <p className="mt-1.5 flex items-start gap-2 text-sm text-navy-700">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
                  {counselor.officeAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
