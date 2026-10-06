"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  LogOut,
  Phone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminFetch, clearToken, getToken } from "@/lib/admin-store";

type Application = {
  _id: string;
  studentName: string;
  studentMobile: string;
  studentWhatsApp: string;
  gender: string;
  interestedCourse: string;
  fatherName: string;
  fatherMobile: string;
  interCollegeName: string;
  interCollegePlace: string;
  appNumber: string;
  homeTownAddress: string;
  status: string;
  createdAt: string;
};

type Stats = {
  total: number;
  inRange: number;
  statusCounts: Record<string, number>;
  recent: number;
};

const STATUSES = ["new", "contacted", "shortlisted", "enrolled", "closed"];

const STATUS_STYLE: Record<string, string> = {
  new: "bg-ember/15 text-ember-700",
  contacted: "bg-navy-50 text-navy",
  shortlisted: "bg-sky-100 text-sky-800",
  enrolled: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function Dashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Application[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  // Starts true so the first paint shows the loading row; afterwards it is set
  // from event handlers (filters, refresh), never synchronously inside an effect.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  /** Bumping this re-runs the fetch effect; used by the Refresh button. */
  const [reloadKey, setReloadKey] = useState(0);

  const signOut = useCallback(() => {
    clearToken();
    router.push("/admin");
  }, [router]);

  // Validate the stored token once on mount; bounce if it is not good.
  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin");
      return;
    }
    adminFetch<{ user: { email: string } }>("/api/admin/me")
      .catch(() => router.replace("/admin"));
  }, [router]);

  // The fetch lives directly in the effect (with abort cleanup) rather than in a
  // callback invoked from it, so no state is set synchronously on mount.
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        // Built with URLSearchParams so the "all" case still gets a leading
        // "?" instead of producing "…/applications&limit=200".
        const params = new URLSearchParams({ limit: "200" });
        if (status !== "all") params.set("status", status);
        const query = `?${params.toString()}`;
        const [s, list] = await Promise.all([
          adminFetch<{ stats: Stats }>("/api/admin/stats", { signal: controller.signal }),
          adminFetch<{ applications: Application[] }>(
            `/api/admin/applications${query}`,
            { signal: controller.signal }
          ),
        ]);
        if (cancelled) return;
        setStats(s.stats);
        setRows(list.applications);
        setError("");
      } catch (err) {
        if (cancelled || (err as Error)?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Could not load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [status, reloadKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.studentName, r.appNumber, r.studentMobile, r.studentWhatsApp, r.interestedCourse, r.interCollegeName, r.interCollegePlace]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const move = async (id: string, next: string) => {
    setNotice("");
    try {
      await adminFetch(`/api/admin/applications/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setNotice(`Moved to ${next}`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  /** Filter changes and refreshes are user actions, so they may set loading. */
  const changeStatus = (next: string) => {
    setLoading(true);
    setStatus(next);
  };

  const refresh = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const exportCsv = () => {
    const headers = [
      "Student Name", "Student Mobile", "Student WhatsApp", "Gender", "Interested Course", "Father", "Father Mobile",
      "Inter College", "Place", "App Number", "Home Town", "Status", "Submitted",
    ];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        [
          r.studentName, r.studentMobile, r.studentWhatsApp, r.gender, r.interestedCourse, r.fatherName, r.fatherMobile,
          r.interCollegeName, r.interCollegePlace, r.appNumber, r.homeTownAddress,
          r.status, new Date(r.createdAt).toISOString(),
        ].map(escape).join(",")
      ),
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ngi-admissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-svh bg-navy-50/50">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-ember-600 uppercase">
              Developer
            </p>
            <h1 className="text-xl font-black text-navy">Admissions dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={signOut} className="bg-navy text-white hover:bg-navy-800">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <p role="alert" className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {notice}
          </p>
        )}

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-navy-100">
            <CardContent className="p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Total applications
              </p>
              <p className="mt-2 text-3xl font-black text-navy">{stats?.total ?? "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-navy-100">
            <CardContent className="p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Last 7 days
              </p>
              <p className="mt-2 text-3xl font-black text-navy">{stats?.inRange ?? "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-navy-100">
            <CardContent className="p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Contacted
              </p>
              <p className="mt-2 text-3xl font-black text-navy">
                {stats ? stats.statusCounts.contacted : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-navy-100">
            <CardContent className="p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Enrolled
              </p>
              <p className="mt-2 text-3xl font-black text-navy">
                {stats ? stats.statusCounts.enrolled : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, application number, phone or college"
              className="pl-9"
              aria-label="Search applications"
            />
          </div>
          <Select value={status} onValueChange={(v) => v && changeStatus(v)}>
            <SelectTrigger className="sm:w-56" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <caption className="sr-only">Admission applications</caption>
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50/60">
                {["Student", "Course", "Contact", "Inter college", "App no.", "Home town", "Status", "Received"].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-xs font-bold tracking-wide text-navy uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    {loading ? "Loading…" : "No applications match this filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="border-b border-navy-50 last:border-0 hover:bg-navy-50/40">
                    <td className="px-4 py-3">
                      <p className="font-bold text-navy">{r.studentName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.gender}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy">{r.interestedCourse}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`tel:+91${r.studentMobile}`}
                        className="flex items-center gap-1.5 font-semibold text-ember-600 hover:underline"
                      >
                        <Phone className="size-3.5" aria-hidden="true" />
                        {r.studentMobile}
                      </a>
                      <a
                        href={`https://wa.me/91${r.studentWhatsApp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-700 hover:underline"
                      >
                        WhatsApp · {r.studentWhatsApp}
                      </a>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.fatherName} · {r.fatherMobile}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-navy">{r.interCollegeName}</p>
                      <p className="text-xs text-muted-foreground">{r.interCollegePlace}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.appNumber}</td>
                    <td className="max-w-56 px-4 py-3 text-xs text-muted-foreground">
                      {r.homeTownAddress}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`capitalize ${STATUS_STYLE[r.status] ?? "bg-navy-50 text-navy"}`}
                      >
                        {r.status}
                      </Badge>
                      <Select
                        value={r.status}
                        onValueChange={(next) => next && move(r._id, next)}
                      >
                        <SelectTrigger
                          className="mt-1.5 h-7 w-full text-xs"
                          aria-label={`Change status for ${r.studentName}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                      {when(r.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" aria-hidden="true" />
          {filtered.length} record{filtered.length === 1 ? "" : "s"} shown · applicant data is
          confidential
        </p>
      </main>
    </div>
  );
}
