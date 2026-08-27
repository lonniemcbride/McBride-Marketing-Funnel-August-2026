"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getActiveTrack, TRACKS } from "@/lib/track";

export default function AcceptInvitePage() {
  const router = useRouter();
  const track = getActiveTrack();
  const brandName = track ? TRACKS[track].brandName : "McBride";

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function establishSession() {
      // supabase-js auto-detects the session from the URL hash in most
      // invite-link formats; fall back to the query-param token_hash form
      // if that didn't happen.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" });
        if (error) {
          setError("This invite link is invalid or has expired. Ask your recruiter for a new one.");
          return;
        }
        setReady(true);
        return;
      }

      setError("This invite link is invalid or has expired. Ask your recruiter for a new one.");
    }
    establishSession();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black/[.03] px-6">
      <div className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-mcbride-blue">
          {brandName} Recruiter Portal
        </p>
        <h1 className="mt-2 text-xl font-bold text-prussian-blue">Set your password</h1>

        {!ready && !error && <p className="mt-4 text-sm text-black/50">Checking your invite…</p>}

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {ready && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-independence">
              Password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-black/20 px-3 py-2 focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue"
              />
            </label>
            <label className="block text-sm font-semibold text-independence">
              Confirm password
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-black/20 px-3 py-2 focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-mcbride-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-prussian-blue disabled:opacity-60"
            >
              {submitting ? "Setting password…" : "Set password & continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
