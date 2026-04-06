"use client";

/**
 * 小王子：紧贴 SiteHeader 内「mirror」品牌字，沿椭圆轨道运动。
 * 图片固定为 public/prince.png → URL /prince.png
 */
export function EmotionalCompanion() {
  return (
    <div className="ec-arena" aria-hidden>
      <div className="ec-orbit">
        <div className="ec-bob">
          <p className="ec-bubble">你也是一个人吗？</p>
          <img
            className="ec-img"
            src="/prince.png"
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
