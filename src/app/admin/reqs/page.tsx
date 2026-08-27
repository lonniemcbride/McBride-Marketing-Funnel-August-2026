"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/auth-guard";
import { LogoutButton } from "@/components/admin/logout-button";
import { supabase } from "@/lib/supabase/client";
import { getActiveTrack, TRACKS } from "@/lib/track";
import { domainOptions } from "@/lib/survey/options";
import { reqStatusOptions, type Req, type ReqStatus } from "@/lib/reqs/types";

const inputClass =
  "mt-1.5 block w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue";

function ReqsDashboard() {
  const track = getActiveTrack();
  const config = track ? TRACKS[track] : null;

  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [dutyLocation, setDutyLocation] = useState("");
  const [needByDate, setNeedByDate] = useState("");
  const [keyRequirement, setKeyRequirement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadReqs() {
    if (!config) return;
    supabase
      .from(config.reqsTableName)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setReqs(data as Req[]);
      });
  }

  useEffect(loadReqs, [config]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from(config.reqsTableName).insert({
      title,
      domain,
      duty_location: dutyLocation,
      need_by_date: needByDate || null,
      key_requirement: keyRequirement || null,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTitle("");
    setDomain("");
    setDutyLocation("");
    setNeedByDate("");
    setKeyRequirement("");
    setShowForm(false);
    loadReqs();
  }

  async function handleStatusChange(reqId: string, newStatus: ReqStatus) {
    if (!config) return;
    const { error } = await supabase.from(config.reqsTableName).update({ status: newStatus }).eq("id", reqId);
    if (error) {
      setError(error.message);
      return;
    }
    loadReqs();
  }

  if (!config) {
    return (
      <p className="mx-auto max-w-lg px-6 py-16 text-center text-black/60">
        NEXT_PUBLIC_TRACK isn&rsquo;t set for this deployment.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-mcbride-blue">
            {config.brandName} Recruiter Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-prussian-blue">Reqs</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-semibold text-mcbride-blue hover:underline">
            &larr; Candidates
          </Link>
          <Link href="/admin/team" className="text-sm font-semibold text-mcbride-blue hover:underline">
            Team
          </Link>
          <LogoutButton />
        </div>
      </div>

      <button
        onClick={() => setShowForm((v) => !v)}
        className="mt-6 rounded-md bg-mcbride-blue px-4 py-2 text-sm font-bold text-white hover:bg-prussian-blue"
      >
        {showForm ? "Cancel" : "New req"}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 space-y-4 rounded-lg border border-black/10 bg-white p-6">
          <label className="block">
            <span className="text-sm font-semibold text-independence">Title</span>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-independence">Domain</span>
            <select required value={domain} onChange={(e) => setDomain(e.target.value)} className={inputClass}>
              <option value="" disabled>Select one</option>
              {domainOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-independence">Duty location</span>
            <input
              required
              value={dutyLocation}
              onChange={(e) => setDutyLocation(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-independence">Need-by date</span>
            <input
              type="date"
              value={needByDate}
              onChange={(e) => setNeedByDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-independence">
              Key requirement
              <span className="ml-1 font-normal text-black/40">
                (the specific program/platform/skill — used in the candidate supplement questions)
              </span>
            </span>
            <input
              value={keyRequirement}
              onChange={(e) => setKeyRequirement(e.target.value)}
              className={inputClass}
            />
          </label>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-mcbride-blue px-4 py-2 text-sm font-bold text-white hover:bg-prussian-blue disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create req"}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-black/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] text-xs font-semibold uppercase text-black/50">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Duty location</th>
              <th className="px-4 py-3">Need by</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {reqs?.map((req) => (
              <tr key={req.id}>
                <td className="px-4 py-3 font-semibold">{req.title}</td>
                <td className="px-4 py-3">{req.domain}</td>
                <td className="px-4 py-3">{req.duty_location}</td>
                <td className="px-4 py-3">
                  {req.need_by_date ? new Date(req.need_by_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value as ReqStatus)}
                    className="rounded-md border border-black/20 px-2 py-1 text-sm"
                  >
                    {reqStatusOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {reqs && reqs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-black/40">
                  No reqs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReqsPage() {
  return (
    <AuthGuard>
      <ReqsDashboard />
    </AuthGuard>
  );
}
