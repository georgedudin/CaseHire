import { cn } from "@/lib/cn";

type CandidateIdeProps = {
  /** Highlight the OPSEC leak — pulse on the chat where the leak happens. */
  leak?: boolean;
  /** Compress vertical chats into a single panel for crowded scene layouts. */
  compact?: boolean;
  className?: string;
};

/**
 * Pure-JSX mockup of the candidate's sandboxed web IDE.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ ●●●  ~/payments/process_refund.py                           │
 *   ├──────────┬──────────────────────────┬─────────────────────┤
 *   │ tree     │ code editor              │ AI Buddy            │
 *   │          │                          │ ────────────────── │
 *   │          │                          │ External LLM       │
 *   └──────────┴──────────────────────────┴─────────────────────┘
 *
 * Reused by scenes 5 (How), 6 (Data Trap), 7 (Who Fills), 9 (Roadmap).
 * The `leak` prop drives a red pulse on the External LLM message — the
 * "moment that lights up the matrix".
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
      <div className="flex items-center gap-3 border-b border-line bg-ink/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-leak/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-flame/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-trust/60" />
        </div>
        <div className="flex flex-1 items-center gap-2 font-mono text-[11px] text-dim">
          <span className="hidden sm:inline">~/payments</span>
          <span className="hidden sm:inline text-line-strong">/</span>
          <span className="text-mute">process_refund.py</span>
        </div>
        <span className="hidden text-[10px] uppercase tracking-[0.25em] text-dim md:inline">
          КейсПодбор · сессия
        </span>
      </div>

      {/* Body */}
      <div
        className={cn(
          "grid",
          // Desktop: 3 columns. Mobile: stack editor + chat.
          compact
            ? "grid-cols-1"
            : "grid-cols-[140px_minmax(0,1fr)] md:grid-cols-[160px_minmax(0,1fr)_minmax(220px,260px)]"
        )}
      >
        {/* File tree */}
        {!compact && (
          <aside className="hidden border-r border-line bg-ink/20 p-3 font-mono text-[11px] text-mute sm:block">
            <p className="mb-3 text-[10px] uppercase tracking-widest text-dim">
              payments
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5">
                <Folder /> <span>api</span>
              </li>
              <li className="ml-3 flex items-center gap-1.5">
                <File /> <span>routes.py</span>
              </li>
              <li className="ml-3 flex items-center gap-1.5">
                <File /> <span className="text-paper">process_refund.py</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Folder /> <span>db</span>
              </li>
              <li className="ml-3 flex items-center gap-1.5">
                <File /> <span>schema.sql</span>
              </li>
              <li className="flex items-center gap-1.5">
                <File />
                <span className="text-leak">customers.csv</span>
              </li>
              <li className="ml-3 mt-0.5 text-[10px] text-leak/80">
                ⚠ PII · internal
              </li>
              <li className="mt-3 flex items-center gap-1.5">
                <File /> <span>README.md</span>
              </li>
              <li className="flex items-center gap-1.5">
                <File /> <span>.env</span>
              </li>
              <li className="ml-3 text-[10px] text-leak/80">⚠ secrets</li>
            </ul>
          </aside>
        )}

        {/* Editor */}
        <div className="border-r border-line bg-ink/10 p-4 font-mono text-[11.5px] leading-relaxed">
          <pre className="overflow-x-auto">
            <code>
              <CodeLine n={1}>
                <Kw>def</Kw> <Fn>process_refund</Fn>
                <Pn>(customer_id, amount):</Pn>
              </CodeLine>
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

        {/* Chats — two stacked panels */}
        {!compact && (
          <aside className="flex flex-col bg-ink/30 md:max-h-none">
            {/* Buddy */}
            <div className="flex flex-1 flex-col gap-3 border-b border-line p-3">
              <header className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-trust">
                  <Dot /> ИИ-напарник
                </span>
                <span className="text-dim">знает код · доверен</span>
              </header>
              <ChatBubble who="buddy">
                Этот файл &mdash; обработчик возвратов. Перед изменением запусти
                тесты в <Code>tests/refund_test.py</Code>.
              </ChatBubble>
              <ChatBubble who="me">
                а что с <Code>customers.csv</Code>?
              </ChatBubble>
            </div>

            {/* External public LLM */}
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
      <div className="flex items-center justify-between border-t border-line bg-ink/40 px-4 py-1.5 font-mono text-[10px] text-dim">
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
        "flex gap-3",
        active && "bg-flame/10 -mx-4 px-4 rounded-sm",
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
    className="text-dim"
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
    className="text-dim"
  >
    <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6L10 2H3Z" />
  </svg>
);
