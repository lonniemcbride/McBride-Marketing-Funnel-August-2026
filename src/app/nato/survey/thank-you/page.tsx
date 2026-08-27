import type { Metadata } from "next";
import { ThankYou } from "@/components/survey/thank-you";
import { TRACKS } from "@/lib/track";

export const metadata: Metadata = {
  title: "Profile Received | McBride International",
};

export default function NatoThankYouPage() {
  return <ThankYou config={TRACKS.nato} />;
}
