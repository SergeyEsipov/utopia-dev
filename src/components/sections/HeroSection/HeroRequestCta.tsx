"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/design-system/components";
import { triggerHaptic } from "@/lib/haptics";
import { NOT_FOUND_HREF } from "@/lib/routes";

/** Desktop hero "Request a stay" CTA — navigates like the dock/nav controls. */
export function HeroRequestCta({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      variant="primary"
      className={className}
      onClick={() => {
        triggerHaptic("light");
        router.push(NOT_FOUND_HREF);
      }}
    >
      Request a stay
    </Button>
  );
}
