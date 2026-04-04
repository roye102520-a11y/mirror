import {
  buildFreeMirrorDimensionUserMessage,
  parseQuickDimensionJson,
  QUICK_DIMENSION_SYSTEM_PROMPT,
} from "@/lib/quick-awareness/dimension-analysis";
import { mirrorPhilosophyCoach } from "@/lib/mirror-prompts";
import type { MirrorTone } from "@/lib/mirror-tone";
import { mirrorToneInstruction } from "@/lib/mirror-tone";
import type { PhilosophyKey } from "@/lib/result-narratives";
import { deepseekChat, resolveDeepseekApiKey } from "@/lib/server/deepseek";
import { NextResponse } from "next/server";

function parseTriple(raw: string): { emotion: string; obsession: string; question: string } | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const o = JSON.parse(m[0]) as { emotion?: string; obsession?: string; question?: string };
      const emotion = o.emotion?.trim();
      const obsession = o.obsession?.trim();
      const question = o.question?.trim();
      if (emotion && obsession && question) return { emotion, obsession, question };
    } catch (e) {
      console.error("[analyze-text] parseTriple JSON.parse", e);
    }
  }
  return null;
}

/**
 * 自由书写 / 随机一问：第一次调用产出三卡 JSON；第二次同路由内产出 analysis_table（六维）。
 */
export async function POST(req: Request) {
  const apiKey = resolveDeepseekApiKey(req)?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
  }

  let text = "";
  let philosophy: PhilosophyKey = "existential";
  let mode = "free";
  let promptContext = "";
  let tone: MirrorTone = "gentle";
  try {
    const body = (await req.json()) as {
      text?: string;
      philosophy?: PhilosophyKey;
      mode?: string;
      promptContext?: string;
      tone?: MirrorTone;
    };
    text = (body.text ?? "").trim();
    if (body.philosophy) philosophy = body.philosophy;
    mode = body.mode ?? "free";
    promptContext = (body.promptContext ?? "").trim();
    if (body.tone === "sharp" || body.tone === "gentle") tone = body.tone;
  } catch (e) {
    console.error("[analyze-text] body parse", e);
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "文本为空" }, { status: 400 });
  }

  const coach = mirrorPhilosophyCoach(philosophy);
  const userLines = [
    coach,
    mirrorToneInstruction(tone),
    `模式：${mode === "random" ? "随机一问后的自愿书写" : "自由书写"}`,
    promptContext ? `背景/提示：\n${promptContext.slice(0, 2000)}` : "",
    `用户正文：\n${text.slice(0, 6000)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const completion = await deepseekChat({
      apiKey,
      messages: [
        {
          role: "system",
          content:
            "你是反思对话助手。只输出一段合法 JSON，键严格为 emotion、obsession、question（中文短句）。emotion：仅据用户正文可见的情绪；obsession：仅据正文可推的执着点，勿虚构情节；question：一句开放式提问。禁止编造用户未写的人、事、对白；禁止评判道德、预言关系结局、表情符号、Markdown。材料不足时用「尚不清晰」等诚实表述，勿杜撰细节。",
        },
        { role: "user", content: userLines },
      ],
      temperature: 0.45,
      max_tokens: 512,
    });

    if (!completion.ok) {
      return NextResponse.json({ error: completion.message }, { status: 502 });
    }

    const parsed = parseTriple(completion.content);
    if (!parsed) {
      return NextResponse.json({ error: "模型输出无法解析为 JSON" }, { status: 502 });
    }

    let analysis_table: ReturnType<typeof parseQuickDimensionJson> = null;
    try {
      const dimUser = buildFreeMirrorDimensionUserMessage(philosophy, mode, promptContext, text);
      const dimChat = await deepseekChat({
        apiKey,
        messages: [
          { role: "system", content: QUICK_DIMENSION_SYSTEM_PROMPT },
          { role: "user", content: dimUser },
        ],
        temperature: 0.35,
        max_tokens: 512,
        response_format: { type: "json_object" },
      });
      if (dimChat.ok) {
        try {
          analysis_table = parseQuickDimensionJson(dimChat.content);
        } catch (parseErr) {
          console.error("[analyze-text] analysis_table parse", parseErr);
        }
      } else {
        console.error("[analyze-text] dimension call", dimChat.message);
      }
    } catch (dimErr) {
      console.error("[analyze-text] dimension branch", dimErr);
    }

    return NextResponse.json({
      emotion: parsed.emotion,
      obsession: parsed.obsession,
      attachment: parsed.obsession,
      question: parsed.question,
      analysis_table,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "错误";
    console.error("[analyze-text] unhandled", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
