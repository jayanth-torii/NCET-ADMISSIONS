import { AccreditationMarquee } from "@/components/accreditation-marquee";
import { ApplySection } from "@/components/apply-section";
import { CampusSection } from "@/components/campus-section";
import { FaqSection } from "@/components/faq-section";
import { Hero } from "@/components/hero";
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
        {/* Counsellor details and the application form sit above, so a
            visitor learns who will call them before browsing programmes. */}
        <ApplySection />
        <ProgrammesSection />
        <CampusSection />
        <ProcessSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
