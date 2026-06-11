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

export function TeamleadSetup({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Кабинет тимлида: четырёхслойная настройка"
      className={cn(
        "rounded-2xl border border-line-strong bg-fog p-5 shadow-2xl shadow-ink/40 sm:p-6",
        className
      )}
    >
      <header className="mb-5 flex items-baseline justify-between">
        <div>
          <p className="text-meta uppercase tracking-[0.25em] text-dim">
            Тимлид
          </p>
          <h3
            className="font-display mt-0.5 text-paper"
            style={{ fontSize: "var(--text-h2)", lineHeight: 1.1 }}
          >
            4 слоя контекста
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-trust">
          15 мин один раз
        </span>
      </header>

      <ul className="space-y-2.5">
        {LAYERS.map((layer) => (
          <li
            key={layer.n}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-line bg-ink/20 p-3"
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-meta tabular-nums",
                layer.progress === 100
                  ? "border-trust/40 bg-trust/15 text-trust"
                  : "border-flame/40 bg-flame/15 text-flame"
              )}
            >
              {layer.n}
            </span>
            <div className="min-w-0">
              <p className="text-meta text-paper">{layer.label}</p>
              <p className="text-[10px] text-dim">{layer.note}</p>
            </div>
            <span
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
    </div>
  );
}
