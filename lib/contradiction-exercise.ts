/**
 * 矛盾意图 / 对立面悬停：以哲学语汇包装，便于用户自行练习。
 */
export function buildContradictionExercise(obsession: string): {
  lead: string;
  instruction: string;
  promptLabel: string;
} {
  const core = obsession.trim().slice(0, 160) || "心里悬着的那件事";
  return {
    lead:
      "当你在同一条思路上反复打转，心智会把它当成「唯一可能的故事」。下面是一个反直觉的练习：不急着反驳念头，而是暂时与它并肩，走到它宣称的尽头——看一看那时身体与心还会说什么。",
    instruction: `你此刻的执着点，粗描如下：「${core}」\n\n请接下来约五分钟，有意地停留在这个念头的最坏版本里——例如：若对方真的不再回复、若你真的「猜对了」最坏情节，不急着安抚自己，也不急着驳倒自己，只是让画面停在那里，留意呼吸、肩背、胃脘，以及心里最先浮现的一两个词。\n\n这不是要你接受现实，也不是咒诅；只是借「矛盾意图」松动自动导航的力道。`,
    promptLabel: "练习结束后，可在此记下身体与心里的变化（不必完整、可仅几个词）：",
  };
}
