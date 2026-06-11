"use client";

/**
 * Right-edge progress rail (landing_v2.md §1.5) — one dot per slide,
 * current in flame, clickable (jump = frozen state, never replays).
 * Hidden on slide 5 (the black flash slide) via opacity.
 */
import { useDeckController, useDeckState } from "@/components/deck/deck-context";
import { cn } from "@/lib/cn";

export type DeckSlideDef = { id: string; title: string; hideChrome?: boolean };

export function ProgressRail({ slides }: { slides: DeckSlideDef[] }) {
  const controller = useDeckController();
  const { currentIndex } = useDeckState();
  const hidden = slides[currentIndex]?.hideChrome ?? false;

  return (
    <nav
      aria-label="Слайды"
      className={cn(
        "fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-2.5 transition-opacity duration-300 lg:flex",
        hidden && "pointer-events-none opacity-0",
      )}
    >
      {slides.map((s, i) => (
        <button
          key={s.id}
          type="button"
          aria-label={`Слайд ${i + 1}: ${s.title}`}
          aria-current={i === currentIndex ? "true" : undefined}
          onClick={() => controller.jumpTo(i)}
          className={cn(
            "size-2 rounded-full transition-colors duration-300",
            i === currentIndex ? "bg-flame" : "bg-line-strong hover:bg-dim",
          )}
        />
      ))}
    </nav>
  );
}
