"use client";

/**
 * 蹲在输入框上方（由父级 position: relative 定位）。
 * 图：/prince.png · 60px · pointer-events: none（见 globals .emotional-companion-root）
 */
export function EmotionalCompanion() {
  return (
    <div className="emotional-companion-root" aria-hidden>
      <div className="emotional-companion-float-jump-inner">
        <img
          className="emotional-companion-img"
          src="/prince.png"
          alt=""
          width={60}
          height={60}
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  );
}
