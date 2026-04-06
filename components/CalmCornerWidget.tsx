"use client";

/**
 * 右下角：呼吸圈圈 + 「疗愈时空」环境音与背景渐变联动。
 * 音频许可见 lib/healing-space-scenes.ts
 */
import { EmotionalCompanion } from "@/components/EmotionalCompanion";
import {
  HEALING_SCENE_ORDER,
  HEALING_SCENES,
  type HealingSceneId,
  animateGradientTo,
  gradientForScene,
} from "@/lib/healing-space-scenes";
import { useCallback, useEffect, useRef, useState } from "react";

const GRADIENT_TRANSITION_MS = 10_000;

export function CalmCornerWidget() {
  const [scene, setScene] = useState<HealingSceneId>("off");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cornerHovered, setCornerHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelGradientRef = useRef<(() => void) | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const skipFirstGradient = useRef(true);
  const audioSceneRef = useRef<HealingSceneId>("off");

  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.preload = "auto";
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (skipFirstGradient.current) {
      skipFirstGradient.current = false;
      return;
    }
    cancelGradientRef.current?.();
    cancelGradientRef.current = animateGradientTo(gradientForScene(scene), GRADIENT_TRANSITION_MS);
    return () => cancelGradientRef.current?.();
  }, [scene]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (scene === "off") {
      a.pause();
      audioSceneRef.current = "off";
      return;
    }
    const cfg = HEALING_SCENES[scene];
    if (audioSceneRef.current !== scene) {
      a.pause();
      a.src = cfg.audioUrl;
      a.load();
      audioSceneRef.current = scene;
    }
    a.volume = cfg.volume;
    void a.play().catch(() => {});
  }, [scene]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = menuRef.current;
      if (el && !el.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const pickScene = useCallback((id: HealingSceneId) => {
    setScene(id);
    setMenuOpen(false);
  }, []);

  return (
    <div
      className="pointer-events-none fixed right-0 isolate z-[9999] overflow-visible p-3 sm:p-4"
      data-mirror-calm-corner=""
      style={{
        bottom: "max(5.25rem, calc(env(safe-area-inset-bottom, 0px) + 4.75rem))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
      }}
    >
      <div
        className="pointer-events-auto flex flex-col items-end gap-3 overflow-visible"
        onMouseEnter={() => setCornerHovered(true)}
        onMouseLeave={() => setCornerHovered(false)}
      >
        <div className="flex max-w-[min(100%,calc(100vw-1.25rem))] flex-row items-end gap-2 overflow-visible">
          <EmotionalCompanion cornerHovered={cornerHovered} />
          <div
            className="pointer-events-none flex w-[5.5rem] flex-col items-center gap-1.5 sm:w-24"
            role="region"
            aria-label="呼吸练习示意"
          >
            <div className="relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
              <div
                className="animate-calm-breathe shadow-mirror absolute rounded-full bg-stone-500/45 ring-2 ring-stone-400/30"
                style={{ width: "56px", height: "56px" }}
                aria-hidden
              />
            </div>
            <p className="text-center text-[10px] leading-snug text-[var(--muted)] sm:text-xs">
              跟着圆圈呼气吸气
            </p>
          </div>
        </div>

        <div ref={menuRef} className="relative">
        {menuOpen ? (
          <div
            className="mirror-healing-menu absolute bottom-full right-0 z-10 mb-2 w-[11.5rem] overflow-hidden rounded-2xl border border-white/55 py-1 shadow-mirror"
            role="menu"
            aria-label="疗愈时空场景"
          >
            {HEALING_SCENE_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => pickScene(key)}
                className={[
                  "mirror-no-hover block w-full px-3 py-2.5 text-left text-xs transition-colors",
                  scene === key
                    ? "bg-white/55 font-medium text-[var(--ink)]"
                    : "bg-transparent text-[var(--ink)] hover:bg-white/40",
                ].join(" ")}
              >
                {HEALING_SCENES[key].label}
              </button>
            ))}
            <div className="mx-2 border-t border-white/40" role="separator" />
            <button
              type="button"
              role="menuitem"
              onClick={() => pickScene("off")}
              className="mirror-no-hover block w-full px-3 py-2.5 text-left text-xs text-[var(--muted)] hover:bg-white/40"
            >
              关闭环境音
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={scene === "off" ? "打开疗愈时空选单" : `当前：${labelForScene(scene)}，打开选单`}
          title="疗愈时空"
          className={[
            "shadow-mirror flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition sm:min-w-[44px]",
            scene !== "off"
              ? "border-stone-400 bg-stone-600 text-white"
              : "border-[var(--line)] bg-white/90 text-[var(--ink)] backdrop-blur-sm hover:border-[var(--accent)]",
          ].join(" ")}
        >
          <HealingIcon className="h-4 w-4 shrink-0 opacity-90" />
          <span className="max-w-[5.5rem] truncate sm:max-w-[7rem]">
            {scene === "off" ? "疗愈时空" : labelForScene(scene)}
          </span>
        </button>
        </div>
      </div>
    </div>
  );
}

function labelForScene(id: HealingSceneId): string {
  if (id === "off") return "疗愈时空";
  return HEALING_SCENES[id].label;
}

function HealingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 0 0 9-9c0-4.5-4-8-9-12C7 4 3 7.5 3 12a9 9 0 0 0 9 9Z"
      />
      <path strokeLinecap="round" d="M12 8v4l2 2" />
    </svg>
  );
}
