"use client";

/**
 * Slide 08 — Ещё одно. Ловушка на работу с данными · «Граница под
 * напряжением» (landing_v2.md §4 slide 08).
 *
 * P2 STATIC SKELETON — renders the FROZEN POST-LEAK (wounded-cool) state:
 * leak bubble visible (safe bubble absolutely stacked + hidden), leak flag
 * stamped, «цифровая гигиена» crashed to 18 in red, faint red vignette at
 * 0.06 opacity. The chip-travel build, flare and shake land in P3/P4.
 *
 * HARD re-budget per Director's cut (1366×768, py-8, audited):
 *   py-8 (64) + top band ~59 (≤88: plaque absolute-left, title --text-h1)
 *   + 14 + panes FIXED 380 + 14 + bottom band ~210 (matrix `dense`: p-4,
 *   no eyebrow, text-lg title, space-y-2) ≈ 741px ✓ (27px slack)
 * 375×620 (pin disabled, auto-chain, audited ≈595px):
 *   py-6 (48) + plaque+title h2 ~60 + 8 + left pane (header + bubble 1 +
 *   file chip; bubbles 2–3 and footers desktop-only; 12px copy) + boundary
 *   20 + right pane (header + leak bubble + flag) + 8 + bespoke single-axis
 *   «цифровая гигиена» strip (~30px, replaces the 5-axis matrix <lg per
 *   spec) + 8 + quote at text-lede ✓.
 *
 * RED IS ALLOWED HERE AND ONLY HERE (§2.4): leak bubble, leak flag, crashed
 * axis, boundary tone="leak", vignette. The «персональные данные» marker
 * inside the buddy bubble stays AMBER (it is a warning, matching slide 6's
 * file tag verbatim — red is reserved for the violation artifacts).
 */
import type { HTMLAttributes, ReactNode } from "react";
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { BoundaryLine } from "@/components/deck/parts/boundary-line";
import { FileChip } from "@/components/deck/parts/file-chip";
import { ProcessMatrix } from "@/components/mockups/process-matrix";

/** Compact 5-axis variant for the bottom band — incl. the crashed axis. */
const TRAP_AXES = [
  { label: "понимание контекста", score: 84 },
  { label: "точность промптов", score: 78 },
  { label: "безопасность команд", score: 80 },
  { label: "проверка", score: 71 },
  { label: "цифровая гигиена", score: 18 }, // post-leak: crashed 89 → 18
];

