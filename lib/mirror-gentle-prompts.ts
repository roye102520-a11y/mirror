/** 主界面书写区磨砂引导卡随机文案（冷启动温柔起句） */
export const MIRROR_GENTLE_PROMPTS = [
  "我觉得有点累……",
  "今天有什么让你心动的细节吗？",
  "此刻如果不必勇敢，我想承认……",
  "有一件小事一直在我心里转……",
  "我说不清，但胸口闷闷的那块大概是……",
  "若只写一句真话，也许是……",
];

export function randomGentlePrompt(): string {
  const i = Math.floor(Math.random() * MIRROR_GENTLE_PROMPTS.length);
  return MIRROR_GENTLE_PROMPTS[i] ?? MIRROR_GENTLE_PROMPTS[0]!;
}
