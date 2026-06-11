"use client";

/**
 * Dev-only HUD for tuning the fixation contract (plan P1 gate; risk #2).
 * Polls controller.debug() on rAF — imperative, outside the snapshot.
 * Never rendered in production builds.
 */
import { useEffect, useRef } from "react";
import { useDeckController } from "@/components/deck/deck-context";

export function DeckHud() {
  const controller = useDeckController();
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const d = controller.debug();
      if (preRef.current) {
        preRef.current.textContent =
          `y ${d.y}  v ${d.velocity.toFixed(3)}\n` +
          `slide ${d.currentIndex + 1} · ${d.slideId}\n` +
          `status ${d.status}\n` +
          `entrance✓ ${d.entranceConsumed}  build✓ ${d.buildConsumed}\n` +
          `fixed ${d.fixed ?? "—"}  held ${d.fixHeldMs}ms\n` +
          `lock ${d.travelLock}  points ${d.points}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controller]);

  return (
    <pre
      ref={preRef}
      aria-hidden="true"
      className="fixed right-4 bottom-4 z-[100] rounded-lg border border-line-strong bg-fog/90 p-3 font-mono text-[11px] leading-relaxed text-mute"
    />
  );
}