export function Slide08Trap() {
  const { ref } = useDeckSlide({
    id: "08-trap",
    hasBuild: true,
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
      id="08-trap"
      hasBuild
      title="Ещё одно: ловушка на работу с данными — два чата, одна граница"
      srSummary="Два чата с разными уровнями доверия: ИИ-напарник, который знает проект, и внешний публичный чат. Кандидат вставил файл customers.csv с пометкой «персональные данные» во внешний чат — обнаружена утечка по точному совпадению, ось «цифровая гигиена» обвалилась с 89 до 18. 11% всего, что вставляют в ChatGPT, — внутренняя информация (Cyberhaven, телеметрия 1,6 млн сотрудников)."
      className="py-6 lg:py-8"
    >
      {/* Persistent post-leak vignette — the slide's wounded-cool freeze
          frame (§4.08 cut). Absolute to .slide (sticky ancestor). */}
      <div
        aria-hidden="true"
        data-vignette
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 62% 40%, rgba(239,68,68,0.9), transparent 70%)",
        }}
      />

      {/* Top band ≤88px: plaque left, title centered at lg. */}
      <header data-band className="relative">
        <p
          data-plaque
          className="mb-1.5 inline-block rounded-full border border-line-strong bg-fog px-2.5 py-0.5 text-[12px] text-mute lg:absolute lg:left-0 lg:top-1/2 lg:mb-0 lg:-translate-y-1/2 lg:px-3 lg:py-1 lg:text-meta"
        >
          Ещё одно.
        </p>
        <h3
          data-title
          className="font-display text-[length:var(--text-h2)] text-paper lg:text-center lg:text-[length:var(--text-h1)]"
        >
          Два чата. <span className="text-flame">Одна граница.</span>
        </h3>
      </header>

      {/* Middle band: dual chat panes + boundary line, fixed 380px at lg. */}
      <div className="mt-2 grid gap-2 lg:mt-3.5 lg:grid-cols-[1fr_96px_1fr] lg:gap-0">
        {/* LEFT — ИИ-напарник (trusted). */}
        <article
          data-panel="buddy"
          className="flex flex-col gap-2 rounded-2xl border border-trust/30 bg-fog p-2.5 lg:h-[380px] lg:gap-3 lg:p-5"
        >
          <header className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] text-trust lg:text-meta">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-trust" />
              ИИ-напарник
            </span>
            <span className="text-[12px] text-mute lg:text-meta">
              знает ваш проект
            </span>
          </header>
          <div className="space-y-2 lg:space-y-2.5">
            <Bubble side="them" tone="trust">
              Файл <code className="text-mute">customers.csv</code> помечен{" "}
              <span className="text-amber-400">персональные данные</span>.
              Внутри кейса можно работать с ним напрямую.
            </Bubble>
            <Bubble side="me" className="hidden lg:block">
              окей. как переписать{" "}
              <code className="text-mute">stripe.Refund.create</code> на батч?
            </Bubble>
            <Bubble side="them" tone="trust" className="hidden lg:block">
              Покажу на 5 строках — пробежим вместе.
            </Bubble>
          </div>
          {/* The trap artifact — leak-tinted border allowed here only. */}
          <FileChip className="self-start" />
          <footer className="mt-auto hidden text-meta text-mute lg:block">
            <span className="text-paper">Доверенный канал.</span> Чувствительные
            артефакты — можно.
          </footer>
        </article>

        {/* Boundary — frozen post-leak tone. Vertical at lg, horizontal <lg. */}
        <div className="flex items-center justify-center lg:h-[380px] lg:py-2">
          <BoundaryLine
            tone="leak"
            orientation="vertical"
            className="hidden lg:block"
          />
          <BoundaryLine
            tone="leak"
            orientation="horizontal"
            className="h-5 lg:hidden"
          />
        </div>

        {/* RIGHT — внешний публичный чат (untrusted). */}
        <article
          data-panel="external"
          className="flex flex-col gap-2 rounded-2xl border border-line-strong bg-fog p-2.5 lg:h-[380px] lg:gap-3 lg:p-5"
        >
          <header className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] text-sterile lg:text-meta">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-sterile" />
              Внешний публичный чат
            </span>
            <span className="rounded-full border border-line bg-ink/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-sterile">
              Публичный
            </span>
          </header>
          <p className="hidden text-meta text-mute lg:block">
            сторонний сервис · не знает контекста
          </p>

          {/* Message slot — safe and leak absolutely stacked; frozen state
              shows the LEAK bubble (safe hidden, toggled by P3 build). */}
          <div className="relative">
            <div
              data-msg="safe"
              aria-hidden="true"
              className="absolute inset-0 opacity-0"
            >
              <Bubble side="me" tone="sterile">
                как переписать stripe.Refund.create на батч?
              </Bubble>
            </div>
            <div data-msg="leak">
              <Bubble side="me" tone="leak">
                перепиши на батч — вот данные:{" "}
                <code className="text-paper">name,email,charge_id,amount</code>
                <br />
                Маркова,Е.,m@…,ch_3Pq…,4500…
              </Bubble>
            </div>
          </div>

          {/* Leak flag — stamped (frozen) state. */}
          <p
            data-leak-flag
            className="rounded-lg border border-leak/40 bg-leak/10 px-3 py-1.5 text-[12px] leading-snug text-leak lg:py-2 lg:text-meta"
          >
            ⚠ обнаружена утечка: <code>customers.csv</code> · точное совпадение
          </p>

          <footer className="mt-auto hidden text-meta text-mute lg:block">
            <span className="text-paper">Недоверенный канал.</span>{" "}
            Чувствительные артефакты — нельзя.
          </footer>
        </article>
      </div>

      {/* Bottom band ~210px: compact 5-axis matrix (lg, dense) + Cyberhaven
          quote. <lg the matrix collapses to the spec's bespoke single-axis
          «цифровая гигиена» strip — the leak crash stays visible on phones
          without the full card's chrome. */}
      <div
        data-bottom
        className="mt-2 grid items-center gap-2 lg:mt-3.5 lg:grid-cols-2 lg:gap-6"
      >
        <div data-matrix>
          <ProcessMatrix
            axes={TRAP_AXES}
            leakLabel="цифровая гигиена"
            dense
            className="hidden lg:block"
          />
          <div
            data-leak-strip
            className="flex items-center gap-2.5 rounded-xl border border-line bg-fog px-3 py-2 lg:hidden"
          >
            <span className="shrink-0 text-[11px] leading-tight text-leak">
              цифровая гигиена{" "}
              <span className="text-[9px] uppercase tracking-widest">
                утечка
              </span>
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line animate-pulse">
              <div className="h-full w-[18%] rounded-full bg-leak" />
            </div>
            <span className="w-7 shrink-0 text-right font-mono text-[11px] tabular-nums text-leak">
              18
            </span>
          </div>
        </div>
        <figure data-quote className="flex flex-col gap-1.5 lg:gap-2">
          <p
            className="font-display text-[length:var(--text-lede)] text-paper lg:text-[length:var(--text-h2)]"
            style={{ lineHeight: 1.15 }}
          >
            <span data-quote-stat className="text-flame">
              11%
            </span>{" "}
            всего, что вставляют в ChatGPT — внутренняя информация.
          </p>
          <figcaption className="text-meta text-dim">
            Cyberhaven · телеметрия 1,6 млн сотрудников
          </figcaption>
        </figure>
      </div>
    </Slide>
  );
}

/* ----------------------------------------------------------------------- */

/** Dual-chat bubble — carried over from v1 06-data-trap (strings verbatim). */
function Bubble({
  side,
  tone,
  className,
  children,
  ...rest
}: {
  side: "me" | "them";
  tone?: "trust" | "sterile" | "leak";
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const base =
    "max-w-[92%] rounded-xl border px-3 py-1.5 text-[12px] leading-snug lg:py-2 lg:text-meta";
  const align = side === "me" ? "ml-auto" : "mr-auto";
  const variant =
    tone === "trust"
      ? "border-trust/30 bg-trust/10 text-paper"
      : tone === "leak"
        ? "border-leak/40 bg-leak/10 text-paper"
        : tone === "sterile"
          ? "border-line bg-ink/30 text-mute"
          : "border-line bg-ink/30 text-paper";
  return (
    <div className={`${base} ${align} ${variant} ${className ?? ""}`} {...rest}>
      {children}
    </div>
  );
}
