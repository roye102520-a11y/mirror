"use client";

export type EmotionalCompanionProps = {
  /** 输入框聚焦或框内有内容时：轻微抛物跳跃（CSS 1.5s 循环） */
  active: boolean;
};

/**
 * 仅用于主界面书写区：蹲在引导卡左缘，pointer-events: none，不妨碍输入与发送。
 */
export function EmotionalCompanion({ active }: EmotionalCompanionProps) {
  return (
    <div
      className={["mirror-input-mascot-root", active ? "mirror-input-mascot-root--active" : ""].filter(Boolean).join(" ")}
      aria-hidden
    >
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
