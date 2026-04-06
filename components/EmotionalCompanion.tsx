"use client";

/** 与 public/prince.png 对应，勿改路径 */
const MASCOT_SRC = "/prince.png" as const;

export type EmotionalCompanionProps = {
  /** 输入框获得焦点：略放大并显示倾听气泡 */
  listening?: boolean;
};

/**
 * 小王子：蹲在对话输入旁；极慢上下浮动；聚焦时 scale + 「我在听，慢慢说。」
 */
export function EmotionalCompanion({ listening = false }: EmotionalCompanionProps) {
  return (
    <div
      className={`mascot-by-input-root${listening ? " mascot-by-input-root--listening" : ""}`}
      aria-hidden
    >
      <p className="mascot-by-input-bubble">我在听，慢慢说。</p>
      <div className="mascot-by-input-float">
        <img
          className="mascot-by-input-img"
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
