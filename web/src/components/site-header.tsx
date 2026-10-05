"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";

import { NgiLogo } from "@/components/ngi-logo";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#counsellor", label: "Counsellor" },
  { href: "#programmes", label: "Programmes" },
  { href: "#process", label: "Process" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer whenever the viewport grows past the md breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Over the hero the header sits on a dark navy surface, so its own colours
  // have to invert; once scrolled it sits on a light blurred bar.
  const onDark = !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-navy-100 bg-white/85 shadow-sm backdrop-blur-xl"
          : "border-white/10 bg-navy/40 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="#top" className="flex items-center gap-2.5">
          {/* The mark ships with an opaque white background, so only the
              wordmark needs to flip between the dark hero and the light bar. */}
          <NgiLogo invert={onDark} priority />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                onDark
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-navy-700 hover:bg-navy-50 hover:text-navy"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink
            href={`tel:${site.helpline.replace(/\s/g, "")}`}
            external
            variant="ghost"
            size="sm"
            className={cn(
              "hidden lg:inline-flex",
              onDark ? "text-white hover:bg-white/10 hover:text-white" : "text-navy"
            )}
          >
            <Phone className="size-4" aria-hidden="true" />
            {site.helpline}
          </ButtonLink>
          <ButtonLink
            href="#apply"
            size="sm"
            className={cn(
              "bg-ember-gradient text-white",
              "shadow-md shadow-ember/30 transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ember/45 hover:brightness-105",
              "active:translate-y-0 active:scale-[0.97] active:shadow-sm"
            )}
          >
            Apply Now
          </ButtonLink>
          <Button
            variant="ghost"
            size="icon"
            className={cn("md:hidden", onDark && "text-white hover:bg-white/10")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-navy-100 bg-white px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}