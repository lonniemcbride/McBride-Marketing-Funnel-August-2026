import Image from "next/image";
import Link from "next/link";
import type { TrackConfig } from "@/lib/track";

export function SiteHeader({ config }: { config: TrackConfig }) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={config.homeHref} className="flex items-center gap-2">
          {config.logoSrc ? (
            <Image
              src={config.logoSrc}
              alt={config.brandName}
              width={config.logoWidth ?? 160}
              height={config.logoHeight ?? 43}
              priority
            />
          ) : (
            <span className="text-2xl font-bold text-mcbride-blue">
              {config.brandName}
            </span>
          )}
        </Link>
        <Link
          href={config.surveyHref}
          className="rounded-md bg-mcbride-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-prussian-blue"
        >
          Start Your Profile
        </Link>
      </div>
    </header>
  );
}
