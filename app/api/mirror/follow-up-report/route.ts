import { deepseekChat, resolveDeepseekApiKey } from "@/lib/server/deepseek";
import { mirrorPhilosophyCoach } from "@/lib/mirror-prompts";
import type { MirrorTone } from "@/lib/mirror-tone";
import type { PhilosophyKey } from "@/lib/result-narratives";
import { NextResponse } from "next/server";

/** 基于主反思 + 追问列表 + 用户补充，生成一段简易整合报告（约 200–320 字） */

function mapUpstreamStatus(httpStatus: number): number {
  if (httpStatus >= 400 && httpStatus < 600) return httpStatus;
  return 502;
}

export async function POST(req: Request) {
  try {
    const apiKey = resolveDeepseekApiKey(req)?.trim();
    if (!apiKey) {
      console.warn("[follow-up-report] missing API key");
      return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
    }

    let philosophy: PhilosophyKey = "existential";
    let tone: MirrorTone = "gentle";
    let emotion = "";
    let obsession = "";
    let question = "";
    let followUps: string[] = [];
    let supplement = "";

    try {
      const body = (await req.json()) as {
        philosophy?: PhilosophyKey;
        tone?: MirrorTone;
        emotion?: string;
        obsession?: string;
        question?: string;
        followUps?: string[];
        supplement?: string;
      };
      philosophy = body.philosophy ?? "existential";
      if (body.tone === "sharp" || body.tone === "gentle") tone = body.tone;
      emotion = (body.emotion ?? "").trim();
      obsession = (body.obsession ?? "").trim();
      question = (body.question ?? "").trim();
      followUps = Array.isArray(body.followUps)
        ? body.followUps.map((s) => String(s).trim()).filter(Boolean)
        : [];
      supplement = (body.supplement ?? "").trim();
    } catch (e) {
      console.error("[follow-up-report] invalid JSON body", e);
      return NextResponse.json({ error: "请求体无效" }, { status: 400 });
    }

    if (!followUps.length && !supplement.trim()) {
      return NextResponse.json(
        { error: "请先点击「追问一次」生成至少一条追问，或在下方写下你的回应后再生成报告。" },
        { status: 400 }
      );
    }

    const coach = mirrorPhilosophyCoach(philosophy);
    const toneHint =
      tone === "sharp"
        ? "语气可略锐利，仍以尊重为前提，禁止人身攻击与关系下定论。"
        : "语气温和、留余地，避免说教与讨好。";

    const userBundle = [
      coach,
      `语气：${toneHint}`,
      `情绪快照：${emotion || "（无）"}`,
      `执着点：${obsession || "（无）"}`,
      `主反思问题：${question || "（无）"}`,
      followUps.length
        ? `进一步追问（逐条）：\n${followUps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
        : "",
      supplement
        ? `用户针对上述追问写下的回应与补充：\n${supplement.slice(0, 4000)}`
        : "用户尚未写下额外回应，请主要根据追问与前三要素作轻量整合。",
      "任务：写一段「简易整合报告」，严格 200–320 个汉字，单段，不要标题、不要分点符号列表、不要引号包裹整段。帮助对方看见：追问触到了什么、补充里出现了哪些新的词语或意象、可与前面的情绪/执着形成怎样的温和勾连。结尾用一句极轻的自问收束。禁止心理诊断、禁止替对方判关系、禁止表情符号。",
    ]
      .filter(Boolean)
      .join("\n\n");

    console.log("[follow-up-report] request ok, userBundleChars=", userBundle.length, "followUps=", followUps.length);

    const result = await deepseekChat({
      apiKey,
      messages: [
        {
          role: "system",
          content:
            "你是偏哲学取向的书写者，文字干净、克制。只输出要求的那一段中文正文，不要任何前缀或后缀说明。",
        },
        { role: "user", content: userBundle.slice(0, 12000) },
      ],
      temperature: 0.45,
      max_tokens: 600,
    });

    if (!result.ok) {
      console.error("[follow-up-report] deepseek failed", result.httpStatus, result.message.slice(0, 300));
      return NextResponse.json(
        { error: result.message },
        { status: mapUpstreamStatus(result.httpStatus) }
      );
    }

    let report = result.content.replace(/^["「『]|["」』]$/g, "").trim();
    if (!report) {
      console.warn("[follow-up-report] empty report after strip");
      return NextResponse.json({ error: "模型无输出" }, { status: 502 });
    }

    console.log("[follow-up-report] success, reportChars=", report.length);
    return NextResponse.json({ report });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "服务器内部错误";
    console.error("[follow-up-report] unhandled", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
