"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/auth-guard";
import { LogoutButton } from "@/components/admin/logout-button";
import { supabase } from "@/lib/supabase/client";
import { getActiveTrack, TRACKS } from "@/lib/track";
import type { SurveyResponseRow, SubmissionStatus } from "@/lib/survey/response-row";
import { statusOptions } from "@/lib/survey/response-row";
import type { Req } from "@/lib/reqs/types";
import type { SupplementResponseRow } from "@/lib/supplement/types";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-black/40">{label}</dt>
      <dd className="mt-0.5 text-sm text-black/85">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-mcbride-blue">{title}</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function SupplementLinkBox({ id }: { id: string }) {
  const track = getActiveTrack();
  const config = track ? TRACKS[track] : null;
  const [copied, setCopied] = useState(false);
  if (!config) return null;

  const path = config.supplementHref(id);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  return (
    <div className="rounded-md bg-marigold/10 px-4 py-3 text-sm">
      <p className="font-semibold text-independence">
        Supplement pending — send this link to the candidate:
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded bg-white px-2 py-1 text-xs">{fullUrl}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="rounded-md bg-mcbride-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-prussian-blue"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const track = getActiveTrack();
  const config = track ? TRACKS[track] : null;

  const [row, setRow] = useState<SurveyResponseRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const [openReqs, setOpenReqs] = useState<Req[]>([]);
  const [selectedReqId, setSelectedReqId] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchedReq, setMatchedReq] = useState<Req | null>(null);
  const [supplement, setSupplement] = useState<SupplementResponseRow | null>(null);

  function loadCandidate() {
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
  }

  useEffect(loadCandidate, [config, id]);

  useEffect(() => {
    if (!config) return;
    supabase
      .from(config.reqsTableName)
      .select("*")
      .eq("status", "Open")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOpenReqs((data as Req[]) ?? []));
  }, [config]);

  useEffect(() => {
    // No UI path currently unmatches a candidate, so there's nothing to
    // reset back to null here — this only ever runs once matched_req_id
    // is set for this candidate.
    if (!config || !row?.matched_req_id) return;
    supabase
      .from(config.reqsTableName)
      .select("*")
      .eq("id", row.matched_req_id)
      .single()
      .then(({ data }) => setMatchedReq(data as Req));
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

  async function handleMatch() {
    if (!config || !row || !selectedReqId) return;
    setMatching(true);
    setError(null);

    const { error: supplementError } = await supabase.from(config.supplementTableName).insert({
      survey_response_id: row.id,
      req_id: selectedReqId,
    });
    if (supplementError) {
      setMatching(false);
      setError(supplementError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from(config.tableName)
      .update({ matched_req_id: selectedReqId, status: "Matched" })
      .eq("id", row.id);
    setMatching(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSelectedReqId("");
    loadCandidate();
  }

  async function handleDownloadResume() {
    if (!config || !row) return;
    // Open the tab synchronously, before the await — browsers only allow
    // window.open() without a popup block as a direct result of the click;
    // calling it after an await (once the signed URL resolves) gets silently
    // dropped or opens a blank tab in most browsers.
    const newTab = window.open("", "_blank");
    const { data, error } = await supabase.storage
      .from(config.bucketName)
      .createSignedUrl(row.resume_path, 300);
    if (error) {
      setError(error.message);
      newTab?.close();
      return;
    }
    setResumeUrl(data.signedUrl);
    if (newTab) newTab.location.href = data.signedUrl;
  }

  async function handleStatusChange(newStatus: SubmissionStatus) {
    if (!config || !row) return;
    setSavingStatus(true);
    const { error } = await supabase
      .from(config.tableName)
      .update({ status: newStatus })
      .eq("id", row.id);
    setSavingStatus(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRow({ ...row, status: newStatus });
  }

  if (!config) {
    return (
      <p className="mx-auto max-w-lg px-6 py-16 text-center text-black/60">
        NEXT_PUBLIC_TRACK isn&rsquo;t set for this deployment.
      </p>
    );
  }

  if (error) {
    return <p className="mx-auto max-w-lg px-6 py-16 text-center text-red-700">{error}</p>;
  }

  if (!row) {
    return <p className="mx-auto max-w-lg px-6 py-16 text-center text-black/50">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm font-semibold text-mcbride-blue hover:underline">
          &larr; Back to candidates
        </Link>
        <LogoutButton />
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-prussian-blue">{row.c1_full_name}</h1>
          <p className="text-black/60">{row.c2_email} &middot; {row.c3_phone}</p>
          <p className="text-sm text-black/40">
            Submitted {new Date(row.submitted_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-independence">
            Status
            <select
              value={row.status}
              disabled={savingStatus}
              onChange={(e) => handleStatusChange(e.target.value as SubmissionStatus)}
              className="ml-2 rounded-md border border-black/20 px-2.5 py-1.5 text-sm focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue"
            >
              {statusOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <button
            onClick={handleDownloadResume}
            className="rounded-md bg-mcbride-blue px-4 py-2 text-sm font-bold text-white hover:bg-prussian-blue"
          >
            Download resume
          </button>
        </div>
      </div>
      {resumeUrl && (
        <p className="mt-2 text-xs text-black/40">
          Signed link expires 5 minutes after generation — click Download again if it lapses.
        </p>
      )}

      <section className="mt-8 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-mcbride-blue">Match &amp; Supplement</h2>

        {!matchedReq && (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-independence">Match to an open req</span>
              <select
                value={selectedReqId}
                onChange={(e) => setSelectedReqId(e.target.value)}
                className="mt-1.5 block w-64 rounded-md border border-black/20 px-3 py-2 text-sm focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue"
              >
                <option value="">Select a req</option>
                {openReqs.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </label>
            <button
              onClick={handleMatch}
              disabled={!selectedReqId || matching}
              className="rounded-md bg-mcbride-blue px-4 py-2 text-sm font-bold text-white hover:bg-prussian-blue disabled:opacity-60"
            >
              {matching ? "Matching…" : "Match"}
            </button>
            {openReqs.length === 0 && (
              <p className="text-sm text-black/40">No open reqs yet — create one under Reqs.</p>
            )}
          </div>
        )}

        {matchedReq && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-black/80">
              Matched to <span className="font-semibold">{matchedReq.title}</span> ({matchedReq.domain})
            </p>

            {supplement && !supplement.submitted_at && (
              <SupplementLinkBox id={supplement.id} />
            )}
            {supplement && supplement.submitted_at && (
              <div className="rounded-md bg-android-green/10 px-4 py-3 text-sm text-black/80">
                <p className="font-semibold text-android-green">Supplement submitted</p>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Field label="Direct experience" value={supplement.direct_experience} />
                  <Field label="Confidence rating" value={supplement.confidence_rating} />
                  <Field label="Available by need date" value={supplement.available_by_need_date} />
                  <Field label="Duty location workable" value={supplement.duty_location_workable} />
                  <Field label="Notes for recruiter" value={supplement.notes_for_recruiter} />
                </dl>
              </div>
            )}

            <Link
              href={`/admin/candidates/${row.id}/dossier`}
              className="inline-block rounded-md bg-marigold px-4 py-2 text-sm font-bold text-prussian-blue hover:bg-android-green"
            >
              View dossier
            </Link>
          </div>
        )}
      </section>

      <div className="mt-8 space-y-6">
        <Section title="Contact & Basics">
          <Field label="Location" value={row.c4_location} />
          <Field label="LinkedIn" value={row.c6_linkedin_url} />
        </Section>

        <Section title="Clearance & Eligibility">
          <Field label="Citizenship" value={row.cl1_citizenship} />
          <Field label="Clearance status" value={row.cl2_clearance_status} />
          <Field label="Clearance level" value={row.cl3_clearance_level} />
          <Field label="Investigation tier" value={row.cl4_investigation_tier} />
          <Field label="Clearance date" value={row.cl5_clearance_date} />
          <Field label="Polygraph status" value={row.cl6_polygraph_status} />
          <Field label="Clearance sponsor" value={row.cl7_clearance_sponsor} />
        </Section>

        <Section title="Professional Background">
          <Field label="Primary domain" value={row.p1_domain} />
          <Field label="Years of experience" value={row.p2_years_experience} />
          <Field label="Experience band" value={row.p3_experience_band} />
          <Field label="Certifications" value={row.p4_certifications?.join(", ")} />
          <Field label="Certifications (other)" value={row.p4_certifications_other} />
          <Field label="Programs / platforms" value={row.p5_programs_platforms} />
        </Section>

        <Section title="Motivation & Fit">
          <Field label="Why this work matters" value={row.m1_why_this_work} />
          <Field label="Priorities" value={row.m2_priorities?.join(", ")} />
          <Field label="Job search status" value={row.m3_job_search_status} />
        </Section>

        <Section title="Work Style & Logistics">
          <Field label="Location model" value={row.w1_location_model} />
          <Field label="Willing to relocate" value={row.w2_relocate} />
          <Field label="Willing OCONUS" value={row.w3_oconus} />
          <Field label="Availability" value={row.w4_availability} />
          <Field label="Compensation" value={row.w5_compensation} />
        </Section>

        {(row.e1_sponsorship_interest || row.e2_training_background || row.e3_mentorship_interest) && (
          <Section title="Entry-Level Add-On">
            <Field label="Sponsorship interest" value={row.e1_sponsorship_interest} />
            <Field label="Training background" value={row.e2_training_background} />
            <Field label="Mentorship interest" value={row.e3_mentorship_interest} />
          </Section>
        )}

        {(row.pr1_leadership_scope || row.pr2_bd_willingness || row.pr3_technical_authority) && (
          <Section title="Principal-Level Add-On">
            <Field label="Leadership scope" value={row.pr1_leadership_scope} />
            <Field label="BD willingness" value={row.pr2_bd_willingness} />
            <Field label="Technical authority" value={row.pr3_technical_authority} />
          </Section>
        )}

        <Section title="Consent & Next Steps">
          <Field label="Preferred contact method" value={row.cn2_contact_preference} />
          <Field label="Consent given" value={new Date(row.consent_given_at).toLocaleString()} />
          <Field label="Consent text version" value={row.consent_text_version} />
        </Section>
      </div>
    </div>
  );
}

export default function CandidateDetailPage() {
  return (
    <AuthGuard>
      <CandidateDetail />
    </AuthGuard>
  );
}
