import { supabaseAdmin } from "@/lib/supabase/admin";

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

async function checkRateLimit(purpose: string, track: string, ip: string, limit: number) {
  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    p_purpose: purpose,
    p_track: track,
    p_ip: ip,
    p_limit: limit,
    p_window: "1 hour",
  });

  // Fail open on an unexpected DB error rather than blocking every real
  // submission because rate limiting itself broke.
  if (error) return { success: true };
  return { success: data === true };
}

/** 5 submissions/hour, keyed per track so one track's traffic can't eat the other's quota. */
export function checkSurveySubmitLimit(track: string, ip: string) {
  return checkRateLimit("survey-submit", track, ip, 5);
}

/** Looser limit on minting upload URLs — a legitimate candidate may retry a failed upload. */
export function checkUploadUrlLimit(track: string, ip: string) {
  return checkRateLimit("upload-url", track, ip, 10);
}
