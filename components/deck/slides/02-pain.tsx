"use client";

/**
 * Slide 02 — Боль: рынок обвалился · «Выжженное поле» (landing_v2.md §4,
 * slide 02 + Director's cut).
 *
 * P3 motion (no build step). Entrance — paused master tl, played by the
 * controller on fixation; readable settle ≈3.8s:
 *   0.0  eyebrow + headline rise (0.5s expo.out)
 *   0.3  100 tiles materialize — scale 0.9→1, autoAlpha, stagger
 *        {grid:[10,10], from:"start", amount:0.6} — one beat of a HEALTHY
 *        market before the collapse
 *   1.0  «−60%» stat block fades in (counter parked at «−0%»)
 *   1.2  THE BURN — solemn ~1.9s diagonal wave (Director's cut: a funeral,
 *        not fireworks). Per-tile delays precomputed as (row+col)·k + jitter
 *        over the 60 hardcoded burn indices (cut option B — survivors are
 *        simply never scheduled). Per tile: ember-overlay flash 0.09s →
 *        collapse scaleY→0.05 ±4° tilt (0.24s power3.in, origin bottom) →
 *        ONE ash mote drift (pooled spans, exactly 1 per tile). «−60%»
 *        counts −0→−60 in LOCKSTEP: ease:none spanning exactly the burn
 *        window, on the same timeline — they cannot drift.
 *   2.9  «7%» block fades in, counts 0→7
 *   3.3  closer reveals; «+30%» quick-ticks over 0.4s
 *
 * Idles (§2.5, killed on leave): every ~4s one random husk exhales a single
 * mote (the spawned tween is killed via killTweensOf in setFrozen, so leave
 * can never strand a drifting particle); «−60%» numeral breathes opacity
 * 1↔0.92 on a 5s sine loop.
 *
 * Perf: profile target = Intel iGPU at 1920 (mid-wave concurrency is
 * ~60–90 active transform/opacity tweens — the agent spec's "~12" claim was
 * wrong, see the cut). Fallback ladder if it drops frames: demote the ember
 * flash from a 0.09s opacity tween to an instant class toggle. Transforms /
 * opacity only; will-change on the 100 tiles is windowed to the entrance
 * and cleared in setFrozen.
 *
 * Frozen = the scorched static render (40 lit / 60 husks, counters final).
 * Dormant = tiles α0 @ scale .9, counters «−0%»/«0%», headline hidden.
 * Reduced motion: hooks are no-ops — the SSR markup IS the final frame.
 *
 * Vertical budget:
 *   375×620 : py-5 (40) + eyebrow+headline ~110 + 16 + field 236 (10×20px
 *             tiles, 4px gap — spec ladder step-down) + 16 + stats 2-col ~120
 *             + 16 + closer ~48 ≈ 586 → fits (slide flex-centers the rest).
 *   1366×768: py-8 (64) + header ~96 + 24 + max(field 394 (34px tiles, 6px
 *             gap), stats column) + 24 + closer ~32 ≈ 634 → fits.
 */
import { gsap } from "@/lib/gsap-setup";
import { addCountUp, countUpText } from "@/lib/motion/count-up";
import { breathe } from "@/lib/motion/idle";
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

/* Burn-wave constants: diagonal front (row+col)·k + deterministic jitter.
 * Max delay ≈ 18·0.095 + 0.12 ≈ 1.83s → wave spread ≈1.9s (solemn). */
const BURN_T = 1.2;
const BURN_K = 0.095;
const burnJitter = (i: number) => (((i * 7) % 13) / 13) * 0.12;

/** Deterministic mote drift offsets. */
const moteDx = (i: number) => ((i % 5) - 2) * 4;
const moteDy = (i: number) => -22 - (i % 3) * 4;

