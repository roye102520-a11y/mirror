"use client";

import { useEffect, useState } from "react";

/** public/prince.png，与物理文件一致 */
const MASCOT_SRC = "/prince.png" as const;

const CYCLE_MS = 15_000;
const REST_MS = 10_000;

export type EmotionalCompanionProps = {
  /** 鼠标靠近 .mirror-brand-anchor（由父级监听） */
  anchorHovered: boolean;
};

/**
 * 顶栏品牌旁：10s 静坐 + 5s 抛物线跳跃（playful-jump）；静止且靠近时缓缓显示气泡。
 */
export function EmotionalCompanion({ anchorHovered }: EmotionalCompanionProps) {
  const [inRestPhase, setInRestPhase] = useState(true);

  useEffect(() => {
    const tick = () => {
      setInRestPhase((Date.now() % CYCLE_MS) < REST_MS);
    };
    tick();
    const id = window.setInterval(tick, 120);
    return () => window.clearInterval(id);
  }, []);

  const showBubble = inRestPhase && anchorHovered;

  return (
    <div className="mascot-header-root" aria-hidden>
      <p className={`mascot-header-bubble${showBubble ? " mascot-header-bubble--on" : ""}`}>
        今天天气不错，对吧？
      </p>
      <div className="mascot-header-jump">
        <img
          className="mascot-header-img"
          src={MASCOT_SRC}
          alt=""
          width={40}
          height={40}
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  );
}
