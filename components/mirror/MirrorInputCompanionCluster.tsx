"use client";

import { GentlePromptCard } from "@/components/GentlePromptCard";
import type { ReactNode } from "react";

type Props = {
  gentlePrompt: string;
  onGentlePick: (line: string) => void;
  /** 引导卡下方的输入区等 */
  children?: ReactNode;
};

/** 书写区：磨砂引导卡 + 输入区（小王子仅在首页 hub，见 MirrorHome）。 */
export function MirrorInputCompanionCluster({ gentlePrompt, onGentlePick, children }: Props) {
  return (
    <div className="mirror-input-companion-cluster relative overflow-visible">
      <div className="relative z-[1] mb-3 overflow-visible">
        <GentlePromptCard prompt={gentlePrompt} onPick={onGentlePick} />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
