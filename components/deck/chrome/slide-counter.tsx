"use client";

/**
 * Bottom-left «01 / 13» counter (landing_v2.md §1.5).
 */
import { useDeckState } from "@/components/deck/deck-context";
import { cn } from "@/lib/cn";

export function SlideCounter({
  total,
  hiddenAt = [],
}: {
  total: number;
  hiddenAt?: number[];
}) {
  const { currentIndex } = useDeckState();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed bottom-5 left-5 z-50 font-mono text-meta tabular-nums text-dim transition-opacity duration-300",
        hiddenAt.includes(currentIndex) && "opacity-0",
      )}
    >
      {pad(currentIndex + 1)} / {pad(total)}
    </div>
  );
}
