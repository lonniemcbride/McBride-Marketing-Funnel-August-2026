import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "McBride | Cleared Careers — Where Your Purpose Is Our Mission",
  description:
    "McBride places cleared and clearance-eligible professionals into NATO and U.S. Air Force contract roles, entry to principal level.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
