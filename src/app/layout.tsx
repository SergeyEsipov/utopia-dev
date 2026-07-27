import type { Metadata, Viewport } from "next";
import { SiteProviders } from "@/components/providers/SiteProviders";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Utopia",
  description:
    "Ultra-luxury private estates in the world's ultimate destinations.",
};

/**
 * `theme_color` in manifest.ts only reaches an *installed* PWA; an ordinary
 * Safari tab reads this meta tag, and with none present iOS paints the bar
 * behind the Dynamic Island / status bar its default white — a white strip
 * above the page on every route.
 *
 * width/initialScale repeat Next's own defaults, which exporting `viewport`
 * would otherwise drop. `viewportFit: "cover"` is deliberately NOT set: it
 * would push the layout under the cutout and make it depend on
 * `env(safe-area-inset-*)`, which changes as Safari hides and shows its bars
 * (see CLAUDE.md). Only the colour is wanted here.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f9f5ea",
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
