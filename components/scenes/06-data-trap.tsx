"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Scene } from "@/components/scroll/scene";
import { ProcessMatrix } from "@/components/mockups/process-matrix";
import { gsap } from "@/lib/gsap-setup";

/**
 * Slide 6 — Ловушка на работу с данными.
 *
 * THE SCENE for the pitch — defines our defensible corner.
 * Two chat panels render side-by-side: trusted Buddy (left) vs. sterile
 * External public chat (right). On scroll, the External panel "leaks"
 * sensitive data and the Process Matrix below lights up its OPSEC axis.
 *
 * Copy verbatim from ru_pitch.md:215–256.
 *
 * Desktop: pinned 2.5 viewport-heights, scrubbed timeline.
 * Mobile/reduced-motion: same content stacked vertically, no scrub.
 */
export function Scene06DataTrap() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;
      const section = stage.closest<HTMLElement>(".scene-shell");
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop:
            "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          isMobile:
            "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          isReduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, isMobile, isReduced } = context.conditions ?? {};

          const panels = stage.querySelectorAll<HTMLElement>("[data-panel]");
          const safeMsg = stage.querySelector<HTMLElement>("[data-msg='safe']");
          const leakMsg = stage.querySelector<HTMLElement>("[data-msg='leak']");
          const flag = stage.querySelector<HTMLElement>("[data-leak-flag]");
          const matrix = stage.querySelector<HTMLElement>("[data-matrix]");
          const quote = stage.querySelector<HTMLElement>("[data-quote]");

          // Reset to baseline
          gsap.set(panels, { opacity: 0, y: 40 });
          gsap.set(safeMsg, { opacity: 1 });
          gsap.set(leakMsg, { opacity: 0 });
          gsap.set(flag, { opacity: 0, y: 8 });
          gsap.set(matrix, { opacity: 0, y: 32 });
          gsap.set(quote, { opacity: 0, y: 12 });

          if (isReduced) {
            gsap.set([panels, safeMsg, leakMsg, flag, matrix, quote], {
              opacity: 1,
              y: 0,
            });
            gsap.set(safeMsg, { opacity: 0 });
            return;
          }

          if (isDesktop) {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "+=240%",
                pin: true,
                pinSpacing: true,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });

            tl.to(panels, {
              opacity: 1,
              y: 0,
              stagger: 0.15,
              duration: 0.5,
              ease: "expo.out",
            })
              .to(safeMsg, { opacity: 0, duration: 0.18 }, 0.55)
              .to(leakMsg, { opacity: 1, duration: 0.22 }, 0.6)
              .to(flag, { opacity: 1, y: 0, duration: 0.2 }, 0.7)
              .to(matrix, { opacity: 1, y: 0, duration: 0.32 }, 0.78)
              .to(quote, { opacity: 1, y: 0, duration: 0.25 }, 0.92);
            return;
          }

          if (isMobile) {
            gsap.to(panels, {
              opacity: 1,
              y: 0,
              stagger: 0.18,
              duration: 0.9,
              ease: "expo.out",
              scrollTrigger: {
                trigger: stage,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            });
            // Mobile shows the leak state immediately for readability.
            gsap.set(safeMsg, { opacity: 0 });
            gsap.set(leakMsg, { opacity: 1 });
            gsap.set([flag, matrix, quote], { opacity: 1, y: 0 });
          }
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
      pin={false}
    >
      <div
        ref={stageRef}
        className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 py-20 lg:px-12"
      >
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

        {/* Split-pane */}
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {/* LEFT: Buddy — trusted */}
          <article
            data-panel
            className="flex flex-col gap-4 rounded-2xl border border-trust/30 bg-fog p-6 lg:p-8"
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
                окей. как переписать <code className="text-mute">stripe.Refund.create</code>{" "}
                на батч?
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

          {/* RIGHT: External — sterile */}
          <article
            data-panel
            className="relative flex flex-col gap-4 rounded-2xl border border-line-strong bg-fog p-6 lg:p-8"
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
            <div className="relative">
              <Bubble side="me" tone="sterile" data-msg="safe">
                как переписать stripe.Refund.create на батч?
              </Bubble>
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
        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div data-matrix>
            <ProcessMatrix
              subtitle="Карточка кандидата · в реальном времени"
              leakLabel="Цифровая гигиена"
            />
          </div>
          <figure
            data-quote
            className="flex flex-col justify-center gap-4 rounded-2xl border border-line-strong bg-fog p-6 lg:p-8"
          >
            <p
              className="font-display text-paper"
              style={{ fontSize: "var(--text-h2)", lineHeight: 1.15 }}
            >
              <span className="text-flame">11%</span> всего, что вставляют в
              ChatGPT — внутренняя информация.
            </p>
            <p className="text-meta text-mute">
              Каждый одиннадцатый сотрудник. Это и есть навык, которого нет
              ни у одного конкурента.
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
