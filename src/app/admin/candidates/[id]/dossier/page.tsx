"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/auth-guard";
import { supabase } from "@/lib/supabase/client";
import { getActiveTrack, TRACKS } from "@/lib/track";
import type { SurveyResponseRow } from "@/lib/survey/response-row";
import type { Req } from "@/lib/reqs/types";
import type { SupplementResponseRow } from "@/lib/supplement/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-4 border-b border-black/10 py-2 text-sm">
      <dt className="w-48 flex-none font-semibold text-black/50">{label}</dt>
      <dd className="text-black/85">{value}</dd>
    </div>
  );
}

function DossierView() {
  const { id } = useParams<{ id: string }>();
  const track = getActiveTrack();
  const config = track ? TRACKS[track] : null;

  const [row, setRow] = useState<SurveyResponseRow | null>(null);
  const [req, setReq] = useState<Req | null>(null);
  const [supplement, setSupplement] = useState<SupplementResponseRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    supabase
      .from(config.tableName)
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRow(data as SurveyResponseRow);
      });
  }, [config, id]);

  useEffect(() => {
    if (!config || !row?.matched_req_id) return;
    supabase
      .from(config.reqsTableName)
      .select("*")
      .eq("id", row.matched_req_id)
      .single()
      .then(({ data }) => setReq(data as Req));
    supabase
      .from(config.supplementTableName)
      .select("*")
      .eq("survey_response_id", row.id)
      .eq("req_id", row.matched_req_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSupplement(data as SupplementResponseRow | null));
  }, [config, row?.matched_req_id, row?.id]);

  async function handleDownloadResume() {
    if (!config || !row) return;
    const newTab = window.open("", "_blank");
    const { data, error } = await supabase.storage
      .from(config.bucketName)
      .createSignedUrl(row.resume_path, 300);
    if (error) {
      setError(error.message);
      newTab?.close();
      return;
    }
    if (newTab) newTab.location.href = data.signedUrl;
  }

  if (!config) return <p className="mx-auto max-w-lg px-6 py-16 text-center text-black/60">NEXT_PUBLIC_TRACK isn&rsquo;t set for this deployment.</p>;
  if (error) return <p className="mx-auto max-w-lg px-6 py-16 text-center text-red-700">{error}</p>;
  if (!row) return <p className="mx-auto max-w-lg px-6 py-16 text-center text-black/50">Loading…</p>;

  if (!row.matched_req_id) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-black/60">This candidate hasn&rsquo;t been matched to a req yet.</p>
        <Link href={`/admin/candidates/${row.id}`} className="mt-4 inline-block text-sm font-semibold text-mcbride-blue hover:underline">
          &larr; Back to candidate
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/admin/candidates/${row.id}`} className="text-sm font-semibold text-mcbride-blue hover:underline">
          &larr; Back to candidate
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadResume}
            className="rounded-md border border-black/20 px-4 py-2 text-sm font-bold text-independence hover:bg-black/5"
          >
            Download resume
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-md bg-mcbride-blue px-4 py-2 text-sm font-bold text-white hover:bg-prussian-blue"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-black/10 bg-white p-8 print:border-0 print:p-0">
        <p className="text-xs font-bold uppercase tracking-widest text-mcbride-blue">
          {config.brandName} &middot; Candidate Dossier
        </p>
        <h1 className="mt-2 text-2xl font-bold text-prussian-blue">{row.c1_full_name}</h1>
        <p className="text-black/60">
          {row.p1_domain} &middot; {row.p3_experience_band}-level &middot; {row.c4_location}
        </p>

        {req && (
          <div className="mt-4 rounded-md bg-black/[.03] px-4 py-3">
            <p className="text-sm font-semibold text-independence">Submitted against: {req.title}</p>
            <p className="text-sm text-black/60">{req.domain} &middot; {req.duty_location}</p>
          </div>
        )}

        {row.m1_why_this_work && (
          <blockquote className="mt-6 border-l-4 border-marigold pl-4 italic text-black/80">
            &ldquo;{row.m1_why_this_work}&rdquo;
          </blockquote>
        )}

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-mcbride-blue">Background</h2>
        <dl className="mt-2">
          <Row label="Years of experience" value={row.p2_years_experience} />
          <Row label="Certifications" value={row.p4_certifications?.join(", ")} />
          <Row label="Programs / platforms" value={row.p5_programs_platforms} />
        </dl>

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-mcbride-blue">
          Clearance &amp; Eligibility <span className="text-xs font-normal normal-case text-black/40">(self-reported by candidate — not independently verified)</span>
        </h2>
        <dl className="mt-2">
          <Row label="Citizenship" value={row.cl1_citizenship} />
          <Row label="Clearance status" value={row.cl2_clearance_status} />
          <Row label="Clearance level" value={row.cl3_clearance_level} />
          <Row label="Polygraph status" value={row.cl6_polygraph_status} />
        </dl>

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-mcbride-blue">Logistics</h2>
        <dl className="mt-2">
          <Row label="Location model" value={row.w1_location_model} />
          <Row label="Willing to relocate" value={row.w2_relocate} />
          <Row label="Willing OCONUS" value={row.w3_oconus} />
          <Row label="Availability" value={row.w4_availability} />
        </dl>

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-mcbride-blue">Role-Specific Supplement</h2>
        {!supplement?.submitted_at ? (
          <p className="mt-2 text-sm text-black/40">Awaiting candidate response.</p>
        ) : (
          <dl className="mt-2">
            <Row label="Direct experience" value={supplement.direct_experience} />
            <Row label="Confidence rating" value={supplement.confidence_rating} />
            <Row label="Available by need date" value={supplement.available_by_need_date} />
            <Row label="Duty location workable" value={supplement.duty_location_workable} />
            <Row label="Notes for recruiter" value={supplement.notes_for_recruiter} />
          </dl>
        )}
      </div>
    </div>
  );
}

export default function DossierPage() {
  return (
    <AuthGuard>
      <DossierView />
    </AuthGuard>
  );
}
