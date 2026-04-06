"use client";

export type EmotionalCompanionProps = {
  /** `input`：聚焦或框内有字时播放跳跃；`hub`：仅首页展示，通常为 false */
  active: boolean;
  variant?: "hub" | "input";
};

/**
 * 仅首页 hub 使用 `variant="hub"`；pointer-events: none，不挡点击。
 */
export function EmotionalCompanion({ active, variant = "input" }: EmotionalCompanionProps) {
  const rootClass = variant === "hub" ? "mirror-mascot-hub-root" : "mirror-input-mascot-root";
  const jumpClass = variant === "input" && active ? "mirror-input-mascot-root--active" : "";
  return (
    <div className={[rootClass, jumpClass].filter(Boolean).join(" ")} aria-hidden>
      <div className="mirror-input-mascot-inner">
        <img
          className="mirror-input-mascot-img"
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
