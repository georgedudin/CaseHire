"use client";

import { LenisProvider } from "@/components/scroll/lenis-provider";
import { KeyboardNav } from "@/components/scroll/keyboard-nav";
import { Scene01Hero } from "@/components/scenes/01-hero";
import { Scene02Pain } from "@/components/scenes/02-pain";
import { Scene03Interviews } from "@/components/scenes/03-interviews";
import { Scene04Reveal } from "@/components/scenes/04-reveal";
import { Scene05HowItWorks } from "@/components/scenes/05-how-it-works";
import { Scene06DataTrap } from "@/components/scenes/06-data-trap";
import { Scene07WhoFills } from "@/components/scenes/07-who-fills";
import { Scene08Market } from "@/components/scenes/08-market";
import { Scene09Roadmap } from "@/components/scenes/09-roadmap";

/**
 * The 9-scene scroll narrative, top to bottom.
 * Order matches ru_pitch.md slides 1 → 9 (the pitch IS the deck).
 */
export function LandingScenes() {
  return (
    <LenisProvider>
      <KeyboardNav />
      <Scene01Hero />
      <Scene02Pain />
      <Scene03Interviews />
      <Scene04Reveal />
      <Scene05HowItWorks />
      <Scene06DataTrap />
      <Scene07WhoFills />
      <Scene08Market />
      <Scene09Roadmap />
    </LenisProvider>
  );
}
