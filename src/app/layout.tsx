import type { Metadata } from "next";
import { SiteProviders } from "@/components/providers/SiteProviders";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Utopia",
  description:
    "Ultra-luxury private estates in the world's ultimate destinations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: browser extensions inject attributes on
    // <html>/<body> (e.g. __gcrremoteframetoken from a recorder extension)
    // before React hydrates, which is otherwise flagged as a mismatch.
    <html
      lang="en"
      data-variant={
        process.env.NEXT_PUBLIC_SITE_VARIANT === "sharp" ? "sharp" : "rounded"
      }
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <SiteProviders>{children}</SiteProviders>
      </body>
    </html>
  );
}
