"use client";

/**
 * Slide 02 — Боль: рынок обвалился · «Выжженное поле» (landing_v2.md §4, slide 02).
 *
 * P2 static skeleton: POST-burn frozen state — 40 intact fog tiles, 60 charred
 * husks (scaleY 0.05 from bottom, ±tilt, opacity 0.12), counters printed at
 * final values. Burn set is a deterministic seeded shuffle (mulberry32, seed
 * 20260611), hardcoded — zero runtime randomness, zero hydration mismatch.
 * Motion hooks: data-tile / data-burned / data-stat / data-line / data-field.
 *
 * Vertical budget:
 *   375×620 : py-5 (40) + eyebrow+headline ~110 + 16 + field 236 (10×20px
 *             tiles, 4px gap — spec ladder step-down) + 16 + stats 2-col ~120
 *             + 16 + closer ~48 ≈ 586 → fits (slide flex-centers the rest).
 *   1366×768: py-8 (64) + header ~96 + 24 + max(field 394 (34px tiles, 6px
 *             gap), stats column) + 24 + closer ~32 ≈ 634 → fits. (py-10
 *             audited 4px over at exactly 768 once the slide-shell padding
 *             override bug was fixed — lg stays at the deck-default 32px.)
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";

/** Deterministic burn set: seeded Fisher–Yates over 0–99, first 60, sorted. */
const BURNED_INDICES = [
  0, 1, 2, 6, 12, 14, 15, 17, 22, 24, 25, 26, 27, 28, 29,
  30, 34, 35, 36, 37, 38, 40, 42, 43, 45, 46, 47, 48, 51, 54,
  55, 56, 57, 58, 59, 63, 66, 68, 69, 73, 74, 75, 76, 77, 79,
  80, 82, 83, 84, 85, 88, 89, 91, 92, 93, 94, 96, 97, 98, 99,
] as const;

const BURNED = new Set<number>(BURNED_INDICES);

/** Deterministic husk tilt: alternates within ±4° based on index. */
const huskTilt = (i: number) => ((i % 9) - 4) * 1;

const TILES = Array.from({ length: 100 }, (_, i) => i);

export function Slide02Pain() {
  const { ref } = useDeckSlide({
    id: "02-pain",
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="02-pain"
      title="Боль: что не так с джунами в 2026"
      srSummary="Вакансий начального уровня — минус 60% с 2022 года (IEEE Spectrum). Доля выпускников в найме крупных технокомпаний — 7%, минус 25% за год (SignalFire 2025). Безработица среди свежих выпускников: плюс 30% с осени 2022."
      className="py-3 lg:py-8"
    >
      <div data-line>
        <p className="text-[length:var(--text-meta)] uppercase tracking-[0.32em] text-mute">
          02 · Боль
        </p>
        <h3 className="font-display mt-2 text-[length:var(--text-h1)] text-paper lg:mt-3 lg:text-[length:var(--text-display)]">
          Что не так с джунами в 2026?
        </h3>
      </div>

      <div className="mt-3 grid gap-x-16 gap-y-3 lg:mt-6 lg:grid-cols-[minmax(380px,1fr)_minmax(340px,420px)] lg:items-center">
        {/* THE FIELD — 10×10, post-burn. Decorative; stats live in srSummary. */}
        <div
          data-field
          aria-hidden="true"
          className="mx-auto grid w-[216px] grid-cols-10 gap-1 lg:mx-0 lg:w-[394px] lg:gap-1.5 xl:w-[494px]"
        >
          {TILES.map((i) =>
            BURNED.has(i) ? (
              <div
                key={i}
                data-tile={i}
                data-burned
                className="aspect-square rounded-[4px] bg-line opacity-[0.12]"
                style={{
                  transform: `scaleY(0.05) rotate(${huskTilt(i)}deg)`,
                  transformOrigin: "bottom",
                }}
              />
            ) : (
              <div
                key={i}
                data-tile={i}
                className="flex aspect-square flex-col justify-center gap-[3px] rounded-[4px] border border-line bg-fog px-[4px] lg:gap-1 lg:px-[6px]"
              >
                <span className="hidden h-[2px] w-full rounded-full bg-line-strong sm:block" />
                <span className="hidden h-[2px] w-3/4 rounded-full bg-line-strong sm:block" />
                <span className="hidden h-[2px] w-1/2 rounded-full bg-line-strong sm:block" />
              </div>
            ),
          )}
        </div>

        {/* STATS — final values printed. */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-1 lg:gap-10">
          <div>
            <p
              data-stat="vacancies"
              className="font-display text-[length:var(--text-display)] tabular-nums leading-none text-flame lg:text-[length:var(--text-hero)]"
            >
              −60%
            </p>
            <p className="mt-2 text-[length:var(--text-body)] leading-snug text-mute lg:text-[length:var(--text-lede)]">
              вакансий начального уровня с 2022 года ·{" "}
              <span className="text-dim">IEEE Spectrum</span>
            </p>
          </div>
          <div>
            <p
              data-stat="graduates"
              className="font-display text-[length:var(--text-display)] tabular-nums leading-none text-paper lg:text-[length:var(--text-hero)]"
            >
              7%
            </p>
            <p className="mt-2 text-[length:var(--text-body)] leading-snug text-mute lg:text-[length:var(--text-lede)]">
              доля выпускников в найме крупных технокомпаний, −25% за год ·{" "}
              <span className="text-dim">SignalFire 2025</span>
            </p>
          </div>
        </div>
      </div>

      <p
        data-line
        data-closer
        className="mt-3 text-[length:var(--text-body)] text-paper lg:mt-6 lg:text-[length:var(--text-lede)]"
      >
        Безработица среди свежих выпускников:{" "}
        <strong data-stat="unemployment" className="tabular-nums">
          +30%
        </strong>{" "}
        с осени 2022.
      </p>
    </Slide>
  );
}
