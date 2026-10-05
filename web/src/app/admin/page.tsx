import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Developer sign-in | NGI Admissions",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-navy px-4 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-navy-grid opacity-40"
      />
      <div className="relative">
        <LoginForm />
        <p className="mt-6 text-center text-xs text-navy-300">
          Developer tool · not for public use
        </p>
      </div>
    </main>
  );
}
