"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const MASCOT_W = 40;
const MASCOT_PAD = 6;

const HUB_WHISPERS = [
  "听，是风的声音",
  "这一刻很轻。",
  "慢慢来，也没关系。",
  "深呼吸一下。",
];

const QUIZ_WHISPER = "别紧张，跟随你的直觉。";

function randomInRange(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

type Burst = { id: number; side: "left" | "right"; whisper: string };

const ANCHOR = "[data-mirror-companion-anchor]";

/** 无 translate：左上角 x */
function clampLeftEdge(left: number, vw: number): number {
  const lo = MASCOT_PAD;
  const hi = Math.max(lo, vw - MASCOT_W - MASCOT_PAD);
  return Math.round(Math.min(Math.max(left, lo), hi));
}

/** 配合 translateX(-50%)：夹紧中心点 x */
function clampCenterX(cx: number, vw: number): number {
  const half = MASCOT_W / 2;
  const lo = half + MASCOT_PAD;
  const hi = Math.max(lo, vw - half - MASCOT_PAD);
  return Math.round(Math.min(Math.max(cx, lo), hi));
}

/**
 * 全局 fixed：/prince.png 40px、opacity 0.8（见 CSS）、z-index 50、pointer-events: none。
 */
export function EmotionalCompanion() {
  const pathname = usePathname();
  const isQuiz = pathname === "/quiz";

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const anchorRef = useRef<Element | null>(null);
  anchorRef.current = anchorEl;
  const [box, setBox] = useState<DOMRect | null>(null);
  const [burst, setBurst] = useState<Burst | null>(null);
  const [vw, setVw] = useState(390);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const pick = () => setAnchorEl(document.querySelector(ANCHOR));
    pick();
    const mo = new MutationObserver(pick);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => mo.disconnect();
  }, [pathname]);

  useLayoutEffect(() => {
    const w = () => setVw(typeof window !== "undefined" ? window.innerWidth : 390);
    w();
    window.addEventListener("resize", w);
    return () => window.removeEventListener("resize", w);
  }, []);

  useLayoutEffect(() => {
    if (!anchorEl) {
      setBox(null);
      return;
    }
    const update = () => setBox(anchorEl.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(anchorEl);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorEl]);

  const scheduleNext = useCallback(() => {
    if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const whisper = isQuiz ? QUIZ_WHISPER : HUB_WHISPERS[randomInRange(0, HUB_WHISPERS.length - 1)]!;
      setBurst({
        id: Date.now(),
        side: Math.random() < 0.5 ? "left" : "right",
        whisper,
      });
    }, randomInRange(15_000, 20_000));
  }, [isQuiz]);

  useEffect(() => {
    if (!anchorEl) {
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setBurst(null);
      return;
    }
    scheduleNext();
    return () => {
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    };
  }, [anchorEl, scheduleNext]);

  const onBurstAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    setBurst(null);
    if (anchorRef.current) scheduleNext();
  };

  if (!burst || !box) return null;

  const centerX = box.left + box.width / 2;
  let left: number;
  let transform: string;
  let top: number;

  if (isQuiz) {
    left = clampLeftEdge(box.left - 4, vw);
    top = Math.max(MASCOT_PAD, box.top - 40);
    transform = "none";
  } else {
    const offset = Math.min(38, box.width * 0.16);
    const center = burst.side === "left" ? centerX - offset : centerX + offset;
    left = clampCenterX(center, vw);
    top = Math.max(MASCOT_PAD, box.top - 44);
    transform = "translateX(-50%)";
  }

  return (
    <div
      className="mirror-emotional-companion-global"
      style={{ left, top, transform }}
      aria-hidden
    >
      <div key={burst.id} className="mirror-mascot-random-burst" onAnimationEnd={onBurstAnimationEnd}>
        <img
          className="mirror-mascot-img"
          src="/prince.png"
          alt=""
          width={MASCOT_W}
          height={MASCOT_W}
          decoding="async"
          draggable={false}
        />
      </div>
      <p
        className={
          isQuiz
            ? "mirror-mascot-whisper-bubble mirror-mascot-whisper-bubble--quiz"
            : "mirror-mascot-whisper-bubble"
        }
      >
        {burst.whisper}
      </p>
    </div>
  );
}
