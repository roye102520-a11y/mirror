"use client";

type Props = {
  /** 递增时重播 1.5s 抛物跳跃；0 为静默蹲守 */
  jumpNonce: number;
};

/**
 * 小王子：蹲在引导卡边缘，仅响应输入 focus/打字；pointer-events 全关。
 */
export function EmotionalCompanion({ jumpNonce }: Props) {
  return (
    <div className="emotional-companion-root" aria-hidden>
      <div
        key={jumpNonce}
        className={["emotional-companion-hop", jumpNonce > 0 ? "emotional-companion-hop--jumping" : ""].join(" ")}
      >
        <img
          className="emotional-companion-img"
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
