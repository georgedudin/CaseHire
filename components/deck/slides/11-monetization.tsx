"use client";

/**
 * Slide 11 — Монетизация · «Весы окупаемости» (landing_v2.md §4 slide 11 +
 * Director's cut; copy verbatim from ru_pitch_v2.md слайд 11).
 *
 * P2 STATIC SKELETON — renders the FROZEN POST-BUILD state:
 *   headline with the flame strike-through across «за кресла» · 4 tariff
 *   cards («Команда» featured: flame ring + chip «основной» + its limits;
 *   other cards name + price, limits at 50% dim — Director's cut
 *   readability staging) · cost track with 3 stacked segments + «$1–3» ·
 *   margin line · zone D beam TIPPED −7° with the «2,5 года» stamp and the
 *   SHRM line visible (PaybackScale).
 * P3 adds: entrance, «Команда» ring DrawSVG, segment scaleX stacking,
 *   the «$1–3» / «1,5 млн ₽» count-ups (the ONLY two count-ups — prices
 *   are static price tags per the cut), beam-tip build, sheen idle.
 *
 * Vertical budgets (zero internal scroll):
 *   375×620  — py-6 → 572 avail: headline ~60 + cards 2×2 (~212 at 160px
 *              width / ~100px tall) + cost ~90 + zone D ~156 (88px beam
 *              field) + gaps 36 ≈ 554 ✓
 *   1366×768 — py-8 lg:py-10 → 688 avail: headline ~60 (1 line at h1) +
 *              cards ~190 + cost ~100 + zone D ~176 + gaps 48 ≈ 574 ✓
 *   1920×1080 — same ladder with air.
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { PaybackScale } from "@/components/deck/parts/payback-scale";
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

export function Slide11Monetization() {
  const { ref } = useDeckSlide({
    id: "11-monetization",
    hasBuild: true,
    // <lg (no pin): the payback build auto-chains after entrance settles.
    autoChainMs: 1500,
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
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
      <h3 className="font-display mx-auto max-w-[28ch] text-center text-[length:var(--text-h2)] text-paper lg:text-[length:var(--text-h1)]">
        Платят за завершённую сессию. Не{" "}
        <span className="relative inline-block whitespace-nowrap">
          за кресла.
          {/* Static in P2; P3 draws it via DrawSVG on the irony beat. */}
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
                {/* Flame ring — SVG rect overlay (P3: DrawSVG draws it). */}
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
        <div className="mt-1.5 flex h-[18px] w-full overflow-hidden rounded-full border border-line bg-fog lg:mt-2 lg:h-[28px]">
          {/* P3: segments stack via scaleX (origin left); labels live OUTSIDE. */}
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

      {/* ---- Zone D: payback beam — frozen POST-BUILD (tipped + stamped) ---- */}
      <PaybackScale className="mt-4 lg:mt-5" />
    </Slide>
  );
}
