"use client";

/**
 * <Deck> — the single client boundary for the whole landing.
 * LenisProvider → DeckProvider → slides + chrome (+ dev HUD).
 */
import type { ReactNode } from "react";
import { LenisProvider } from "@/components/deck/lenis-provider";
import { DeckProvider } from "@/components/deck/deck-context";
import { ProgressRail, type DeckSlideDef } from "@/components/deck/chrome/progress-rail";
import { SlideCounter } from "@/components/deck/chrome/slide-counter";
import { DeckHud } from "@/components/deck/chrome/deck-hud";

export type { DeckSlideDef };

export function Deck({
  slides,
  children,
}: {
  slides: DeckSlideDef[];
  children: ReactNode;
}) {
  const hiddenAt = slides
    .map((s, i) => (s.hideChrome ? i : -1))
    .filter((i) => i >= 0);

  return (
    <LenisProvider>
      <DeckProvider>
        {children}
        <ProgressRail slides={slides} />
        <SlideCounter total={slides.length} hiddenAt={hiddenAt} />
        {process.env.NODE_ENV === "development" ? <DeckHud /> : null}
      </DeckProvider>
    </LenisProvider>
  );
}
