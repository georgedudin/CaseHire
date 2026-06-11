/**
 * addCountUp — the v2 replacement for v1's useCountUp (landing_v2.md §2.2).
 *
 * Creates the proxy tween INSIDE the scene's paused master timeline, so the
 * controller's fixation gate owns playback. No ScrollTrigger, no detached
 * paused-tween footgun. The element's JSX should server-render the initial
 * value; the slide's setFrozen writes the final formatted string.
 */
import { gsap } from "@/lib/gsap-setup";
import { ruNumber } from "@/lib/format";

export type CountUpOpts = {
  to: number;
  from?: number;
  duration?: number;
  ease?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

export function countUpText(
  value: number,
  opts: Partial<CountUpOpts> = {},
): string {
  const { decimals = 0, prefix = "", suffix = "" } = opts;
  // CLDR ru uses ASCII hyphen-minus; the deck's static copy uses the
  // typographic U+2212 «−» — normalize so counters land glyph-identical
  // to their SSR'd finals.
  const formatted = ruNumber(decimals).format(value).replace(/-/g, "−");
  return `${prefix}${formatted}${suffix}`;
}

export function addCountUp(
  tl: gsap.core.Timeline,
  position: gsap.Position,
  el: Element | null | undefined,
  opts: CountUpOpts,
): gsap.core.Timeline {
  if (!el) return tl;
  const { to, from = 0, duration = 1.8, ease = "expo.out" } = opts;
  const proxy = { v: from };
  tl.to(
    proxy,
    {
      v: to,
      duration,
      ease,
      onUpdate: () => {
        el.textContent = countUpText(proxy.v, opts);
      },
    },
    position,
  );
  return tl;
}
