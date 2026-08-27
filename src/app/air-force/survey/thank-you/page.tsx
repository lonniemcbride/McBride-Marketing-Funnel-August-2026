import type { Metadata } from "next";
import { ThankYou } from "@/components/survey/thank-you";
import { TRACKS } from "@/lib/track";

export const metadata: Metadata = {
  title: "Profile Received | McBride",
};

export default function AirForceThankYouPage() {
  return <ThankYou config={TRACKS.air_force} />;
}
