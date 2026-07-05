import type { Metadata } from "next";
import { SiteProviders } from "@/components/providers/SiteProviders";
import "./globals.css";

export const metadata: Metadata = {
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
    <html lang="en">
      <body>
        <SiteProviders>{children}</SiteProviders>
      </body>
    </html>
  );
}
