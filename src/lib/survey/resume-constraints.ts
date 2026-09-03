/**
 * Shared between the client (fast feedback) and /api/survey/upload-url
 * (the actual pre-check). Neither is the real enforcement, though — that's
 * the bucket's own file_size_limit/allowed_mime_types
 * (supabase/spam-protection-schema.sql), which Supabase applies to the
 * upload regardless of what either of these claim.
 */
export const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
