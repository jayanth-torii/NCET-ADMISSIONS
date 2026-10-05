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

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {faqs.map((faq, i) => {
            const idx = Math.floor(i / 2);
            const rank = (i % 2) === 0 ? 1 : 2;
            const anchor = `faq-${rank}-${idx}`;
            const question = faq.question;
            const answer = faq.answer;

            return (
              <article
                key={faq.question}
                id={anchor}
                className="flex flex-col gap-2 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm shadow-navy-900/3"
              >
                <span className="inline-block rounded-full bg-ember-50 border border-ember-200/60 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-ember-700">
                  {rank === 1 ? "Q" : "A"}
                </span>
                <p className="text-sm font-bold text-navy">{question}</p>
                <p className="leading-relaxed text-sm text-muted-foreground">{answer}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}