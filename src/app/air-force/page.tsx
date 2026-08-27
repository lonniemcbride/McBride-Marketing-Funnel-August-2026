import type { Metadata } from "next";
import { LandingTemplate, type LandingContent } from "@/components/landing-template";
import { TRACKS } from "@/lib/track";

export const metadata: Metadata = {
  title:
    "McBride | Cleared Careers for U.S. Air Force Contracts — Where Your Purpose Is Our Mission",
  description:
    "Build your profile once. A real recruiter matches you to cleared U.S. Air Force contract roles — entry to principal level — with a pre-interview call before anything goes to the client.",
};

const content: LandingContent = {
  eyebrow: TRACKS.air_force.eyebrow,
  subheadline:
    "Not another keyword match. Tell us about your experience once — a real recruiter reads it, talks with you, and only then puts your name in front of the mission that needs it.",
  problemBody: [
    "Apply. Wait. Hear nothing — or hear back for a role that has almost nothing to do with your background, because a keyword scan matched a skill on your resume to a line in a job description. Multiply that across every cleared job board and it's no wonder the process feels like shouting into a black hole.",
    "We built McBride to work differently: fewer, better-matched conversations instead of more resumes into more systems.",
  ],
  builtForHeading: "Built for cleared careers",
  builtForBody:
    "McBride places cleared and clearance-eligible professionals into U.S. Air Force contract roles, from entry-level to principal. We ask about your clearance status because it matters for the role — not because we can verify it for you. That part stays exactly where it's always been: between you and the government.",
  surveyHref: TRACKS.air_force.surveyHref,
};

export default function AirForceLandingPage() {
  return <LandingTemplate content={content} />;
}
