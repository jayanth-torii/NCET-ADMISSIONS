import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";

import "./globals.css";

// NCET (ncet.co.in) declares `font-family: Product Sans, sans-serif`. It is not
// in next/font/google's bundle, so the latin woff2 subsets are self-hosted from
// Google Fonts (see README for the licence note).
//
// Product Sans ships 400/500/700 only. The design calls for font-extrabold and
// font-black, so 600/800/900 all point at the real 700 outlines — the browser
// would otherwise synthesise a faux-bold from the 500 face.
const productSans = localFont({
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
  src: [
    { path: "./fonts/ProductSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ProductSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ProductSans-700.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ProductSans-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/ProductSans-700.woff2", weight: "800", style: "normal" },
    { path: "./fonts/ProductSans-700.woff2", weight: "900", style: "normal" },
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ncet.co.in"),
  title: {
    default: "NGI Admissions 2026–27 | Nagarjuna Group of Institutions",
    template: "%s | NGI Admissions",
  },
  description:
    "Apply for admission 2026–27 to the Nagarjuna Group of Institutions — NAAC A+ accredited, autonomous, and consistently placed across Bengaluru. Talk to a regional admissions counsellor.",
  keywords: [
    "NGI admissions",
    "Nagarjuna Group of Institutions",
    "NCET admissions",
    "engineering admissions Karnataka",
    "BCA admission",
    "KCET counselling",
  ],
  openGraph: {
    title: "NGI Admissions 2026–27",
    description:
      "One application to the Nagarjuna Group of Institutions. NAAC A+ accredited, autonomous, placement-focused.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${productSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
