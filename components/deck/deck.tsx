"use client";

/**
 * <Deck> — the single client boundary for the whole landing.
 * LenisProvider → DeckProvider → slides + chrome (+ dev HUD).
 */
import { useEffect, useState, type ReactNode } from "react";
import { LenisProvider } from "@/components/deck/lenis-provider";
import { cn } from "@/lib/cn";
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

  // SSR-rendered veil: slides stay hidden until every scene's setDormant has
  // run (their fonts.ready callbacks register before this effect's, so ours
  // resolves after theirs), killing the visible→hidden→entrance flash.
  // <noscript> in layout.tsx unhides for JS-less readers; 2s safety timeout.
  const [veiled, setVeiled] = useState(true);
  useEffect(() => {
    let done = false;
    const unveil = () => {
      if (!done) {
        done = true;
        setVeiled(false);
      }
    };
    const safety = setTimeout(unveil, 2000);
    document.fonts.ready.then(() => requestAnimationFrame(unveil));
    return () => {
      done = true; // unmount guard: never setState after teardown
      clearTimeout(safety);
    };
  }, []);

  return (
    <LenisProvider>
      <DeckProvider>
        <div className={cn(veiled && "deck-veil")}>{children}</div>
        <ProgressRail slides={slides} />
        <SlideCounter total={slides.length} hiddenAt={hiddenAt} />
        {process.env.NODE_ENV === "development" ? <DeckHud /> : null}
      </DeckProvider>
    </LenisProvider>
  );
}
