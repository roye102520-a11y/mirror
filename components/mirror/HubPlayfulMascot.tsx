"use client";

/**
 * 首页 hub：蹲在 slogan 与「完整扫描」卡片之间的间隙，不压卡片正文。
 * 图片 /prince.png · 宽 66 · playful-jump（15s：10s 静坐 + 5s 抛物跳跃）· 内层与呼吸圈同频 scale（8s）。
 */
export function HubPlayfulMascot() {
  return (
    <div className="hub-mascot-stage pointer-events-none" aria-hidden>
      <div className="hub-mascot-hop">
        <div className="hub-mascot-glass animate-calm-breathe-mascot">
          <img
            className="hub-mascot-img"
            src="/prince.png"
            alt=""
            width={66}
            height={66}
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
