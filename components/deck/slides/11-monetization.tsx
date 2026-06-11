"use client";

/**
 * Slide 11 — Монетизация · «Весы окупаемости» (landing_v2.md §4 slide 11 +
 * Director's cut; copy verbatim from ru_pitch_v2.md слайд 11).
 *
 * P3 MOTION. Director's cut readability staging is binding: tariff PRICES
 * render STATICALLY (price tags, not measurements) — the only two count-ups
 * are «$1–3» and «1,5 млн ₽»; zone D holds DORMANT at 40% opacity with the
 * beam LEVEL until the build.
 *
 * Entrance (≤3.8s):
 *   0.0  headline SplitText words rise (y16→0, expo.out, stagger 0.05);
 *        split reverted on settle (§6)
 *   0.4  tariff cards rise stagger 0.12 — prices already printed
 *   1.3  «Команда» feature beat: scale 1→1.04 back.out(1.4), flame ring
 *        DrawSVG, chip «основной» pop 0.8→1
 *   1.8  cost machine: track fade 0.2s; segments stack scaleX left→right
 *        (labels OUTSIDE the scaled bars); «$1–3» count-up finishes ≈2.9;
 *        margin readout 2.8–3.1
 *   3.2  zone D appears DORMANT (beam level, 40% opacity, no stamp)
 *   3.4  closing wink: flame strike-through DrawSVG across «за кресла» 0.4s
 * Build (one-shot ≤3.2s, midpoint gesture at lg / auto-chain <lg):
 *   0.0  zone D wakes to 1; «1,5 млн ₽» counts up 0.8s, pan label brightens
 *   0.5  beam −8° over 0.9s power3.inOut (quart) → settles to −7° (the 1°
 *        overshoot); pans counter-rotate mirror so text stays level
 *   1.45 STAMP «…окупает „Команду“ на 2,5 года» slams 1.4→1 power4.out
 *        with a 2px y-jolt on the zone (sanctioned slam, §2.3)
 *   1.9  SHRM line fades → done ≈2.3s
 * Idles: SETTLED — sheen across the «Команда» ring every ~6s, «$1–3»
 *   breathe 1↔0.85, beam ±0.3° waiting sway; BUILT — beam ±0.4° micro-sway
 *   around −7°, sheen + breathe continue.
 * Reduced motion: instant final TIPPED state (hook calls setFrozen("built")).
 *
 * Vertical budgets (zero internal scroll) — unchanged from the P2 audit:
 *   375×620 ≈ 554 ✓ · 1366×768 ≈ 574 ✓ · 1920×1080 with air.
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import type { SlideStage } from "@/components/deck/deck-controller";
import { PaybackScale } from "@/components/deck/parts/payback-scale";
import { addCountUp, countUpText } from "@/lib/motion/count-up";
import { breathe } from "@/lib/motion/idle";
import { cn } from "@/lib/cn";

type Tariff = {
  name: string;
  price: string;
  limits: string;
  featured?: boolean;
};

const TARIFFS: Tariff[] = [
  { name: "Пилот", price: "15 000 ₽", limits: "1 позиция · 100 кандидатов" },
  {
    name: "Команда",
    price: "49 000 ₽/мес",
    limits: "5 позиций · 1 000 кандидатов",
    featured: true,
  },
  {
    name: "Рост",
    price: "149 000 ₽/мес",
    limits: "20 позиций · 4 000 кандидатов + аналитика",
  },
  {
    name: "Энтерпрайз",
    price: "от 400 000 ₽/год",
    limits: "+ локальное развёртывание",
  },
];

const PAN_OPTS = {
  to: 1.5,
  duration: 0.8,
  decimals: 1,
  suffix: " млн ₽",
  ease: "power1.inOut",
};

export function Slide11Monetization() {
  const { ref } = useDeckSlide({
    id: "11-monetization",
    hasBuild: true,
    // <lg (no pin): the payback build auto-chains after entrance settles.
    autoChainMs: 1500,
    create: ({ root, reduced }) => {
      const lg = window.matchMedia("(min-width: 1024px)").matches;
      const one = (sel: string) => root.querySelector<HTMLElement>(sel);
      const all = (sel: string) =>
        Array.from(root.querySelectorAll<HTMLElement>(sel));

      /* ---- targets ---------------------------------------------------- */
      const headlineEl = one("[data-headline]")!;
      const strike = root.querySelector<SVGPathElement>("[data-strike] path")!;
      const cards = all("[data-card]");
      const featured = one('[data-card="Команда"]')!;
      const ringRect = root.querySelector<SVGRectElement>("[data-ring] rect");
      const chip = one("[data-chip]");
      const sheen = one("[data-sheen]");
      const track = one("[data-track]")!;
      const segs = all("[data-seg]");
      const segLabels = all("[data-seg-label]");
      const total = one("[data-total]")!;
      const margin = one("[data-margin]")!;
      const zoneD = one("[data-zone-d]")!;
      const beam = one("[data-beam]")!;
      const pans = all("[data-pan-left], [data-pan-right]");
      const panNum = one("[data-pan-num]");
      const panLabel = one("[data-pan-label]")!;
      const stamp = one("[data-stamp]")!;
      const shrm = one("[data-shrm]")!;

      const FEAT_SCALE = lg ? 1.04 : 1.02;

      // The flame ring's rect geometry comes from CSS calc() in JSX (SSR);
      // DrawSVG needs measurable attributes — pin them from the live card.
      if (ringRect) {
        const w = Math.max(featured.clientWidth - 1.5, 0);
        const h = Math.max(featured.clientHeight - 1.5, 0);
        ringRect.setAttribute("width", String(w));
        ringRect.setAttribute("height", String(h));
        ringRect.style.width = "";
        ringRect.style.height = "";
      }

      /* ---- SplitText (headline words; reverted post-settle, §6) -------- */
      let headlineSplit: SplitText | null = reduced
        ? null
        : SplitText.create(headlineEl, { type: "words" });
      const revertHeadlineSplit = () => {
        headlineSplit?.revert();
        headlineSplit = null;
      };

      const writeTotal = (v: number) => {
        const hi = Math.round(v);
        total.textContent = `$${Math.min(1, hi)}–${hi}`;
      };

      let stage: "settled" | "built" = "settled";

      /* ---- state setters ------------------------------------------------ */
      const setZoneCommon = () => {
        gsap.set(pans, { transformOrigin: "50% 0%" });
      };

      const setDormant = () => {
        stage = "settled";
        if (headlineSplit)
          gsap.set(headlineSplit.words, { autoAlpha: 0, y: 16 });
        gsap.set(strike, { drawSVG: "0%" });
        gsap.set(cards, { autoAlpha: 0, y: 24, scale: 1 });
        if (ringRect) gsap.set(ringRect, { drawSVG: "0%" });
        if (chip) gsap.set(chip, { autoAlpha: 0, scale: 0.8 });
        if (sheen) gsap.set(sheen, { xPercent: -160 });
        gsap.set(track, { autoAlpha: 0 });
        gsap.set(segs, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(segLabels, { autoAlpha: 0 });
        writeTotal(0);
        gsap.set(margin, { autoAlpha: 0 });
        setZoneCommon();
        gsap.set(zoneD, { autoAlpha: 0, y: 12 });
        gsap.set(beam, { rotation: 0 });
        gsap.set(pans, { rotation: 0 });
        if (panNum) panNum.textContent = countUpText(1.5, PAN_OPTS);
        gsap.set(panLabel, { clearProps: "color" });
        gsap.set(stamp, { autoAlpha: 0, scale: 1.4 });
        gsap.set(shrm, { autoAlpha: 0 });
      };

      const setFrozen = (s: SlideStage) => {
        stage = s === "built" ? "built" : "settled";
        revertHeadlineSplit(); // frozen frames use the whole h3
        gsap.set(strike, { drawSVG: "100%" });
        gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(featured, { scale: FEAT_SCALE });
        if (ringRect) gsap.set(ringRect, { drawSVG: "100%" });
        if (chip) gsap.set(chip, { autoAlpha: 1, scale: 1 });
        if (sheen) gsap.set(sheen, { xPercent: -160 });
        gsap.set(track, { autoAlpha: 1 });
        gsap.set(segs, { scaleX: 1, transformOrigin: "left center" });
        gsap.set(segLabels, { autoAlpha: 1 });
        writeTotal(3);
        gsap.set(margin, { autoAlpha: 1 });
        setZoneCommon();
        if (panNum) panNum.textContent = countUpText(1.5, PAN_OPTS);
        if (stage === "built") {
          gsap.set(zoneD, { autoAlpha: 1, y: 0 });
          gsap.set(beam, { rotation: -7 });
          gsap.set(pans, { rotation: 7 });
          gsap.set(panLabel, { color: "var(--color-paper)" });
          gsap.set(stamp, { autoAlpha: 1, scale: 1 });
          gsap.set(shrm, { autoAlpha: 1 });
        } else {
          // Director's cut: zone D dormant at 40%, beam LEVEL, no stamp.
          gsap.set(zoneD, { autoAlpha: 0.4, y: 0 });
          gsap.set(beam, { rotation: 0 });
          gsap.set(pans, { rotation: 0 });
          gsap.set(panLabel, { clearProps: "color" });
          gsap.set(stamp, { autoAlpha: 0, scale: 1.4 });
          gsap.set(shrm, { autoAlpha: 0 });
        }
      };

      if (reduced) {
        // Hook applies setFrozen("built") — the instant final tipped state.
        return { entrance: gsap.timeline({ paused: true }), setFrozen, setDormant };
      }

      /* ---- entrance (settle ≈3.8s) -------------------------------------- */
      const entrance = gsap.timeline({ paused: true });
      if (headlineSplit) {
        entrance.to(
          headlineSplit.words,
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.05 },
          0,
        );
      }
      entrance
        // Tariff cards — PRICES STATIC (no count-up, Director's cut).
        .to(
          cards,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.12 },
          0.4,
        )
        // «Команда» feature beat.
        .to(featured, { scale: FEAT_SCALE, duration: 0.6, ease: "back.out(1.4)" }, 1.3);
      if (ringRect)
        entrance.to(
          ringRect,
          { drawSVG: "100%", duration: 0.6, ease: "power2.inOut" },
          1.35,
        );
      if (chip)
        entrance.to(
          chip,
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
          1.7,
        );
      // Cost machine: track fade, segments stack left→right (labels outside).
      entrance.to(track, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 1.8);
      const segAt = [1.9, 2.15, 2.5];
      const segDur = [0.25, 0.35, 0.3];
      segs.forEach((seg, i) => {
        entrance.to(
          seg,
          { scaleX: 1, duration: segDur[i] ?? 0.3, ease: "power2.out" },
          segAt[i] ?? 1.9,
        );
        if (segLabels[i])
          entrance.to(
            segLabels[i],
            { autoAlpha: 1, duration: 0.25, ease: "power1.out" },
            (segAt[i] ?? 1.9) + 0.05,
          );
      });
      // «$1–3» — one of the slide's only two count-ups; finishes ≈2.9.
      const totalProxy = { v: 0 };
      entrance.to(
        totalProxy,
        {
          v: 3,
          duration: 1.0,
          ease: "power1.inOut",
          onUpdate: () => writeTotal(totalProxy.v),
        },
        1.9,
      );
      entrance
        .to(margin, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 2.8)
        // Zone D appears DORMANT: beam level, 40% opacity, numbers dim.
        .to(zoneD, { autoAlpha: 0.4, y: 0, duration: 0.5, ease: "power2.out" }, 3.2)
        // Closing wink: flame strike-through across «за кресла».
        .to(strike, { drawSVG: "100%", duration: 0.4, ease: "power2.inOut" }, 3.4)
        .call(() => {
          stage = "settled";
          revertHeadlineSplit();
        });

      /* ---- build: the scale tips (one-shot, done ≈2.3s ≤3.2) ------------ */
      const build = gsap.timeline({ paused: true });
      build
        .set(beam, { willChange: "transform" }, 0)
        // (a) zone D wakes; «1,5 млн ₽» counts up; pan label brightens.
        .to(zoneD, { autoAlpha: 1, duration: 0.4, ease: "power1.inOut" }, 0)
        .to(panLabel, { color: "var(--color-paper)", duration: 0.4 }, 0);
      addCountUp(build, 0, panNum, PAN_OPTS);
      build
        // (b) beam tips −8° (quart.inOut) and settles to −7° — the 1°
        // overshoot; pans counter-rotate in mirror so text stays level.
        .to(beam, { rotation: -8, duration: 0.9, ease: "power3.inOut" }, 0.5)
        .to(pans, { rotation: 8, duration: 0.9, ease: "power3.inOut" }, 0.5)
        .to(beam, { rotation: -7, duration: 0.3, ease: "power2.out" }, 1.4)
        .to(pans, { rotation: 7, duration: 0.3, ease: "power2.out" }, 1.4)
        // (c) the verdict STAMP (sanctioned slam, §2.3) + 2px y-jolt.
        .fromTo(
          stamp,
          { autoAlpha: 0, scale: 1.4 },
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power4.out" },
          1.45,
        )
        .to(
          zoneD,
          { keyframes: { y: [0, 2, 0] }, duration: 0.12, ease: "none" },
          1.55,
        )
        .to(shrm, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 1.9)
        .set(beam, { willChange: "auto" }, 2.3)
        .call(() => {
          stage = "built";
        });

      /* ---- idles --------------------------------------------------------- */
      const makeIdles = (): gsap.core.Animation[] => {
        const idles: gsap.core.Animation[] = [];
        if (sheen) {
          const sweep = gsap.timeline({ repeat: -1, repeatDelay: 4.8 }); // deck-contract: idle
          sweep.fromTo(
            sheen,
            { xPercent: -160 },
            { xPercent: 460, duration: 1.2, ease: "power2.inOut" },
          );
          idles.push(sweep);
        }
        idles.push(breathe(total, 1, 0.85, 2));
        idles.push(
          stage === "built"
            ? gsap.fromTo(
                beam,
                { rotation: -7.4 },
                {
                  rotation: -6.6,
                  duration: 2,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                },
              )
            : gsap.fromTo(
                beam,
                { rotation: -0.3 },
                {
                  rotation: 0.3,
                  duration: 1.5,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                },
              ),
        );
        return idles;
      };

      return { entrance, build, makeIdles, setFrozen, setDormant };
    },
  });

  return (
    <Slide
      ref={ref}
      id="11-monetization"
      hasBuild
      title="Монетизация"
      srSummary={
        <>
          Платят за завершённую сессию, не за кресла. Тарифы: Пилот 15 000 ₽
          (1 позиция, 100 кандидатов); Команда 49 000 ₽/мес — основной (5
          позиций, 1 000 кандидатов); Рост 149 000 ₽/мес (20 позиций, 4 000
          кандидатов + аналитика); Энтерпрайз от 400 000 ₽/год + локальное
          развёртывание. Себестоимость сессии $1–3: контейнер $0,15,
          ИИ-напарник $0,5–2, внешний канал и оценка — остальное. Маржа: ~70%
          на Пилоте, 75–85% на Энтерпрайзе. Один предотвращённый плохой найм
          (1,5 млн ₽ — замена, SHRM: 100% годовой зарплаты) окупает «Команду»
          (588 тыс ₽ в год) на 2,5 года.
        </>
      }
      className="py-6 lg:py-10"
    >
      {/* ---- Zone A: headline with flame strike-through on «за кресла» ---- */}
      <h3
        data-headline
        className="font-display mx-auto max-w-[28ch] text-center text-[length:var(--text-h2)] text-paper lg:text-[length:var(--text-h1)]"
      >
        Платят за завершённую сессию. Не{" "}
        <span className="relative inline-block whitespace-nowrap">
          за кресла.
          {/* Drawn by DrawSVG on the irony beat (~3.4s, the closing wink). */}
          <svg
            data-strike
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-[0.2em] w-full -translate-y-1/2 overflow-visible"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <path
              d="M0 6.5 L100 3.5"
              fill="none"
              stroke="var(--color-flame)"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </span>
      </h3>

      {/* ---- Zone B: tariff cards (mobile 2×2 at ~160px, desktop 4-up) ---- */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:mt-6 lg:grid-cols-4 lg:gap-4">
        {TARIFFS.map((t) => (
          <div
            key={t.name}
            data-card={t.name}
            className={cn(
              "relative rounded-2xl border bg-fog p-3 lg:p-5",
              t.featured
                ? "z-10 border-transparent lg:scale-[1.04]"
                : "border-line",
            )}
          >
            {t.featured ? (
              <>
                {/* Flame ring — SVG rect overlay (DrawSVG at the feature
                    beat; geometry attrs are pinned from the card at create). */}
                <svg
                  data-ring
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  {/* Geometry via CSS (SVG2) — calc() is invalid in attributes. */}
                  <rect
                    x="0.75"
                    y="0.75"
                    rx="15"
                    style={{
                      width: "calc(100% - 1.5px)",
                      height: "calc(100% - 1.5px)",
                    }}
                    fill="none"
                    stroke="var(--color-flame)"
                    strokeWidth="1.5"
                  />
                </svg>
                {/* Sheen — idle highlight translating across the ring ~6s. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                >
                  <span
                    data-sheen
                    className="absolute -inset-y-2 left-0 w-1/3 -translate-x-[160%] -skew-x-12 bg-gradient-to-r from-transparent via-paper/8 to-transparent"
                  />
                </span>
                <span
                  data-chip
                  className="absolute right-2 top-2 rounded-full bg-flame px-2 py-0.5 text-[10px] font-semibold text-ink lg:right-3 lg:top-3 lg:text-[11px]"
                >
                  основной
                </span>
              </>
            ) : null}
            <p
              className={cn(
                "text-[13px] tracking-tight lg:text-[15px]",
                t.featured ? "font-semibold text-paper" : "text-mute",
              )}
            >
              {t.name}
            </p>
            <p className="font-display mt-1 whitespace-nowrap text-[16px] font-semibold tabular-nums text-paper lg:mt-2 lg:text-[length:var(--text-lede)]">
              {t.price}
            </p>
            {/* Director's cut: limits visible only on «Команда»; others 50% dim. */}
            <p
              className={cn(
                "mt-1 text-[11px] leading-snug text-mute lg:mt-2 lg:text-[12px]",
                !t.featured && "opacity-50",
              )}
            >
              {t.limits}
            </p>
          </div>
        ))}
      </div>

      {/* ---- Zone C: cost machine ---- */}
      <div data-cost className="mt-4 lg:mt-6">
        <div className="flex items-end justify-between">
          <p className="text-[12px] text-mute lg:text-meta">
            Себестоимость сессии
          </p>
          <p
            data-total
            className="font-display whitespace-nowrap text-[20px] font-semibold tabular-nums text-flame lg:text-[length:var(--text-h2)]"
          >
            $1–3
          </p>
        </div>
        <div
          data-track
          className="mt-1.5 flex h-[18px] w-full overflow-hidden rounded-full border border-line bg-fog lg:mt-2 lg:h-[28px]"
        >
          {/* Segments stack via scaleX (origin left); labels live OUTSIDE. */}
          <div data-seg="container" className="h-full w-[8%] bg-sterile/70" />
          <div data-seg="buddy" className="h-full w-[56%] bg-glass/60" />
          <div data-seg="rest" className="h-full w-[36%] bg-mute/30" />
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-dim lg:mt-2 lg:text-[13px]">
          <span data-seg-label="container">контейнер $0,15</span>
          <span data-seg-label="buddy">ИИ-напарник $0,5–2</span>
          <span data-seg-label="rest">внешний канал и оценка — остальное</span>
        </div>
        <p
          data-margin
          className="mt-1 text-right text-[11px] text-mute lg:text-[13px]"
        >
          Маржа: ~70% на Пилоте, 75–85% на Энтерпрайзе
        </p>
      </div>

      {/* ---- Zone D: payback beam — dormant 40% until the build tips it ---- */}
      <PaybackScale className="mt-4 lg:mt-5" />
    </Slide>
  );
}
