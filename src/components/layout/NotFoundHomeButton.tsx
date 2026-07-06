"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/design-system/components";
import { triggerHaptic } from "@/lib/haptics";

export function NotFoundHomeButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => {
        triggerHaptic("light");
        router.push("/");
      }}
    >
      Return home
    </Button>
  );
}
