import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * NEXT_PUBLIC_TRACK selects a single-track deployment (set per Vercel
 * project). When set, "/" and "/survey" transparently serve that track's
 * real routes — the browser URL never shows "/nato" or "/air-force". Unset
 * (local dev, or a combined deployment) leaves "/" as the two-track chooser.
 *
 * This has to be a proxy rewrite rather than a next.config.ts rewrite:
 * declarative rewrites in next.config don't reliably override fully
 * statically-optimized App Router pages, since the static file for "/"
 * still wins. Proxy runs per-request ahead of that resolution.
 */
const track = process.env.NEXT_PUBLIC_TRACK;
const basePath = track === "nato" ? "/nato" : track === "air_force" ? "/air-force" : null;

export function proxy(request: NextRequest) {
  if (!basePath) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const target =
    pathname === "/"
      ? basePath
      : pathname === "/survey" || pathname === "/survey/thank-you"
        ? `${basePath}${pathname}`
        : null;

  if (!target) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/survey", "/survey/thank-you"],
};
