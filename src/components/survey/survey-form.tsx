"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { surveySchema, type SurveyFormData } from "@/lib/survey/schema";
import {
  showClearanceDetail,
  showEntryAddOn,
  showPrincipalAddOn,
} from "@/lib/survey/branching";
import { toSurveyResponseRow } from "@/lib/survey/payload";
import { supabase } from "@/lib/supabase/client";
import { TRACKS, type Track } from "@/lib/track";
import {
  emptyToUndefined,
  FieldShell,
  selectInputClass,
  textAreaClass,
  textInputClass,
} from "./fields";
import * as opt from "@/lib/survey/options";

const STEP_LABELS = [
  "Contact & Basics",
  "Clearance & Eligibility",
  "Professional Background",
  "Motivation & Fit",
  "Work Style & Logistics",
  "Additional Details",
  "Consent & Next Steps",
] as const;

const STEP_FIELDS: Path<SurveyFormData>[][] = [
  ["C1", "C2", "C3", "C4", "C6"],
  ["CL1", "CL2", "CL3", "CL4", "CL5", "CL6", "CL7"],
  ["P1", "P2", "P3", "P4", "P4Other", "P5"],
  ["M1", "M2", "M3"],
  ["W1", "W2", "W3", "W4", "W5"],
  ["E1", "E2", "E3", "PR1", "PR2", "PR3"],
  ["CN1", "CN2"],
];

