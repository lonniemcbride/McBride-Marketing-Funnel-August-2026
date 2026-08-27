import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTrack, TRACKS } from "@/lib/track";
import { supplementAnswersSchema } from "@/lib/supplement/schema";

/**
 * Service-role-backed route for the public Role-Specific Supplement link.
 * Deliberately not RLS-backed: a candidate has no login, and a policy
 * permissive enough to let the anon key fetch one row by id would also let
 * it list the whole table. This route is the access boundary instead —
 * it looks up exactly the row asked for and nothing else.
 */

function trackConfig() {
  const track = getActiveTrack();
  return track ? TRACKS[track] : null;
}

export async function GET(_req: Request, ctx: RouteContext<"/api/supplement/[id]">) {
  const config = trackConfig();
  if (!config) {
    return NextResponse.json({ error: "Track not configured" }, { status: 500 });
  }
  const { id } = await ctx.params;

  const { data: supplement, error } = await supabaseAdmin
    .from(config.supplementTableName)
    .select("id, submitted_at, req_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !supplement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (supplement.submitted_at) {
    return NextResponse.json({ error: "Already submitted" }, { status: 410 });
  }

  const { data: req, error: reqError } = await supabaseAdmin
    .from(config.reqsTableName)
    .select("title, domain, duty_location, need_by_date, key_requirement")
    .eq("id", supplement.req_id)
    .maybeSingle();

  if (reqError || !req) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ req });
}

export async function POST(request: Request, ctx: RouteContext<"/api/supplement/[id]">) {
  const config = trackConfig();
  if (!config) {
    return NextResponse.json({ error: "Track not configured" }, { status: 500 });
  }
  const { id } = await ctx.params;

  const { data: supplement, error } = await supabaseAdmin
    .from(config.supplementTableName)
    .select("id, submitted_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !supplement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (supplement.submitted_at) {
    return NextResponse.json({ error: "Already submitted" }, { status: 410 });
  }

  const body = await request.json().catch(() => null);
  const parsed = supplementAnswersSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from(config.supplementTableName)
    .update({ ...parsed.data, submitted_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
