import type { Metadata } from "next";

import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Admissions dashboard | NGI Admissions",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <Dashboard />;
}
