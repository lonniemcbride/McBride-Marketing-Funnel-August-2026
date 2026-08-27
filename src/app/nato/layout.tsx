import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TRACKS } from "@/lib/track";

const config = TRACKS.nato;

export default function NatoLayout({ children }: LayoutProps<"/nato">) {
  return (
    <>
      <SiteHeader config={config} />
      <main className="flex-1">{children}</main>
      <SiteFooter config={config} />
    </>
  );
}
