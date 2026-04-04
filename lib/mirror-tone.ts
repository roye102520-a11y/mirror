export type MirrorTone = "gentle" | "sharp";

export const MIRROR_TONE_STORAGE = "mirror-tone";

export const MIRROR_TONE_OPTIONS: { id: MirrorTone; label: string; hint: string }[] = [
  {
    id: "gentle",
    label: "温和引导",
    hint: "像「你似乎有点焦虑，愿意聊聊吗？」——邀请、留空间。",
  },
  {
    id: "sharp",
    label: "尖锐提问",
    hint: "像「有什么证据？你最怕的究竟是什么？」——直面念头，仍尊重对方。",
  },
];

export function readStoredMirrorTone(): MirrorTone {
  if (typeof window === "undefined") return "gentle";
  const s = localStorage.getItem(MIRROR_TONE_STORAGE);
  if (s === "sharp" || s === "gentle") return s;
  return "gentle";
}

export function writeStoredMirrorTone(t: MirrorTone) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MIRROR_TONE_STORAGE, t);
}

/** 写入 API system / user 提示的短语 */
export function mirrorToneInstruction(tone: MirrorTone): string {
  if (tone === "sharp") {
    return [
      "语气：尖锐模式。",
      "emotion 可略点明张力；obsession 可指出「猜测/灾难化」等惯性；",
      "question 宜用一两句有力追问（例如证据与恐惧核心），但禁止羞辱用户、禁止定性他人人品、禁止预言关系，禁止脏话。",
    ].join("");
  }
  return [
    "语气：温和模式。",
    "emotion、obsession 以容纳、命名感受为主，避免说教；",
    "question 像轻柔邀请（如「愿意往前探一点点吗？」），禁止施压与恐吓式追问。",
  ].join("");
}

export function mirrorToneForSingleQuestion(tone: MirrorTone): string {
  if (tone === "sharp") {
    return "语气偏锐利：一句追问，可点到证据与底层恐惧，禁止人身攻击、禁止粗口、禁止替用户判关系死刑。";
  }
  return "语气偏温和：一句柔软、敞开的追问，像并肩坐着的对话，禁止训斥感。";
}
