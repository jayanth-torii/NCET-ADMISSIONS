"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send, User, Phone, GraduationCap, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/fetcher";

type FormValues = {
  studentName: string;
  studentMobile: string;
  gender: string;
  fatherName: string;
  fatherMobile: string;
  interCollegeName: string;
  interCollegePlace: string;
  appNumber: string;
  homeTownAddress: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL: FormValues = {
  studentName: "",
  studentMobile: "",
  gender: "",
  fatherName: "",
  fatherMobile: "",
  interCollegeName: "",
  interCollegePlace: "",
  appNumber: "",
  homeTownAddress: "",
};

const MOBILE_RE = /^[6-9]\d{9}$/;

/** Client-side mirror of the API validation, so errors surface before a round-trip. */
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.studentName.trim().length < 2) errors.studentName = "Enter the student's full name";
  if (!MOBILE_RE.test(values.studentMobile.trim()))
    errors.studentMobile = "Enter a valid 10-digit mobile number";
  if (!values.gender) errors.gender = "Select gender";
  if (values.fatherName.trim().length < 2) errors.fatherName = "Enter father's / guardian's name";
  if (!MOBILE_RE.test(values.fatherMobile.trim()))
    errors.fatherMobile = "Enter a valid 10-digit mobile number";
  if (values.interCollegeName.trim().length < 2)
    errors.interCollegeName = "Enter your inter college / school name";
  if (values.interCollegePlace.trim().length < 2)
    errors.interCollegePlace = "Enter the town or city of your college";
  if (!values.appNumber.trim())
    errors.appNumber = "Enter your KCET / JEE / CET application number";
  if (values.homeTownAddress.trim().length < 5)
    errors.homeTownAddress = "Enter your home town address";

  return errors;
}

