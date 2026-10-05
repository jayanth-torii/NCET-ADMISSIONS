import { SectionHeading } from "@/components/section-heading";
import { faqs } from "@/data/site";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-navy-50/50 py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="If your question is not here, call the regional desk and ask for the admissions counsellor."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {faqs.map((faq, i) => (
            // Every card is a self-contained question and answer, so numbering
            // them Q/A by position would mislabel half of them.
            <article
              key={faq.question}
              id={`faq-${i}`}
              className="flex flex-col gap-2 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm shadow-navy-900/3"
            >
              <p className="text-sm font-bold text-navy">{faq.question}</p>
              <p className="leading-relaxed text-sm text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}