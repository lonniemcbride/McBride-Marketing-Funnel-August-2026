import { z } from "zod";
import {
  availabilityOptions,
  bdWillingnessOptions,
  certificationOptions,
  citizenshipOptions,
  clearanceLevelOptions,
  clearanceStatusOptions,
  contactMethodOptions,
  domainOptions,
  experienceBandOptions,
  investigationTierOptions,
  jobSearchStatusOptions,
  locationModelOptions,
  oconusOptions,
  polygraphOptions,
  priorityOptions,
  relocateOptions,
  sponsorshipInterestOptions,
  yearsExperienceOptions,
  yesNoOptions,
} from "./options";

/**
 * Field IDs mirror the Q ID column in the Core Survey build spec exactly,
 * so answers can be cross-checked against that sheet at a glance.
 */
export type ExperienceBand = (typeof experienceBandOptions)[number];

/**
 * R1's "CL3 required only when CL2 != None" lives in the survey form's
 * goNext() step logic (via setError/clearErrors), not here as a
 * superRefine: zod only runs superRefine after the *entire* object
 * validates, which never happens mid-wizard while later steps are still
 * unfilled — so a cross-field superRefine here would silently never fire
 * until final submit.
 */
export const surveySchema = z
  .object({
    // Contact & Basics
    C1: z.string().min(1, "Full name is required"),
    C2: z.string().email("Enter a valid email address"),
    C3: z.string().min(1, "Phone number is required"),
    C4: z.string().min(1, "Location is required"),
    // C5 (resume) is handled as a separate File, not part of the zod object.
    C6: z.string().optional(),

    // Clearance & Eligibility
    CL1: z.enum(citizenshipOptions),
    CL2: z.enum(clearanceStatusOptions),
    CL3: z.enum(clearanceLevelOptions).optional(),
    CL4: z.enum(investigationTierOptions).optional(),
    CL5: z.string().optional(), // Month/Year
    CL6: z.enum(polygraphOptions).optional(),
    CL7: z.string().optional(),

    // Professional Background
    P1: z.enum(domainOptions),
    P2: z.enum(yearsExperienceOptions),
    P3: z.enum(experienceBandOptions),
    P4: z.array(z.enum(certificationOptions)).optional(),
    P4Other: z.string().optional(),
    P5: z.string().optional(),

    // Motivation & Fit
    M1: z.string().min(1, "Tell us why this work matters to you"),
    M2: z
      .array(z.enum(priorityOptions))
      .max(3, "Choose up to 3")
      .min(1, "Choose at least 1"),
    M3: z.enum(jobSearchStatusOptions),

    // Work Style & Logistics
    W1: z.enum(locationModelOptions),
    W2: z.enum(relocateOptions),
    W3: z.enum(oconusOptions),
    W4: z.enum(availabilityOptions),
    W5: z.string().optional(),

    // Entry-Level Add-On
    E1: z.enum(sponsorshipInterestOptions).optional(),
    E2: z.string().optional(),
    E3: z.enum(yesNoOptions).optional(),

    // Principal-Level Add-On
    PR1: z.string().optional(),
    PR2: z.enum(bdWillingnessOptions).optional(),
    PR3: z.string().optional(),

    // Consent & Next Steps
    CN1: z.literal(true, {
      message: "Consent is required before your profile can be submitted",
    }),
    CN2: z.enum(contactMethodOptions),
  });

export type SurveyFormData = z.infer<typeof surveySchema>;
