/**
 * Idle-loop helpers (landing_v2.md §2.5): subtle loops only — ≤0.15 opacity
 * amplitude or ≤4% scale. Created by a scene's makeIdles() factory; the
 * controller kills them on slide:leave / document.hidden.
 */
import { gsap } from "@/lib/gsap-setup";

/** Opacity breathe, e.g. breathe(el, 0.55, 0.8, 4). */
export function breathe(
  targets: gsap.TweenTarget,
  from: number,
  to: number,
  durationS = 4,
): gsap.core.Tween {
  gsap.set(targets, { opacity: from });
  return gsap.to(targets, {
    opacity: to,
    duration: durationS,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
}

/** Scale pulse loop with a hold between cycles, e.g. ember dots. */
export function pulse(
  targets: gsap.TweenTarget,
  scale = 1.04,
  durationS = 2.4,
  repeatDelayS = 0,
): gsap.core.Tween {
  return gsap.to(targets, {
    scale,
    duration: durationS,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    repeatDelay: repeatDelayS,
  });
}
