export type Track = "nato" | "air_force";

export interface TrackConfig {
  track: Track;
  /** Shown in the header/footer wordmark. */
  brandName: string;
  /** Wordmark image, when we have a real logo asset for this track. Falls back to a text wordmark. */
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  homeHref: string;
  surveyHref: string;
  thankYouHref: string;
  /** Supabase table + storage bucket are fully separate per track — no shared data store. */
  tableName: string;
  bucketName: string;
  eyebrow: string;
}

export const TRACKS: Record<Track, TrackConfig> = {
  nato: {
    track: "nato",
    brandName: "McBride International",
    logoSrc: "/brand/mcbride-intl-logo.png",
    logoWidth: 160,
    logoHeight: 43,
    homeHref: "/nato",
    surveyHref: "/nato/survey",
    thankYouHref: "/nato/survey/thank-you",
    tableName: "nato_survey_responses",
    bucketName: "resumes-nato",
    eyebrow: "NATO Contract Staffing · Cleared Careers, Entry to Principal Level",
  },
  air_force: {
    track: "air_force",
    brandName: "McBride",
    logoSrc: "/brand/mcbride-logo.png",
    logoWidth: 160,
    logoHeight: 43,
    homeHref: "/air-force",
    surveyHref: "/air-force/survey",
    thankYouHref: "/air-force/survey/thank-you",
    tableName: "air_force_survey_responses",
    bucketName: "resumes-air-force",
    eyebrow: "U.S. Air Force Contract Staffing · Cleared Careers, Entry to Principal Level",
  },
};
