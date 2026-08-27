import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Invites a new recruiter to the CALLER's own team — team is never taken
 * from the request body, always derived server-side from the caller's own
 * recruiter_profiles row, so a recruiter can't provision access to the
 * other team by passing a different team value.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: callerProfile, error: profileError } = await supabaseAdmin
    .from("recruiter_profiles")
    .select("team")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !callerProfile) {
    return NextResponse.json({ error: "Only existing recruiters can send invites" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/admin/accept-invite`,
  });

  if (inviteError || !invited.user) {
    return NextResponse.json({ error: inviteError?.message || "Invite failed" }, { status: 500 });
  }

  const { error: insertError } = await supabaseAdmin.from("recruiter_profiles").insert({
    id: invited.user.id,
    team: callerProfile.team,
    display_name: displayName,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
