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
    <div className="flex flex-col gap-4">
      {/* 1. Counsellor Profile Block: Directly below "Your counsellor details" */}
      <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-navy-100 bg-navy-50/50 p-5 text-center sm:text-left">
        <div className="relative shrink-0">
          <span
            aria-hidden="true"
            className="flex size-18 items-center justify-center rounded-2xl bg-ember-gradient text-white shadow-md shadow-ember/20"
          >
            <UserRound className="size-8" />
          </span>
          <span
            className="absolute -bottom-1 -right-1 flex size-5.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white shadow-xs"
            title="Available for Admissions Guidance"
          >
            <span className="size-2 rounded-full bg-white animate-pulse" />
          </span>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-xl font-black text-navy">{counselor.name}</h3>
            <span className="inline-block rounded-full bg-ember-100/90 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-ember-800 uppercase">
              {counselor.region} Desk
            </span>
          </div>
          <p className="text-xs font-bold text-navy-700 mt-0.5">
            {counselor.designation}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground">
            Nagarjuna Group of Institutions
          </p>

          {counselor.languages?.length ? (
            <div className="mt-2.5 flex flex-wrap justify-center sm:justify-start gap-1">
              {counselor.languages.map((language) => (
                <span
                  key={language}
                  className="rounded-md border border-navy-200/60 bg-white px-2 py-0.5 text-[10px] font-bold text-navy-700 shadow-xs"
                >
                  {language}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. Message Quote Box */}
      <div className="rounded-xl bg-navy-50/70 p-3.5 border border-navy-100/80">
        <p className="text-xs font-medium leading-relaxed text-navy-700 text-justify">
          &ldquo;{counselor.message}&rdquo;
        </p>
      </div>

      {/* 3. Direct Contact & Office Details (Row-wise one below another) */}
      <div className="rounded-2xl border border-navy-100 bg-white p-4.5 space-y-3.5">
        {counselor.phones.map((phone) => (
          <div key={phone}>
            <p className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
              Call / WhatsApp Directly
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <ButtonLink
                href={dial(phone)}
                external
                size="sm"
                className="h-8 rounded-lg bg-ember-gradient text-white text-xs font-bold hover:opacity-90 px-3 shadow-xs"
              >
                <Phone className="size-3 mr-1" aria-hidden="true" />
                {phone}
              </ButtonLink>
              <ButtonLink
                href={waLink(phone)}
                external
                newTab
                srSuffix={`${phone} (opens in a new tab)`}
                size="sm"
                variant="outline"
                className="h-8 rounded-lg border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100/80 px-3"
              >
                <MessageCircle className="size-3 mr-1 text-emerald-600" aria-hidden="true" />
                WhatsApp
              </ButtonLink>
            </div>
          </div>
        ))}

        <div>
          <p className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
            Admissions Email
          </p>
          <a
            href={`mailto:${counselor.email}`}
            className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-bold text-ember-600 underline-offset-4 hover:underline"
          >
            <Mail className="size-3.5 shrink-0" aria-hidden="true" />
            {counselor.email}
          </a>
        </div>

        {counselor.officeAddress && (
          <div>
            <p className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
              Regional Office
            </p>
            <p className="mt-0.5 flex items-start gap-1.5 text-[11px] font-medium leading-normal text-navy-700">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-ember" aria-hidden="true" />
              {counselor.officeAddress}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
