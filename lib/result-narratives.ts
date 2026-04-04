import type {
  AttachmentType,
  CareerStructureType,
  DominantRelationRisk,
  SocialRoleType,
} from "./scoring";

/** 对应主问卷「你更容易被哪种人生哲学吸引？」一题（0-based） */
export const PHILOSOPHY_QUESTION_INDEX = 56;

export type PhilosophyKey =
  | "existential"
  | "stoic"
  | "eastern"
  | "utilitarian"
  | "religious"
  | "unknown";

export function philosophyFromAnswers(answers: number[]): PhilosophyKey {
  const i = answers[PHILOSOPHY_QUESTION_INDEX];
  const map: PhilosophyKey[] = [
    "existential",
    "stoic",
    "eastern",
    "utilitarian",
    "religious",
  ];
  if (typeof i !== "number" || i < 0 || i >= map.length) return "unknown";
  return map[i];
}

export type OutcomeLines = { brief: string; reflect: string };

const PU: Record<PhilosophyKey, string> = {
  existential:
    "此刻的关系里，哪一条边界最需要被你与对方彼此看见？",
  stoic: "在外界回应难以预料之外，你仍可为相处守住哪一种内在的节律？",
  eastern: "若暂时松一松对结果的抓取，你想在互动里多留哪一分缓？",
  utilitarian: "短期安心与长期清明之间，你此刻更愿向自己诚实的是哪一端？",
  religious: "你愿把哪一件具体的倾听或说话，当作今日的托付与践行？",
  unknown: "在相处里，哪一处体验最近最常被你想起，却少被说出？",
};

function pick(p: PhilosophyKey, table: Record<PhilosophyKey, string>): string {
  return table[p] ?? table.unknown;
}

const ATTACH_BRIEF: Record<AttachmentType, string> = {
  安全型: "亲近与疏离间多能协调摆动。",
  焦虑型: "分离线索易牵动情绪与想象。",
  回避型: "常以距离调节亲密中的张力。",
  混乱型: "靠近与撤离的冲动常交织出现。",
};

const ATTACH_Q: Record<AttachmentType, Record<PhilosophyKey, string>> = {
  安全型: {
    existential:
      "若必须由你的选择为亲密命名，今日你愿意守住哪一条细小边界？",
    stoic: "在对方反应不可控时，你仍可为关系守住哪一种可控的习俗？",
    eastern: "放下对即刻回应的抓取后，你想在相处里多留哪一分缓与让？",
    utilitarian: "你权衡「靠近与独处」时，愿为对方的节奏留出多大权重？",
    religious: "哪一种具体的守约或聆听，可成为你今天对爱的细小实行？",
    unknown: PU.unknown,
  },
  焦虑型: {
    existential:
      "当恐惧被说出而不被评价时，你愿意先对自己启齿的第一句是什么？",
    stoic: "哪些扰动属于你可分心处理的想象，哪些值得放进一句直接的话？",
    eastern: "执念升起时，你能否只对事实与呼吸，完成一次完整的注意？",
    utilitarian: "若把「被安抚」也当作资源，你最先想可持续供给它的是什么？",
    religious: "你如何把悬挂的担忧交托出去，又仍在此地尽一份清楚的表达？",
    unknown: PU.unknown,
  },
  回避型: {
    existential:
      "你选择保留距离时，这一步是在保护何种对你重要的空间？",
    stoic: "可分的距离里，哪一部分属于你仍能练习说明的范围？",
    eastern: "「退后」与「不参与」之间，你如何辨认此刻身心的真实位置？",
    utilitarian: "距离换得的轻松，在长期里替换了哪些成本，你愿意重新清点吗？",
    religious: "退后若也是一种守护，你今天能否为它找到一句诚实的理由？",
    unknown: PU.unknown,
  },
  混乱型: {
    existential:
      "当靠近与离开同时浮现，你能否为两者各写一句尚未审判的描述？",
    stoic: "今天哪一件极小的身体动作或作息，完全在你的意向之内可先稳住？",
    eastern: "波澜交叠时，哪一次放缓的呼气或停顿，可以成为第一个法门？",
    utilitarian: "若把混乱也视为待整理的信息，你最先想厘清的是哪一个变量？",
    religious: "在静默或祷念里，你请求被照见的，是颤抖本身还是其下的需要？",
    unknown: PU.unknown,
  },
};

const SOCIAL_BRIEF: Record<SocialRoleType, string> = {
  领导者: "常主动发起协作与方向感。",
  连接者: "擅在人际张力间搭桥联络。",
  观察者: "倾向先澄清脉络再参与。",
  竞争者: "多在比较与表现中取力。",
};

