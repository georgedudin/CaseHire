"use client";

import { Scene } from "@/components/scroll/scene";

export function Scene03Interviews() {
  return (
    <Scene id="interviews" ariaLabel="Глубинные интервью" pin={false}>
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-meta uppercase tracking-[0.32em] text-dim">
          03 · Сцена в разработке
        </p>
        <h2 className="font-display mt-6 text-h1 text-paper">
          16 интервью. Услышали одно и то&nbsp;же.
        </h2>
      </div>
    </Scene>
  );
}
