import type { Metadata, Viewport } from "next";
import { SiteProviders } from "@/components/providers/SiteProviders";
import { alternatesFor, siteUrl } from "@/lib/site";
import "./globals.css";

/**
 * Site-wide metadata. Every route inherits `openGraph`/`twitter` from here and
 * the file-based `opengraph-image.tsx` next to this file supplies the image.
 *
 * TWO THINGS TO KNOW BEFORE EDITING:
 *
 * 1. **`title` is a bare string, not a `{ default, template }` pair.** The child
 *    routes already spell out their own suffix ("Careers — Utopia", "Website
 *    Terms — Utopia"), so a `%s — Utopia` template would double it. As a plain
 *    string it is simply inherited by the routes that set no title of their
 *    own — `/` and the not-found page — and replaced by the ones that do.
 * 2. **A child that declares `openGraph` at all replaces this object wholesale**
 *    — Next does not deep-merge it — and with it the file-convention og:image.
 *    That is why `/terms` and `/privacy` set only `alternates` here, and it is
 *    the live bug on `/careers/[slug]` (see CLAUDE.md).
 *
 * The copy below is a PLACEHOLDER derived from the pages' own content, not
 * from the design file. Figma holds the signed-off titles and descriptions
 * (bug #29); replace these strings when they arrive.
 */
const description =
  "Ultra-luxury private estates in the world's ultimate destinations.";
const homeTitle = "Utopia — It's all yours";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: homeTitle,
  description,
  applicationName: "Utopia",
  alternates: alternatesFor("/"),
  /* Only the genuinely site-wide fields. `title`/`description` are left out on
     purpose: Next derives og:title and og:description from each route's own
     `title`/`description`, and pinning them here would stamp the home page's
     copy onto every other route's share card. Same reason there is no `twitter`
     block — Next picks the card type from whether an image resolved. */
  openGraph: {
    type: "website",
    siteName: "Utopia",
    locale: "en_GB",
  },
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
 *
 * KNOWN COMPROMISE (bug #18): this one cream is used on every route, so on `/`
 * — whose hero is a dark photograph — the browser paints a cream strip in the
 * status-bar area that reads as a gap above the image. It cannot be fixed from
 * here: the root layout does not know the pathname, and `viewportFit: "cover"`
 * (which would let the photo run under the strip) is ruled out above. A dark
 * `themeColor` exported from `src/app/page.tsx` would fix `/` and only `/`;
 * that is a product decision, because the same bar then stays dark once the
 * page is scrolled onto the cream sections below the hero.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f9f5ea",
  /* Declares the page light so the UA picks dark status-bar/scrollbar/form
     furniture. Without it a browser may assume dark and draw white status-bar
     glyphs on the cream strip above, which is what made bug #18's screenshot
     illegible as well as visible. */
  colorScheme: "light",
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
      <head>
        {/* The body face carries the large majority of the glyphs on every
            route, and it is the one whose `font-display: swap` window reads as
            "the font fell off" (bugs #34, #38) while it is still in flight.
            Preloading collapses that window at the cost of one 62KB
            same-origin fetch. `crossOrigin` is required even same-origin, or
            the font is fetched twice. The display face is deliberately left
            out: it carries few glyphs and its Georgia fallback is visually
            much closer, so it is not worth another 62KB on the critical path. */}
        <link
          rel="preload"
          href="/fonts/NB-International-Pro-Regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <SiteProviders>{children}</SiteProviders>
      </body>
    </html>
  );
}
