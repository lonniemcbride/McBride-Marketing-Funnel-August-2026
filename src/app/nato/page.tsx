import type { Metadata } from "next";
import { LandingTemplate, type LandingContent } from "@/components/landing-template";
import { TRACKS } from "@/lib/track";

export const metadata: Metadata = {
  title:
    "McBride International | Cleared Careers for NATO Contracts — Where Your Purpose Is Our Mission",
  description:
    "Build your profile once. A real recruiter matches you to cleared NATO contract roles across Europe and allied programs — entry to principal level — with a pre-interview call before anything goes to the client.",
};

const content: LandingContent = {
  eyebrow: TRACKS.nato.eyebrow,
  subheadline:
    "Not another keyword match. Tell us about your experience once — a real recruiter reads it, talks with you, and only then puts your name in front of the NATO mission that needs it.",
  problemBody: [
    "Apply. Wait. Hear nothing — or hear back for a role that has almost nothing to do with your background, because a keyword scan matched a skill on your resume to a line in a job description. Multiply that across every cleared job board and every OCONUS posting, and it's no wonder the process feels like shouting into a black hole.",
    "We built McBride International to work differently: fewer, better-matched conversations instead of more resumes into more systems.",
  ],
  builtForHeading: "Built for NATO careers",
  builtForBody:
    "McBride International places cleared and clearance-eligible professionals into NATO contract roles across Europe and allied programs, from entry-level to principal. We ask about your clearance status because it matters for the role — not because we can verify it for you. That part stays exactly where it's always been: between you and the government.",
  surveyHref: TRACKS.nato.surveyHref,
};

export default function NatoLandingPage() {
  return <LandingTemplate content={content} />;
}
