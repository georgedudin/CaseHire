"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Scene } from "@/components/scroll/scene";
import { ProcessMatrix } from "@/components/mockups/process-matrix";
import { gsap } from "@/lib/gsap-setup";

/**
 * Slide 6 — Ловушка на работу с данными. THE scene.
 *
 * Originally tried to pin + scrub a multi-stage timeline, but the panel +
 * matrix + quote block is too tall to fit one viewport on common laptops.
 * Now: flow scene with a two-phase entry timeline.
 *   Phase A (on enter): the two chat panels + the matrix slide in.
 *   Phase B (slightly later trigger): the External LLM message flips
 *     from a safe question to the leaked customer data; the matrix gets
 *     a red pulse on the digital-hygiene axis; the leak flag appears.
 */
export function Scene06DataTrap() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      const panels = stage.querySelectorAll<HTMLElement>("[data-panel]");
      const safeMsg = stage.querySelector<HTMLElement>("[data-msg='safe']");
      const leakMsg = stage.querySelector<HTMLElement>("[data-msg='leak']");
      const flag = stage.querySelector<HTMLElement>("[data-leak-flag]");
      const matrix = stage.querySelector<HTMLElement>("[data-matrix]");
      const quote = stage.querySelector<HTMLElement>("[data-quote]");

      // Shared initial state — every path starts here.
      gsap.set(panels, { opacity: 0, y: 36 });
      gsap.set(safeMsg, { opacity: 1 });
      gsap.set(leakMsg, { opacity: 0 });
      gsap.set(flag, { opacity: 0, y: 8 });
      gsap.set(matrix, { opacity: 0, y: 28 });
      gsap.set(quote, { opacity: 0, y: 12 });

      const mm = gsap.matchMedia();

      // Reduced-motion — snap everything to its end state.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([...panels, leakMsg, flag, matrix, quote], {
          opacity: 1,
          y: 0,
        });
        gsap.set(safeMsg, { opacity: 0 });
      });

      // lg+ — pinned scrubbed timeline. Phase A then a held breath then
      // the leak. Lets the reader absorb the boundary before it's broken.
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: stage,
                start: "top top",
                end: "+=140%",
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            })
            .to(panels, {
              opacity: 1,
              y: 0,
              stagger: 0.18,
              duration: 0.6,
              ease: "expo.out",
            })
            .to(
              matrix,
              { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" },
              "-=0.3"
            )
            .to({}, { duration: 0.4 }) // hold — reader absorbs panels
            .to(safeMsg, { opacity: 0, duration: 0.2 })
            .to(leakMsg, { opacity: 1, duration: 0.3 }, "-=0.05")
            .to(flag, { opacity: 1, y: 0, duration: 0.25 }, "-=0.1")
            .to(quote, { opacity: 1, y: 0, duration: 0.4 }, "-=0.1");
        }
      );

      // <lg (phone, tablet zone) — flow with two on-enter timelines.
      // No pin, no scrub: the screen is too small for the cinematic feel
      // and pinning would trap the user on a tiny canvas.
      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: stage,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            })
            .to(panels, {
              opacity: 1,
              y: 0,
              stagger: 0.16,
              duration: 0.8,
              ease: "expo.out",
            })
            .to(
              matrix,
              { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" },
              "-=0.3"
            );

          gsap
            .timeline({
              scrollTrigger: {
                trigger: stage,
                start: "top 35%",
                toggleActions: "play none none reverse",
              },
            })
            .to(safeMsg, { opacity: 0, duration: 0.25 })
            .to(leakMsg, { opacity: 1, duration: 0.35 }, "-=0.1")
            .to(flag, { opacity: 1, y: 0, duration: 0.3 }, "-=0.1")
            .to(quote, { opacity: 1, y: 0, duration: 0.45 }, "-=0.05");
        }
      );

      return () => mm.revert();
    },
    { scope: stageRef }
  );

  return (
    <Scene
      id="data-trap"
      ariaLabel="Ловушка на работу с данными: два чата, одна граница"
    >
      <div ref={stageRef} className="scene-content">
        <p
          data-panel
          className="text-meta uppercase tracking-[0.3em] text-dim"
        >
          06 · Ещё одно
        </p>

        <h2
          data-panel
          className="font-display mt-6 max-w-[20ch] text-paper"
          style={{ fontSize: "var(--text-display)" }}
        >
          Два чата.{" "}
          <span className="text-flame">Одна граница.</span>
        </h2>

        {/* Split-pane: stacked on mobile, side-by-side on desktop */}
        <div className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-2 lg:gap-6">
          {/* LEFT — Buddy */}
          <article
            data-panel
            className="flex flex-col gap-4 rounded-2xl border border-trust/30 bg-fog p-6 sm:p-7 lg:p-8"
          >
            <header className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-meta text-trust">
                <span className="h-2 w-2 rounded-full bg-trust" />
                ИИ-напарник
              </span>
              <span className="text-meta text-mute">в курсе проекта</span>
            </header>
            <p className="text-meta text-mute">
              знает базу кода · знает команду · знает задачу
            </p>
            <div className="space-y-2.5">
              <Bubble side="them" tone="trust">
                Файл <code className="text-mute">customers.csv</code> помечен{" "}
                <span className="text-leak">персональные данные</span>. Внутри
                кейса можно работать с ним напрямую.
              </Bubble>
              <Bubble side="me">
                окей. как переписать{" "}
                <code className="text-mute">stripe.Refund.create</code> на батч?
              </Bubble>
              <Bubble side="them" tone="trust">
                Покажу на 5 строках — пробежим вместе.
              </Bubble>
            </div>
            <footer className="mt-auto text-meta text-mute">
              <span className="text-paper">Доверенный канал.</span>{" "}
              Чувствительные артефакты — можно.
            </footer>
          </article>

          {/* RIGHT — External */}
          <article
            data-panel
            className="relative flex flex-col gap-4 rounded-2xl border border-line-strong bg-fog p-6 sm:p-7 lg:p-8"
          >
            <header className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-meta text-sterile">
                <span className="h-2 w-2 rounded-full bg-sterile" />
                Внешний публичный чат
              </span>
              <span className="rounded-full border border-line bg-ink/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-sterile">
                Публичный
              </span>
            </header>
            <p className="text-meta text-mute">
              сторонний сервис · не знает контекста
            </p>
            {/* Message slot — safe and leak share space, fade between */}
            <div className="relative min-h-[6.5rem]">
              <div className="absolute inset-0" data-msg="safe">
                <Bubble side="me" tone="sterile">
                  как переписать stripe.Refund.create на батч?
                </Bubble>
              </div>
              <div className="absolute inset-0" data-msg="leak">
                <Bubble side="me" tone="leak">
                  перепиши на батч — вот данные:{" "}
                  <code className="text-paper">
                    name,email,charge_id,amount
                  </code>
                  <br />
                  Маркова,Е.,m@…,ch_3Pq…,4500…
                </Bubble>
              </div>
            </div>
            <div
              data-leak-flag
              className="mt-3 rounded-lg border border-leak/40 bg-leak/10 px-3 py-2 text-meta text-leak"
            >
              ⚠ обнаружена утечка: <code>customers.csv</code> · точное
              совпадение
            </div>
            <footer className="mt-auto text-meta text-mute">
              <span className="text-paper">Недоверенный канал.</span>{" "}
              Чувствительные артефакты — нельзя.
            </footer>
          </article>
        </div>

        {/* Matrix + quote */}
        <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-2">
          <div data-matrix>
            <ProcessMatrix
              subtitle="Карточка кандидата · в реальном времени"
              leakLabel="Цифровая гигиена"
            />
          </div>
          <figure
            data-quote
            className="flex flex-col justify-center gap-4 rounded-2xl border border-line-strong bg-fog p-6 sm:p-7 lg:p-8"
          >
            <p
              className="font-display text-paper"
              style={{ fontSize: "var(--text-h2)", lineHeight: 1.15 }}
            >
              <span className="text-flame">11%</span> всего, что вставляют в
              ChatGPT — внутренняя информация.
            </p>
            <p className="text-meta text-mute">
              Каждый одиннадцатый сотрудник. Это и есть навык, которого нет ни
              у одного конкурента.
            </p>
            <figcaption className="mt-2 text-meta uppercase tracking-[0.2em] text-dim">
              Cyberhaven · телеметрия 1,6 млн сотрудников
            </figcaption>
          </figure>
        </div>
      </div>
    </Scene>
  );
}

function Bubble({
  side,
  tone,
  children,
  ...rest
}: {
  side: "me" | "them";
  tone?: "trust" | "sterile" | "leak";
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const base =
    "max-w-[92%] rounded-xl px-3 py-2 text-meta leading-snug border";
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
    <div className={`${base} ${align} ${variant}`} {...rest}>
      {children}
    </div>
  );
}
