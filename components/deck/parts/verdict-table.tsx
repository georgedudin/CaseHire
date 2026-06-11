/**
 * <VerdictTable> — slide 12: «Вердикт-таблица» (landing_v2.md §4 slide 12
 * + Director's cut).
 *
 * Motion targets (driven by 12-competitors.tsx):
 *   [data-row="competitor"] ×5 — cascade x−16, later dimmed to 45%
 *   [data-stamp-cell][data-glyph="cross"] — ✗ stamps 1.6→1 / −8°→0 (22, the
 *     sanctioned stamp wall) · [data-glyph="check"] — quiet ✓ fades
 *   [data-col] — column index for the lock "press" dips
 *   [data-row="us"] + [data-us-sweep] — flame/8 bg sweep (scaleX origin
 *     left; an absolute overlay because a <tr> background can't transform;
 *     wrapper is `isolate` so the −z overlay paints above bg-fog, below text)
 *   [data-lock-ring] — ring span fired by each flame ✓ lock (scale 1→1.6)
 *
 * RED RULE: ✗ are dim gray (text-dim), NEVER red — flame is the only
 * accent here (§2.4). Row border idle is STATIC (Director's cut binding).
 *
 * Mobile (Director's cut): short axis forms in a vertical-rl 80px header
 * band; the full six axes live in the sr-only <caption> legend. Karat's
 * «$248 млн» sub-label is desktop-only; names truncate at 112px.
 */
import { cn } from "@/lib/cn";

type VerdictRow = {
  name: string;
  /** Dim meta sub-label (Karat: «$248 млн»), desktop-only. */
  meta?: string;
  /** ✓/✗ per axis, in AXES order. */
  cells: boolean[];
};

const AXES: { full: string; short: string }[] = [
  { full: "ИИ в среде", short: "ИИ в среде" },
  { full: "Канал на утечки", short: "Утечки" },
  { full: "Под джунов", short: "Джуны" },
  { full: "Без живого интервьюера", short: "Без интервью" },
  { full: "Кейс под позицию", short: "Кейс" },
  { full: "Локально в РФ", short: "РФ" },
];

const COMPETITORS: VerdictRow[] = [
  { name: "HackerRank", cells: [true, false, false, true, false, false] },
  { name: "Codility (Cody)", cells: [true, false, false, true, false, false] },
  { name: "CodeSignal (Cosmo)", cells: [true, false, false, true, false, false] },
  { name: "CoderPad", cells: [true, false, false, false, false, false] },
  { name: "Karat NextGen", meta: "$248 млн", cells: [true, false, false, false, false, false] },
];

const US: VerdictRow = {
  name: "КейсПодбор",
  cells: [true, true, true, true, true, true],
};

type GlyphTone = "mute" | "flame" | "trust";

function GlyphCell({
  value,
  col,
  tone = "mute",
}: {
  value: boolean;
  col: number;
  tone?: GlyphTone;
}) {
  const glyph = (
    <span
      data-stamp-cell
      data-glyph={value ? "check" : "cross"}
      data-col={col}
      className={cn(
        "inline-block text-[15px] lg:text-[17px]",
        value
          ? tone === "flame"
            ? "font-semibold text-flame"
            : tone === "trust"
              ? "font-semibold text-trust"
              : "text-mute"
          : "text-dim", // ✗ — dim gray, not red (§2.4)
      )}
      aria-hidden="true"
    >
      {value ? "✓" : "✗"}
    </span>
  );
  return (
    <td className="text-center">
      {tone === "flame" ? (
        <span className="relative inline-block">
          {glyph}
          {/* Lock ring — fired by the flame ✓ lock (scale 1→1.6 fade). */}
          <span
            data-lock-ring
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-full border border-ember opacity-0"
          />
        </span>
      ) : (
        glyph
      )}
      <span className="sr-only">{value ? "да" : "нет"}</span>
    </td>
  );
}

export function VerdictTable({ className }: { className?: string }) {
  return (
    <div
      data-table
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-line bg-fog",
        className,
      )}
    >
      {/* Flame/8 sweep under the КейсПодбор row — positioned by the slide's
          create() from the live row geometry; scaleX 0→1 origin-left. */}
      <div
        data-us-sweep
        aria-hidden="true"
        className="absolute inset-x-0 -z-10 origin-left bg-flame/8"
      />
      <table className="w-full table-fixed border-collapse">
        {/* sr-only legend with the FULL axes (mobile shows short forms). */}
        <caption className="sr-only">
          Оси сравнения: ИИ в среде · Канал на утечки · Под джунов · Без
          живого интервьюера · Кейс под позицию · Локально в РФ
        </caption>
        <colgroup>
          <col className="w-[112px] lg:w-[200px]" />
          {AXES.map((a) => (
            <col key={a.full} />
          ))}
        </colgroup>
        <thead>
          <tr className="h-20 border-b border-line lg:h-14">
            <th scope="col" className="sr-only">
              Игрок
            </th>
            {AXES.map((a) => (
              <th
                key={a.full}
                scope="col"
                className="px-1 align-bottom pb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-mute lg:text-[11px]"
              >
                <span className="hidden lg:inline">{a.full}</span>
                <span
                  className="inline-block max-h-[64px] [writing-mode:vertical-rl] lg:hidden"
                  aria-hidden="true"
                >
                  {a.short}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPETITORS.map((row) => (
            // Frozen post-auto-chain state: rivals dimmed to 45% (SSR frame;
            // gsap owns the value at runtime).
            <tr
              key={row.name}
              data-row="competitor"
              className="h-9 border-b border-line opacity-45 lg:h-12"
            >
              <th
                scope="row"
                className="truncate px-3 text-left text-[12px] font-normal text-mute lg:px-4 lg:text-[14px]"
              >
                {row.name}
                {row.meta ? (
                  <span className="hidden text-[11px] text-dim lg:block">
                    {row.meta}
                  </span>
                ) : null}
              </th>
              {row.cells.map((v, i) => (
                <GlyphCell key={AXES[i].full} value={v} col={i} />
              ))}
            </tr>
          ))}
          <tr
            data-row="us"
            className="h-10 border-t border-line-strong lg:h-12"
          >
            <th
              scope="row"
              className="truncate px-3 text-left text-[12px] font-semibold text-paper lg:px-4 lg:text-[14px]"
            >
              {US.name}
            </th>
            {US.cells.map((v, i) => (
              // First ✓ (shared axis «ИИ в среде») in trust, five moat ✓ in flame.
              <GlyphCell
                key={AXES[i].full}
                value={v}
                col={i}
                tone={i === 0 ? "trust" : "flame"}
              />
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
