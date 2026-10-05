"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setToken } from "@/lib/admin-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4005";

type Step = "credentials" | "otp";

/** Two-step developer sign-in: password, then OTP. */
export function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challenge, setChallenge] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onCredentials = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setError(payload?.message ?? "Sign-in failed.");
        return;
      }

      setChallenge(payload.challenge);
      setEmail(payload.email);
      setStep("otp");
    } catch {
      setError("Could not reach the API. Is the server running?");
    } finally {
      setBusy(false);
    }
  };

  const onOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, challenge }),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setError(payload?.message ?? "Incorrect OTP.");
        return;
      }

      setToken(payload.token);
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the API. Is the server running?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white p-8 shadow-xl sm:p-10">
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-2xl bg-ember-gradient text-white"
      >
        <ShieldCheck className="size-6" />
      </span>

      <h1 className="mt-5 text-2xl font-black text-navy">
        {step === "credentials" ? "Developer sign-in" : "Enter OTP"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {step === "credentials"
          ? "Admissions data is restricted to authorised developers."
          : `Sent to ${email}. Use the developer OTP to continue.`}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      {step === "credentials" ? (
        <form onSubmit={onCredentials} className="mt-7 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ncetmail.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full bg-ember-gradient text-white hover:opacity-90"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={onOtp} className="mt-7 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="otp">Developer OTP</Label>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="text-center text-lg tracking-[0.5em]"
            />
          </div>

          <Button
            type="submit"
            disabled={busy || otp.length !== 6}
            className="h-11 w-full bg-ember-gradient text-white hover:opacity-90"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              setOtp("");
              setError("");
            }}
            className="w-full text-center text-sm font-medium text-muted-foreground hover:text-navy"
          >
            Use a different account
          </button>
        </form>
      )}
    </div>
  );
}
