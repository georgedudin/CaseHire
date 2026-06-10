"use client";

import { Scene } from "@/components/scroll/scene";

export function Scene07WhoFills() {
  return (
    <Scene id="who-fills" ariaLabel="Две аудитории: заказчик и кандидат" pin={false}>
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-meta uppercase tracking-[0.32em] text-dim">
          07 · Сцена в разработке
        </p>
        <h2 className="font-display mt-6 text-h1 text-paper">
          Кто что заполняет
        </h2>
      </div>
    </Scene>
  );
}
