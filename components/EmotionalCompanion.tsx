"use client";

/**
 * 小王子：SiteHeader 内「mirror」旁椭圆轨道 + 子级上下浮动。
 * 图片固定 public/prince.png → /prince.png
 * 动画：轨道在 .mascot-orbit（guarding），浮动仅在 .mascot-vertical-bob（vertical-float）。
 */
export function EmotionalCompanion() {
  return (
    <div className="mascot-arena" aria-hidden>
      <div className="mascot-orbit">
        <div className="mascot-vertical-bob">
          <p className="mascot-bubble">你也是一个人吗？</p>
          <img
            className="mascot-img"
            src="/prince.png"
            alt=""
            width={40}
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
