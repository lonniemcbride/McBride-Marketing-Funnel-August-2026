import type { SurveyFormData } from "./schema";
import { CONSENT_TEXT_VERSION } from "./options";
import { showClearanceDetail, showEntryAddOn, showPrincipalAddOn } from "./branching";

/**
 * Maps form state to the survey_responses row shape. Fields that branching
 * rules would have skipped are nulled out here even if a value lingers in
 * form state (e.g. from a candidate going back and changing an earlier
 * answer), so what's stored always matches what was actually asked.
 */
export function toSurveyResponseRow(
  data: SurveyFormData,
  resumePath: string,
) {
  const clearanceDetailShown = showClearanceDetail(data.CL2);
  const entryShown = showEntryAddOn(data.P3);
  const principalShown = showPrincipalAddOn(data.P3);

  return {
    c1_full_name: data.C1,
    c2_email: data.C2,
    c3_phone: data.C3,
    c4_location: data.C4,
    c6_linkedin_url: data.C6 || null,
    resume_path: resumePath,

    cl1_citizenship: data.CL1,
    cl2_clearance_status: data.CL2,
    cl3_clearance_level: clearanceDetailShown ? data.CL3 ?? null : null,
    cl4_investigation_tier: clearanceDetailShown ? data.CL4 ?? null : null,
    cl5_clearance_date: clearanceDetailShown ? data.CL5 || null : null,
    cl6_polygraph_status: clearanceDetailShown ? data.CL6 ?? null : null,
    cl7_clearance_sponsor: clearanceDetailShown ? data.CL7 || null : null,

    p1_domain: data.P1,
    p2_years_experience: data.P2,
    p3_experience_band: data.P3,
    p4_certifications: data.P4 ?? [],
    p4_certifications_other: data.P4Other || null,
    p5_programs_platforms: data.P5 || null,

    m1_why_this_work: data.M1,
    m2_priorities: data.M2,
    m3_job_search_status: data.M3,

    w1_location_model: data.W1,
    w2_relocate: data.W2,
    w3_oconus: data.W3,
    w4_availability: data.W4,
    w5_compensation: data.W5 || null,

    e1_sponsorship_interest: entryShown ? data.E1 ?? null : null,
    e2_training_background: entryShown ? data.E2 || null : null,
    e3_mentorship_interest: entryShown ? data.E3 ?? null : null,

    pr1_leadership_scope: principalShown ? data.PR1 || null : null,
    pr2_bd_willingness: principalShown ? data.PR2 ?? null : null,
    pr3_technical_authority: principalShown ? data.PR3 || null : null,

    cn2_contact_preference: data.CN2,
    consent_given_at: new Date().toISOString(),
    consent_text_version: CONSENT_TEXT_VERSION,
  };
}
