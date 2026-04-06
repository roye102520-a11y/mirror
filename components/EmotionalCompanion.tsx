"use client";

/** 与 public/prince.png 对应，勿改路径 */
const MASCOT_SRC = "/prince.png" as const;

/**
 * 小王子：SiteHeader 内「mirror」旁椭圆轨道（mascot-orbit）+ 子级浮动（mascot-bob）。
 */
export function EmotionalCompanion() {
  return (
    <div className="mascot-arena" aria-hidden>
      <div className="mascot-orbit">
        <div className="mascot-vertical-bob">
          <p className="mascot-bubble">你也是一个人吗？</p>
          <img
            className="mascot-img"
            src={MASCOT_SRC}
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
