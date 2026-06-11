import { cn } from "@/lib/cn";

type CandidateIdeProps = {
  /** Pulse the External LLM bubble red — the OPSEC leak moment. */
  leak?: boolean;
  /** Compress the layout into a single editor column (used in tight grids). */
  compact?: boolean;
  className?: string;
};

/**
 * Pure-JSX mockup of the candidate's sandboxed web IDE.
 *
 * Layout breakpoints:
 *   <640px       : editor only (single column)            — tightest mobile
 *   sm 640+      : editor + stacked chats (2 columns)     — phablet/landscape
 *   md 768+      : tree + editor + stacked chats (3 cols) — tablet & desktop
 *
 * `compact` collapses to editor-only at every size — used inside dense
 * scene grids where the full 3-pane is too noisy.
 *
 * v2 note: the file-tree PII/secrets tags are AMBER and Russian
 * («⚠ персональные данные» / «⚠ секреты») — §2.4 color grammar: amber =
 * предупреждение; red's first pixel on screen is slide 8's flare.
 */
export function CandidateIde({
  leak = false,
  compact = false,
  className,
}: CandidateIdeProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line-strong bg-fog shadow-2xl shadow-ink/50",
        className
      )}
      aria-label="Веб-IDE кандидата с двумя чатами"
      role="img"
    >
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-line bg-ink/40 px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex shrink-0 gap-1.5">
          {/* neutral traffic light — red is reserved for slide 8 (§2.4) */}
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-flame/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-trust/60" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 truncate font-mono text-[11px] text-dim">
          <span className="hidden sm:inline">~/payments</span>
          <span className="hidden sm:inline text-line-strong">/</span>
          <span className="truncate text-mute">process_refund.py</span>
        </div>
        <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.25em] text-dim md:inline">
          КейсПодбор · сессия
        </span>
      </div>

      {/* Body */}
      <div
        className={cn(
          "grid",
          compact
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(200px,240px)] md:grid-cols-[150px_minmax(0,1fr)_minmax(220px,260px)]"
        )}
      >
        {/* File tree — only at md+ */}
        {!compact && (
          <aside className="hidden border-r border-line bg-ink/20 p-3 font-mono text-[11px] text-mute md:block">
            <p className="mb-3 text-[10px] uppercase tracking-widest text-dim">
              payments
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5">
                <Folder />
                <span>api</span>
              </li>
              <li className="ml-3 flex items-center gap-1.5">
                <File />
                <span>routes.py</span>
              </li>
              <li className="ml-3 flex items-center gap-1.5">
                <File />
                <span className="truncate text-paper">process_refund.py</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Folder />
                <span>db</span>
              </li>
              <li className="ml-3 flex items-center gap-1.5">
                <File />
                <span>schema.sql</span>
              </li>
              <li className="ml-3 flex items-center gap-1.5">
                <File />
                <span className="truncate text-amber-400/90">customers.csv</span>
              </li>
              <li className="ml-3 mt-0.5 text-[10px] text-amber-400/80">
                ⚠ персональные данные
              </li>
              <li className="mt-3 flex items-center gap-1.5">
                <File />
                <span>README.md</span>
              </li>
              <li className="flex items-center gap-1.5">
                <File />
                <span>.env</span>
              </li>
              <li className="ml-3 text-[10px] text-amber-400/80">⚠ секреты</li>
            </ul>
          </aside>
        )}

        {/* Editor — overflow-x-auto so long lines scroll inside the panel */}
        <div className="min-w-0 border-line bg-ink/10 p-2 font-mono text-[10px] leading-[1.45] sm:border-r sm:p-4 sm:text-[11.5px] sm:leading-relaxed">
          <pre className="overflow-x-auto">
            <code>
              <CodeLine n={1}>
                <Kw>def</Kw> <Fn>process_refund</Fn>
                <Pn>(customer_id, amount):</Pn>
              </CodeLine>
              {/* Phone budget (compact call sites, slide 9): lines 2–6 fold
                  away like an IDE code fold — the def + active return stay. */}
              {compact && (
                <div
                  aria-hidden="true"
                  className="flex gap-3 whitespace-pre text-dim sm:hidden"
                >
                  <span className="w-4 select-none text-right">2</span>
                  <span style={{ paddingLeft: "1.6em" }}>⋯</span>
                </div>
              )}
              <div className={cn(compact && "hidden sm:contents")}>
                <CodeLine n={2} indent={4} dim>
                  <St>{`"""Refund a charge — see /docs/refund-policy.md."""`}</St>
                </CodeLine>
                <CodeLine n={3} indent={4}>
                  customer = db.get_customer(customer_id)
                </CodeLine>
                <CodeLine n={4} indent={4}>
                  <Kw>if not</Kw> customer.is_active:
                </CodeLine>
                <CodeLine n={5} indent={8}>
                  <Kw>raise</Kw> InactiveCustomer(customer_id)
                </CodeLine>
                <CodeLine n={6} indent={4}>
                  charge = stripe.Charge.retrieve(customer.last_charge_id)
                </CodeLine>
              </div>
              <CodeLine n={7} indent={4} active>
                <Kw>return</Kw> stripe.Refund.<Fn>create</Fn>(
              </CodeLine>
              <CodeLine n={8} indent={8}>
                charge=charge.id, amount=<Num>{"amount"}</Num>,
              </CodeLine>
              <CodeLine n={9} indent={4}>
                )
              </CodeLine>
            </code>
          </pre>
        </div>

        {/* Chats — visible at sm+, hidden in compact mode */}
        {!compact && (
          <aside className="hidden flex-col bg-ink/30 sm:flex">
            {/* Buddy */}
            <div className="flex flex-1 flex-col gap-3 border-b border-line p-3">
              <header className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-trust">
                  <Dot /> ИИ-напарник
                </span>
                <span className="text-dim">знает код</span>
              </header>
              <ChatBubble who="buddy">
                Этот файл &mdash; обработчик возвратов. Перед изменением
                запусти тесты в <Code>tests/refund_test.py</Code>.
              </ChatBubble>
              <ChatBubble who="me">
                а что с <Code>customers.csv</Code>?
              </ChatBubble>
            </div>

            {/* External */}
            <div
              className={cn(
                "flex flex-1 flex-col gap-3 p-3",
                leak && "ring-2 ring-leak/60"
              )}
            >
              <header className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-sterile">
                  <Dot dim /> Внешний публичный чат
                </span>
                <span className="rounded-full border border-line bg-ink/40 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-sterile">
                  Публичный
                </span>
              </header>
              <ChatBubble who="external" leak={leak}>
                {leak
                  ? "перепиши на батч — вот данные: name,email,charge_id..."
                  : "как переписать stripe.Refund.create на батч?"}
              </ChatBubble>
              {leak && (
                <p className="text-[10px] text-leak">
                  ⚠ обнаружена утечка: customers.csv (точное совпадение)
                </p>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-line bg-ink/40 px-3 py-1 font-mono text-[10px] text-dim sm:px-4 sm:py-1.5">
        <span>python · 3.13 · venv</span>
        <span className="flex items-center gap-3">
          <span>tests: 12 ✓</span>
          <span className="hidden sm:inline">main</span>
        </span>
      </div>
    </div>
  );
}

/* ---------- atoms ---------- */

function CodeLine({
  n,
  indent = 0,
  active,
  dim,
  children,
}: {
  n: number;
  indent?: number;
  active?: boolean;
  dim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 whitespace-pre",
        active && "-mx-4 rounded-sm bg-flame/10 px-4",
        dim && "text-dim"
      )}
    >
      <span className="w-4 select-none text-right text-dim">{n}</span>
      <span style={{ paddingLeft: `${indent * 0.4}em` }} className="text-paper">
        {children}
      </span>
    </div>
  );
}

