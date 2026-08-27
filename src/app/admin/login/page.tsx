"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getActiveTrack, TRACKS } from "@/lib/track";

export default function AdminLoginPage() {
  const router = useRouter();
  const track = getActiveTrack();
  const brandName = track ? TRACKS[track].brandName : "McBride";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black/[.03] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-8"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-mcbride-blue">
          {brandName} Recruiter Portal
        </p>
        <h1 className="mt-2 text-xl font-bold text-prussian-blue">Sign in</h1>

        <label className="mt-6 block text-sm font-semibold text-independence">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-black/20 px-3 py-2 focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-independence">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-black/20 px-3 py-2 focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-md bg-mcbride-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-prussian-blue disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
