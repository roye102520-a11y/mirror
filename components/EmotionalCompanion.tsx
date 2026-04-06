"use client";

/**
 * 蹲在输入框上方（父级须 position: relative; overflow: visible）。
 * 图：/prince.png · 60px；样式见 app/globals.css .mascot-*
 */
export function EmotionalCompanion() {
  return (
    <div className="mascot-container">
      <div className="mascot-wrapper">
        <p className="mascot-bubble">今天，想和我聊聊吗？</p>
        <div className="mascot-row">
          <span className="mascot-intro-text">今天，想和我聊聊你的内心世界吗？</span>
          <div className="mascot-jump">
            <img src="/prince.png" className="mascot-img" alt="小王子" width={60} height={60} decoding="async" draggable={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
