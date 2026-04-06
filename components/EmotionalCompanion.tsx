"use client";

import princeImg from "@/assets/prince.png";
import Image from "next/image";

export type EmotionalCompanionProps = {
  /** 由 CalmCornerWidget 统一检测：鼠标靠近右下角（含呼吸圈）时为 true */
  cornerHovered?: boolean;
};

/**
 * 小王子：右下角 CalmCornerWidget 内，与呼吸圆圈同步缩放。
 * 图片经 import 打入构建产物，避免 Vercel 上 public 文件漏部署导致 404。
 */
export function EmotionalCompanion({ cornerHovered = false }: EmotionalCompanionProps) {
  return (
    <div className="mascot-corner" aria-hidden>
      <p className={`mascot-corner-bubble${cornerHovered ? " mascot-corner-bubble--visible" : ""}`}>
        别怕，我在。
      </p>
      <div className="mascot-corner-glass animate-calm-breathe-mascot">
        <Image
          className="mascot-corner-img"
          src={princeImg}
          alt=""
          width={40}
          height={40}
          unoptimized
          priority
          sizes="40px"
        />
      </div>
    </div>
  );
}
