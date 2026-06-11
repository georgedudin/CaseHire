/**
 * <FlareOverlay> — slide 08's full-bleed red detonation (landing_v2.md §4
 * slide 08, §2.4: the deck's ONLY full-screen red; red's first pixel).
 *
 * One pre-painted radial-gradient div, opacity-only (no blur, no filter,
 * no backdrop-filter — Intel-iGPU rule from the spec's risk list). Absolute
 * inset-0 resolves against the sticky `.slide` stage (slide-content is not
 * positioned), so the flare covers the full viewport frame while staying
 * scene-contained under `contain: paint`.
 *
 * The gradient center is parameterized via --flare-x / --flare-y so the
 * slide's create() can aim it at the measured chip-crossing point on the
 * boundary (gsap.set of CSS vars, never a repaint of the gradient itself).
 */
import { cn } from "@/lib/cn";

export function FlareOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-flare=""
      className={cn(
        "pointer-events-none absolute inset-0 z-30 opacity-0",
        className,
      )}
      style={{
        background:
          "radial-gradient(ellipse 75% 65% at var(--flare-x, 50%) var(--flare-y, 45%), rgba(239,68,68,0.95) 0%, rgba(239,68,68,0.4) 32%, rgba(239,68,68,0.12) 55%, transparent 78%)",
      }}
    />
  );
}
