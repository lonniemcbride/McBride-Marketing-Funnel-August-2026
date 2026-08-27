import type { TrackConfig } from "@/lib/track";

export function SiteFooter({ config }: { config: TrackConfig }) {
  return (
    <footer className="border-t border-white/10 bg-prussian-blue py-8 text-white">
      <div className="mx-auto max-w-6xl px-6 text-sm text-white/70">
        <p>
          Your information is used to match you to roles and, only with your
          review and consent, shared with a hiring organization as part of a
          submission. See our privacy notice for details.
        </p>
        <p className="mt-4 text-xs text-white/50">
          &copy; {new Date().getFullYear()} {config.brandName}. Where Your
          Purpose Is Our Mission.
        </p>
      </div>
    </footer>
  );
}
