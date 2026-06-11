"use client";

/**
 * Slide 06 — Как это работает · «The Generator» (landing_v2.md §4 slide 06).
 *
 * P2 STATIC SKELETON — renders the FROZEN POST-BUILD state: seed line docked
 * at stage top, built world (file tree / editor / schema / status bar) and
 * the trace ticker with 3 static chips. Entrance/build motion lands in P3/P4
 * via the data-* hooks below.
 *
 * Vertical budget (zero internal scroll):
 *   1366×768: py-10 (80) + header ~56 + 16 + rail ~160 + 24 + stage ~330
 *             ≈ 666px ✓ (~100px slack)
 *   375×620:  py-8 (64) + header 2 lines ~60 + 12 + rail 3×~62 = 186 + 12
 *             + stage (seed ~54 + micro-world ~96 + status 30 + chips ~52
 *             + ticker 28 ≈ 270) ≈ 604px ✓
 *   1920×1080: same layout, flex-centered with slack.
 *
 * Color grammar §2.4: the customers.csv tag is AMBER and reads
 * «⚠ персональные данные» (Director's cut) — no red on this slide.
 */
import type { ReactNode } from "react";
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { cn } from "@/lib/cn";

export function Slide06Generator() {
  const { ref } = useDeckSlide({
    id: "06-generator",
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
      id="06-generator"
      hasBuild
      title="Как это работает: три шага, один проход, без интеграций"
      srSummary="Тимлид настраивается один раз — четыре слоя контекста и одна-три строки про задачу позиции; никакой выгрузки базы кода. Кандидат через 30 секунд попадает в веб-IDE: синтетическая база кода, живая БД, сервисы-заглушки, тесты, ИИ-напарник — 20–40 минут реальной работы. Платформа записывает всё: каждый промпт, файл, команду, тест."
      className="py-8 lg:py-10"
    >
      <h3
        data-header
        className="font-display text-[length:var(--text-h1)] text-paper"
      >
        Три шага. Один проход. Без интеграций.
      </h3>

      {/* ---------------------------------------------------------------
       * Step rail — 3 cards + 2 SVG chevrons (lg). Mobile: 3 stacked rows
       * (number + title + boldest chip; plaques as small lines, §4.06 cut).
       * ------------------------------------------------------------- */}
      <div className="mt-3 grid gap-2 lg:mt-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-3">
        <StepCard
          n={1}
          title="Тимлид"
          keyChip="один раз"
          tagline={
            <>
              4 слоя · <b className="font-semibold text-paper">один раз</b>
            </>
          }
          detail={
            <>
              стек → «как мы работаем» → бизнес-контекст →{" "}
              <b className="font-semibold text-paper">1–3 строки</b> про задачу
              позиции
            </>
          }
          plaque="Никакой выгрузки базы кода. Никогда."
        />
        <Chevron />
        <StepCard
          n={2}
          title="Кандидат"
          keyChip="30 секунд"
          tagline={
            <>
              ссылка →{" "}
              <b data-chip-30s className="font-semibold text-paper">
                30 секунд
              </b>{" "}
              → веб-IDE
            </>
          }
          detail={
            <>
              синтетическая база кода · живая БД · сервисы-заглушки · тесты ·
              ИИ-напарник
            </>
          }
          plaque="20–40 минут реальной работы."
        />
        <Chevron />
        <StepCard
          n={3}
          title="Платформа"
          keyChip="всё"
          recDot
          tagline={
            <>
              записывает <b className="font-semibold text-paper">всё</b>
            </>
          }
          detail={<>каждый промпт · файл · команду · тест</>}
        />
      </div>

      {/* ---------------------------------------------------------------
       * Generator stage — POST-BUILD state. Seed line docked at top; built
       * world below; trace ticker strip at the bottom.
       * ------------------------------------------------------------- */}
      <section
        data-stage
        aria-label="Сгенерированная среда кейса"
        className="mt-3 overflow-hidden rounded-2xl border border-line bg-fog lg:mt-6"
      >
        {/* Seed line — docked (frozen end state of the build dock beat). */}
        <p
          data-seed
          className="border-b border-line bg-ink/30 px-3 py-2 font-mono text-[11px] leading-snug text-mute lg:px-4 lg:py-2.5 lg:text-xs"
        >
          <span aria-hidden="true" className="mr-1.5 text-flame">
            ›
          </span>
          Реализовать batch-обработчик возвратов поверх stripe API, с
          корректным обращением к таблице{" "}
          <code className="text-paper">customers</code>. Покрыть тестами.
        </p>

        {/* Built world — full IDE anatomy at lg+ (tree / editor / schema). */}
        <div
          data-world
          className="hidden lg:grid lg:grid-cols-[190px_minmax(0,1fr)_230px]"
        >
          {/* File tree — candidate-ide path vocabulary. */}
          <aside className="border-r border-line bg-ink/20 p-3 font-mono text-[11px] text-mute">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-dim">
              payments
            </p>
            <ul className="space-y-1">
              <li data-tree-row>api/</li>
              <li data-tree-row className="ml-3">
                routes.py
              </li>
              <li data-tree-row data-highlight className="ml-3 text-paper">
                process_refund.py
              </li>
              <li data-tree-row>db/</li>
              <li data-tree-row className="ml-3">
                schema.sql
              </li>
              <li data-tree-row className="ml-3 text-paper">
                customers.csv
              </li>
              <li
                data-tree-row
                data-pii-tag
                className="ml-3 text-[10px] text-amber-400"
              >
                ⚠ персональные данные
              </li>
              <li data-tree-row className="mt-2">
                README.md
              </li>
            </ul>
          </aside>

          {/* Editor snippet — product chrome, code allowed (§0). */}
          <div className="min-w-0 border-r border-line bg-ink/10 p-4 font-mono text-[11.5px] leading-relaxed text-mute">
            <pre className="overflow-hidden" data-editor>
              <code>
                <span className="block">
                  <span className="text-sterile">def</span>{" "}
                  <span className="text-glass">process_refund_batch</span>
                  (refunds):
                </span>
                <span className="block pl-4">
                  rows = db.fetch(
                  <span className="text-ember">&quot;customers&quot;</span>,
                  refunds.ids)
                </span>
                <span className="block pl-4">
                  <span className="text-sterile">return</span>{" "}
                  stripe.Refund.create_batch(rows)
                </span>
                <span className="mt-2 block text-dim"># tests/test_refunds.py · 12 passed</span>
              </code>
            </pre>
          </div>

          {/* schema.sql mini-diagram. */}
          <div className="p-3">
            <svg
              data-schema
              viewBox="0 0 200 130"
              className="h-auto w-full"
              aria-hidden="true"
            >
              <rect
                x="10"
                y="8"
                width="180"
                height="114"
                rx="8"
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth="1.5"
              />
              <line
                x1="10"
                y1="34"
                x2="190"
                y2="34"
                stroke="var(--color-line-strong)"
                strokeWidth="1.5"
              />
              <text
                x="20"
                y="26"
                className="fill-paper"
                fontSize="11"
                fontFamily="var(--font-mono)"
              >
                customers
              </text>
              {["name · text", "email · text", "charge_id · text", "amount · int"].map(
                (row, i) => (
                  <text
                    key={row}
                    x="20"
                    y={54 + i * 18}
                    className="fill-mute"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                  >
                    {row}
                  </text>
                ),
              )}
            </svg>
          </div>
        </div>

        {/* Mobile micro-world (Director's cut): 3-row tree + nothing cut to
            a checklist — a real generated surface, just smaller. */}
        <div data-world-micro className="lg:hidden">
          <ul className="space-y-1 px-3 py-2 font-mono text-[11px] text-mute">
            <li data-tree-row data-highlight className="text-paper">
              payments/api/process_refund.py
            </li>
            <li data-tree-row>payments/db/schema.sql</li>
            <li data-tree-row>
              payments/db/customers.csv{" "}
              <span data-pii-tag className="text-[10px] text-amber-400">
                ⚠ персональные данные
              </span>
            </li>
          </ul>
        </div>

        {/* Status bar — trust-green test counter + mock-service chips. */}
        <div
          data-status
          className="flex items-center gap-3 border-t border-line bg-ink/30 px-3 py-2 font-mono text-[11px] text-mute lg:gap-4 lg:px-4"
        >
          <span className="hidden lg:inline">~/payments</span>
          <span data-service>stripe-mock ✓</span>
          <span data-service>живая БД ✓</span>
          <span data-tests className="ml-auto text-trust">
            tests: 12 ✓
          </span>
        </div>

        {/* Mobile trust chips — the step-2 environment list, kept as
            product UI (verbatim copy lives in the desktop card too). */}
        <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2 lg:hidden">
          {[
            "синтетическая база кода",
            "живая БД",
            "сервисы-заглушки",
            "тесты",
            "ИИ-напарник",
          ].map((chip) => (
            <span
              key={chip}
              data-trust-chip
              className="rounded-full border border-line px-2 py-0.5 text-[10px] text-mute"
            >
              <span className="text-trust">✓</span> {chip}
            </span>
          ))}
        </div>

        {/* Trace ticker — 3 static mono chips (frozen mid-tick). */}
        <div
          data-trace
          className="flex items-center gap-2 overflow-hidden border-t border-line bg-ink/40 px-3 py-1.5"
        >
          <span
            aria-hidden="true"
            data-rec-dot
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-flame"
          />
          <span className="shrink-0 text-[10px] uppercase tracking-widest text-dim">
            запись
          </span>
          {[
            "промпт · «как переписать на батч?»",
            "файл · process_refund.py",
            "тест · 12 ✓",
          ].map((chip) => (
            <span
              key={chip}
              data-chip="trace"
              className="shrink-0 whitespace-nowrap rounded border border-line px-2 py-0.5 font-mono text-[10px] text-mute"
            >
              {chip}
            </span>
          ))}
        </div>
      </section>
    </Slide>
  );
}

/* ----------------------------------------------------------------------- */

function StepCard({
  n,
  title,
  keyChip,
  tagline,
  detail,
  plaque,
  recDot,
}: {
  n: number;
  title: string;
  keyChip: string;
  tagline: ReactNode;
  detail: ReactNode;
  plaque?: string;
  recDot?: boolean;
}) {
  return (
    <article
      data-step={n}
      className="flex flex-col rounded-2xl border border-line bg-fog px-3 py-2 lg:p-5"
    >
      <div className="flex items-baseline gap-2.5">
        <span className="font-display text-base text-flame lg:text-lg">
          0{n}
        </span>
        <h4 className="font-display text-base text-paper lg:text-lg">
          {title}
        </h4>
        {recDot ? (
          <span
            aria-hidden="true"
            data-rec-dot
            className="h-1.5 w-1.5 self-center rounded-full bg-flame"
          />
        ) : null}
        {/* Mobile: boldest chip only (§4.06 mobile rail). */}
        <span className="ml-auto rounded-full border border-line-strong px-2 py-0.5 text-[10px] font-semibold text-paper lg:hidden">
          {keyChip}
        </span>
      </div>
      <p className="mt-1.5 hidden text-meta leading-snug text-mute lg:block">
        {tagline}
      </p>
      <p className="mt-1 hidden text-[12px] leading-snug text-dim lg:block">
        {detail}
      </p>
      {plaque ? (
        <p
          data-plaque
          className={cn(
            "mt-1.5 text-[11px] leading-snug text-flame",
            "lg:mt-auto lg:pt-3",
          )}
        >
          <span className="lg:rounded-lg lg:border lg:border-line-strong lg:px-2.5 lg:py-1">
            {plaque}
          </span>
        </p>
      ) : null}
    </article>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      data-chevron
      viewBox="0 0 40 24"
      className="hidden w-10 self-center text-line-strong lg:block"
    >
      <path
        d="M2 12h28m0 0-8-8m8 8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
