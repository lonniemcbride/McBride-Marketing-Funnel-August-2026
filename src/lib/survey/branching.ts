import type { SurveyFormData } from "./schema";

/** Branching Logic sheet, rules R1-R4 (R5/R6 fire post-Subscribe and are out of scope here). */

/** R1: no point asking clearance detail for someone with no clearance history. */
export function showClearanceDetail(cl2: SurveyFormData["CL2"] | undefined) {
  return cl2 !== undefined && cl2 !== "None";
}

/** R2/R3/R4: Entry and Principal each get a short add-on block; Mid/Senior get neither. */
export function showEntryAddOn(p3: SurveyFormData["P3"] | undefined) {
  return p3 === "Entry";
}

export function showPrincipalAddOn(p3: SurveyFormData["P3"] | undefined) {
  return p3 === "Principal";
}