const SOCIAL_Q: Record<SocialRoleType, Record<PhilosophyKey, string>> = {
  领导者: {
    existential:
      "你发起的方向里，哪一处愿意交由他人共同署名、而非独自承担？",
    stoic: "群体骚动时，你仍愿守住哪一条不被卷走的内在议事规则？",
    eastern: "若牵头也是一种执着，你在何处学习放手让局面自己成形？",
    utilitarian: "当「成效」与「人情」相抵时，你愿把秤砣暂搁在哪一侧？",
    religious: "哪一种服侍或服务，可把你今天的带头从表演改为陪伴？",
    unknown: "在群体中，你最近一次带头时，身体哪里最先感到紧或轻？",
  },
  连接者: {
    existential:
      "你修补缝隙时，是否也有一道属于自己的边界需要被看见？",
    stoic: "调和之外，哪一句不讨好、却诚实的话，你打算何时练习说出？",
    eastern: "当和事成为一种习惯，你从何处辨认自己真实的喜好与疲惫？",
    utilitarian: "连接带来的和谐，是否在某个角落压抑了本可开谈的差异？",
    religious: "你希望哪一种安慰或代求，先落在自己身上再流向他人？",
    unknown: "你最近在关系里居中调停时，最常被省略的那一声是什么？",
  },
  观察者: {
    existential:
      "长时间的观看之后，你选择入场的那一步，会落在语言的哪里？",
    stoic: "信息足够之前与之后，你如何把沉默从逃避改名为审慎？",
    eastern: "旁观若也是一种在场，你如何不让清晰变成与他人隔绝的墙？",
    utilitarian: "延后参与节省了什么、又可能让谁独自承担了可见的成本？",
    religious: "在静观或聆听里，你为哪位他者保留了不被你匆忙定义的位置？",
    unknown: "你最近一次想开口却停住时，停住底下流动的是什么？",
  },
  竞争者: {
    existential:
      "当你赢过某个标准之后，那标准仍值得你继续用性命去追吗？",
    stoic: "胜败喧哗之外，哪一小块日常仍完全属于你不必交卷的练习？",
    eastern: "比较心生起时，你能否只对当下的一事一物，完成无胜负的注视？",
    utilitarian: "若把自尊也计入成本，这场较量里你愿意重新加减哪些项？",
    religious: "在追求卓越的路上，哪一种谦卑或谢恩可与你并肩而不减锐气？",
    unknown: "最近一次你觉得被比下去时，身体最先发出信号的部位是哪里？",
  },
};

const CAREER_BRIEF: Record<CareerStructureType, string> = {
  稳定职业型: "偏好可预期的结构与台阶。",
  资源整合型: "在联结人与事中找到支点。",
  创业探索型: "愿为不确定承担较多变数。",
  组织依附型: "在层级与归属里定位自身。",
};

const CAREER_Q: Record<CareerStructureType, Record<PhilosophyKey, string>> = {
  稳定职业型: {
    existential:
      "在既定轨道之内，哪一件小事仍完全由你命名其意义？",
    stoic: "规则与考核之外，你今天能为内心保留哪一寸不可被评分的时间？",
    eastern: "稳定若带来安心，是否也可能遮住一种你想轻轻试探的可能？",
    utilitarian: "当晋升与平稳相冲突，你愿把「好的生活」怎样换算？",
    religious: "哪一种忠心或委身，可把你今天的职务从履历连成召叫？",
    unknown: "最近工作日里，哪一刻你感到结构在托住你，又在限制你？",
  },
  资源整合型: {
    existential:
      "你织网时，哪一条线若断裂，会让你重新看见自己的限度与珍贵？",
    stoic: "人情与事务交织之处，哪一声「不」或「稍等」属于你仍可练习的？",
    eastern: "连结众多时，你从何处收回一点不再外借的空白？",
    utilitarian: "若网络是一种资产，你愿意为它的维护标出怎样的隐形预算？",
    religious: "哪一种分享或引介，今日可以不做表演、只做款待？",
    unknown: "你最近一次撮合资源时，心底最先掠过的一丝犹豫是什么？",
  },
  创业探索型: {
    existential:
      "在冒险的叙事里，哪一处失败仍被你愿意保留为合法的章节？",
    stoic: "风浪日起时，你今天仍能控制的「最小日常」是什么？",
    eastern: "成败故事交替时，你从何处辨认「成」与「败」之外的第三条路？",
    utilitarian: "若把风险折成可承受的损失上限，你愿意为试错写下哪一笔？",
    religious: "哪一种信托或交托，可让你在前行时不过度偷窥结局？",
    unknown: "最近一次你对未知说「再来一次」时，驱力里混入了什么颜色的情绪？",
  },
  组织依附型: {
    existential:
      "在依系于结构的同时，哪一块主意你仍想保留为「我的」而非「我们的」？",
    stoic: "服从与等候之间，哪一寸边界属于你仍可温和声明的？",
    eastern: "放下个人戏份、融入集体时，你从何处辨认自己并未消散？",
    utilitarian: "归属带来的安全，是否在某个面向让你推迟了本可一试的步子？",
    religious: "在上级与同伴之间，你如何把「听从」与「辨别」放在同一天平？",
    unknown: "你最近在层级里感到被托起与被挡住的是同一件事吗？",
  },
};

