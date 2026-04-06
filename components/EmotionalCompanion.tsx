"use client";

/**
 * 仅 mirror 首页 hub：静立展示，pointer-events: none。
 */
export function EmotionalCompanion() {
  return (
    <div className="mirror-mascot-hub-root" aria-hidden>
      <img
        className="mirror-mascot-img"
        src="/prince.png"
        alt=""
        width={60}
        height={60}
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
