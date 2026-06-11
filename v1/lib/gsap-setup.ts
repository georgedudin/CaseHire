import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Register GSAP plugins at module-load on the client.
 * Putting this at module scope guarantees the plugin is available before
 * any child component's `useGSAP` effect runs — React mounts children
 * before parents, so a provider-mounted effect would race scenes.
 *
 * Server-side imports are inert (we guard on `window`).
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Lenis drives the ticker; disable lag smoothing so backgrounded tabs
  // don't desync the scroll timelines on return.
  gsap.ticker.lagSmoothing(0);
}

export { gsap, ScrollTrigger };
