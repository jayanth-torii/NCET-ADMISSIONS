import { ApplicationForm } from "@/components/application-form";
import { Stagger, StaggerItem } from "@/components/animated/motion-ui";
import { CounsellorCard } from "@/components/counsellor-card";

/**
 * The combined enquiry block: counsellor details first, application form second.
 * Both live in one section so a visitor reads who will call them, then applies.
 */
export function ApplySection() {
  return (
    <section id="apply" className="bg-navy-50/50 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Stagger className="grid gap-6 lg:grid-cols-2 lg:gap-8 items-stretch">
          {/* --- 1. Counsellor details (Left Column) --- */}
          <StaggerItem className="flex flex-col h-full">
            <div className="flex flex-col h-full rounded-3xl border border-navy-100/90 bg-white p-6 sm:p-8 shadow-xl shadow-navy-900/5 justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full bg-ember-50 border border-ember-200/60 px-2.5 py-0.5 text-[11px] font-black text-ember-700 uppercase tracking-wide">
                    Dedicated Guidance
                  </span>
                </div>
                <h2
                  id="counsellor"
                  className="mt-2.5 scroll-mt-24 text-2xl font-black tracking-tight text-navy sm:text-3xl"
                >
                  Your counsellor details
                </h2>
              </div>

              <div className="w-full">
                <CounsellorCard />
              </div>
            </div>
          </StaggerItem>

          {/* --- 2. Application form (Right Column) --- */}
          <StaggerItem className="flex flex-col h-full">
            <ApplicationForm />
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}