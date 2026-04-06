"use client";

import { useEmotionalAmbient } from "@/context/EmotionalAmbientContext";
import { useEffect, useState } from "react";

/**
 * 全局背景脉动曲线；z-index: 5。问卷选项点击时短暂变亮（acknowledgeChoice）。
 */
export function EmotionalPulse() {
  const { pulseGen } = useEmotionalAmbient();
  const [lit, setLit] = useState(false);

  useEffect(() => {
    if (pulseGen === 0) return;
    setLit(true);
    const t = window.setTimeout(() => setLit(false), 700);
    return () => window.clearTimeout(t);
  }, [pulseGen]);

  return (
    <div className="emotional-pulse-layer" aria-hidden>
      <svg
        className={lit ? "emotional-pulse-svg emotional-pulse-svg--lit" : "emotional-pulse-svg"}
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
      >
        <title>ambient</title>
        <path
          d="M0,55 Q80,15 160,45 T320,35 T400,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0,68 Q100,40 200,62 T400,58"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.85"
          opacity="0.65"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
