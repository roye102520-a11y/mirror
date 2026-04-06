"use client";

import { useEffect, useRef, useState } from "react";

const LOOP_MS = 15_000;
const SIT_LEFT_MS = 10_000;
const JUMP_TO_RIGHT_MS = 1_000;
const REST_RIGHT_MS = 2_000;

function phaseAt(ms: number): "sitL" | "jumpR" | "restR" | "jumpL" {
  const t = ((ms % LOOP_MS) + LOOP_MS) % LOOP_MS;
  if (t < SIT_LEFT_MS) return "sitL";
  if (t < SIT_LEFT_MS + JUMP_TO_RIGHT_MS) return "jumpR";
  if (t < SIT_LEFT_MS + JUMP_TO_RIGHT_MS + REST_RIGHT_MS) return "restR";
  return "jumpL";
}

export function HubPlayfulMascot() {
  const [tick, setTick] = useState(() => Date.now());
  const railRef = useRef<HTMLDivElement>(null);
  const [mouseInRail, setMouseInRail] = useState(false);
  const [mouseNearRightAnchor, setMouseNearRightAnchor] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 120);
    return () => window.clearInterval(id);
  }, []);

  const phase = phaseAt(tick);
  const showWeatherGlass =
    phase === "restR" && mouseInRail && mouseNearRightAnchor;

  return (
    <div
      className="hub-playful-mascot-root mx-auto mt-1 max-w-xl overflow-visible"
      aria-hidden
    >
      <div
        ref={railRef}
        className="hub-playful-mascot-rail relative overflow-visible"
        onMouseEnter={() => setMouseInRail(true)}
        onMouseLeave={() => {
          setMouseInRail(false);
          setMouseNearRightAnchor(false);
        }}
        onMouseMove={(e) => {
          const el = railRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const lx = e.clientX - r.left;
          const ly = e.clientY - r.top;
          if (lx < 0 || lx > r.width || ly < 0 || ly > r.height) return;
          const anchorX = r.width * 0.82;
          const anchorY = r.height * 0.55;
          const dist = Math.hypot(lx - anchorX, ly - anchorY);
          setMouseNearRightAnchor(dist < 88);
        }}
      >
        <div className="hub-playful-mascot-jumper">
          <div className="hub-playful-mascot-jumper-inner">
            <div className="hub-playful-mascot-glass animate-calm-breathe-mascot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hub-playful-mascot-img"
                src="/prince.png"
                width={66}
                alt=""
                draggable={false}
              />
            </div>
            <p
              className={
                showWeatherGlass
                  ? "hub-playful-weather-bubble hub-playful-weather-bubble--visible"
                  : "hub-playful-weather-bubble"
              }
            >
              今天天气不错，对吧？
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
