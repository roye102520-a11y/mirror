"use client";

/**
 * 小王子：环绕顶部 mirror 品牌区的椭圆守护轨迹 guarding / vertical-float（见 globals.css）。
 * 图片：public/prince.png
 */
export function Mascot() {
  return (
    <div className="mascot-arena" aria-hidden>
      <div className="mascot-orbit">
        <div className="mascot-vertical-bob">
          <p className="mascot-bubble">你也是一个人吗？</p>
          <img
            className="mascot-img"
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
