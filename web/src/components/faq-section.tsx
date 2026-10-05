import { SectionGeometry } from "@/components/section-geometry";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/section-heading";
import { faqs } from "@/data/site";

export function FaqSection() {
  return (
    <section id="faq" className="relative overflow-hidden bg-navy-50/50 py-24 sm:py-32">
      <SectionGeometry shape="dotsDense" size={300} className="-right-6 top-10 text-navy-200" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="If your question is not here, call the regional desk and ask for the admissions counsellor."
        />

        {/* Base UI accordion: single-open is the default (multiple defaults to false). */}
        <Accordion className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold text-navy hover:underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
