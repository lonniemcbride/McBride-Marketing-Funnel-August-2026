import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TRACKS } from "@/lib/track";

const config = TRACKS.air_force;

export default function AirForceLayout({ children }: LayoutProps<"/air-force">) {
  return (
    <>
      <SiteHeader config={config} />
      <main className="flex-1">{children}</main>
      <SiteFooter config={config} />
    </>
  );
}
