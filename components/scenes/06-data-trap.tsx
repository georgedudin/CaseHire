"use client";

import { Scene } from "@/components/scroll/scene";

export function Scene06DataTrap() {
  return (
    <Scene id="data-trap" ariaLabel="Ловушка на работу с данными" pin={false}>
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-meta uppercase tracking-[0.32em] text-dim">
          06 · Сцена в разработке
        </p>
        <h2 className="font-display mt-6 text-h1 text-paper">
          Два чата. Одна граница.
        </h2>
      </div>
    </Scene>
  );
}