const Kw = ({ children }: { children: React.ReactNode }) => (
  <span className="text-flame">{children}</span>
);
const Fn = ({ children }: { children: React.ReactNode }) => (
  <span className="text-glass">{children}</span>
);
const Pn = ({ children }: { children: React.ReactNode }) => (
  <span className="text-mute">{children}</span>
);
const St = ({ children }: { children: React.ReactNode }) => (
  <span className="text-trust/70">{children}</span>
);
const Num = ({ children }: { children: React.ReactNode }) => (
  <span className="text-ember">{children}</span>
);

function ChatBubble({
  who,
  leak,
  children,
}: {
  who: "buddy" | "me" | "external";
  leak?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-[92%] rounded-lg px-2.5 py-1.5 text-[11px] leading-snug",
        who === "buddy" && "self-start bg-trust/15 text-paper",
        who === "me" && "self-end bg-fog text-paper",
        who === "external" &&
          (leak ? "self-end bg-leak/15 text-paper" : "self-end bg-line text-mute")
      )}
    >
      {children}
    </div>
  );
}

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-ink/40 px-1 py-0.5 font-mono text-[10px] text-mute">
    {children}
  </code>
);

const Dot = ({ dim }: { dim?: boolean } = {}) => (
  <span
    className={cn(
      "inline-block h-1.5 w-1.5 rounded-full",
      dim ? "bg-sterile" : "bg-trust"
    )}
    aria-hidden="true"
  />
);

const Folder = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    className="shrink-0 text-dim"
  >
    <path d="M1 4a1 1 0 0 1 1-1h4l1.5 1.5H14a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Z" />
  </svg>
);

const File = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    className="shrink-0 text-dim"
  >
    <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6L10 2H3Z" />
  </svg>
);
