/**
 * 「疗愈时空」场景：音频 + 背景渐变色板。
 *
 * 音频来自 Mixkit（免版税，可商用，无需署名；建议在产品文档中保留来源说明）
 * https://mixkit.co/license/
 *
 * 对应素材（可在 Mixkit 站内搜索名称核对 / 替换链接）：
 * - 深夜·雨林：Light rain loop（sfx/2393）
 * - 晨间·鸟鸣：Morning birds（sfx/2472）
 * - 深空·白噪音：Space ship hum（sfx/2136，偏宇宙舱嗡鸣，适合作为「深空」垫底）
 *
 * 若 CDN 失效：打开 https://mixkit.co/free-sound-effects/ 搜索上述名称，
 * 下载后放到 `public/audio/` 并改用 `/audio/xxx.mp3`。
 */
export type HealingSceneId = "off" | "rain" | "birds" | "space";

/** 与 app/globals.css 中 :root 初始值保持一致 */
export const HEALING_DEFAULT_GRADIENT = ["#efe8f7", "#e6f0fc", "#fcecf3", "#ebe6f8"] as const;

export const HEALING_SCENE_ORDER = ["rain", "birds", "space"] as const;

export type HealingSceneKey = (typeof HEALING_SCENE_ORDER)[number];

export const HEALING_SCENES: Record<
  HealingSceneKey,
  {
    label: string;
    /** Mixkit preview/full MP3 */
    audioUrl: string;
    volume: number;
    gradient: readonly [string, string, string, string];
  }
> = {
  rain: {
    label: "深夜·雨林",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
    volume: 0.34,
    gradient: ["#2a3544", "#3d4d62", "#354558", "#243040"],
  },
  birds: {
    label: "晨间·鸟鸣",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2472/2472-preview.mp3",
    volume: 0.3,
    gradient: ["#f7f2e8", "#faf6ee", "#ebe3d4", "#f3ead6"],
  },
  space: {
    label: "深空·白噪音",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2136/2136-preview.mp3",
    volume: 0.26,
    gradient: ["#1c1528", "#2a2238", "#241c34", "#181022"],
  },
};

const VAR_NAMES = ["--mirror-bg-a", "--mirror-bg-b", "--mirror-bg-c", "--mirror-bg-d"] as const;

function parseHex(s: string): [number, number, number] {
  const h = s.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpHex(from: string, to: string, t: number): string {
  const [r0, g0, b0] = parseHex(from);
  const [r1, g1, b1] = parseHex(to);
  const k = Math.min(1, Math.max(0, t));
  const r = Math.round(r0 + (r1 - r0) * k);
  const g = Math.round(g0 + (g1 - g0) * k);
  const b = Math.round(b0 + (b1 - b0) * k);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function gradientForScene(id: HealingSceneId): readonly [string, string, string, string] {
  if (id === "off") return HEALING_DEFAULT_GRADIENT;
  return HEALING_SCENES[id].gradient;
}

export function applyGradientToDocument(colors: readonly [string, string, string, string]) {
  const root = document.documentElement;
  for (let i = 0; i < 4; i++) {
    root.style.setProperty(VAR_NAMES[i], colors[i]);
  }
}

export function readGradientFromDocument(): [string, string, string, string] {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  return [
    cs.getPropertyValue("--mirror-bg-a").trim() || HEALING_DEFAULT_GRADIENT[0],
    cs.getPropertyValue("--mirror-bg-b").trim() || HEALING_DEFAULT_GRADIENT[1],
    cs.getPropertyValue("--mirror-bg-c").trim() || HEALING_DEFAULT_GRADIENT[2],
    cs.getPropertyValue("--mirror-bg-d").trim() || HEALING_DEFAULT_GRADIENT[3],
  ];
}

/** 10s 内从当前（或 `from`）过渡到目标渐变色；纯前端、不挡交互层 */
export function animateGradientTo(
  target: readonly [string, string, string, string],
  durationMs: number,
  from?: readonly [string, string, string, string]
): () => void {
  const start = from ?? readGradientFromDocument();
  const t0 = performance.now();
  let frame = 0;
  let cancelled = false;

  const step = (now: number) => {
    if (cancelled) return;
    const raw = Math.min(1, (now - t0) / durationMs);
    const t = easeInOutCubic(raw);
    const next: [string, string, string, string] = [
      lerpHex(start[0], target[0], t),
      lerpHex(start[1], target[1], t),
      lerpHex(start[2], target[2], t),
      lerpHex(start[3], target[3], t),
    ];
    applyGradientToDocument(next);
    if (raw < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}
