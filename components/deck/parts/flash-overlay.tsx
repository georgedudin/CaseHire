/**
 * FlashOverlay — slide 05's detonation flash (landing_v2.md §4, slide 05 +
 * Director's cut).
 *
 * One centered square, ~1.2× the viewport's max dimension (120vmax — half the
 * compositor memory of a full-bleed-at-2.4× layer), position ABSOLUTE within
 * the slide (never fixed; the .slide's `contain: paint` scene-contains it).
 * Centering is margin-based so GSAP owns the transform exclusively (scale
 * 0.3→2.4 during the flash, nothing else ever touches it).
 *
 * The radial gradient is pre-rendered (painted once): white-hot core well
 * under 60% of overlay area (WCAG 2.3.1 luminance cap, spec risk #1) → ember
 * → transparent. Only opacity + scale are tweened; `will-change` is applied
 * by the entrance timeline and cleared via clearProps after the flash.
 *
 * CSS default opacity-0 = frozen/no-JS/reduced render (motion-only element).
 */
export function FlashOverlay() {
  return (
    <div
      data-flash
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 opacity-0"
      style={{
        width: "120vmax",
        height: "120vmax",
        marginLeft: "-60vmax",
        marginTop: "-60vmax",
        background:
          "radial-gradient(circle closest-side, #ffffff 0%, #fff3e8 14%, var(--color-ember) 30%, rgba(255, 90, 31, 0.4) 48%, transparent 72%)",
      }}
    />
  );
}
