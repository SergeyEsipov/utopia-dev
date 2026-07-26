"use client";

import { MenuProvider } from "@/contexts/MenuContext";
import { SiteVariant } from "./SiteVariant";

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <SiteVariant />
      {children}
    </MenuProvider>
  );
}