export function attachmentNarrative(type: AttachmentType, p: PhilosophyKey): OutcomeLines {
  return {
    brief: ATTACH_BRIEF[type],
    reflect: pick(p, ATTACH_Q[type]),
  };
}

export function socialRoleNarrative(type: SocialRoleType, p: PhilosophyKey): OutcomeLines {
  return {
    brief: SOCIAL_BRIEF[type],
    reflect: pick(p, SOCIAL_Q[type]),
  };
}

export function careerNarrative(type: CareerStructureType, p: PhilosophyKey): OutcomeLines {
  return {
    brief: CAREER_BRIEF[type],
    reflect: pick(p, CAREER_Q[type]),
  };
}

export type RelationCycleOutcome = {
  /** 循环简称，如「追—退」 */
  patternTitle: string;
  brief: string;
  reflect: string;
};

const CYCLE_TITLE: Record<DominantRelationRisk, Record<AttachmentType, string>> = {
  conflict: {
    安全型: "争辩—回修",
    焦虑型: "施压—僵住",
    回避型: "隐忍—爆发",
    混乱型: "升级—断裂",
  },
  avoidance: {
    安全型: "留白—再近",
    焦虑型: "靠近—后撤",
    回避型: "沉默—累积",
    混乱型: "疏离—拉扯",
  },
  dependency: {
    安全型: "依靠—自立",
    焦虑型: "渴求—试探",
    回避型: "依赖—愧疚",
    混乱型: "依附—撕裂",
  },
  control: {
    安全型: "安排—协商",
    焦虑型: "抓取—落空",
    回避型: "规则—反抗",
    混乱型: "掌控—失控",
  },
  balanced: {
    安全型: "摆动—回正",
    焦虑型: "敏感—修补",
    回避型: "距离—靠近",
    混乱型: "起伏—整合",
  },
};

const CYCLE_BRIEF: Record<DominantRelationRisk, Record<AttachmentType, string>> = {
  conflict: {
    安全型:
      "分歧出现时你较愿直面；若声调抬高，往往在求被听懂。冷静下来后，你通常愿意一起收尾，循环多以修补告终。",
    焦虑型:
      "不安时容易把担心说成质问；对方一沉默，你又更焦虑。常见循环是「逼近—对抗—后悔」，暂停往往比追问更能破局。",
    回避型:
      "你习惯先忍，等耐受饱和再爆发；对方常感到突兀。循环是「积压—冲撞」；早点用一句小话露头，反而安全。",
    混乱型:
      "靠近与愤怒可能短间隔切换，双方都难预测下一步。循环呈「急升—急停」；需要先让身体稳一点，再谈道理。",
  },
  avoidance: {
    安全型:
      "你会给彼此留白，再选时机靠近。偶有「多说两句就好」的遗憾，但整体能自调节奏。",
    焦虑型:
      "你想亲近，又怕被拒绝；一时热情一时退缩，对方可能读成摇摆。循环是「试探—撤退」；可把需要说小、说具体。",
    回避型:
      "距离是你的安全阀；对方越追，你越退。经典「追—逃」里，你是后退的一方；一句时间边界胜过长时间消失。",
    混乱型:
      "既渴望连结又怕窒息，互动里易出现突然冷淡。循环是「热—冷」交替；标记自己的极限有助于对方配合。",
  },
  dependency: {
    安全型:
      "你能依靠他人，也保留自我步调；偶尔过度操心，但能拉回。循环多为「相依—各自复位」。",
    焦虑型:
      "把安心系在回应速度上时，容易盯消息、要承诺。循环是「确认—短暂安心—再担心」；需在身体层面练习自持。",
    回避型:
      "内心需要却羞于开口，或开口后又自责「太黏」。循环是「想要—否认需要」；承认需要不等于软弱。",
    混乱型:
      "粘附与推开可能连着出现，自己亦困惑。循环呈「贴—推」；小步约定比大起大落更易稳态。",
  },
  control: {
    安全型:
      "你擅安排与推进；在信任关系里愿分权。若要调循环，留意「计划落空」时的口头禅是否伤人。",
    焦虑型:
      "不确定时更易抓细节、反复确认。循环是「约束—反弹」；给对方一小块自选空间，反而减控。",
    回避型:
      "你用规则或沉默守边界；对方可能感到被管或摸不透。循环是「收紧—冷战」；明说底线比暗示更有效。",
    混乱型:
      "时而强控时而撒手，他人难跟。循环是「紧—松」突变；把自己的担心写下来再沟通，可降冲击。",
  },
  balanced: {
    安全型:
      "四向风险都不极端时，你的互动多在可商范围内波动；偶有小疙瘩，多能日常消化。",
    焦虑型:
      "整体风险不高，但仍对疏远敏感。小循环常是「多虑—一句澄清就好」；提前说「我需要听一句」很管用。",
    回避型:
      "整体平稳，只是仍喜独处充电。循环多是「歇—回」，给对方一个你可回来的时间感即可。",
    混乱型:
      "起伏存在但不主导关系。觉察「今天更容易刺」的日子，温柔降档，可打断小循环。",
  },
};

