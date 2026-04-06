"use client";

import { EmotionalCompanion } from "@/components/EmotionalCompanion";
import { GentlePromptCard } from "@/components/GentlePromptCard";
import type { ReactNode } from "react";

type Props = {
  gentlePrompt: string;
  onGentlePick: (line: string) => void;
  jumpNonce: number;
  /** 引导卡与气泡 / textarea 等 */
  children?: ReactNode;
};

/**
 * 输入区上方：磨砂引导卡 + 蹲在卡缘的小王子（absolute，不挡点击）。
 */
export function MirrorInputCompanionCluster({ gentlePrompt, onGentlePick, jumpNonce, children }: Props) {
  return (
    <div className="mirror-input-companion-cluster relative overflow-visible">
      <div className="relative z-[1] mb-3 min-h-[4.25rem] pl-11 sm:pl-12">
        <GentlePromptCard prompt={gentlePrompt} onPick={onGentlePick} />
        <EmotionalCompanion jumpNonce={jumpNonce} />
      </div>
      {children}
    </div>
  );
}
