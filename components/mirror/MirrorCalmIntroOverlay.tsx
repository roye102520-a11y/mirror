"use client";

import { useEffect, useState } from "react";
import { triggerMirrorRipple } from "@/lib/mirror-ripple";

const INTRO_STORAGE_KEY = "mirror-calm-intro-v1";

function writeMirrorCalmIntroDismissed() {
  sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
}

function greetingFromHour(h: number): string {
  if (h >= 5 && h < 12) return "早安";
  if (h >= 12 && h < 18) return "午好";
  return "晚安";
}

type Props = {
  onDismiss: () => void;
};

export function MirrorCalmIntroOverlay({ onDismiss }: Props) {
  const [phase, setPhase] = useState<"visible" | "exiting">("visible");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(greetingFromHour(new Date().getHours()));
  }, []);

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerMirrorRipple(e);
    setPhase("exiting");
  };

  const handleTransitionEnd = (ev: React.TransitionEvent<HTMLDivElement>) => {
    if (phase !== "exiting") return;
    if (ev.propertyName !== "transform") return;
    writeMirrorCalmIntroDismissed();
    onDismiss();
  };

  return (
    <div
      className={[
        "mirror-calm-intro pointer-events-auto fixed inset-0 z-[100] flex flex-col items-center justify-center px-5",
        phase === "exiting" ? "mirror-calm-intro--exit" : "",
      ].join(" ")}
      onTransitionEnd={handleTransitionEnd}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mirror-calm-intro-title"
    >
      <div className="mirror-calm-intro__panel max-w-md rounded-[1.75rem] border border-white/70 bg-white/55 px-8 py-10 text-center sm:px-10 sm:py-12">
        <p className="text-xs font-normal tracking-[0.25em] text-[var(--muted)]">mirror</p>
        <h2 id="mirror-calm-intro-title" className="mt-6 text-2xl font-normal text-[var(--ink)] sm:text-3xl">
          {greeting || "你好"}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          先与自己待一会儿。准备好后，再进入今日书写与对话。
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="mirror-ripple-btn shadow-mirror mt-10 min-h-[48px] w-full rounded-full border border-[var(--line)] bg-white/90 px-8 py-3.5 text-sm font-normal text-[var(--ink)] transition hover:border-[var(--accent)] sm:w-auto"
        >
          开启今日对话
        </button>
      </div>
    </div>
  );
}
