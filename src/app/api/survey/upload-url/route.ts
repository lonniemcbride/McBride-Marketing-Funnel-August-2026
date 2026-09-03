import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TRACKS, type Track } from "@/lib/track";
import { checkUploadUrlLimit, getClientIp } from "@/lib/rate-limit";
import { ALLOWED_RESUME_MIME_TYPES, MAX_RESUME_SIZE } from "@/lib/survey/resume-constraints";

/**
 * Mints a short-lived signed upload URL so the browser can PUT the resume
 * directly to Supabase Storage — the file's bytes never pass through this
 * (or any) Vercel function, sidestepping the ~4.5MB serverless body cap.
 *
 * The checks here are a fast client-friendly rejection; the *authoritative*
 * enforcement is the bucket's own file_size_limit/allowed_mime_types
 * (supabase/spam-protection-schema.sql), which Supabase enforces on the
 * actual upload regardless of what's declared here.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const track = body?.track as Track | undefined;
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const fileSize = typeof body?.fileSize === "number" ? body.fileSize : 0;
  const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";

  if (track !== "nato" && track !== "air_force") {
    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const { success } = await checkUploadUrlLimit(track, ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!fileName) {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }
  if (fileSize > MAX_RESUME_SIZE) {
    return NextResponse.json({ error: "File is too large (10MB max)" }, { status: 400 });
  }
  if (!ALLOWED_RESUME_MIME_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: "File type not allowed (PDF, DOC, or DOCX only)" }, { status: 400 });
  }

  const config = TRACKS[track];
  const path = `${crypto.randomUUID()}-${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(config.bucketName)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Could not create upload URL" }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