function SectionBadge({ number, title, icon: Icon }: { number: string; title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2.5 pb-2 mb-4 border-b border-navy-100/70">
      <span className="flex size-6 items-center justify-center rounded-full bg-ember/15 text-ember-700 text-xs font-black">
        {number}
      </span>
      <Icon className="size-4 text-navy-600" />
      <h4 className="text-xs font-black uppercase tracking-wider text-navy-800">
        {title}
      </h4>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-bold text-navy-800 flex items-center justify-between">
        <span>
          {label}
          <span aria-hidden="true" className="ml-0.5 text-ember-600 font-black">
            *
          </span>
        </span>
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[11px] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

export function ApplicationForm() {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string>("");

  const set = (key: keyof FormValues) => (value: string | null) => {
    setValues((prev) => ({ ...prev, [key]: value ?? "" }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus("idle");
      const firstKey = Object.keys(found)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          appNumber: values.appNumber.trim().toUpperCase(),
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        if (payload?.errors) {
          const mapped: FormErrors = {};
          for (const item of payload.errors as { field: string; message: string }[]) {
            if (item.field in INITIAL) mapped[item.field as keyof FormValues] = item.message;
          }
          setErrors(mapped);
        }
        setStatus("error");
        setServerMessage(payload?.message ?? "We could not submit the form. Please try again.");
        return;
      }

      setStatus("success");
      setValues(INITIAL);
    } catch {
      setStatus("error");
      setServerMessage(
        "We could not reach the admissions server. Please try again, or call the counsellor directly."
      );
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        role="status"
        className="relative overflow-hidden flex flex-col items-center rounded-3xl border border-emerald-200/80 bg-white p-10 sm:p-12 text-center shadow-xl"
      >
        <div className="pointer-events-none absolute -top-16 size-44 rounded-full bg-emerald-100 blur-2xl opacity-70" />
        <span className="flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="size-10" aria-hidden="true" />
        </span>
        <h3 className="mt-6 text-2xl font-black tracking-tight text-navy">
          Application Received Successfully!
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-600">
          Thank you for applying. Your dedicated regional admission counsellor will review your details and reach out within <strong>one working day</strong> to help with eligibility & seat confirmation.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full border-navy-200 px-6 py-2.5 font-bold text-navy hover:bg-navy-50"
            onClick={() => setStatus("idle")}
          >
            Submit Another Application
          </Button>
        </div>
      </motion.div>
    );
  }

  const fieldProps = (key: keyof FormValues) => ({
    id: key,
    name: key,
    value: values[key],
    required: true,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative flex flex-col justify-between h-full overflow-hidden rounded-3xl border border-navy-100/90 bg-white p-6 sm:p-8 shadow-xl shadow-navy-900/5 transition-all"
    >
      {/* Decorative subtle ambient top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-ember-gradient" />

      {/* Header section */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-navy-100/70">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-ember-50 border border-ember-200/60 px-2 py-0.5 text-[10px] font-black text-ember-700 uppercase tracking-wide">
              <Sparkles className="size-2.5 text-ember" />
              Direct Admission 2026
            </span>
          </div>
          <h3 className="mt-1.5 text-xl font-black tracking-tight text-navy sm:text-2xl">
            Admission Enquiry Form
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Complete the short form to connect directly with your regional counsellor.
          </p>
        </div>
        <div className="hidden sm:flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800 border border-navy-100">
          <ShieldCheck className="size-5 text-ember" />
        </div>
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-xs font-semibold text-destructive animate-in fade-in"
        >
          {serverMessage}
        </div>
      )}

      <div className="mt-5 space-y-4 flex-1">
        {/* Step 1: Student Information */}
        <div>
          <SectionBadge number="1" title="Student Details" icon={User} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="studentName" label="Student Full Name" error={errors.studentName}>
              <Input
                {...fieldProps("studentName")}
                onChange={(e) => set("studentName")(e.target.value)}
                placeholder="e.g. Anitha Sharma"
                autoComplete="name"
                className="h-9.5 rounded-xl bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
              />
            </Field>

            <Field id="studentMobile" label="Student Mobile Number" error={errors.studentMobile}>
              <Input
                {...fieldProps("studentMobile")}
                onChange={(e) => set("studentMobile")(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                autoComplete="tel"
                className="h-9.5 rounded-xl bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field id="gender" label="Gender" error={errors.gender}>
                <Select value={values.gender} onValueChange={set("gender")}>
                  <SelectTrigger
                    id="gender"
                    aria-invalid={errors.gender ? true : undefined}
                    aria-describedby={errors.gender ? "gender-error" : undefined}
                    className="w-full h-9.5 rounded-xl bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        </div>

        {/* Step 2: Parent / Guardian Details */}
        <div>
          <SectionBadge number="2" title="Parent / Guardian Details" icon={Phone} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="fatherName" label="Father / Guardian Name" error={errors.fatherName}>
              <Input
                {...fieldProps("fatherName")}
                onChange={(e) => set("fatherName")(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="h-9.5 rounded-xl bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
              />
            </Field>

            <Field id="fatherMobile" label="Father / Guardian Mobile" error={errors.fatherMobile}>
              <Input
                {...fieldProps("fatherMobile")}
                onChange={(e) => set("fatherMobile")(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                autoComplete="tel"
                className="h-9.5 rounded-xl bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
              />
            </Field>
          </div>
        </div>

        {/* Step 3: Academic & Location */}
        <div>
          <SectionBadge number="3" title="Academic Background & Address" icon={GraduationCap} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="interCollegeName" label="Inter College / School Name" error={errors.interCollegeName}>
              <Input
                {...fieldProps("interCollegeName")}
                onChange={(e) => set("interCollegeName")(e.target.value)}
                placeholder="e.g. Sri Chaitanya Junior College"
                className="h-9.5 rounded-xl bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
              />
            </Field>

            <Field id="interCollegePlace" label="College Town / City" error={errors.interCollegePlace}>
              <Input
                {...fieldProps("interCollegePlace")}
                onChange={(e) => set("interCollegePlace")(e.target.value)}
                placeholder="e.g. Kurnool"
                className="h-9.5 rounded-xl bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field
                id="appNumber"
                label="Entrance Exam / Allotment App No."
                error={errors.appNumber}
                hint="KCET, JEE Main, COMEDK, or CET hall ticket / application number"
              >
                <Input
                  {...fieldProps("appNumber")}
                  onChange={(e) => set("appNumber")(e.target.value)}
                  placeholder="e.g. 2026012345"
                  className="h-9.5 rounded-xl uppercase font-mono tracking-wider bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                id="homeTownAddress"
                label="Home Town Address"
                error={errors.homeTownAddress}
              >
                <Textarea
                  {...fieldProps("homeTownAddress")}
                  onChange={(e) => set("homeTownAddress")(e.target.value)}
                  placeholder="Door No., Street, Area, City/Town, District, State & PIN code"
                  rows={2}
                  className="rounded-xl bg-navy-50/40 border-navy-200/70 text-xs focus:bg-white focus:border-ember transition-colors"
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3">
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          className="h-11.5 w-full rounded-xl bg-ember-gradient text-sm font-black text-white shadow-lg shadow-ember/20 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-ember/30 active:scale-[0.99] cursor-pointer"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
              Submitting Application…
            </>
          ) : (
            <>
              <Send className="size-4 mr-2" aria-hidden="true" />
              Submit Admission Enquiry
            </>
          )}
        </Button>

        <div className="mt-2.5 flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
          <ShieldCheck className="size-3 text-emerald-600" />
          <span>Your contact details are encrypted and handled confidentially.</span>
        </div>
      </div>
    </form>
  );
}

