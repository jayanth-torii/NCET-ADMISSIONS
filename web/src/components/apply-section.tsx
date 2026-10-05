import { ApplicationForm } from "@/components/application-form";
import { BlurFade } from "@/components/animated/spotlight-card";
import { CounsellorCard } from "@/components/counsellor-card";
import { ShieldCheck, Clock, PhoneCall } from "lucide-react";
import { fallbackCounselor } from "@/data/site";

const PROMISES = [
  { icon: Clock, text: "Callback within one working day" },
  { icon: ShieldCheck, text: "Your details stay private and are never sold" },
  { icon: PhoneCall, text: "Speak to a named counsellor, not a queue" },
];

/**
 * The combined enquiry block: counsellor details first, application form second.
 * Both live in one section so a visitor reads who will call them, then applies.
 */
export function ApplySection() {
  return (
    <section id="apply" className="bg-navy-50/50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* --- 1. Counsellor details --- */}
          <BlurFade>
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-ember-600 uppercase">
                Your counsellor
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-balance text-navy sm:text-4xl">
                Your counsellor details
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Every enquiry from this page is routed to a named regional counsellor —
                not a call centre. Reach out directly for programme guidance,
                eligibility clarification or a campus visit.
              </p>
            </div>

            <div className="mt-8">
              <CounsellorCard />
            </div>

            <ul className="mt-6 space-y-3">
              {PROMISES.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-ember"
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-semibold text-navy-700">{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Prefer to talk first?
              </p>
              <p className="mt-2 text-sm text-navy-700">
                Call{" "}
                <a
                  href={`tel:+91${fallbackCounselor.phones[0]}`}
                  className="font-bold text-ember-600 underline-offset-4 hover:underline"
                >
                  {fallbackCounselor.phones[0]}
                </a>{" "}
                for {fallbackCounselor.region} or email{" "}
                <a
                  href={`mailto:${fallbackCounselor.email}`}
                  className="font-bold text-ember-600 underline-offset-4 hover:underline"
                >
                  {fallbackCounselor.email}
                </a>
                .
              </p>
            </div>
          </BlurFade>

          {/* --- 2. Application form, alongside the counsellor --- */}
          <BlurFade delay={120}>
            <ApplicationForm />
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
