import type { QaOption, QaQuestion } from "./types";

const c = (
  label: string,
  dim?: QaOption["dim"],
  emotionFrag?: string,
  obsessionFrag?: string
): QaOption => ({ label, dim, emotionFrag, obsessionFrag });

/**
 * 关系觉察 12 题（与「工作觉察」12 题结构平行：感受—反刍—身心—状态—控制—缓解—消耗—逃离—抽离—展望—消耗评分）
 */
export const RELATION_QUESTIONS: QaQuestion[] = [
  {
    kind: "choice",
    id: "r1",
    text: "当前这段（或对你最重要的）关系，整体给你什么感受？",
    options: [
      c("平静、可呼吸", { control: 2 }, "相对稳定感"),
      c("温暖、有连结", { anxiety: 0 }, "被滋养的体验"),
      c("焦虑、心神不宁", { anxiety: 3 }, "明显的焦虑张力", "对未来的不确定"),
      c("压抑、说不上话", { anxiety: 2, selfBlame: 1 }, "压抑感"),
      c("愤怒、常起冲突", { anxiety: 2, catastrophizing: 1 }, "易怒与冲突感"),
      c("麻木、像在完成程序", { anxiety: 1 }, "疏离与麻木"),
      c("说不清，很混杂", { anxiety: 1 }, "混杂感受"),
    ],
  },
  {
    kind: "choice",
    id: "r2",
    text: "你反复在脑海里想的是哪类问题？",
    options: [
      c("猜测对方真实想法", { guessing: 3, anxiety: 2 }, "心神被牵动", "试图解读他人"),
      c("担心被冷落或抛弃", { anxiety: 3, catastrophizing: 2 }, "对被弃的担忧", "对依恋安全的执着"),
      c("反复复盘争吵细节", { anxiety: 2 }, "反刍争吵"),
      c("设想最坏结局", { catastrophizing: 3, anxiety: 2 }, "灾难化想象"),
      c("觉得自己哪里不够好", { selfBlame: 3, anxiety: 1 }, "自我苛责感", "对自我价值的执着"),
      c("很少反复想，能放下", { control: 2 }),
      c("其他/说不清", { anxiety: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "r3",
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
    id: "r4",
    text: "想起这些事时，身体常有的反应？",
    options: [
      c("整体还好，不明显", { anxiety: 0 }),
      c("胸闷、发紧", { anxiety: 2 }),
      c("胃不适、吃不下", { anxiety: 2 }),
      c("失眠或早醒", { anxiety: 3 }),
      c("头痛、肩颈紧", { anxiety: 2 }),
      c("疲劳、提不起劲", { anxiety: 2, selfBlame: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "r5",
    text: "若用一个短语描述你们之间的互动状态？",
    options: [
      c("相对稳定、能商量", { control: 2, anxiety: 0 }),
      c("忽冷忽热", { anxiety: 2, guessing: 2 }, "难以预测对方"),
      c("像单方面在维持", { selfBlame: 2, anxiety: 2 }),
      c("常回避深入沟通", { anxiety: 2, guessing: 1 }),
      c("频繁冲突或冷战", { anxiety: 3, catastrophizing: 1 }),
      c("渐行渐远、力不从心", { anxiety: 2, catastrophizing: 2 }),
    ],
  },
  {
    kind: "choice",
    id: "r6",
    text: "你觉得能影响这段关系走向的程度？",
    options: [
      c("几乎影响不了", { control: 0, anxiety: 2 }),
      c("影响很小", { control: 1, anxiety: 1 }),
      c("一般", { control: 2 }),
      c("比较大", { control: 3 }),
      c("很大程度在我", { control: 3, anxiety: 0 }),
    ],
  },
  {
    kind: "choice",
    id: "r7",
    text: "感到压力大时，你通常如何缓解？（与关系相关）",
    options: [
      c("倾诉、运动或其他转移", { anxiety: 1, control: 1 }),
      c("独自消化、少与人说", { anxiety: 2 }),
      c("尝试与对方直接沟通", { control: 2, anxiety: 0 }),
      c("冷战、退后或减少接触", { anxiety: 2, guessing: 1 }),
      c("反复查信息想获得确定感", { guessing: 2, anxiety: 2 }),
      c("说不清、随它去", { anxiety: 1 }),
    ],
  },
  {
    kind: "choice",
    id: "r8",
    text: "这段关系目前最消耗你的是？",
    options: [
      c("信任与互相猜测", { guessing: 3, anxiety: 2 }, "", "在信任与解读上的消耗"),
      c("情绪劳动、总要照顾气氛", { anxiety: 2 }),
      c("价值观或生活方式分歧", { anxiety: 2 }),
      c("未来、承诺或外界压力", { anxiety: 2, catastrophizing: 1 }),
      c("家庭或其他关系牵扯", { anxiety: 2 }),
      c("说不清，整体很累", { anxiety: 3 }),
    ],
  },
  {
    kind: "choice",
    id: "r9",
    text: "过去一个月里，你有没有过「想结束或逃离」的念头？",
    options: [
      c("从没有", { anxiety: 0, catastrophizing: 0 }),
      c("偶尔一闪而过", { anxiety: 1, catastrophizing: 1 }),
      c("有时会有", { anxiety: 2, catastrophizing: 2 }),
      c("比较频繁", { anxiety: 3, catastrophizing: 3 }),
      c("认真考虑过或已有打算", { anxiety: 3, catastrophizing: 3 }),
    ],
  },
  {
    kind: "choice",
    id: "r10",
    text: "若暂时分开或冷静，你能否抽离并专注自己的事？",
    options: [
      c("比较容易", { control: 3 }),
      c("有一点难", { control: 2, anxiety: 1 }),
      c("看情况而定", { control: 1, anxiety: 1 }),
      c("比较难", { control: 1, anxiety: 2 }),
      c("几乎不能，会一直想", { anxiety: 3, guessing: 2 }),
    ],
  },
  {
    kind: "choice",
    id: "r11",
    text: "你对这段关系一年后的走向感知？",
    options: [
      c("可能更稳定亲密", { anxiety: 0, control: 2 }),
      c("大概维持现状", { anxiety: 1 }),
      c("很不确定", { anxiety: 2, catastrophizing: 1 }),
      c("偏向恶化", { anxiety: 2, catastrophizing: 2 }),
      c("可能结束或已难挽回", { anxiety: 3, catastrophizing: 2 }),
    ],
  },
  {
    kind: "choice",
    id: "r12",
    text: "整体来看，这段关系带来的情绪消耗有多大？（自评）",
    options: [
      c("很小", { anxiety: 0 }),
      c("较小", { anxiety: 1 }),
      c("中等", { anxiety: 2 }),
      c("比较大", { anxiety: 3 }),
      c("非常大，已影响生活", { anxiety: 3, catastrophizing: 2 }),
    ],
  },
];
