"use client";

/**
 * Slide 04 — Глубинные интервью · «Единогласие — 16 голосов»
 * (landing_v2.md §4, slide 04 + Director's cut).
 *
 * P2 static skeleton: full verdict wall — 16-dot master ledger (8 HR sterile +
 * 8 candidate ember), three quote cards with pips at final fill (6/8 and 5/8
 * with visible dark gaps; 8/8 all-flame + flame ring), the two strips, kicker.
 * Quote reveal is masked line-rise in P3 (typing banned here, §2.3).
 *
 * Motion hooks: data-headline · data-subtitle · data-ledger · data-dot ·
 * data-card · data-fraction · data-pip · data-ring · data-strip · data-kicker.
 *
 * Vertical budget:
 *   375×620 : py-4 (32) + headline 2×~28 + 4 + subtitle ~20 (meta size <sm) +
 *             8 + ledger ~44 + 8 + cards 3×~84 + 16 gaps + 8 + strips ~100 +
 *             8 + kicker ~28 ≈ 580 → fits 620.
 *   1366×768: py-10 (80) + headline ~56 + subtitle ~24 + ledger ~44 + cards
 *             row ~230 + strips ~48 + kicker ~40 + gaps ~70 ≈ 592 → fits.
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";

const PIPS = [0, 1, 2, 3, 4, 5, 6, 7];

const CARDS = [
  {
    key: "resumes",
    role: "HR",
    filled: 6,
    pipClass: "bg-sterile",
    quote: "Все резюме одинаковые. Я не могу отфильтровать никого до собеса.",
  },
  {
    key: "takehomes",
    role: "HR",
    filled: 5,
    pipClass: "bg-sterile",
    quote: "Домашние тестовые обесценились. ChatGPT решает за кандидата.",
  },
  {
    key: "silence",
    role: "Кандидат",
    filled: 8,
    pipClass: "bg-flame",
    quote: "После отказа — просто тишина. Месяц молчания.",
  },
] as const;

export function Slide04Interviews() {
  const { ref } = useDeckSlide({
    id: "04-interviews",
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="04-interviews"
      title="Глубинные интервью: 16 голосов, одна боль"
      srSummary="16 интервью: 8 нанимающих менеджеров + 8 кандидатов-джунов. 6 из 8 HR: все резюме одинаковые, не могу отфильтровать никого до собеса. 5 из 8 HR: домашние тестовые обесценились, ChatGPT решает за кандидата. 8 из 8 кандидатов: после отказа — просто тишина, месяц молчания. 7 из 8 HR: хотим предфильтр до часа собеседования. 7 из 8 кандидатов: короткие практические задачи — честный формат. Одна боль. Две стороны."
      className="py-2 lg:py-10"
    >
      <div className="text-center">
        <h3
          data-headline
          className="font-display text-[20px] text-paper sm:text-[length:var(--text-h2)] lg:text-[length:var(--text-h1)]"
        >
          16 интервью. Услышали одно и то же.
        </h3>
        <p
          data-subtitle
          className="mt-0.5 text-[length:var(--text-meta)] text-mute sm:mt-1 sm:text-[length:var(--text-lede)] lg:mt-3"
        >
          8 нанимающих менеджеров + 8 кандидатов-джунов
        </p>

        {/* Master ledger — 16 dots in two groups of 8. */}
        <div
          data-ledger
          aria-hidden="true"
          className="mt-1.5 flex items-start justify-center gap-7 sm:mt-2 lg:mt-4"
        >
          <div>
            <div className="flex gap-2">
              {PIPS.map((i) => (
                <span
                  key={i}
                  data-dot={i}
                  className="h-2 w-2 rounded-full bg-sterile lg:h-2.5 lg:w-2.5"
                />
              ))}
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-dim lg:mt-1.5 lg:text-[length:var(--text-meta)]">
              HR
            </p>
          </div>
          <div>
            <div className="flex gap-2">
              {PIPS.map((i) => (
                <span
                  key={i}
                  data-dot={i + 8}
                  className="h-2 w-2 rounded-full bg-ember lg:h-2.5 lg:w-2.5"
                />
              ))}
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-dim lg:mt-1.5 lg:text-[length:var(--text-meta)]">
              Кандидат
            </p>
          </div>
        </div>
      </div>

      {/* Quote cards — horizontal rows <lg, three columns at lg. */}
      <div className="mt-1.5 grid gap-1.5 sm:mt-2 lg:mt-6 lg:grid-cols-3 lg:gap-6">
        {CARDS.map((card, n) => (
          <div
            key={card.key}
            data-card={n + 1}
            className="relative flex items-center gap-4 rounded-2xl border border-line bg-fog p-2 sm:p-2.5 lg:block lg:p-6"
          >
            {n === 2 ? (
              /* Flame ring — 8/8 unanimity (idle breathe in P3). */
              <svg
                data-ring
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                <rect
                  x="1"
                  y="1"
                  rx="15"
                  pathLength={100}
                  fill="none"
                  stroke="var(--color-flame)"
                  strokeWidth="1.5"
                  style={{
                    width: "calc(100% - 2px)",
                    height: "calc(100% - 2px)",
                  }}
                />
              </svg>
            ) : null}

            <div className="w-[96px] shrink-0 lg:w-auto">
              <p
                data-fraction
                className="font-display text-[clamp(2rem,3vw,3.5rem)] tabular-nums leading-none text-paper"
              >
                {card.filled}
                <span className="text-[0.5em] text-dim">/8</span>
              </p>
              <div className="mt-1.5 flex gap-1 lg:mt-2 lg:gap-1.5">
                {PIPS.map((i) => (
                  <span
                    key={i}
                    data-pip={i}
                    className={`h-2 w-2 rounded-[2px] ${
                      i < card.filled ? card.pipClass : "bg-line"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="lg:mt-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-dim lg:text-[length:var(--text-meta)]">
                {card.role}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-mute lg:mt-1 lg:text-[length:var(--text-body)]">
                «{card.quote}»
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* The two strips, divided. */}
      <div className="mt-1.5 flex flex-col items-center gap-1.5 sm:mt-2 lg:mt-6 lg:flex-row lg:justify-center lg:gap-5">
        <p
          data-strip="hr"
          className="rounded-full border border-line px-3 py-0.5 text-center text-[13px] text-mute sm:py-1 lg:px-4 lg:py-1.5 lg:text-[length:var(--text-body)]"
        >
          7 из 8 HR: хотим предфильтр до часа собеседования
        </p>
        <span
          aria-hidden="true"
          className="h-px w-6 bg-line-strong lg:h-10 lg:w-px"
        />
        <p
          data-strip="candidates"
          className="rounded-full border border-line px-3 py-0.5 text-center text-[13px] text-mute sm:py-1 lg:px-4 lg:py-1.5 lg:text-[length:var(--text-body)]"
        >
          7 из 8 кандидатов: короткие практические задачи — честный формат
        </p>
      </div>

      {/* Kicker */}
      <p
        data-kicker
        className="font-display mt-1.5 text-center text-[20px] sm:mt-2 sm:text-[length:var(--text-h2)] lg:mt-6"
      >
        <span className="text-paper">Одна боль.</span>{" "}
        <span className="text-ember">Две стороны.</span>
      </p>
    </Slide>
  );
}
