import type { QaOption, QaQuestion } from "./types";

const c = (
  label: string,
  dim?: QaOption["dim"],
  emotionFrag?: string,
  obsessionFrag?: string
): QaOption => ({ label, dim, emotionFrag, obsessionFrag });

/** 工作觉察 14 题：前 12 与关系模块平行主题，13–14 为新增人际与认可题 */
export const WORK_QUESTIONS: QaQuestion[] = [
  {
    kind: "choice",
    id: "w1",
    text: "整体而言，工作/学业带给你的感受更接近？",
    options: [
      c("充实、有方向", { anxiety: 0, control: 2 }),
      c("平淡但可接受", { anxiety: 0 }),
      c("压力大、常紧绷", { anxiety: 3 }, "高强度的紧绷"),
      c("倦怠、想逃避", { anxiety: 2, selfBlame: 1 }),
      c("愤怒或不公感强", { anxiety: 2 }),
      c("麻木、像熬时间", { anxiety: 2 }),
    ],
  },
  {
    kind: "choice",
    id: "w2",
    text: "你反复在脑海里想的是哪类问题？",
    options: [
      c("领导或评价体系怎么看我", { guessing: 2, anxiety: 2 }, "", "在意他者评价"),
      c("与同事/合作方人际关系", { anxiety: 2, guessing: 1 }),
      c("失误与后果会不会很严重", { catastrophizing: 3, anxiety: 2 }, "对后果的灾难化想象"),
      c("自己是不是能力不足", { selfBlame: 3, anxiety: 1 }, "对能力的自我怀疑"),
      c("职业发展卡住了怎么办", { anxiety: 2, catastrophizing: 1 }),
      c("很少反复想", { control: 2 }),
      c("其他", { anxiety: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "w3",
    text: "这类念头出现的频率？",
    options: [
      c("几乎没有", { anxiety: 0, control: 2 }),
      c("偶尔", { anxiety: 1 }),
      c("有时", { anxiety: 2 }),
      c("经常", { anxiety: 3 }),
      c("几乎每天", { anxiety: 3, catastrophizing: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "w4",
    text: "想起工作/任务时，身体常有的反应？",
    options: [
      c("整体还好", { anxiety: 0 }),
      c("胸闷、发紧", { anxiety: 2 }),
      c("胃不适", { anxiety: 2 }),
      c("失眠或早醒", { anxiety: 3 }),
      c("头痛、肩颈紧", { anxiety: 2 }),
      c("疲劳、提不起劲", { anxiety: 2 }),
    ],
  },
  {
    kind: "choice",
    id: "w5",
    text: "若描述你近期的工作状态？",
    options: [
      c("相对高效、能推进", { control: 3, anxiety: 0 }),
      c("拖延、启动困难", { anxiety: 2, selfBlame: 2 }),
      c("疲于应付、应接不暇", { anxiety: 3 }),
      c("被动、缺少话语权", { control: 0, anxiety: 2 }),
      c("感到孤立、少支持", { anxiety: 2, guessing: 1 }),
      c("混乱、优先级不清", { anxiety: 2, catastrophizing: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "w6",
    text: "你对工作节奏与决策的掌控感？",
    options: [
      c("几乎无法掌控", { control: 0, anxiety: 3 }),
      c("影响很小", { control: 1, anxiety: 2 }),
      c("一般", { control: 2 }),
      c("比较大", { control: 3 }),
      c("很大程度能自己安排", { control: 3, anxiety: 0 }),
    ],
  },
  {
    kind: "choice",
    id: "w7",
    text: "工作压力大时，你通常如何缓解？",
    options: [
      c("运动、爱好或向人倾诉", { anxiety: 1 }),
      c("独自硬扛", { anxiety: 2, selfBlame: 1 }),
      c("暂时放下、切换场景", { control: 1 }),
      c("加班扛过去", { anxiety: 2 }),
      c("刷信息或转移但难持久", { anxiety: 2 }),
      c("说不清", { anxiety: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "w8",
    text: "工作目前最消耗你的是？",
    options: [
      c("人际与政治", { guessing: 2, anxiety: 2 }),
      c("任务量与截止时间", { anxiety: 3 }),
      c("意义感缺失", { anxiety: 2, selfBlame: 1 }),
      c("不确定性与变动", { anxiety: 2, catastrophizing: 2 }),
      c("自我要求过高", { selfBlame: 3 }),
      c("说不清，整体耗竭", { anxiety: 3 }),
    ],
  },
  {
    kind: "choice",
    id: "w9",
    text: "过去一个月里，「想辞职/放弃」的念头？",
    options: [
      c("从没有", { anxiety: 0 }),
      c("偶尔闪过", { anxiety: 1, catastrophizing: 1 }),
      c("有时", { anxiety: 2, catastrophizing: 2 }),
      c("比较频繁", { anxiety: 3, catastrophizing: 2 }),
      c("认真考虑或已行动", { anxiety: 3, catastrophizing: 3 }),
    ],
  },
  {
    kind: "choice",
    id: "w10",
    text: "下班后能否从工作角色里抽离出来？",
    options: [
      c("比较容易", { control: 3 }),
      c("有一点难", { control: 2, anxiety: 1 }),
      c("看情况", { control: 1 }),
      c("比较难", { control: 1, anxiety: 2 }),
      c("几乎不能，脑子停不下来", { anxiety: 3 }),
    ],
  },
  {
    kind: "choice",
    id: "w11",
    text: "你对职业/学业发展走向的感知？",
    options: [
      c("有清晰路径", { control: 2, anxiety: 0 }),
      c("停滞但可忍受", { anxiety: 1 }),
      c("迷茫、看不清", { anxiety: 2, catastrophizing: 1 }),
      c("感到退步或边缘化", { anxiety: 3, selfBlame: 2 }),
      c("在主动探索变化", { control: 2, anxiety: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "w12",
    text: "工作带来的整体情绪消耗？（自评）",
    options: [
      c("很小", { anxiety: 0 }),
      c("较小", { anxiety: 1 }),
      c("中等", { anxiety: 2 }),
      c("比较大", { anxiety: 3 }),
      c("非常大", { anxiety: 3, catastrophizing: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "w13",
    text: "工作中让你感到压力最大的人际关系是？",
    options: [
      c("领导", { anxiety: 2, guessing: 1 }),
      c("同事", { anxiety: 2, guessing: 1 }),
      c("下属", { anxiety: 2 }),
      c("客户或外部合作方", { anxiety: 2 }),
      c("无特别对象", { anxiety: 0 }),
    ],
  },
  {
    kind: "choice",
    id: "w14",
    text: "你觉得自己在职场中被认可的程度？",
    options: [
      c("很低", { selfBlame: 2, anxiety: 2 }),
      c("一般", { anxiety: 1 }),
      c("较高", { anxiety: 0, control: 1 }),
      c("很高", { anxiety: 0, control: 2 }),
    ],
  },
];
