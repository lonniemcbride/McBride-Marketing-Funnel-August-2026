import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TRACKS, type Track } from "@/lib/track";
import { surveySchema } from "@/lib/survey/schema";
import { toSurveyResponseRow } from "@/lib/survey/payload";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkSurveySubmitLimit, getClientIp } from "@/lib/rate-limit";

/**
 * The only write path for survey submissions — public insert policies on
 * the survey tables were dropped in supabase/spam-protection-schema.sql, so
 * this service-role-backed route (honeypot + Turnstile + rate limit + the
 * same zod schema the form itself uses) is the sole way a row gets created.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const track = body?.track as Track | undefined;

  if (track !== "nato" && track !== "air_force") {
    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  }

  // Honeypot: a real candidate never fills this hidden field. Respond as if
  // it succeeded so a bot doesn't learn it was caught, but skip the insert.
  if (typeof body?.honeypot === "string" && body.honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(request);
  const { success: withinLimit } = await checkSurveySubmitLimit(track, ip);
  if (!withinLimit) {
    return NextResponse.json({ error: "Too many submissions — please try again later" }, { status: 429 });
  }

  const turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
  const turnstileOk = await verifyTurnstileToken(turnstileToken, ip).catch(() => false);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Verification failed — please try again" }, { status: 403 });
  }

  const parsed = surveySchema.safeParse(body?.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const resumePath = typeof body?.resumePath === "string" ? body.resumePath : "";
  if (!resumePath) {
    return NextResponse.json({ error: "Missing resume upload" }, { status: 400 });
  }

  const config = TRACKS[track];
  const row = toSurveyResponseRow(parsed.data, resumePath);

  const { error: insertError } = await supabaseAdmin.from(config.tableName).insert(row);

  if (insertError) {
    Sentry.captureException(new Error(`Survey insert failed: ${insertError.message}`), {
      tags: { track, event: "survey_submission_failure" },
    });
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  Sentry.captureMessage("survey_submission_success", {
    level: "info",
    tags: { track },
  });

  return NextResponse.json({ ok: true });
}
