"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  directExperienceOptions,
  confidenceRatingOptions,
  dutyLocationWorkableOptions,
  yesNoOptions,
} from "@/lib/supplement/schema";

interface ReqContext {
  title: string;
  domain: string;
  duty_location: string;
  need_by_date: string | null;
  key_requirement: string | null;
}

const selectClass =
  "mt-1.5 block w-full rounded-md border border-black/20 bg-white px-3 py-2 focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue";

export function SupplementForm({ id }: { id: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "not-found" | "already-submitted" | "submitted">(
    "loading",
  );
  const [req, setReq] = useState<ReqContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [directExperience, setDirectExperience] = useState("");
  const [confidenceRating, setConfidenceRating] = useState("");
  const [availableByNeedDate, setAvailableByNeedDate] = useState("");
  const [dutyLocationWorkable, setDutyLocationWorkable] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/supplement/${id}`)
      .then(async (res) => {
        if (res.status === 410) {
          setStatus("already-submitted");
          return;
        }
        if (!res.ok) {
          setStatus("not-found");
          return;
        }
        const data = await res.json();
        setReq(data.req);
        setStatus("ready");
      })
      .catch(() => setStatus("not-found"));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/supplement/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direct_experience: directExperience,
        confidence_rating: confidenceRating,
        available_by_need_date: availableByNeedDate,
        duty_location_workable: dutyLocationWorkable,
        notes_for_recruiter: notes || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong submitting your answers. Please try again.");
      return;
    }
    setStatus("submitted");
  }

  if (status === "loading") {
    return <p className="text-center text-black/50">Loading…</p>;
  }
  if (status === "not-found") {
    return <p className="text-center text-black/60">This link isn&rsquo;t valid. Check with your recruiter for a new one.</p>;
  }
  if (status === "already-submitted") {
    return <p className="text-center text-black/60">This has already been submitted — thanks for getting back to us.</p>;
  }
  if (status === "submitted") {
    return (
      <p className="text-center text-black/70">
        Got it — your recruiter has your answers and will follow up with next steps.
      </p>
    );
  }
  if (!req) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-prussian-blue">A few quick questions for {req.title}</h1>
        <p className="mt-1 text-sm text-black/60">
          This stays short — just enough for your recruiter to prep for your call.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-independence">
          {req.key_requirement
            ? `Do you have direct hands-on experience with ${req.key_requirement}?`
            : "Do you have direct hands-on experience relevant to this role?"}
        </span>
        <select
          required
          value={directExperience}
          onChange={(e) => setDirectExperience(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>Select one</option>
          {directExperienceOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-independence">
          {req.key_requirement
            ? `Rate your confidence supporting: ${req.key_requirement}`
            : "Rate your confidence supporting this role's core requirement"}
        </span>
        <select
          required
          value={confidenceRating}
          onChange={(e) => setConfidenceRating(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>Select one</option>
          {confidenceRatingOptions.map((o) => (
            <option key={o} value={o}>{o} {o === "1" ? "(low)" : o === "5" ? "(high)" : ""}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-independence">
          {req.need_by_date
            ? `Are you available to start by ${new Date(req.need_by_date).toLocaleDateString()}?`
            : "Are you available to start by this role's need-by date?"}
        </span>
        <select
          required
          value={availableByNeedDate}
          onChange={(e) => setAvailableByNeedDate(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>Select one</option>
          {yesNoOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-independence">
          Is {req.duty_location} workable for you day-to-day?
        </span>
        <select
          required
          value={dutyLocationWorkable}
          onChange={(e) => setDutyLocationWorkable(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>Select one</option>
          {dutyLocationWorkableOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-independence">
          Anything you&rsquo;d like your recruiter to know before your call?
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${selectClass} min-h-[6rem] resize-y`}
        />
      </label>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-mcbride-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-prussian-blue disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
