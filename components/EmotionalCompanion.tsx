"use client";

/** 与 public/prince.png 对应 */
const MASCOT_SRC = "/prince.png" as const;

export type EmotionalCompanionProps = {
  /** 由 CalmCornerWidget 统一检测：鼠标靠近右下角（含呼吸圈）时为 true */
  cornerHovered?: boolean;
};

/**
 * 小王子：固定在右下角 CalmCornerWidget 内，与呼吸圆圈同步缩放（8s = 4s 吸 + 4s 呼）。
 * 整体磨砂玻璃感 + opacity 0.7（见 globals .mascot-corner）。
 */
export function EmotionalCompanion({ cornerHovered = false }: EmotionalCompanionProps) {
  return (
    <div className="mascot-corner" aria-hidden>
      <p className={`mascot-corner-bubble${cornerHovered ? " mascot-corner-bubble--visible" : ""}`}>
        别怕，我在。
      </p>
      <div className="mascot-corner-glass animate-calm-breathe-mascot">
        <img
          className="mascot-corner-img"
          src={MASCOT_SRC}
          alt=""
          width={40}
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  );
}
