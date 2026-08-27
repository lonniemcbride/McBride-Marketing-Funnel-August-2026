"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/auth-guard";
import { LogoutButton } from "@/components/admin/logout-button";
import { supabase } from "@/lib/supabase/client";
import { getActiveTrack, TRACKS } from "@/lib/track";
import type { RecruiterProfile } from "@/lib/admin/recruiter";

const inputClass =
  "mt-1.5 block w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue";

function TeamDashboard() {
  const track = getActiveTrack();
  const config = track ? TRACKS[track] : null;

  const [teammates, setTeammates] = useState<RecruiterProfile[] | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  function loadTeammates() {
    supabase
      .from("recruiter_profiles")
      .select("*")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setTeammates(data as RecruiterProfile[]);
      });
  }

  useEffect(loadTeammates, []);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setSuccess(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setInviting(false);
      setError("Your session expired — refresh and try again.");
      return;
    }

    const res = await fetch("/api/admin/invite-recruiter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, displayName: displayName || undefined }),
    });
    setInviting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Invite failed. Please try again.");
      return;
    }

    setSuccess(`Invite sent to ${email}.`);
    setEmail("");
    setDisplayName("");
    loadTeammates();
  }

  if (!config) {
    return (
      <p className="mx-auto max-w-lg px-6 py-16 text-center text-black/60">
        NEXT_PUBLIC_TRACK isn&rsquo;t set for this deployment.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-mcbride-blue">
            {config.brandName} Recruiter Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-prussian-blue">Team</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-semibold text-mcbride-blue hover:underline">
            &larr; Candidates
          </Link>
          <Link href="/admin/reqs" className="text-sm font-semibold text-mcbride-blue hover:underline">
            Reqs
          </Link>
          <LogoutButton />
        </div>
      </div>

      <form onSubmit={handleInvite} className="mt-6 space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-mcbride-blue">Invite a teammate</h2>
        <label className="block">
          <span className="text-sm font-semibold text-independence">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-independence">Display name (optional)</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
        </label>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-md bg-android-green/10 px-3 py-2 text-sm text-android-green">{success}</p>}
        <button
          type="submit"
          disabled={inviting}
          className="rounded-md bg-mcbride-blue px-4 py-2 text-sm font-bold text-white hover:bg-prussian-blue disabled:opacity-60"
        >
          {inviting ? "Sending…" : "Send invite"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-black/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] text-xs font-semibold uppercase text-black/50">
            <tr>
              <th className="px-4 py-3">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {teammates?.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3">{t.display_name || "(no display name set)"}</td>
              </tr>
            ))}
            {teammates && teammates.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-black/40">No teammates yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <AuthGuard>
      <TeamDashboard />
    </AuthGuard>
  );
}
