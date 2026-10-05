import { Counter } from "@/components/animated/counter";
import { BlurFade } from "@/components/animated/spotlight-card";
import { stats } from "@/data/site";

export function StatsStrip() {
  return (
    <section aria-label="Group highlights" className="border-b border-navy-100 bg-white">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-navy-100 px-4 sm:px-6 lg:grid-cols-4 lg:divide-x lg:px-8">
        {stats.map((stat, i) => (
          <BlurFade
            key={stat.label}
            delay={i * 90}
            className="px-2 py-8 text-center sm:py-10 lg:px-6"
          >
            <dd className="text-3xl font-black tracking-tight text-navy sm:text-4xl">
              <Counter value={stat.value} suffix={stat.suffix} />
            </dd>
            <dt className="mt-1.5 text-sm font-semibold text-navy-700">{stat.label}</dt>
            {stat.hint && (
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</p>
            )}
          </BlurFade>
        ))}
      </dl>
    </section>
  );
}
