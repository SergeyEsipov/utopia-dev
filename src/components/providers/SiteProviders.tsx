"use client";

import { MenuProvider } from "@/contexts/MenuContext";

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return <MenuProvider>{children}</MenuProvider>;
}
