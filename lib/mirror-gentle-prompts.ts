/** 输入区冷启动：磨砂卡片内随机展示的温柔起句 */

export const MIRROR_GENTLE_PROMPTS = [
  "我觉得有点累……",
  "今天有什么让你心动的细节吗？",
  "此刻最想被谁认真听一次？",
  "我对自己诚实的一点是……",
  "有一件事我一直没说出口：",
  "如果不用完美，我想写的是……",
];

export function randomGentlePrompt(): string {
  const i = Math.floor(Math.random() * MIRROR_GENTLE_PROMPTS.length);
  return MIRROR_GENTLE_PROMPTS[i] ?? MIRROR_GENTLE_PROMPTS[0];
}
