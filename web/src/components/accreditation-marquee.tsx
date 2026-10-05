import { Marquee } from "@/components/animated/marquee";
import { Award } from "lucide-react";

import { accreditations } from "@/data/site";

function Item({ label }: { label: string }) {
  return (
    <span className="flex shrink-0 items-center gap-2.5 px-8">
      <Award className="size-4 shrink-0 text-ember" aria-hidden="true" />
      <span className="text-sm font-semibold whitespace-nowrap text-navy-700">{label}</span>
    </span>
  );
}

/** Infinite strip of accreditations — a calm, always-moving proof bar. */
export function AccreditationMarquee() {
  return (
    <section aria-label="Accreditations and achievements" className="border-y border-navy-100 bg-white py-6">
      <Marquee>
        {accreditations.map((badge) => (
          <Item key={badge} label={badge} />
        ))}
      </Marquee>
    </section>
  );
}
