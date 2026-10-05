import { ApplicationForm } from "@/components/application-form";
import { Stagger, StaggerItem } from "@/components/animated/motion-ui";
import { CounsellorCard } from "@/components/counsellor-card";
import { SectionGeometry } from "@/components/section-geometry";

/**
 * The combined enquiry block: counsellor details first, application form second.
 * Both live in one section so a visitor reads who will call them, then applies.
 */
export function ApplySection() {
  return (
    <section
      id="apply"
      className="relative overflow-hidden bg-navy-50/50 py-16 sm:py-20 lg:py-28"
    >
      {/* Faint geometry so the band does not read as empty space. */}
      <SectionGeometry shape="quarter" size={300} className="-left-20 -top-16 text-navy-100" />
      <SectionGeometry
        shape="dotsDense"
        size={260}
        className="-right-8 bottom-6 text-navy-200"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Stagger className="grid gap-6 lg:grid-cols-2 lg:gap-8 items-start">
          {/* --- 1. Counsellor details (Left Column) --- */}
          <StaggerItem className="flex flex-col">
            {/* Content flows top-down and the card fills whatever height the form
                sets, so both columns align without a void in between. */}
            <div className="relative flex flex-col overflow-hidden rounded-3xl border border-navy-100/90 bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-8">
              <div className="flex flex-col gap-6">
                <div>
                  <span className="inline-block rounded-full border border-ember-200/60 bg-ember-50 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-ember-700">
                    Dedicated Guidance
                  </span>
                  <h2
                    id="counsellor"
                    className="mt-2.5 scroll-mt-24 text-xl font-black tracking-tight text-navy sm:text-2xl"
                  >
                    Your counsellor details
                  </h2>
                </div>

                <div className="w-full">
                  <CounsellorCard />
                </div>
              </div>

              {/* Anchors the base of the column when the form is the taller one. */}
              <SectionGeometry
                shape="blob"
                size={200}
                className="-bottom-16 -right-10 text-navy-50"
              />
            </div>
          </StaggerItem>

          {/* --- 2. Application form (Right Column) --- */}
          <StaggerItem className="flex flex-col">
            <ApplicationForm />
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}