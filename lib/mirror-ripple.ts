import type { MouseEvent } from "react";

/** 在按钮点击位置播放短暂水波纹（需配合 globals.css 中 .mirror-ripple-wave） */
export function triggerMirrorRipple(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const wave = document.createElement("span");
  wave.className = "mirror-ripple-wave";
  wave.setAttribute("aria-hidden", "true");
  wave.style.left = `${x}px`;
  wave.style.top = `${y}px`;
  const computed = window.getComputedStyle(el);
  const posWasStatic = computed.position === "static";
  const prevOverflow = el.style.overflow;
  if (posWasStatic) el.style.position = "relative";
  el.style.overflow = "hidden";
  el.appendChild(wave);
  const done = () => {
    wave.remove();
    el.style.overflow = prevOverflow;
    if (posWasStatic) el.style.removeProperty("position");
  };
  wave.addEventListener("animationend", done, { once: true });
}
