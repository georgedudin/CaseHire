/**
 * GSAP setup v2 — deck edition.
 *
 * Registered at MODULE LOAD (never inside an effect): children's `useGSAP`
 * callbacks run before parent effects, so effect-time registration races
 * scene timelines (v1 lesson).
 *
 * Deliberately NO ScrollTrigger: the v2 deck has exactly one scroll consumer
 * (DeckController). Nothing is scrubbed — every animation is a paused
 * timeline played on snap fixation. `scripts/check-deck-contract.mjs`
 * enforces the ban.
 *
 * All four plugins below are free in GSAP 3.15 (post-Webflow). Individual
 * import paths keep Turbopack tree-shaking effective — never `gsap/all`.
 */
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, DrawSVGPlugin, MotionPathPlugin, Flip);
  // Backgrounded tabs must not desync timelines when the pitch tab regains focus.
  gsap.ticker.lagSmoothing(0);
}

export { gsap, SplitText, DrawSVGPlugin, MotionPathPlugin, Flip };
