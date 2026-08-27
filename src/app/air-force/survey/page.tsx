import type { Metadata } from "next";
import { SurveyForm } from "@/components/survey/survey-form";

export const metadata: Metadata = {
  title: "Start Your Profile | McBride",
  description:
    "Build your profile once — clearance, background, and what matters to you. About 8–12 minutes.",
};

export default function AirForceSurveyPage() {
  return (
    <div className="bg-black/[.02]">
      <SurveyForm track="air_force" />
    </div>
  );
}
