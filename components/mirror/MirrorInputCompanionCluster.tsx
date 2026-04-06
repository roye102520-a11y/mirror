"use client";

import { GentlePromptCard } from "@/components/GentlePromptCard";
import type { ReactNode } from "react";

type Props = {
  gentlePrompt: string;
  onGentlePick: (line: string) => void;
  /** 引导卡下方的气泡 + 输入区等 */
  children?: ReactNode;
};

/**
 * 书写区：仅磨砂引导卡；小王子须挂在含 textarea 的 relative 容器内（见 MirrorHome）。
 */
export function MirrorInputCompanionCluster({ gentlePrompt, onGentlePick, children }: Props) {
  return (
    <div className="mirror-input-companion-cluster relative overflow-visible">
      <div className="relative z-[1] mb-3 min-h-[4.25rem] pl-11 sm:pl-12 overflow-visible">
        <GentlePromptCard prompt={gentlePrompt} onPick={onGentlePick} />
      </div>
      {children}
    </div>
  );
}
