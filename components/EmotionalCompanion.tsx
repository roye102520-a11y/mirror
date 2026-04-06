"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WHISPERS = [
  "听，是风的声音",
  "这一刻很轻。",
  "慢慢来，也没关系。",
  "深呼吸一下。",
];

function randomInRange(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

type Burst = { id: number; side: "left" | "right"; whisper: string };

/**
 * 首页 hub：mirror 标题上方左/右随机闪现（random-appearance）；pointer-events: none。
 */
export function EmotionalCompanion() {
  const [burst, setBurst] = useState<Burst | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const scheduleNext = useCallback(() => {
    if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setBurst({
        id: Date.now(),
        side: Math.random() < 0.5 ? "left" : "right",
        whisper: WHISPERS[randomInRange(0, WHISPERS.length - 1)]!,
      });
    }, randomInRange(15_000, 20_000));
  }, []);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    };
  }, [scheduleNext]);

  const onBurstAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    setBurst(null);
    scheduleNext();
  };

  if (!burst) return null;

  return (
    <div
      className={`mirror-emotional-companion mirror-emotional-companion--${burst.side}`}
      aria-hidden
    >
      <div
        key={burst.id}
        className="mirror-mascot-random-burst"
        onAnimationEnd={onBurstAnimationEnd}
      >
        <img
          className="mirror-mascot-img"
          src="/prince.png"
          alt=""
          width={60}
          height={60}
          decoding="async"
          draggable={false}
        />
      </div>
      <p className="mirror-mascot-whisper-bubble">{burst.whisper}</p>
    </div>
  );
}
