"use client";

/**
 * 右下角：呼吸圈圈（纯 CSS 动画）+ 雨声白噪音开关。
 * 位置抬高并避开安全区，减少对底部说明条与常见输入区的遮挡。
 *
 * 雨声：Mixkit 免版税素材（可商用），若链接失效可换 MIXKIT_RAIN_AUDIO_URL。
 * 许可：https://mixkit.co/license/
 */
import { useCallback, useEffect, useRef, useState } from "react";

/** Mixkit 「Light rain loop」预览片段，循环播放作雨声背景 */
const MIXKIT_RAIN_AUDIO_URL =
  "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3";

export function CalmCornerWidget() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [rainOn, setRainOn] = useState(false);

  useEffect(() => {
    const a = new Audio(MIXKIT_RAIN_AUDIO_URL);
    a.loop = true;
    a.preload = "auto";
    a.volume = 0.35;
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleRain = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    if (rainOn) {
      a.pause();
      setRainOn(false);
      return;
    }
    try {
      await a.play();
      setRainOn(true);
    } catch {
      setRainOn(false);
    }
  }, [rainOn]);

  return (
    <div
      className="pointer-events-none fixed right-0 z-[35] flex flex-col items-end gap-3 p-3 sm:p-4"
      style={{
        bottom: "max(5.25rem, calc(env(safe-area-inset-bottom, 0px) + 4.75rem))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
      }}
    >
      {/* 呼吸训练：非交互，仅占位视觉 */}
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

      {/* 雨声：可点击，触控区域 ≥ 44px */}
      <div className="pointer-events-auto">
        <button
          type="button"
          onClick={() => void toggleRain()}
          aria-pressed={rainOn}
          aria-label={rainOn ? "关闭雨声白噪音" : "播放雨声白噪音"}
          title={rainOn ? "点击关闭雨声" : "点击播放雨声"}
          className={[
            "shadow-mirror flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border transition sm:h-12 sm:w-12",
            rainOn
              ? "border-stone-400 bg-stone-600 text-white"
              : "border-[var(--line)] bg-white/90 text-[var(--ink)] backdrop-blur-sm hover:border-[var(--accent)]",
          ].join(" ")}
        >
          <RainIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function RainIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 14c0-2.5 2-4 5-4s5 1.5 5 4" />
      <path d="M4 18h2M9 18h2M14 18h2M18 18h2" />
      <path d="M7 20v2M11 20v2M15 20v2" />
    </svg>
  );
}
