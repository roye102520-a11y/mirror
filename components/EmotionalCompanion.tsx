"use client";

/**
 * 「情感伙伴」像素画占位：请将小王子与狐狸的合成像素图放到 public 目录后启用。
 *
 * 推荐路径（与下方常量一致）：
 *   public/emotional-companion/prince-fox.png
 *
 * 也可改用两张并排资源时，自行替换为两张 <img> 或雪碧图，并保持 .emotional-companion-img 约 48×48。
 */
export const EMOTIONAL_COMPANION_IMAGE = "/emotional-companion/prince-fox.png";

export function EmotionalCompanion() {
  return (
    <div className="emotional-companion-host" aria-hidden>
      <div className="emotional-companion-actor">
        <picture>
          {/* 预留：可改为 prince.png / fox.png 并排 */}
          <img
            className="emotional-companion-img"
            src={EMOTIONAL_COMPANION_IMAGE}
            width={48}
            height={48}
            alt=""
            decoding="async"
            draggable={false}
          />
        </picture>
      </div>
    </div>
  );
}
