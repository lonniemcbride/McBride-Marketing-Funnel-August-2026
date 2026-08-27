import Link from "next/link";
import type { TrackConfig } from "@/lib/track";

export function ThankYou({ config }: { config: TrackConfig }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-prussian-blue sm:text-3xl">
        Your profile is in.
      </h1>
      <p className="mt-4 text-black/75">
        A recruiter will review it personally — not a keyword scan. If
        something&rsquo;s a fit, you&rsquo;ll hear from us with a real person
        on the other end, not a black hole. If you&rsquo;re not a match for
        anything right now, you&rsquo;ll hear that too, with a reason, and
        your profile stays on file for when something does fit.
      </p>
      <p className="mt-4 text-black/75">
        Nothing is shared with a hiring organization without your review and
        consent first.
      </p>
      <Link
        href={config.homeHref}
        className="mt-8 inline-block rounded-md bg-mcbride-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-prussian-blue"
      >
        Back to Home
      </Link>
    </div>
  );
}
