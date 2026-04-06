"use client";

import { useEffect, useRef, useState } from "react";

const CYCLE_S = 15;
const IDLE_LEFT_END = 10;
const JUMP_OUT_END = 11.5;
const IDLE_RIGHT_END = 13.5;

/** 与落地静止期对齐：10s 左侧坐 + 1.5s 起跳 + 2s 右侧停 + 1.5s 回跳 */
function phaseFromT(t: number): "idle-left" | "jump-out" | "idle-right" | "jump-back" {
  const x = ((t % CYCLE_S) + CYCLE_S) % CYCLE_S;
  if (x < IDLE_LEFT_END) return "idle-left";
  if (x < JUMP_OUT_END) return "jump-out";
  if (x < IDLE_RIGHT_END) return "idle-right";
  return "jump-back";
}

function idleForBubble(p: ReturnType<typeof phaseFromT>) {
  return p === "idle-left" || p === "idle-right";
}

/**
 * 首页 hub：蹲在「完整扫描」卡顶框附近；15s 周期（10s 静坐 / 5s 抛物跳跃）；/prince.png 66px；
 * 静止期靠近时浮现「今天天气不错，对吧？」；pointer-events:none；z-50。
 */
export function HubPlayfulMascot() {
  const trackRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const [phase, setPhase] = useState<ReturnType<typeof phaseFromT>>("idle-left");
  const [mouseNear, setMouseNear] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setPhase(phaseFromT(elapsed));
    }, 40);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!idleForBubble(phase)) {
        setMouseNear(false);
        return;
      }
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(e.clientX - cx, e.clientY - cy);
      setMouseNear(d < 96);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [phase]);

  const showWeather = idleForBubble(phase) && mouseNear;

  return (
    <div className="hub-playful-root pointer-events-none absolute overflow-visible" aria-hidden>
      <div ref={trackRef} className="hub-playful-track animate-playful-jump">
        <p className={`hub-playful-weather-bubble${showWeather ? " hub-playful-weather-bubble--visible" : ""}`}>
          今天天气不错，对吧？
        </p>
        <div className="hub-playful-glass animate-calm-breathe-mascot">
          <img
            className="hub-playful-img"
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
