"use client";

/**
 * Slide 13 — Дорожная карта + финал · «Два испытуемых, одна матрица →
 * эпитафия» (landing_v2.md §4 slide 13 + Director's cut; copy verbatim
 * from ru_pitch_v2.md слайд 13).
 *
 * P2 STATIC SKELETON — DEV NOTE: the frozen state is the REFRAIN EPITAPH
 * over the dimmed Act I, and that is what renders here:
 *   [data-act1] at inline opacity 0.05 / scale 0.97 (its full layout still
 *   occupies the slide, so BOTH compositions' viewport budgets are
 *   verified by this one render), [data-refrain] overlay visible (three
 *   lines, third in flame, faint ember radial glow at 0.12).
 * P3's build toggles the two: Act I starts at opacity 1 / scale 1, the
 *   refrain starts hidden; the build dims Act I and slams the three
 *   [data-refrain-line]s in. Reduced motion keeps exactly this frame.
 *
 * Vertical budgets (zero internal scroll):
 *   375×620  — py-6 → 572 avail (Act I): headline ~64 + timeline rail
 *              ~48 + «+12 мес» card ~56 + chips ~52 + DualProcessMatrix
 *              (5 axes) ~220 + gaps 44 ≈ 484 ✓; refrain overlay ~330 ✓
 *   1366×768 — py-8 → 704 avail: headline ~64 + timeline ~110 + split
 *              ~350 (chips 24 + IDEs capped 320) + gaps 48 ≈ 572 ✓;
 *              refrain ~360 inside the overlay ✓
 *   1920×1080 — split gets air (max-w-7xl is the .slide-content cap).
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { CandidateIde } from "@/components/mockups/candidate-ide";
import { DualProcessMatrix } from "@/components/mockups/dual-process-matrix";
import { cn } from "@/lib/cn";

type Milestone = {
  label: string;
  desc: string;
  flame?: boolean;
};

const MILESTONES: Milestone[] = [
  { label: "Сейчас", desc: "один шаблон · 10 пилотов · найм джунов" },
  {
    label: "+6 мес",
    desc: "больше ролей и отраслей · генерация под описание архитектуры",
  },
  {
    label: "+12 мес",
    desc: "оценка ИИ-агентов на той же инфраструктуре",
    flame: true,
  },
  { label: "Долгосрок", desc: "субстрат оценки интеллекта на работе" },
];

function SessionChip({
  tone,
  children,
}: {
  tone: "glass" | "ember";
  children: string;
}) {
  return (
    <p
      data-session-chip={tone}
      className={cn(
        "inline-block self-start rounded-full border px-2.5 py-1 font-mono text-[11px] lg:text-[12px]",
        tone === "glass"
          ? "border-glass/40 bg-glass/10 text-glass"
          : "border-ember/40 bg-ember/10 text-ember",
      )}
    >
      {children}
    </p>
  );
}

export function Slide13Finale() {
  const { ref } = useDeckSlide({
    id: "13-finale",
    hasBuild: true,
    // <lg: Act II auto-chains after the dual-matrix fill settles (~3.8s).
    autoChainMs: 4000,
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="13-finale"
      hasBuild
      title="Дорожная карта и финал"
      srSummary={
        <>
          Это не HR-инструмент. Это категория. Дорожная карта: сейчас — один
          шаблон, 10 пилотов, найм джунов; через 6 месяцев — больше ролей и
          отраслей, генерация под описание архитектуры; через 12 — оценка
          ИИ-агентов на той же инфраструктуре; долгосрок — субстрат оценки
          интеллекта на работе. На экране две сессии на одной задаче — Анна
          П., junior backend, и Claude Code, агент — оцениваемые одной
          матрицей процесса. Результат умер. Процесс — единственное, что
          осталось измерять. Кем бы он ни был.
        </>
      }
      className="py-6 lg:py-8"
    >
      <div className="relative">
        {/* ================= Act I — dimmed under the epitaph =================
            Inline style = the P2 frozen state; P3 toggles it via gsap. */}
        <div
          data-act1
          style={{ opacity: 0.05, transform: "scale(0.97)" }}
          aria-hidden="true"
        >
          {/* Headline */}
          <h3 className="font-display text-[length:var(--text-h1)] text-paper">
            Это не HR-инструмент.{" "}
            <span className="text-flame">Это категория.</span>
          </h3>

          {/* Timeline — horizontal SVG spine + 4 nodes (P3: DrawSVG l→r). */}
          <div data-timeline className="mt-5 lg:mt-8">
            <div className="relative">
              <svg
                data-spine
                aria-hidden="true"
                className="absolute left-0 top-[5px] h-[2px] w-full"
                viewBox="0 0 100 2"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="1"
                  x2="100"
                  y2="1"
                  stroke="var(--color-line-strong)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <ol className="relative grid grid-cols-4 gap-2 lg:gap-6">
                {MILESTONES.map((m) => (
                  <li key={m.label} data-node={m.label}>
                    <span className="relative inline-block h-3 w-3">
                      <span
                        className={cn(
                          "absolute inset-[2px] rounded-full",
                          m.flame ? "bg-flame" : "bg-mute",
                        )}
                      />
                      {m.flame ? (
                        // P3 swaps to an SVG circle for DrawSVG + breathe idle.
                        <span
                          data-node-ring
                          className="absolute -inset-1 rounded-full border border-flame"
                        />
                      ) : null}
                    </span>
                    <p
                      className={cn(
                        "font-display mt-1.5 text-[13px] font-semibold lg:text-[15px]",
                        m.flame ? "text-flame" : "text-paper",
                      )}
                    >
                      {m.label}
                    </p>
                    {/* Mobile: rail of dots + labels only; descriptions are
                        desktop-only (the «+12 мес» card carries it below). */}
                    <p
                      className={cn(
                        "mt-1 hidden max-w-[24ch] text-meta leading-snug lg:block",
                        m.flame ? "text-flame/80" : "text-dim",
                      )}
                    >
                      {m.desc}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            {/* Mobile-only highlighted «+12 мес» card (other descs cut —
                the speaker carries them). */}
            <div className="mt-3 rounded-xl border border-flame/40 bg-flame/8 p-3 lg:hidden">
              <p className="text-[13px] leading-snug text-mute">
                <span className="font-display font-semibold text-flame">
                  +12 мес
                </span>{" "}
                — оценка ИИ-агентов на той же инфраструктуре
              </p>
            </div>
          </div>

          {/* Split — human session · dual matrix · agent session. */}
          <div data-split className="mt-5 lg:mt-8">
            {/* Desktop: two compact IDEs flank the shared matrix. */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_minmax(300px,360px)_1fr] lg:items-center lg:gap-5">
              <div className="flex flex-col">
                <SessionChip tone="glass">
                  Сессия #4173 · Анна П. · junior backend
                </SessionChip>
                <CandidateIde compact className="mt-2 max-h-[320px]" />
              </div>
              <DualProcessMatrix className="self-center" />
              <div className="flex flex-col">
                <SessionChip tone="ember">
                  Сессия #4174 · Claude Code · агент
                </SessionChip>
                <CandidateIde compact className="mt-2 max-h-[320px]" />
              </div>
            </div>
            {/* Mobile: IDEs cut; chips stack over one 5-axis dual matrix
                (dual bars are the money shot — bars stay visible, §5). */}
            <div className="lg:hidden">
              <div className="flex flex-col gap-1.5">
                <SessionChip tone="glass">
                  Сессия #4173 · Анна П. · junior backend
                </SessionChip>
                <SessionChip tone="ember">
                  Сессия #4174 · Claude Code · агент
                </SessionChip>
              </div>
              <DualProcessMatrix maxAxes={5} className="mt-3" />
            </div>
          </div>
        </div>

        {/* ================= Act II — the refrain epitaph =================
            Visible in P2 (frozen state); P3 reveals it during the build. */}
        <div
          data-refrain
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center lg:gap-4"
        >
          {/* Faint ember radial glow — pre-rendered gradient, opacity-only. */}
          <div
            data-refrain-glow
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] lg:h-[480px] lg:w-[480px]"
            style={{
              background:
                "radial-gradient(circle, var(--color-ember) 0%, transparent 65%)",
            }}
          />
          <p
            data-refrain-line
            className="font-display relative max-w-[24ch] text-[length:var(--text-display)] text-paper [text-wrap:balance]"
          >
            Результат умер.
          </p>
          <p
            data-refrain-line
            className="font-display relative max-w-[24ch] text-[length:var(--text-display)] text-paper [text-wrap:balance]"
          >
            Процесс — единственное, что осталось измерять.
          </p>
          <p
            data-refrain-line
            className="font-display relative max-w-[24ch] text-[length:var(--text-display)] text-flame [text-wrap:balance]"
          >
            Кем бы он ни был.
          </p>
        </div>
      </div>
    </Slide>
  );
}
