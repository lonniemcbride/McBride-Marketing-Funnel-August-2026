/** Single source of truth for select options, shared by the zod schema and the form UI. */

export const citizenshipOptions = ["U.S. Citizen", "Not a U.S. Citizen"] as const;

export const clearanceStatusOptions = [
  "Active",
  "Previously held, now inactive",
  "In process",
  "None",
] as const;

export const clearanceLevelOptions = [
  "Confidential",
  "Secret",
  "Top Secret",
  "TS/SCI",
  "Other",
  "Not sure",
] as const;

export const investigationTierOptions = ["T1", "T2", "T3", "T5", "Not sure"] as const;

export const polygraphOptions = [
  "None",
  "CI Polygraph",
  "Full-Scope Polygraph",
  "Not sure",
] as const;

export const domainOptions = [
  "Cybersecurity",
  "Systems Engineering",
  "Software Development",
  "Program & Project Management",
  "Intelligence Analysis",
  "Logistics & Supply Chain",
  "Test & Evaluation",
  "Modeling & Simulation",
  "Acquisition & Contracts",
  "Other",
] as const;

export const yearsExperienceOptions = ["0–2", "3–5", "6–10", "11–15", "16+"] as const;

export const experienceBandOptions = ["Entry", "Mid", "Senior", "Principal"] as const;

export const certificationOptions = [
  "Security+",
  "CISSP",
  "CISM",
  "PMP",
  "DAWIA I/II/III",
  "ITIL",
  "Six Sigma",
  "None",
  "Other (specify)",
] as const;

export const priorityOptions = [
  "Mission impact",
  "Technical challenge",
  "Team culture",
  "Compensation",
  "Stability & location",
  "Career growth",
  "Work-life balance",
] as const;

export const jobSearchStatusOptions = [
  "Actively searching",
  "Open to the right opportunity",
  "Not looking, just curious",
] as const;

export const locationModelOptions = ["Onsite", "Hybrid", "Remote"] as const;

export const relocateOptions = ["Yes", "No", "Depends on location"] as const;

export const oconusOptions = ["Yes", "No", "Depends"] as const;

export const availabilityOptions = [
  "Immediately",
  "2 weeks",
  "1 month",
  "2+ months",
] as const;

export const sponsorshipInterestOptions = ["Yes", "No", "Not sure"] as const;

export const yesNoOptions = ["Yes", "No"] as const;

export const bdWillingnessOptions = ["Yes", "No", "Depends"] as const;

export const contactMethodOptions = ["Email", "Phone", "Text"] as const;

export const CN1_TEXT =
  "I understand McBride may use this information to match me to opportunities and, if I'm a strong fit for a specific role, prepare a summary shared with the hiring organization. I will be able to review that summary before it is shared.";

/** Bump this if CN1_TEXT ever changes, so stored consent records stay tied to the exact wording accepted. */
export const CONSENT_TEXT_VERSION = "v1";