export function Slide02Pain() {
  const { ref } = useDeckSlide({
    id: "02-pain",
    create: ({ root, reduced }) => {
      if (reduced) {
        // Static deck: the SSR markup already IS the final reduced frame
        // (scorched field, counters printed). Hooks are no-ops.
        return {
          entrance: gsap.timeline({ paused: true }),
          setFrozen: () => {},
          setDormant: () => {},
        };
      }

      const header = root.querySelector<HTMLElement>("[data-header]")!;
      const closer = root.querySelector<HTMLElement>("[data-closer]")!;
      const tiles = Array.from(
        root.querySelectorAll<HTMLElement>("[data-tile]"),
      );
      const burnedEls = tiles.filter((t) => t.hasAttribute("data-burned"));
      const survivorEls = tiles.filter((t) => !t.hasAttribute("data-burned"));
      const embers = Array.from(
        root.querySelectorAll<HTMLElement>("[data-ember]"),
      );
      const motes = Array.from(
        root.querySelectorAll<HTMLElement>("[data-mote]"),
      );
      const statVac = root.querySelector<HTMLElement>('[data-stat="vacancies"]')!;
      const statGrad = root.querySelector<HTMLElement>('[data-stat="graduates"]')!;
      const statUnemp = root.querySelector<HTMLElement>(
        '[data-stat="unemployment"]',
      )!;
      const statBlocks = Array.from(
        root.querySelectorAll<HTMLElement>("[data-stat-block]"),
      );
      const [vacBlock, gradBlock] = statBlocks;

      const tileIndex = (el: HTMLElement) => Number(el.dataset.tile);

      const setDormant = () => {
        gsap.set([header, closer], { autoAlpha: 0, y: 24 });
        gsap.set(statBlocks, { autoAlpha: 0, y: 16 });
        gsap.set(tiles, {
          autoAlpha: 0,
          scaleX: 0.9,
          scaleY: 0.9,
          rotation: 0,
          transformOrigin: "50% 50%",
        });
        gsap.set(embers, { autoAlpha: 0 });
        gsap.set(motes, { autoAlpha: 0, x: 0, y: 0 });
        statVac.textContent = countUpText(-0, { suffix: "%" }); // «−0%»
        statGrad.textContent = countUpText(0, { suffix: "%" });
        statUnemp.textContent = countUpText(0, { prefix: "+", suffix: "%" });
      };

      const setFrozen = () => {
        // Stray idle mote tween / numeral breathe must never outlive a leave.
        gsap.killTweensOf([...motes, ...tiles, ...embers, statVac]);
        gsap.set([header, closer], { autoAlpha: 1, y: 0 });
        gsap.set(statBlocks, { autoAlpha: 1, y: 0 });
        gsap.set(survivorEls, {
          autoAlpha: 1,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          willChange: "auto",
        });
        gsap.set(burnedEls, {
          autoAlpha: 0.12,
          scaleX: 1,
          scaleY: 0.05,
          transformOrigin: "50% 100%",
          rotation: (_i: number, el: Element) =>
            huskTilt(tileIndex(el as HTMLElement)),
          willChange: "auto",
        });
        gsap.set(embers, { autoAlpha: 0 });
        gsap.set(motes, { autoAlpha: 0, x: 0, y: 0 });
        gsap.set(statVac, { opacity: 1 });
        statVac.textContent = countUpText(-60, { suffix: "%" });
        statGrad.textContent = countUpText(7, { suffix: "%" });
        statUnemp.textContent = countUpText(30, { prefix: "+", suffix: "%" });
      };

      /* ----------------------------------------------------------------
       * Entrance
       * ---------------------------------------------------------------- */
      const entrance = gsap.timeline({ paused: true });
      entrance
        .set(tiles, { willChange: "transform, opacity" }, 0)
        .to(header, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0)
        // one beat of a healthy market — all 100 tiles, grid wave
        .to(
          tiles,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
            stagger: { grid: [10, 10], from: "start", amount: 0.6 },
          },
          0.3,
        )
        .to(vacBlock, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 1.0);

      // THE BURN — precomputed per-tile offsets over the 60 burn indices.
      let burnEnd = BURN_T;
      for (const el of burnedEls) {
        const i = tileIndex(el);
        const row = Math.floor(i / 10);
        const col = i % 10;
        const t = BURN_T + (row + col) * BURN_K + burnJitter(i);
        const ember = el.querySelector<HTMLElement>("[data-ember]")!;
        const mote = el.parentElement!.querySelector<HTMLElement>("[data-mote]")!;
        entrance
          .to(ember, { autoAlpha: 1, duration: 0.09, ease: "power1.in" }, t)
          .to(ember, { autoAlpha: 0, duration: 0.12, ease: "power1.out" }, t + 0.09)
          .to(
            el,
            {
              scaleY: 0.05,
              rotation: huskTilt(i),
              autoAlpha: 0.12,
              transformOrigin: "50% 100%",
              duration: 0.24,
              ease: "power3.in",
            },
            t + 0.07,
          )
          .fromTo(
            mote,
            { autoAlpha: 0.7, x: 0, y: 0 },
            {
              autoAlpha: 0,
              x: moteDx(i),
              y: moteDy(i),
              duration: 0.5,
              ease: "power1.out",
            },
            t + 0.16,
          );
        burnEnd = Math.max(burnEnd, t + 0.31);
      }
      // «−60%» in lockstep: ease none over exactly the burn window.
      addCountUp(entrance, BURN_T, statVac, {
        to: -60,
        from: -0,
        duration: burnEnd - BURN_T,
        ease: "none",
        suffix: "%",
      });

      entrance.to(
        gradBlock,
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
        2.9,
      );
      addCountUp(entrance, 2.9, statGrad, {
        to: 7,
        duration: 0.7,
        ease: "power1.out",
        suffix: "%",
      });
      entrance.to(
        closer,
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
        3.3,
      );
      addCountUp(entrance, 3.35, statUnemp, {
        to: 30,
        duration: 0.4,
        ease: "power1.out",
        prefix: "+",
        suffix: "%",
      });

      /* ----------------------------------------------------------------
       * Idles — one exhaling husk every ~4s + numeral breathe.
       * ---------------------------------------------------------------- */
      const makeIdles = () => {
        const exhale = gsap.timeline({ repeat: -1, repeatDelay: 3.5 }); // deck-contract: idle
        exhale
          .call(() => {
            const j = Math.floor(Math.random() * motes.length);
            gsap.fromTo(
              motes[j],
              { autoAlpha: 0.6, x: 0, y: 0 },
              {
                autoAlpha: 0,
                x: moteDx(j),
                y: -20,
                duration: 0.5,
                ease: "power1.out",
                overwrite: "auto",
              },
            );
          })
          .to({}, { duration: 0.5 }, 0); // pad: cycle ≈ 4.0s
        return [exhale, breathe(statVac, 1, 0.92, 5)];
      };

      return { entrance, makeIdles, setFrozen, setDormant };
    },
  });

  return (
    <Slide
      ref={ref}
      id="02-pain"
      title="Боль: что не так с джунами в 2026"
      srSummary="Вакансий начального уровня — минус 60% с 2022 года (IEEE Spectrum). Доля выпускников в найме крупных технокомпаний — 7%, минус 25% за год (SignalFire 2025). Безработица среди свежих выпускников: плюс 30% с осени 2022."
      className="py-3 lg:py-8"
    >
      <div data-header>
        <p className="text-[length:var(--text-meta)] uppercase tracking-[0.32em] text-mute">
          02 · Боль
        </p>
        <h3 className="font-display mt-2 text-[length:var(--text-h1)] text-paper lg:mt-3 lg:text-[length:var(--text-display)]">
          Что не так с джунами в 2026?
        </h3>
      </div>

      <div className="mt-3 grid gap-x-16 gap-y-3 lg:mt-6 lg:grid-cols-[minmax(380px,1fr)_minmax(340px,420px)] lg:items-center">
        {/* THE FIELD — 10×10, SSR'd post-burn. Decorative; stats live in
            srSummary. Burned cells share the healthy tile structure (the
            entrance shows one beat of a healthy market) inside a relative
            wrapper that hosts the ember overlay (flash) + ash mote (drift). */}
        <div
          data-field
          aria-hidden="true"
          className="mx-auto grid w-[216px] grid-cols-10 gap-1 lg:mx-0 lg:w-[394px] lg:gap-1.5 xl:w-[494px]"
        >
          {TILES.map((i) =>
            BURNED.has(i) ? (
              <div key={i} className="relative aspect-square">
                <div
                  data-tile={i}
                  data-burned
                  className="absolute inset-0 flex flex-col justify-center gap-[3px] rounded-[4px] border border-line bg-fog px-[4px] lg:gap-1 lg:px-[6px]"
                  style={{
                    transform: `scaleY(0.05) rotate(${huskTilt(i)}deg)`,
                    transformOrigin: "50% 100%",
                    opacity: 0.12,
                  }}
                >
                  <span className="hidden h-[2px] w-full rounded-full bg-line-strong sm:block" />
                  <span className="hidden h-[2px] w-3/4 rounded-full bg-line-strong sm:block" />
                  <span className="hidden h-[2px] w-1/2 rounded-full bg-line-strong sm:block" />
                  <span
                    data-ember
                    className="absolute inset-0 rounded-[4px] opacity-0"
                    style={{
                      background:
                        "linear-gradient(180deg, var(--color-ember), var(--color-flame))",
                    }}
                  />
                </div>
                <span
                  data-mote
                  className="absolute left-1/2 top-[55%] h-[2px] w-[2px] rounded-full bg-ember opacity-0"
                />
              </div>
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

        {/* STATS — SSR'd at final values; counters are textContent-driven. */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-1 lg:gap-10">
          <div data-stat-block="vacancies">
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
          <div data-stat-block="graduates">
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
