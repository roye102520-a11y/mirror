"use client";

import { useEffect, useState } from "react";

export type EmotionalCompanionProps = {
  /** 递增时触发一次 1.5s 的抛物线跳跃 */
  jumpSignal: number;
  className?: string;
};

/**
 * 小王子：/prince.png · 60px · pointer-events: none · 不参与点击。
 * 由父级 absolute 定位；opacity 在 .emotional-companion。
 */
export function EmotionalCompanion({ jumpSignal, className = "" }: EmotionalCompanionProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (jumpSignal <= 0) return;
    setPlaying(true);
    const t = window.setTimeout(() => setPlaying(false), 1500);
    return () => window.clearTimeout(t);
  }, [jumpSignal]);

  return (
    <div
      className={["emotional-companion", className].filter(Boolean).join(" ")}
      aria-hidden
    >
      <div className={playing ? "emotional-companion-hop" : undefined}>
        <div className="emotional-companion-glass">
          {/* eslint-disable-next-line @next/next/no-img-element -- public 资产，需 pixelated 与固定尺寸 */}
          <img
            src="/prince.png"
            alt=""
            width={60}
            height={60}
            className="emotional-companion-img"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
