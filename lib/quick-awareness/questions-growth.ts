import type { QaOption, QaQuestion } from "./types";

const c = (
  label: string,
  dim?: QaOption["dim"],
  emotionFrag?: string,
  obsessionFrag?: string
): QaOption => ({ label, dim, emotionFrag, obsessionFrag });

export const GROWTH_QUESTIONS: QaQuestion[] = [
  {
    kind: "choice",
    id: "g1",
    text: "你对自己目前的成长速度满意吗？",
    options: [
      c("非常不满意", { anxiety: 3, selfBlame: 3 }, "强烈的成长焦虑", "对自我进度的苛责"),
      c("不太满意", { anxiety: 2, selfBlame: 2 }, "对进度的失落"),
      c("一般", { anxiety: 1 }),
      c("比较满意", { anxiety: 0, control: 1 }),
      c("很满意", { anxiety: 0, control: 2 }),
    ],
  },
  {
    kind: "choice",
    id: "g2",
    text: "你经常拿自己和别人比较吗？",
    options: [
      c("从不", { anxiety: 0 }),
      c("很少", { anxiety: 1 }),
      c("有时", { anxiety: 2, selfBlame: 1 }),
      c("经常", { anxiety: 2, selfBlame: 2 }, "", "横向比较的习惯"),
      c("总是", { anxiety: 3, selfBlame: 3 }),
    ],
  },
  {
    kind: "choice",
    id: "g3",
    text: "你觉得自己有「应该」完成的目标吗？（如应该升职、应该结婚）",
    options: [
      c("没有", { anxiety: 0 }),
      c("有一点", { anxiety: 1 }),
      c("有很多", { anxiety: 2, selfBlame: 2 }, "", "对「应该」清单的执着"),
      c("压得喘不过气", { anxiety: 3, selfBlame: 2, catastrophizing: 2 }),
    ],
  },
  {
    kind: "choice",
    id: "g4",
    text: "当你达不到自己的期望时，你的感受更接近？",
    options: [
      c("自责", { selfBlame: 3, anxiety: 2 }),
      c("沮丧", { anxiety: 3 }),
      c("无所谓、先放下", { anxiety: 0, control: 1 }),
      c("积极改进", { control: 2, anxiety: 1 }),
      c("逃避或拖延面对", { anxiety: 2 }),
    ],
  },
  {
    kind: "choice",
    id: "g5",
    text: "你是否有完美主义倾向？",
    options: [
      c("完全没有", { anxiety: 0 }),
      c("轻微", { anxiety: 1 }),
      c("中等", { anxiety: 2, selfBlame: 1 }),
      c("严重", { anxiety: 3, selfBlame: 3 }, "", "完美主义下的紧绷"),
    ],
  },
  {
    kind: "text",
    id: "g6",
    text: "你最近一次为自己感到骄傲是因为什么？（可不填）",
    required: false,
    placeholder: "一两句话即可；可点「跳过」",
  },
];
