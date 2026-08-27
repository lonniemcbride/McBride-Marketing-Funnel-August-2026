export interface SupplementResponseRow {
  id: string;
  survey_response_id: string;
  req_id: string;
  created_at: string;
  submitted_at: string | null;
  direct_experience: string | null;
  confidence_rating: string | null;
  available_by_need_date: string | null;
  duty_location_workable: string | null;
  notes_for_recruiter: string | null;
}
