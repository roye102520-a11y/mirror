import type { InternetArchetypeKey, InternetQuestion } from "./quiz-types";

const w = (
  label: string,
  pts: number,
  weights: NonNullable<InternetQuestion["options"][number]["archetypeWeights"]>
) => ({ label, pts, archetypeWeights: weights });

/** 选做 8 题；描述由 archetypeWeights 累加后匹配预设文案 */
export const INTERNET_QUESTIONS: InternetQuestion[] = [
  {
    text: "在社交媒体或网络社群中，你通常扮演什么角色？",
    options: [
      w("积极发言者（经常发表观点、评论）", 3, { expressive: 3, rational: 1 }),
      w("内容分享者（转发、分享有趣内容）", 3, { expressive: 1, maintainer: 2 }),
      w("潜水观察者（只看不说，很少互动）", 3, { observer: 4 }),
      w("信息搜集者（专注获取信息，不参与讨论）", 3, { observer: 3, rational: 2 }),
      w("关系维护者（主要与熟人互动、点赞）", 3, { maintainer: 4 }),
    ],
  },
  {
    text: "你在网络上的自我呈现与现实中的你相比？",
    options: [
      w("基本一致，没有区别", 3, { maintainer: 1, rational: 1 }),
      w("有所美化，展示更好的一面", 3, { expressive: 1, anonymous: 1 }),
      w("完全不同，扮演另一个角色", 3, { anonymous: 4 }),
      w("更真实，现实中反而压抑", 3, { expressive: 2, anonymous: 1 }),
      w("更谨慎，刻意隐藏身份", 3, { observer: 3, rational: 1 }),
    ],
  },
  {
    text: "你更愿意在哪种网络社群中活跃？",
    options: [
      w("兴趣社群（游戏、音乐、读书等）", 3, { expressive: 1, observer: 1 }),
      w("职业/学习社群（技术讨论、行业交流）", 3, { rational: 3, observer: 1 }),
      w("情感支持社群（匿名倾诉、互助）", 3, { emotional: 3, anonymous: 1 }),
      w("熟人社交圈（微信群、朋友圈）", 3, { maintainer: 4 }),
      w("争议性话题社群（辩论、政治、价值观）", 3, { expressive: 2, rational: 2 }),
    ],
  },
  {
    text: "你在网络上发表观点时，是否会在意他人的反应？",
    options: [
      w("非常在意，害怕被攻击或否定", 3, { emotional: 2, observer: 2 }),
      w("比较在意，会斟酌措辞", 3, { rational: 3, observer: 1 }),
      w("不太在意，想说就说", 3, { expressive: 3 }),
      w("完全不在意，甚至享受争论", 3, { expressive: 2, rational: 2 }),
    ],
  },
  {
    text: "你是否曾在网络上建立过深厚的情感联系（如网友变成密友或恋人）？",
    options: [
      w("是，多次", 3, { emotional: 4 }),
      w("是，一两次", 3, { emotional: 3 }),
      w("尝试过，但没有持久", 3, { emotional: 1, observer: 1 }),
      w("从未，保持距离", 3, { observer: 2, rational: 2 }),
    ],
  },
  {
    text: "当你在网络上遇到观点冲突或攻击时，通常如何应对？",
    options: [
      w("理性辩论，试图说服对方", 3, { rational: 4 }),
      w("忽略或拉黑", 3, { observer: 2, rational: 1 }),
      w("情绪化反击", 3, { expressive: 2, emotional: 2 }),
      w("感到受伤，退出讨论", 3, { emotional: 3, observer: 1 }),
      w("私下向朋友抱怨", 3, { maintainer: 2, emotional: 1 }),
    ],
  },
  {
    text: "你觉得网络上的自己更接近你的「真实人格」还是「理想人格」？",
    options: [
      w("真实人格（就是我本人）", 3, { maintainer: 1, rational: 1 }),
      w("理想人格（我想成为的样子）", 3, { expressive: 2, anonymous: 1 }),
      w("阴影人格（平时压抑的一面）", 3, { anonymous: 4 }),
      w("碎片化（不同平台不同人格）", 3, { anonymous: 3, expressive: 1 }),
    ],
  },
  {
    text: "如果有一天完全不能上网（包括社交、娱乐、工作沟通），你的感受会是？",
    options: [
      w("焦虑不安，无法适应", 3, { emotional: 3, maintainer: 1 }),
      w("有点不习惯，但能接受", 3, { rational: 2, observer: 1 }),
      w("无所谓，甚至感到轻松", 3, { observer: 2, rational: 2 }),
      w("非常解脱，早就想逃离", 3, { observer: 3, anonymous: 1 }),
    ],
  },
];

export const INTERNET_ARCHETYPE_COPY: Record<
  InternetArchetypeKey,
  { title: string; body: string }
> = {
  observer: {
    title: "观察型潜水者",
    body:
      "你在网络中更多是观察和吸收信息，较少主动表达。现实里你也可能习惯先做倾听者；数字空间为你提供了理解世界所需的距离感。",
  },
  expressive: {
    title: "活跃表达者",
    body:
      "你在网络上愿意发声，参与观点交流。这既可能是现实中未被充分承接的表达欲，也可能是你乐于分享与碰撞的天性。",
  },
  maintainer: {
    title: "关系维护者",
    body:
      "你使用网络多是为了维系已有的现实关系，线上是线下的延伸，而非替代。稳定与熟悉对你比在陌生流量中表演更重要。",
  },
  anonymous: {
    title: "匿名探索者",
    body:
      "你在数字场域里试验与现实不同的面向，以帮助探索被日常收起的部分自我。这是探索，也需留意边界与消耗。",
  },
  emotional: {
    title: "情感联结者",
    body:
      "你曾在互联网上建立较深的情感纽带，网络对你来说不只是信息渠道，也是支持与依恋的载体，同时可能伴随额外的不确定与焦虑。",
  },
  rational: {
    title: "理性据理者",
    body:
      "你倾向于在网络上保持说理与策略，斟酌措辞或坚持论证。你重视说服力与自我保护，冲突时更少有即兴的情绪宣泄。",
  },
};