const SOCIAL_FEED: Record<SocialRoleType, string> = {
  领导者: "你在循环里常主动定调；试试留下一句让对方也敢改词的缝隙。",
  连接者: "你常居中调停；记得自己的疲惫也列入待议，而非无限补给。",
  竞争者: "输赢感容易给循环加温；辨认何时是在争对错、何时其实在争被看见。",
  观察者: "你惯先看全图；若迟迟不入局，对方可能把沉默读成冷淡。",
};

const CYCLE_REFLECT: Record<DominantRelationRisk, Record<PhilosophyKey, string>> = {
  conflict: {
    existential: "下一次争执里，你愿意共同命名的是问题本身，还是彼此的恐惧？",
    stoic: "哪些话属于可延后反应的噪音，哪些值得当场一句说清楚？",
    eastern: "火气上来时，能否先完成一次慢行呼吸，再给反应？",
    utilitarian: "这场争论若按「关系长期收益」记账，你现在愿意付的一点成本是什么？",
    religious: "哪一种具体的致歉或原谅，可以成为今天循环的休止符？",
    unknown: "最近一次吵完后，你最先感到松一口气还是更空？",
  },
  avoidance: {
    existential: "你选择的距离是保护某种价值，还是躲避某种难以启齿的需要？",
    stoic: "今天哪一步小接触仍在你的承受边界内，却尚未尝试？",
    eastern: "退一步时，你是否仍能感受自己与对方同在这一事实？",
    utilitarian: "回避省下的精力，是否在别处以利息形式偿还？",
    religious: "静默里，你求的是被理解，还是被赦免？",
    unknown: "对方若不问，你最近最想被主动问起的一件小事是什么？",
  },
  dependency: {
    existential: "没有回应的片刻里，你仍可当作自己存在的第一见证人吗？",
    stoic: "哪些安慰必须来自他人，哪些其实可由作息与小事自给？",
    eastern: "黏与离都像浪；你能否在浪隙里仍触到自己的足底？",
    utilitarian: "若把「被需要」当作资源，它的可再生条件是什么？",
    religious: "哪一种托付可让你不靠窥探结局也能安歇一刻？",
    unknown: "上一次你忍住没发出去的那条消息，底下真正的句子是什么？",
  },
  control: {
    existential: "你抓住的清单里，哪一条其实从来不在你手中？",
    stoic: "今天哪一件事证明你仍能练习放手而不失自重？",
    eastern: "松手若带来空洞，空洞底下是否还有另一层信任？",
    utilitarian: "控制得来的秩序，是否让某条人伦线路长期亏损？",
    religious: "哪一种交托或节制，可使你的引领带温柔而非寒气？",
    unknown: "别人不按你剧本走时，你身体哪一处最先收紧？",
  },
  balanced: {
    existential: "平静之下，是否仍有一条你愿认真听见的小裂缝？",
    stoic: "日常稳定中，你今天仍愿守护哪一种微小节律？",
    eastern: "不大起大落时，你从何处练习不麻木的清醒？",
    utilitarian: "关系「够用」之外，你若再多投资 5%，会投在哪？",
    religious: "哪一个不起眼的守约，可把你和对方轻轻系在同一天？",
    unknown: "最近让你觉得「这样就挺好」的一个瞬间是什么？",
  },
};

/** 关系循环：由主导风险 × 依恋 × 社交角色拼合的启发式描述（非临床诊断） */
export function relationCycleNarrative(
  attach: AttachmentType,
  risk: DominantRelationRisk,
  social: SocialRoleType,
  p: PhilosophyKey
): RelationCycleOutcome {
  const patternTitle = CYCLE_TITLE[risk][attach];
  const core = CYCLE_BRIEF[risk][attach];
  const hook = SOCIAL_FEED[social];
  return {
    patternTitle,
    brief: `${core} ${hook}`,
    reflect: pick(p, CYCLE_REFLECT[risk]),
  };
}
