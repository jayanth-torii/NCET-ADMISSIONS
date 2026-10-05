"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
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

/** One shared control style, so every field reads as part of the same form. */
const CONTROL =
  "h-11 rounded-xl border-navy-200 bg-white text-sm transition-colors focus:border-ember focus:ring-ember/20";

function Field({
  id,
  label,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-sm font-semibold text-navy-800">
        {label}
        <span aria-hidden="true" className="ml-0.5 text-ember-600">
          *
        </span>
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1"
        >
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
        className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-navy-100 bg-white p-10 text-center shadow-lg shadow-navy-900/5 sm:p-12"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-xl font-bold tracking-tight text-navy sm:text-2xl">
          Application received
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thank you for applying. Your counsellor will call within{" "}
          <strong className="font-semibold text-navy">one working day</strong>.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-xl border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy-50"
          onClick={() => setStatus("idle")}
        >
          Submit another application
        </Button>
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
      className="flex flex-col rounded-3xl border border-navy-100 bg-white p-6 shadow-lg shadow-navy-900/5 sm:p-7"
    >
      <div className="mb-6">
        <h3 className="text-base font-bold tracking-tight text-navy sm:text-lg">
          Admission enquiry
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Nine quick details and your counsellor will call you.
        </p>
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm font-medium text-destructive animate-in fade-in"
        >
          {serverMessage}
        </div>
      )}

      <div className="space-y-4">
        <Field id="studentName" label="Student full name" error={errors.studentName}>
          <Input
            {...fieldProps("studentName")}
            onChange={(e) => set("studentName")(e.target.value)}
            placeholder="e.g. Anitha Sharma"
            autoComplete="name"
            className={CONTROL}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="studentMobile" label="Student mobile" error={errors.studentMobile}>
            <Input
              {...fieldProps("studentMobile")}
              onChange={(e) =>
                set("studentMobile")(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="10-digit number"
              inputMode="numeric"
              autoComplete="tel"
              className={CONTROL}
            />
          </Field>

          <Field id="gender" label="Gender" error={errors.gender}>
            <Select value={values.gender} onValueChange={set("gender")}>
              <SelectTrigger
                id="gender"
                aria-invalid={errors.gender ? true : undefined}
                aria-describedby={errors.gender ? "gender-error" : undefined}
                className={`w-full ${CONTROL}`}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="fatherName" label="Father / guardian name" error={errors.fatherName}>
            <Input
              {...fieldProps("fatherName")}
              onChange={(e) => set("fatherName")(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              autoComplete="name"
              className={CONTROL}
            />
          </Field>

          <Field id="fatherMobile" label="Father / guardian mobile" error={errors.fatherMobile}>
            <Input
              {...fieldProps("fatherMobile")}
              onChange={(e) =>
                set("fatherMobile")(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="10-digit number"
              inputMode="numeric"
              autoComplete="tel"
              className={CONTROL}
            />
          </Field>
        </div>

        <div>
          <Field id="interCollegeName" label="Inter college / school" error={errors.interCollegeName}>
            <Input
              {...fieldProps("interCollegeName")}
              onChange={(e) => set("interCollegeName")(e.target.value)}
              placeholder="e.g. Sri Chaitanya Junior College"
              className={CONTROL}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="interCollegePlace" label="College town / city" error={errors.interCollegePlace}>
            <Input
              {...fieldProps("interCollegePlace")}
              onChange={(e) => set("interCollegePlace")(e.target.value)}
              placeholder="e.g. Kurnool"
              className={CONTROL}
            />
          </Field>

          <Field
            id="appNumber"
            label="Entrance exam / allotment number"
            error={errors.appNumber}
            hint="KCET, JEE Main, COMEDK or CET application number"
          >
            <Input
              {...fieldProps("appNumber")}
              onChange={(e) => set("appNumber")(e.target.value)}
              placeholder="e.g. 2026012345"
              className={`${CONTROL} font-mono uppercase tracking-wide`}
            />
          </Field>
        </div>

        <Field id="homeTownAddress" label="Home town address" error={errors.homeTownAddress}>
          <Textarea
            {...fieldProps("homeTownAddress")}
            onChange={(e) => set("homeTownAddress")(e.target.value)}
            placeholder="Door No., Street, Area, City, District, State & PIN"
            rows={3}
            className="rounded-xl border-navy-200 bg-white text-sm transition-colors focus:border-ember focus:ring-ember/20"
          />
        </Field>
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          className="h-11 w-full rounded-xl bg-ember-gradient text-sm font-bold text-white shadow-lg shadow-ember/20 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-ember/30 active:scale-[0.99] cursor-pointer"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" aria-hidden="true" />
              Submit enquiry
            </>
          )}
        </Button>
        <p className="mt-2.5 text-center text-xs text-muted-foreground">
          Your details stay confidential and are used only for this admission.
        </p>
      </div>
    </form>
  );
}
