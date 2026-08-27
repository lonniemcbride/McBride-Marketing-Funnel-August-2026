import { z } from "zod";

/** The 5 "Universal — include for every req" questions from the Role Supplement Template sheet. */
export const directExperienceOptions = ["Extensive", "Some", "None"] as const;
export const confidenceRatingOptions = ["1", "2", "3", "4", "5"] as const;
export const yesNoOptions = ["Yes", "No"] as const;
export const dutyLocationWorkableOptions = ["Yes", "No", "Need to discuss"] as const;

export const supplementAnswersSchema = z.object({
  direct_experience: z.enum(directExperienceOptions),
  confidence_rating: z.enum(confidenceRatingOptions),
  available_by_need_date: z.enum(yesNoOptions),
  duty_location_workable: z.enum(dutyLocationWorkableOptions),
  notes_for_recruiter: z.string().optional(),
});

export type SupplementAnswers = z.infer<typeof supplementAnswersSchema>;
