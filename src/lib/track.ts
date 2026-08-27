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
  reqsTableName: string;
  supplementTableName: string;
  supplementHref: (id: string) => string;
  eyebrow: string;
}

/**
 * When a Vercel project is dedicated to a single track (NEXT_PUBLIC_TRACK
 * set in that project's env vars), next.config.ts rewrites "/" and "/survey"
 * to that track's real routes, and links here switch to the short paths so
 * the browser URL never reveals "/nato" or "/air-force". Unset (local dev,
 * or a combined deployment) keeps the full paths and the "/" chooser page.
 */
const activeTrack = process.env.NEXT_PUBLIC_TRACK;

/** The track this deployment is dedicated to, or null (local/combined dev). */
export function getActiveTrack(): Track | null {
  return activeTrack === "nato" || activeTrack === "air_force" ? activeTrack : null;
}

function hrefsFor(track: Track, basePath: string) {
  const isDedicatedDeploy = activeTrack === track;
  return {
    homeHref: isDedicatedDeploy ? "/" : basePath,
    surveyHref: isDedicatedDeploy ? "/survey" : `${basePath}/survey`,
    thankYouHref: isDedicatedDeploy ? "/survey/thank-you" : `${basePath}/survey/thank-you`,
    supplementHref: (id: string) =>
      isDedicatedDeploy ? `/supplement/${id}` : `${basePath}/supplement/${id}`,
  };
}

export const TRACKS: Record<Track, TrackConfig> = {
  nato: {
    track: "nato",
    brandName: "McBride International",
    logoSrc: "/brand/mcbride-intl-logo.png",
    logoWidth: 160,
    logoHeight: 43,
    ...hrefsFor("nato", "/nato"),
    tableName: "nato_survey_responses",
    bucketName: "resumes-nato",
    reqsTableName: "nato_reqs",
    supplementTableName: "nato_supplement_responses",
    eyebrow: "NATO Contract Staffing · Cleared Careers, Entry to Principal Level",
  },
  air_force: {
    track: "air_force",
    brandName: "McBride",
    logoSrc: "/brand/mcbride-logo.png",
    logoWidth: 160,
    logoHeight: 43,
    ...hrefsFor("air_force", "/air-force"),
    tableName: "air_force_survey_responses",
    bucketName: "resumes-air-force",
    reqsTableName: "air_force_reqs",
    supplementTableName: "air_force_supplement_responses",
    eyebrow: "U.S. Air Force Contract Staffing · Cleared Careers, Entry to Principal Level",
  },
};
