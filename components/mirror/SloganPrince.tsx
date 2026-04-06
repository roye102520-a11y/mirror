"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const CYCLE_S = 15;

/** 静止：0–10s 左侧；11.5–13.5s 右侧落地停留；其余为跳跃过程 */
function inRestPhase(elapsedS: number): boolean {
  const u = ((elapsedS % CYCLE_S) + CYCLE_S) % CYCLE_S;
  return u < 10 || (u >= 11.5 && u < 13.5);
}

type SloganPrinceProps = {
  children: ReactNode;
};

/**
 * 包裹英文标语；小王子在上层 z-50、pointer-events:none，子文案 z-55 保证可读与可选中。
 */
export function SloganPrince({ children }: SloganPrinceProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const t0 = useRef<number | null>(null);
  const [restPhase, setRestPhase] = useState(true);
  const [near, setNear] = useState(false);

  useEffect(() => {
    t0.current = performance.now();
    const id = window.setInterval(() => {
      if (t0.current == null) return;
      setRestPhase(inRestPhase((performance.now() - t0.current) / 1000));
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const pad = 56;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nearNow =
        e.clientX >= r.left - pad &&
        e.clientX <= r.right + pad &&
        e.clientY >= r.top - pad &&
        e.clientY <= r.bottom + pad;
      setNear(nearNow);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const showWeatherBubble = restPhase && near;

  return (
    <div
      ref={wrapRef}
      className="mirror-slogan-anchor relative mx-auto mt-10 max-w-xl overflow-visible px-4 pb-16 sm:pb-[4.5rem]"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-50 h-28 overflow-visible sm:h-32" aria-hidden>
        <p
          className={`mirror-slogan-prince-bubble${showWeatherBubble ? " mirror-slogan-prince-bubble--visible" : ""}`}
        >
          今天天气不错，对吧？
        </p>
        <div className="mirror-slogan-prince-stage">
          <div className="mirror-slogan-prince-jump">
            <div className="mirror-slogan-prince-glass animate-calm-breathe-mascot">
              <img
                className="mirror-slogan-prince-img"
                src="/prince.png"
                alt=""
                width={66}
                height={66}
                decoding="async"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-[55]">{children}</div>
    </div>
  );
}