export function SurveyForm({ track }: { track: Track }) {
  const trackConfig = TRACKS[track];
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    mode: "onBlur",
    // react-hook-form defaults an untouched checkbox-group field to `false`
    // rather than an array until a box is checked; without an explicit
    // array default here, zod's array validation fails with a type
    // mismatch instead of the intended required/optional message.
    defaultValues: { P4: [], M2: [] },
  });

  const cl2 = watch("CL2");
  const p3 = watch("P3");
  const p4Raw = watch("P4");
  const p4 = Array.isArray(p4Raw) ? p4Raw : [];
  const clearanceDetailShown = showClearanceDetail(cl2);
  const entryShown = showEntryAddOn(p3);
  const principalShown = showPrincipalAddOn(p3);
  const addOnStepHasContent = entryShown || principalShown;

  async function goNext() {
    if (step === 0 && !resumeFile) {
      setResumeError("Resume upload is required");
      return;
    }
    setResumeError(null);

    const fieldsToValidate = STEP_FIELDS[step].filter((field) => {
      if (step === 1 && !clearanceDetailShown) {
        return !["CL3", "CL4", "CL5", "CL6", "CL7"].includes(field);
      }
      return true;
    });
    const valid = await trigger(fieldsToValidate);
    if (!valid) return;

    // R1: CL3 is required only when clearance detail is shown. This can't
    // live in the zod schema as a superRefine, since superRefine only runs
    // once the *whole* form validates — which never happens mid-wizard.
    if (step === 1 && clearanceDetailShown) {
      if (!watch("CL3")) {
        setError("CL3", { type: "manual", message: "Clearance level is required" });
        return;
      }
      clearErrors("CL3");
    }

    let nextStep = step + 1;
    if (nextStep === 5 && !addOnStepHasContent) {
      nextStep = 6; // R4: Mid/Senior skip the add-on step entirely
    }
    setStep(nextStep);
  }

  function goBack() {
    let prevStep = step - 1;
    if (prevStep === 5 && !addOnStepHasContent) {
      prevStep = 4;
    }
    setStep(Math.max(prevStep, 0));
  }

  async function onSubmit(data: SurveyFormData) {
    if (!resumeFile) {
      setResumeError("Resume upload is required");
      setStep(0);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const resumePath = `${crypto.randomUUID()}-${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from(trackConfig.bucketName)
        .upload(resumePath, resumeFile);
      if (uploadError) throw uploadError;

      const row = toSurveyResponseRow(data, resumePath);
      const { error: insertError } = await supabase
        .from(trackConfig.tableName)
        .insert(row);
      if (insertError) throw insertError;

      router.push(trackConfig.thankYouHref);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong submitting your profile. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl px-6 py-16">
      <ol className="mb-8 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-black/40">
        {STEP_LABELS.map((label, i) => (
          <li
            key={label}
            className={i === step ? "text-mcbride-blue" : undefined}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-prussian-blue">Contact & Basics</h2>
          <FieldShell label="Full name" required error={errors.C1}>
            <input className={textInputClass} {...register("C1")} />
          </FieldShell>
          <FieldShell label="Email address" required error={errors.C2}>
            <input type="email" className={textInputClass} {...register("C2")} />
          </FieldShell>
          <FieldShell label="Phone number" required error={errors.C3}>
            <input className={textInputClass} {...register("C3")} />
          </FieldShell>
          <FieldShell label="Current location (city, state/country)" required error={errors.C4}>
            <input className={textInputClass} {...register("C4")} />
          </FieldShell>
          <label className="block">
            <span className="text-sm font-semibold text-independence">
              Resume upload <span className="text-marigold">*</span>
            </span>
            <span className="mt-1 block text-xs text-black/50">PDF or DOC</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="mt-1.5 block w-full text-sm"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
            {resumeError && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                {resumeError}
              </span>
            )}
          </label>
          <FieldShell label="LinkedIn profile URL" error={errors.C6}>
            <input className={textInputClass} {...register("C6")} />
          </FieldShell>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-prussian-blue">Clearance & Eligibility</h2>
          <FieldShell label="U.S. citizenship status" required error={errors.CL1}>
            <select className={selectInputClass} defaultValue="" {...register("CL1")}>
              <option value="" disabled>Select one</option>
              {opt.citizenshipOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell
            label="Do you currently hold an active U.S. Government security clearance?"
            required
            error={errors.CL2}
          >
            <select className={selectInputClass} defaultValue="" {...register("CL2")}>
              <option value="" disabled>Select one</option>
              {opt.clearanceStatusOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>

          {clearanceDetailShown && (
            <>
              <FieldShell label="Clearance level" required error={errors.CL3}>
                <select
                  className={selectInputClass}
                  defaultValue=""
                  {...register("CL3", { setValueAs: emptyToUndefined })}
                >
                  <option value="" disabled>Select one</option>
                  {opt.clearanceLevelOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell
                label="Investigation tier/type (if known)"
                hint="Many candidates won't know this — leave blank if unsure"
                error={errors.CL4}
              >
                <select
                  className={selectInputClass}
                  defaultValue=""
                  {...register("CL4", { setValueAs: emptyToUndefined })}
                >
                  <option value="">Not sure / prefer not to say</option>
                  {opt.investigationTierOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Approximate clearance granted/last adjudicated date" error={errors.CL5}>
                <input type="month" className={textInputClass} {...register("CL5")} />
              </FieldShell>
              <FieldShell label="Polygraph status" error={errors.CL6}>
                <select
                  className={selectInputClass}
                  defaultValue=""
                  {...register("CL6", { setValueAs: emptyToUndefined })}
                >
                  <option value="">Select one</option>
                  {opt.polygraphOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Adjudicating agency / sponsor (if known)" error={errors.CL7}>
                <input className={textInputClass} {...register("CL7")} />
              </FieldShell>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-prussian-blue">Professional Background</h2>
          <FieldShell label="Primary functional domain" required error={errors.P1}>
            <select className={selectInputClass} defaultValue="" {...register("P1")}>
              <option value="" disabled>Select one</option>
              {opt.domainOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Years of relevant cleared/defense experience" required error={errors.P2}>
            <select className={selectInputClass} defaultValue="" {...register("P2")}>
              <option value="" disabled>Select one</option>
              {opt.yearsExperienceOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Experience / seniority self-identification" required error={errors.P3}>
            <select className={selectInputClass} defaultValue="" {...register("P3")}>
              <option value="" disabled>Select one</option>
              {opt.experienceBandOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>

          <fieldset>
            <legend className="text-sm font-semibold text-independence">
              Relevant certifications
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {opt.certificationOptions.map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm text-black/80">
                  <input type="checkbox" value={o} {...register("P4")} />
                  {o}
                </label>
              ))}
            </div>
            {p4.includes("Other (specify)") && (
              <input
                className={`${textInputClass} mt-2`}
                placeholder="Please specify"
                {...register("P4Other")}
              />
            )}
          </fieldset>

          <FieldShell label="Programs / platforms worked on" error={errors.P5}>
            <textarea className={textAreaClass} {...register("P5")} />
          </FieldShell>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-prussian-blue">Motivation & Fit</h2>
          <FieldShell
            label="Why does this kind of mission-driven work matter to you?"
            required
            error={errors.M1}
          >
            <textarea className={textAreaClass} {...register("M1")} />
          </FieldShell>

          <fieldset>
            <legend className="text-sm font-semibold text-independence">
              What matters most in your next role? (choose up to 3){" "}
              <span className="text-marigold">*</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {opt.priorityOptions.map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm text-black/80">
                  <input type="checkbox" value={o} {...register("M2")} />
                  {o}
                </label>
              ))}
            </div>
            {errors.M2 && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                {errors.M2.message}
              </span>
            )}
          </fieldset>

          <FieldShell label="Current job-search status" required error={errors.M3}>
            <select className={selectInputClass} defaultValue="" {...register("M3")}>
              <option value="" disabled>Select one</option>
              {opt.jobSearchStatusOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-prussian-blue">Work Style & Logistics</h2>
          <FieldShell label="Preferred work location model" required error={errors.W1}>
            <select className={selectInputClass} defaultValue="" {...register("W1")}>
              <option value="" disabled>Select one</option>
              {opt.locationModelOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Willingness to relocate" required error={errors.W2}>
            <select className={selectInputClass} defaultValue="" {...register("W2")}>
              <option value="" disabled>Select one</option>
              {opt.relocateOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell
            label="Willingness to work OCONUS (incl. NATO postings in Europe)"
            required
            error={errors.W3}
          >
            <select className={selectInputClass} defaultValue="" {...register("W3")}>
              <option value="" disabled>Select one</option>
              {opt.oconusOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Earliest start availability / notice period" required error={errors.W4}>
            <select className={selectInputClass} defaultValue="" {...register("W4")}>
              <option value="" disabled>Select one</option>
              {opt.availabilityOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Compensation expectations" error={errors.W5}>
            <input className={textInputClass} {...register("W5")} />
          </FieldShell>
        </div>
      )}

      {step === 5 && entryShown && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-prussian-blue">Entry-Level Add-On</h2>
          <FieldShell label="Are you seeking sponsorship for a first-time security clearance?" error={errors.E1}>
            <select
              className={selectInputClass}
              defaultValue=""
              {...register("E1", { setValueAs: emptyToUndefined })}
            >
              <option value="">Select one</option>
              {opt.sponsorshipInterestOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Relevant internships, training, or coursework" error={errors.E2}>
            <textarea className={textAreaClass} {...register("E2")} />
          </FieldShell>
          <FieldShell label="Interested in a mentorship-track role?" error={errors.E3}>
            <select
              className={selectInputClass}
              defaultValue=""
              {...register("E3", { setValueAs: emptyToUndefined })}
            >
              <option value="">Select one</option>
              {opt.yesNoOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
        </div>
      )}

      {step === 5 && principalShown && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-prussian-blue">Principal-Level Add-On</h2>
          <FieldShell label="Largest team or program you've led (size / budget)" error={errors.PR1}>
            <input className={textInputClass} {...register("PR1")} />
          </FieldShell>
          <FieldShell label="Willingness to support business development / proposal efforts" error={errors.PR2}>
            <select
              className={selectInputClass}
              defaultValue=""
              {...register("PR2", { setValueAs: emptyToUndefined })}
            >
              <option value="">Select one</option>
              {opt.bdWillingnessOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Areas of technical/domain authority" error={errors.PR3}>
            <textarea className={textAreaClass} {...register("PR3")} />
          </FieldShell>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-prussian-blue">Consent & Next Steps</h2>
          <label className="flex gap-3 rounded-md border border-black/10 bg-black/[.03] p-4 text-sm text-black/80">
            <input type="checkbox" className="mt-1" {...register("CN1")} />
            <span>{opt.CN1_TEXT}</span>
          </label>
          {errors.CN1 && (
            <span className="block text-xs font-medium text-red-600">
              {errors.CN1.message}
            </span>
          )}
          <FieldShell label="Preferred contact method" required error={errors.CN2}>
            <select className={selectInputClass} defaultValue="" {...register("CN2")}>
              <option value="" disabled>Select one</option>
              {opt.contactMethodOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FieldShell>
        </div>
      )}

      {submitError && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-md px-5 py-2.5 text-sm font-bold text-independence disabled:opacity-0"
        >
          Back
        </button>
        {step < STEP_LABELS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-md bg-mcbride-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-prussian-blue"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-marigold px-6 py-2.5 text-sm font-bold text-prussian-blue hover:bg-android-green disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit My Profile"}
          </button>
        )}
      </div>
    </form>
  );
}
