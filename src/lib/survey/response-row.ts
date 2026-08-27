export const statusOptions = ["New", "Contacted", "Matched", "Not a fit"] as const;
export type SubmissionStatus = (typeof statusOptions)[number];

/** Shape of a row read back from `<track>_survey_responses`, mirrors payload.ts's write shape plus DB-assigned fields. */
export interface SurveyResponseRow {
  id: string;
  submitted_at: string;
  status: SubmissionStatus;

  c1_full_name: string;
  c2_email: string;
  c3_phone: string;
  c4_location: string;
  c6_linkedin_url: string | null;
  resume_path: string;

  cl1_citizenship: string;
  cl2_clearance_status: string;
  cl3_clearance_level: string | null;
  cl4_investigation_tier: string | null;
  cl5_clearance_date: string | null;
  cl6_polygraph_status: string | null;
  cl7_clearance_sponsor: string | null;

  p1_domain: string;
  p2_years_experience: string;
  p3_experience_band: string;
  p4_certifications: string[];
  p4_certifications_other: string | null;
  p5_programs_platforms: string | null;

  m1_why_this_work: string;
  m2_priorities: string[];
  m3_job_search_status: string;

  w1_location_model: string;
  w2_relocate: string;
  w3_oconus: string;
  w4_availability: string;
  w5_compensation: string | null;

  e1_sponsorship_interest: string | null;
  e2_training_background: string | null;
  e3_mentorship_interest: string | null;

  pr1_leadership_scope: string | null;
  pr2_bd_willingness: string | null;
  pr3_technical_authority: string | null;

  cn2_contact_preference: string;
  consent_given_at: string;
  consent_text_version: string;
}

export type SubmissionListItem = Pick<
  SurveyResponseRow,
  | "id"
  | "submitted_at"
  | "status"
  | "c1_full_name"
  | "c2_email"
  | "p1_domain"
  | "p3_experience_band"
  | "cl2_clearance_status"
>;
