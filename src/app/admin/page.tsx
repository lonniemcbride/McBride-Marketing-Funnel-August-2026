"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/auth-guard";
import { LogoutButton } from "@/components/admin/logout-button";
import { supabase } from "@/lib/supabase/client";
import { getActiveTrack, TRACKS } from "@/lib/track";
import type { SubmissionListItem, SubmissionStatus } from "@/lib/survey/response-row";
import { statusOptions } from "@/lib/survey/response-row";
import { domainOptions, experienceBandOptions, clearanceStatusOptions } from "@/lib/survey/options";

const selectClass =
  "rounded-md border border-black/20 bg-white px-2.5 py-1.5 text-sm focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue";

function AdminDashboard() {
  const track = getActiveTrack();
  const config = track ? TRACKS[track] : null;

  const [rows, setRows] = useState<SubmissionListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [bandFilter, setBandFilter] = useState("");
  const [clearanceFilter, setClearanceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!config) return;
    let query = supabase
      .from(config.tableName)
      .select("id, submitted_at, status, c1_full_name, c2_email, p1_domain, p3_experience_band, cl2_clearance_status")
      .order("submitted_at", { ascending: false });

    if (domainFilter) query = query.eq("p1_domain", domainFilter);
    if (bandFilter) query = query.eq("p3_experience_band", bandFilter);
    if (clearanceFilter) query = query.eq("cl2_clearance_status", clearanceFilter);
    if (statusFilter) query = query.eq("status", statusFilter);
    if (search.trim()) {
      query = query.or(`c1_full_name.ilike.%${search.trim()}%,c2_email.ilike.%${search.trim()}%`);
    }

    query.then(({ data, error }) => {
      if (error) setError(error.message);
      else setRows(data as SubmissionListItem[]);
    });
  }, [config, search, domainFilter, bandFilter, clearanceFilter, statusFilter]);

  const count = useMemo(() => rows?.length ?? 0, [rows]);

  if (!config) {
    return (
      <p className="mx-auto max-w-lg px-6 py-16 text-center text-black/60">
        NEXT_PUBLIC_TRACK isn&rsquo;t set for this deployment, so the admin
        view doesn&rsquo;t know which track&rsquo;s data to show.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-mcbride-blue">
            {config.brandName} Recruiter Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-prussian-blue">Candidates</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded-md border border-black/20 px-3 py-1.5 text-sm focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue"
        />
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className={selectClass}>
          <option value="">All domains</option>
          {domainOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select value={bandFilter} onChange={(e) => setBandFilter(e.target.value)} className={selectClass}>
          <option value="">All experience bands</option>
          {experienceBandOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select value={clearanceFilter} onChange={(e) => setClearanceFilter(e.target.value)} className={selectClass}>
          <option value="">All clearance statuses</option>
          {clearanceStatusOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          {statusOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-black/50">{count} candidate{count === 1 ? "" : "s"}</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-black/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] text-xs font-semibold uppercase text-black/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Clearance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {rows?.map((row) => (
              <tr key={row.id} className="hover:bg-black/[.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/candidates/${row.id}`} className="font-semibold text-mcbride-blue hover:underline">
                    {row.c1_full_name}
                  </Link>
                  <div className="text-black/50">{row.c2_email}</div>
                </td>
                <td className="px-4 py-3">{row.p1_domain}</td>
                <td className="px-4 py-3">{row.p3_experience_band}</td>
                <td className="px-4 py-3">{row.cl2_clearance_status}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-black/50">
                  {new Date(row.submitted_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {rows && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-black/40">
                  No candidates match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const colors: Record<SubmissionStatus, string> = {
    New: "bg-mcbride-blue/10 text-mcbride-blue",
    Contacted: "bg-marigold/15 text-marigold",
    Matched: "bg-android-green/15 text-android-green",
    "Not a fit": "bg-black/10 text-black/50",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminDashboard />
    </AuthGuard>
  );
}
