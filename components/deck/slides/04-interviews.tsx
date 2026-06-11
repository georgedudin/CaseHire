"use client";

/**
 * Slide 04 — Глубинные интервью · «Единогласие — 16 голосов»
 * (landing_v2.md §4, slide 04 + Director's cut).
 *
 * P3 motion (no build step). Entrance — paused master tl, settles ≈3.6s:
 *   0.0   headline SplitText LINES masked rise (yPercent 110→0)
 *   0.25  subtitle fades · 16 ledger dots pop (scale 0→1, back.out(1.7),
 *         stagger 0.02) — "16 people arrive"
 *   0.7+  cards rise (y 28→0, power3.out, stagger 0.4); per card 0.15s in:
 *         numerator counts (textContent, snapped int, ease:none) SYNCED
 *         pip-by-pip with pip fills flipping dark→sterile (opacity overlay,
 *         stagger 0.1); quotes reveal as MASKED LINE-RISES (SplitText lines,
 *         yPercent 110→0, ~0.4s — char typing is BANNED here, §2.3)
 *   1.9   card 3 — pips flip to flame WITH scale pops (back.out(2)),
 *         numerator 0→8
 *   2.5   flame ring draws (pathLength-normalized dashoffset 100→0) while
 *         the 8 candidate ledger dots pulse flame once
 *   2.7   strips slide in (x ∓40) · divider scales in
 *   3.1   kicker halves meet at the divider axis
 *
 * Idles (killed on leave): card-3 ring breathes stroke-opacity 0.55↔0.95
 * (3s — THE sanctioned breathing ring, §2.5: slides 4 & 13 only); ledger
 * "listening" cursor — dots rest at 0.85 opacity and one at a time rises to
 * 1 (+4% scale), advancing every 0.9s.
 *
 * Frozen = the verdict wall (numerators 6/5/8, pips lit, ring drawn, strips
 * + kicker in place). Dormant = numerators «0», pips dark, ring undrawn,
 * everything hidden. Reduced motion: hooks are no-ops — the SSR markup IS
 * the final frame. Entrance-only splits are reverted post-settle (a11y).
 *
 * Vertical budget:
 *   375×620 : py-4 (32) + headline 2×~28 + 4 + subtitle ~20 + 8 + ledger ~44
 *             + 8 + cards 3×~84 + 16 gaps + 8 + strips ~100 + 8 + kicker ~28
 *             ≈ 580 → fits 620.
 *   1366×768: py-10 (80) + headline ~56 + subtitle ~24 + ledger ~44 + cards
 *             row ~230 + strips ~48 + kicker ~40 + gaps ~70 ≈ 592 → fits.
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { addCountUp } from "@/lib/motion/count-up";
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
    create: ({ root, reduced }) => {
      if (reduced) {
        // Static deck: the SSR verdict wall IS the final frame.
        return {
          entrance: gsap.timeline({ paused: true }),
          setFrozen: () => {},
          setDormant: () => {},
        };
      }

      const headline = root.querySelector<HTMLElement>("[data-headline]")!;
      const subtitle = root.querySelector<HTMLElement>("[data-subtitle]")!;
      const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-dot]"));
      const candDots = dots.slice(8);
      const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
      const numerators = cards.map(
        (c) => c.querySelector<HTMLElement>("[data-numerator]")!,
      );
      const fillsPerCard = cards.map((c) =>
        Array.from(c.querySelectorAll<HTMLElement>("[data-pip-fill]")),
      );
      const allFills = fillsPerCard.flat();
      const card3PipWraps = fillsPerCard[2].map((f) => f.parentElement!);
      const quotes = Array.from(root.querySelectorAll<HTMLElement>("[data-quote]"));
      const ring = root.querySelector<SVGRectElement>("[data-ring] rect")!;
      const stripHr = root.querySelector<HTMLElement>('[data-strip="hr"]')!;
      const stripCand = root.querySelector<HTMLElement>(
        '[data-strip="candidates"]',
      )!;
      const divider = root.querySelector<HTMLElement>("[data-divider]")!;
      const kickA = root.querySelector<HTMLElement>('[data-kick="a"]')!;
      const kickB = root.querySelector<HTMLElement>('[data-kick="b"]')!;

      // Masked line splits (fonts gated by useDeckSlide; context-tracked).
      const headSplit = SplitText.create(headline, { type: "lines", mask: "lines" });
      const quoteSplits = quotes.map((el) =>
        SplitText.create(el, { type: "lines", mask: "lines" }),
      );
      let splitsAlive = true;
      const revertSplits = () => {
        if (!splitsAlive) return;
        splitsAlive = false;
        headSplit.revert();
        for (const s of quoteSplits) s.revert();
      };

      const setDormant = () => {
        gsap.set(headSplit.lines, { yPercent: 110 });
        gsap.set(subtitle, { autoAlpha: 0, y: 8 });
        gsap.set(dots, { scale: 0, autoAlpha: 0 });
        gsap.set(cards, { autoAlpha: 0, y: 28 });
        for (const n of numerators) n.textContent = "0";
        gsap.set(allFills, { opacity: 0 });
        gsap.set(card3PipWraps, { scale: 1 });
        for (const s of quoteSplits) gsap.set(s.lines, { yPercent: 110 });
        // pathLength=100 on the rect → dash units are normalized; offset
        // 100 = undrawn, 0 = full ring. Stroke-only, no DrawSVG needed.
        gsap.set(ring, { strokeDasharray: 100, strokeDashoffset: 100, strokeOpacity: 1 });
        gsap.set(stripHr, { autoAlpha: 0, x: -40 });
        gsap.set(stripCand, { autoAlpha: 0, x: 40 });
        gsap.set(divider, { scale: 0 });
        gsap.set(kickA, { autoAlpha: 0, x: -16 });
        gsap.set(kickB, { autoAlpha: 0, x: 16 });
      };

      const setFrozen = () => {
        revertSplits();
        gsap.killTweensOf([...dots, ring]);
        gsap.set(headline, { autoAlpha: 1 });
        gsap.set(subtitle, { autoAlpha: 1, y: 0 });
        gsap.set(dots, { scale: 1, autoAlpha: 1 });
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        CARDS.forEach((card, n) => {
          numerators[n].textContent = String(card.filled);
        });
        gsap.set(allFills, { opacity: 1 });
        gsap.set(card3PipWraps, { scale: 1 });
        gsap.set(ring, { strokeDasharray: 100, strokeDashoffset: 0, strokeOpacity: 1 });
        gsap.set([stripHr, stripCand], { autoAlpha: 1, x: 0 });
        gsap.set(divider, { scale: 1 });
        gsap.set([kickA, kickB], { autoAlpha: 1, x: 0 });
      };

      /* ----------------------------------------------------------------
       * Entrance
       * ---------------------------------------------------------------- */
      const entrance = gsap.timeline({ paused: true });
      entrance
        .to(
          headSplit.lines,
          { yPercent: 0, duration: 0.5, ease: "expo.out", stagger: 0.08 },
          0,
        )
        .to(subtitle, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.25)
        .to(
          dots,
          { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(1.7)", stagger: 0.02 },
          0.25,
        );

      CARDS.forEach((card, n) => {
        const t = 0.7 + n * 0.4;
        const innerT = n === 2 ? 1.9 : t + 0.15;
        entrance.to(
          cards[n],
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
          t,
        );
        // Numerator ↔ pip sync: ease:none over filled×0.1s — the integer
        // ticks land as their pips flip.
        addCountUp(entrance, innerT, numerators[n], {
          to: card.filled,
          duration: card.filled * 0.1,
          ease: "none",
        });
        entrance.to(
          fillsPerCard[n],
          { opacity: 1, duration: 0.15, ease: "power1.out", stagger: 0.1 },
          innerT,
        );
        if (n === 2) {
          // unanimity pips pop — flame flips with scale
          entrance.fromTo(
            card3PipWraps,
            { scale: 1.3 },
            { scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.1 },
            innerT,
          );
        }
        entrance.to(
          quoteSplits[n].lines,
          { yPercent: 0, duration: 0.4, ease: "power3.out", stagger: 0.06 },
          t + 0.2,
        );
      });

      entrance
        // flame ring draws while the 8 candidate ledger dots pulse once
        .to(ring, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 2.5)
        .to(
          candDots,
          { scale: 1.2, duration: 0.18, ease: "power1.out", yoyo: true, repeat: 1, stagger: 0.03 },
          2.5,
        )
        .to(stripHr, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out" }, 2.7)
        .to(stripCand, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out" }, 2.7)
        .to(divider, { scale: 1, duration: 0.35, ease: "power2.out" }, 2.8)
        .to(
          [kickA, kickB],
          { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out" },
          3.1,
        )
        .call(revertSplits, [], 3.65);

      /* ----------------------------------------------------------------
       * Idles — sanctioned breathing ring + ledger "listening" cursor.
       * ---------------------------------------------------------------- */
      const makeIdles = () => {
        const ringBreathe = gsap.fromTo(
          ring,
          { strokeOpacity: 0.55 },
          { strokeOpacity: 0.95, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 },
        );
        const scan = gsap.timeline({ repeat: -1 }); // deck-contract: idle
        scan.set(dots, { opacity: 0.85 }, 0);
        dots.forEach((d, i) => {
          const t = 0.2 + i * 0.9;
          scan
            .to(d, { opacity: 1, scale: 1.04, duration: 0.25, ease: "power1.out" }, t)
            .to(d, { opacity: 0.85, scale: 1, duration: 0.4, ease: "power1.inOut" }, t + 0.3);
        });
        return [ringBreathe, scan];
      };

      return { entrance, makeIdles, setFrozen, setDormant };
    },
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
              /* Flame ring — 8/8 unanimity (the sanctioned breathing ring). */
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
                <span data-numerator>{card.filled}</span>
                <span className="text-[0.5em] text-dim">/8</span>
              </p>
              <div className="mt-1.5 flex gap-1 lg:mt-2 lg:gap-1.5">
                {PIPS.map((i) =>
                  i < card.filled ? (
                    /* Filled pip: dark base + color fill overlay — the flip
                       is opacity-only (deck contract: no bg-color tweens). */
                    <span
                      key={i}
                      data-pip={i}
                      className="relative h-2 w-2 rounded-[2px] bg-line"
                    >
                      <span
                        data-pip-fill
                        className={`absolute inset-0 rounded-[2px] ${card.pipClass}`}
                      />
                    </span>
                  ) : (
                    <span
                      key={i}
                      data-pip={i}
                      className="h-2 w-2 rounded-[2px] bg-line"
                    />
                  ),
                )}
              </div>
            </div>

            <div className="lg:mt-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-dim lg:text-[length:var(--text-meta)]">
                {card.role}
              </p>
              <p
                data-quote
                className="mt-0.5 text-[13px] leading-snug text-mute lg:mt-1 lg:text-[length:var(--text-body)]"
              >
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
          data-divider
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

      {/* Kicker — halves meet at the divider axis. */}
      <p
        data-kicker
        className="font-display mt-1.5 text-center text-[20px] sm:mt-2 sm:text-[length:var(--text-h2)] lg:mt-6"
      >
        <span data-kick="a" className="text-paper">
          Одна боль.
        </span>{" "}
        <span data-kick="b" className="text-ember">
          Две стороны.
        </span>
      </p>
    </Slide>
  );
}
