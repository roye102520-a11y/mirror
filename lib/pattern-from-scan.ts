import type { PatternRadarData } from "@/components/PatternRadar";

/** 由 60 题雷达六轴与关系风险粗推「执着模式」五维强度（0–100），供模式雷达个性化展示 */
export function patternRadarFromScan(
  radar: readonly number[],
  risks: { conflict: number; avoidance: number; dependency: number; control: number }
): PatternRadarData {
  const [ind, intimate, social, emo, power, self] = [
    radar[0] ?? 50,
    radar[1] ?? 50,
    radar[2] ?? 50,
    radar[3] ?? 50,
    radar[4] ?? 50,
    radar[5] ?? 50,
  ];

  const guessing = Math.round(
    Math.min(100, (100 - social) * 0.45 + (100 - intimate) * 0.25 + risks.dependency * 0.3)
  );
  const selfBlame = Math.round(Math.min(100, (100 - self) * 0.55 + emo * 0.35 + risks.conflict * 0.1));
  const catastrophize = Math.round(Math.min(100, emo * 0.5 + risks.conflict * 0.35 + risks.dependency * 0.15));
  const overControl = Math.round(Math.min(100, power * 0.55 + risks.control * 0.45));
  const avoidComm = Math.round(
    Math.min(100, risks.avoidance * 0.5 + (100 - social) * 0.35 + (100 - intimate) * 0.15)
  );

  return {
    labels: ["猜测他人", "自我责备", "灾难化", "过度控制", "回避沟通"],
    datasets: [
      {
        label: "模式强度（由扫描结果推导）",
        data: [guessing, selfBlame, catastrophize, overControl, avoidComm],
        backgroundColor: "rgba(100, 100, 100, 0.18)",
        borderColor: "#333333",
        borderWidth: 1,
      },
    ],
  };
}
