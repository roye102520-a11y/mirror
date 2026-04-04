/** 前端规则：根据叙述关键词给出客观、中性的引导语（非诊断） */
export function narrativeGuidance(text: string): string {
  const t = text.trim();
  if (!t) return "你可以从最近一件让你反复回想的关系或事件写起，不必完整，三五句即可。";

  const hits: string[] = [];
  if (/父母|家庭|童年|原生|父亲|母亲|爸妈/.test(t)) hits.push("原生家庭与早期经验");
  if (/伴侣|恋爱|婚姻|分手|亲密|男朋友|女朋友|丈夫|妻子/.test(t)) hits.push("亲密关系与依恋");
  if (/同事|领导|工作|职场|职业|失业|跳槽/.test(t)) hits.push("职业与权力情境");
  if (/朋友|社交|孤独|合群|圈子/.test(t)) hits.push("社交角色与归属");
  if (/焦虑|抑郁|愤怒|情绪|崩溃|压抑/.test(t)) hits.push("情绪与防御方式");
  if (/意义|价值|我是谁|人生/.test(t)) hits.push("自我叙事与意义感");

  if (hits.length === 0) {
    return "你已写下一段具体经验。下面的选择题将从关系结构、情绪与自我叙事等侧面帮助你整理，而非评判对错。";
  }

  return `从你的叙述中，可侧重阅读：${hits.join("、")}。下列题目将引导你从事件本身的个人维度做选择，如实即可。`;
}
