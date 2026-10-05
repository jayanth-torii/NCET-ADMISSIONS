"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

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
      <Label htmlFor={id}>
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
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
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
    // Clear the field error as soon as the user starts correcting it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus("idle");
      // Move focus to the first invalid field for keyboard/screen-reader users.
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
        // Map server field errors onto the form where we can.
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
      <div
        role="status"
        className="flex flex-col items-center rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center"
      >
        <CheckCircle2 className="size-14 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-extrabold text-navy">Application received</h3>
        <p className="mt-2 max-w-sm text-sm text-navy-700/80">
          Thank you. Our regional admission counsellor will call you within one working day.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setStatus("idle")}>
          Submit another application
        </Button>
      </div>
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
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-navy-100 bg-white p-6 shadow-xl sm:p-10">
      <div className="flex items-start gap-3">
        <Send className="mt-1 size-5 shrink-0 text-ember" aria-hidden="true" />
        <div>
          <h3 className="text-xl font-extrabold text-navy">Admission enquiry — 2026</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Takes about two minutes. Our counsellor will call you back.
          </p>
        </div>
      </div>

      {status === "error" && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
        >
          {serverMessage}
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field id="studentName" label="Student name" error={errors.studentName}>
          <Input
            {...fieldProps("studentName")}
            onChange={(e) => set("studentName")(e.target.value)}
            placeholder="e.g. Anitha Sharma"
            autoComplete="name"
          />
        </Field>

        <Field id="studentMobile" label="Student mobile" error={errors.studentMobile}>
          <Input
            {...fieldProps("studentMobile")}
            onChange={(e) => set("studentMobile")(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit number"
            inputMode="numeric"
            autoComplete="tel"
          />
        </Field>

        <Field id="gender" label="Gender" error={errors.gender}>
          <Select value={values.gender} onValueChange={set("gender")}>
            <SelectTrigger
              id="gender"
              aria-invalid={errors.gender ? true : undefined}
              aria-describedby={errors.gender ? "gender-error" : undefined}
              className="w-full"
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

        <Field id="fatherName" label="Father / guardian name" error={errors.fatherName}>
          <Input
            {...fieldProps("fatherName")}
            onChange={(e) => set("fatherName")(e.target.value)}
            placeholder="e.g. Ramesh Sharma"
          />
        </Field>

        <Field id="fatherMobile" label="Father / guardian mobile" error={errors.fatherMobile}>
          <Input
            {...fieldProps("fatherMobile")}
            onChange={(e) => set("fatherMobile")(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit number"
            inputMode="numeric"
            autoComplete="tel"
          />
        </Field>

        <Field id="interCollegeName" label="Inter college name" error={errors.interCollegeName}>
          <Input
            {...fieldProps("interCollegeName")}
            onChange={(e) => set("interCollegeName")(e.target.value)}
            placeholder="e.g. Sri Chaitanya Junior College"
          />
        </Field>

        <Field id="interCollegePlace" label="Inter college place" error={errors.interCollegePlace}>
          <Input
            {...fieldProps("interCollegePlace")}
            onChange={(e) => set("interCollegePlace")(e.target.value)}
            placeholder="e.g. Kurnool"
          />
        </Field>

        <Field
          id="appNumber"
          label="Application number"
          error={errors.appNumber}
          hint="Your KCET, JEE Main or CET allotment number"
        >
          <Input
            {...fieldProps("appNumber")}
            onChange={(e) => set("appNumber")(e.target.value)}
            placeholder="e.g. 2026012345"
            className="uppercase"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field
            id="homeTownAddress"
            label="Home town address"
            error={errors.homeTownAddress}
          >
            <Textarea
              {...fieldProps("homeTownAddress")}
              onChange={(e) => set("homeTownAddress")(e.target.value)}
              placeholder="House / street, area, town, district, state, PIN"
              rows={3}
            />
          </Field>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="mt-8 h-12 w-full bg-ember-gradient text-base text-white hover:opacity-90"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            Submit application
          </>
        )}
      </Button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By submitting you agree to be contacted by the Nagarjuna Group admissions team.
      </p>
    </form>
  );
}
