import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** 5 submissions/hour, keyed per track so one track's traffic can't eat the other's quota. */
const surveySubmitLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "ratelimit:survey-submit",
});

/** Looser limit on minting upload URLs — a legitimate candidate may retry a failed upload. */
const uploadUrlLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "ratelimit:upload-url",
});

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function checkSurveySubmitLimit(track: string, ip: string) {
  return surveySubmitLimiter.limit(`${track}:${ip}`);
}

export async function checkUploadUrlLimit(track: string, ip: string) {
  return uploadUrlLimiter.limit(`${track}:${ip}`);
}
