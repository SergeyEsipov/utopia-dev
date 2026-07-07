"use client";

import { MenuProvider } from "@/contexts/MenuContext";
import { useStableViewportHeight } from "@/hooks/useStableViewportHeight";

export function SiteProviders({ children }: { children: React.ReactNode }) {
  useStableViewportHeight();

  return <MenuProvider>{children}</MenuProvider>;
}
