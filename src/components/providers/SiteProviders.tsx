"use client";

import { MenuProvider } from "@/contexts/MenuContext";
import { SiteVariant } from "./SiteVariant";
import { CookieConsent } from "@/components/layout/CookieConsent";

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <SiteVariant />
      {children}
      <CookieConsent />
    </MenuProvider>
  );
}
