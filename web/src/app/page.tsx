import { AccreditationMarquee } from "@/components/accreditation-marquee";
import { ApplySection } from "@/components/apply-section";
import { CampusSection } from "@/components/campus-section";
import { FaqSection } from "@/components/faq-section";
import { Hero } from "@/components/hero";
import { InstitutionsSection } from "@/components/institutions-section";
import { ProcessSection } from "@/components/process-section";
import { ProgrammesSection } from "@/components/programmes-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatsStrip } from "@/components/stats-strip";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <StatsStrip />
        <AccreditationMarquee />
        <InstitutionsSection />
        <ProgrammesSection />
        <CampusSection />
        <ProcessSection />
        {/* Counsellor details and the application form, in one section. */}
        <ApplySection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
