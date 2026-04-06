"use client";

import { EmotionalCompanion } from "@/components/EmotionalCompanion";
import { GentlePromptCard } from "@/components/GentlePromptCard";
import type { ReactNode } from "react";

type Props = {
  gentlePrompt: string;
  onGentlePick: (line: string) => void;
  /** 输入框 focus 或框内有字时为 true，触发小王轻微跳跃 */
  mascotActive: boolean;
  /** 引导卡下方的输入区等（所在父级已有 position:relative） */
  children?: ReactNode;
};

/**
 * 主界面书写区：磨砂引导卡 + 蹲在卡缘的小王子（pointer-events 由卡与 textarea 承接）。
 */
export function MirrorInputCompanionCluster({
  gentlePrompt,
  onGentlePick,
  mascotActive,
  children,
}: Props) {
  return (
    <div className="mirror-input-companion-cluster relative overflow-visible">
      <div className="mirror-gentle-prompt-slot relative z-[1] mb-3 min-h-[4.25rem] overflow-visible pl-[3.35rem] sm:pl-14">
        <EmotionalCompanion active={mascotActive} />
        <GentlePromptCard prompt={gentlePrompt} onPick={onGentlePick} />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
