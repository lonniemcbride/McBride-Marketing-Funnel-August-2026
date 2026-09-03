import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

// Source-map upload is intentionally left unconfigured (no org/project/authToken)
// for this pass — Turbopack builds skip it anyway. Error/message capture works
// without it; only nicer stack traces in the Sentry UI are deferred.
export default withSentryConfig(nextConfig, {
  silent: true,
});
