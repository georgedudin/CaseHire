import { cn } from "@/lib/cn";

const LAYERS = [
  {
    n: 1,
    label: "Стек / окружение",
    note: "Шаблон или абзац описания",
    progress: 100,
  },
  {
    n: 2,
    label: "Идентичность команды",
    note: "5–7 ответов",
    progress: 100,
  },
  {
    n: 3,
    label: "Бизнес-контекст",
    note: "~300 слов",
    progress: 100,
  },
  {
    n: 4,
    label: "Задача под позицию",
    note: "1–3 строки",
    progress: 65,
  },
];

type TeamleadSetupProps = {
  /**
   * Slide-9 desktop mode: hides the case-preview box + button and tightens
   * the chrome so the card lands at ≈230px (fits the buyer column at 768).
   */
  dense?: boolean;
  /**
   * Slide-9 mobile mode: collapses the whole card to a single ~40px row —
   * «Тимлид» · «4 слоя контекста» · four check-dots · «15 мин один раз».
   * Takes precedence over `dense`.
   */
  strip?: boolean;
  className?: string;
};

export function TeamleadSetup({
  dense = false,
  strip = false,
  className,
}: TeamleadSetupProps) {
  if (strip) {
    return (
      <div
        role="img"
        aria-label="Кабинет тимлида: четырёхслойная настройка, 15 минут один раз"
        className={cn(
          "flex items-center gap-2 rounded-xl border border-line-strong bg-fog px-3 py-1.5 shadow-2xl shadow-ink/40",
          className
        )}
      >
        <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-dim">
          Тимлид
        </span>
        <span data-team-head className="min-w-0 truncate text-[12px] text-paper">
          4 слоя контекста
        </span>
        <span aria-hidden="true" className="flex shrink-0 items-center gap-1">
          {LAYERS.map((layer) => (
            <span
              key={layer.n}
              data-layer-dot={layer.n}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                layer.progress === 100 ? "bg-trust" : "bg-flame"
              )}
            />
          ))}
        </span>
        <span className="ml-auto shrink-0 text-[9px] uppercase tracking-wide text-trust">
          15 мин один раз
        </span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label="Кабинет тимлида: четырёхслойная настройка"
      className={cn(
        "rounded-2xl border border-line-strong bg-fog shadow-2xl shadow-ink/40",
        dense ? "p-4" : "p-5 sm:p-6",
        className
      )}
    >
      <header
        className={cn(
          "flex items-baseline justify-between",
          dense ? "mb-2" : "mb-5"
        )}
      >
        <div>
          <p className="text-meta uppercase tracking-[0.25em] text-dim">
            Тимлид
          </p>
          <h3
            data-team-head
            className={cn("font-display mt-0.5 text-paper", dense && "text-lg")}
            style={
              dense ? undefined : { fontSize: "var(--text-h2)", lineHeight: 1.1 }
            }
          >
            4 слоя контекста
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-trust">
          15 мин один раз
        </span>
      </header>

      <ul className={dense ? "space-y-1.5" : "space-y-2.5"}>
        {LAYERS.map((layer) => (
          <li
            key={layer.n}
            className={cn(
              "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-line bg-ink/20",
              dense ? "p-1.5" : "p-3"
            )}
          >
            <span
              data-layer-badge={layer.n}
              className={cn(
                "flex items-center justify-center rounded-full border text-meta tabular-nums",
                dense ? "h-6 w-6 text-[11px]" : "h-7 w-7",
                layer.progress === 100
                  ? "border-trust/40 bg-trust/15 text-trust"
                  : "border-flame/40 bg-flame/15 text-flame"
              )}
            >
              {layer.n}
            </span>
            <div className="min-w-0">
              <p className="text-meta text-paper">{layer.label}</p>
              {!dense && <p className="text-[10px] text-dim">{layer.note}</p>}
            </div>
            <span
              data-layer-status={layer.n}
              className={cn(
                "text-[10px] tabular-nums",
                layer.progress === 100 ? "text-trust" : "text-flame"
              )}
            >
              {layer.progress === 100 ? "✓" : `${layer.progress}%`}
            </span>
          </li>
        ))}
      </ul>

      {!dense && (
        <div className="mt-5 rounded-xl border border-line bg-ink/30 p-3">
          <p className="text-[10px] uppercase tracking-widest text-dim">
            Превью кейса
          </p>
          <p className="mt-1.5 text-meta text-mute line-clamp-3">
            «Реализовать batch-обработчик возвратов поверх stripe API, с
            корректным обращением к таблице{" "}
            <code className="text-paper">customers</code>. Покрыть тестами.»
          </p>
          <button
            type="button"
            className="mt-3 rounded-full bg-flame px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink"
          >
            Отправить кандидатам
          </button>
        </div>
      )}
    </div>
  );
}
