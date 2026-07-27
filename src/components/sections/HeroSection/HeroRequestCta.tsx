"use client";

import { Button } from "@/design-system/components";
import { triggerHaptic } from "@/lib/haptics";

/** Desktop hero "Request a stay" CTA — navigates like the dock/nav controls. */
export function HeroRequestCta({ className }: { className?: string }) {

  return (
    <Button
      variant="primary"
      className={className}
      // No destination yet — the prototype's CTA is `href="#"`, i.e. live
      // styling that goes nowhere. Deliberately not a 404.
      onClick={() => triggerHaptic("light")}
    >
      Request a stay
    </Button>
  );
}
