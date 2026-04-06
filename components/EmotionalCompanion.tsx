"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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

/**
 * 全局挂载：依锚点 fixed 定位（hub 标题行 / quiz 进度+题卡区）；pointer-events: none；z-index 见 globals。
 */
export function EmotionalCompanion() {
  const pathname = usePathname();
  const isQuiz = pathname === "/quiz";

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const anchorRef = useRef<Element | null>(null);
  anchorRef.current = anchorEl;
  const [box, setBox] = useState<DOMRect | null>(null);
  const [burst, setBurst] = useState<Burst | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const pick = () => setAnchorEl(document.querySelector(ANCHOR));
    pick();
    const mo = new MutationObserver(pick);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => mo.disconnect();
  }, [pathname]);

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
    left = box.left - 6;
    top = box.top - 54;
    transform = "none";
  } else {
    const offset = Math.min(56, box.width * 0.18);
    left = burst.side === "left" ? centerX - offset : centerX + offset;
    top = box.top - 58;
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
