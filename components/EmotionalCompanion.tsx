"use client";

import { useEffect, useState } from "react";

const CYCLE_MS = 15_000;
/** 静止在左侧（「坐」在名字旁） */
const IDLE_LEFT_END = 10_000;
/** 右侧落地后静止开始 */
const IDLE_RIGHT_START = 11_500;
const IDLE_RIGHT_END = 13_500;

const BUBBLE_TEXT = "今天天气不错，对吧？";

function isBubblePhase(t: number): boolean {
  return (t >= 0 && t < IDLE_LEFT_END) || (t >= IDLE_RIGHT_START && t < IDLE_RIGHT_END);
}

/**
 * 首页 hub：标语下方的小王子陪伴。15s 周期内约 10s 静坐、约 5s 抛物线往返；
 * 静止期且指针靠近时才淡入气泡（不阻挡导航与点击）。
 */
export function EmotionalCompanion() {
  const [near, setNear] = useState(false);
  const [stillPhase, setStillPhase] = useState(true);

  useEffect(() => {
    const tick = () => {
      setStillPhase(isBubblePhase(Date.now() % CYCLE_MS));
    };
    tick();
    const id = window.setInterval(tick, 80);
    return () => window.clearInterval(id);
  }, []);

  const bubbleOn = near && stillPhase;

  return (
    <div
      className="mascot-playful-hit"
      onMouseEnter={() => setNear(true)}
      onMouseLeave={() => setNear(false)}
    >
      <div className="mascot-playful-stage">
        <div className="mascot-playful-hop">
          <p className={`mascot-playful-bubble${bubbleOn ? " mascot-playful-bubble--visible" : ""}`}>
            {BUBBLE_TEXT}
          </p>
          <img
            className="mascot-playful-img"
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
  );
}
