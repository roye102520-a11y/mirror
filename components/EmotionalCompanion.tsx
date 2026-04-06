"use client";

import { useState } from "react";

/**
 * 首页 hub：绝对定位在 Slogan 父级内；动效见 emotional-companion-pop。
 * 图片 pointer-events: none；仅气泡区域 pointer-events: auto。
 */
export function EmotionalCompanion() {
  const [bubbleHover, setBubbleHover] = useState(false);

  return (
    <div className="mirror-emotional-companion" aria-hidden>
      <div className="mirror-mascot-pop-target">
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
      <div
        className="mirror-emotional-companion-bubble-wrap"
        onMouseEnter={() => setBubbleHover(true)}
        onMouseLeave={() => setBubbleHover(false)}
      >
        <p className="mirror-emotional-companion-bubble">
          {bubbleHover ? "慢慢说。" : "今天天气不错，对吧？"}
        </p>
      </div>
    </div>
  );
}
