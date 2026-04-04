import {
  buildDimensionAnalysisUserMessage,
  parseQuickDimensionJson,
  QUICK_DIMENSION_SYSTEM_PROMPT,
} from "@/lib/quick-awareness/dimension-analysis";
import type { PhilosophyKey, QuickModuleId } from "@/lib/quick-awareness/types";
import { deepseekChat, resolveDeepseekApiKey } from "@/lib/server/deepseek";
import type { MirrorTone } from "@/lib/mirror-tone";
import { mirrorToneForSingleQuestion } from "@/lib/mirror-tone";
import { NextResponse } from "next/server";

/** Vercel / 部分托管：放宽 Serverless 上限；免费档仍可能被限制在 10s，故下方并行两次请求 */
export const maxDuration = 60;

function isQuickModule(m: string): m is QuickModuleId {
  return m === "relation" || m === "work" || m === "growth";
}

function isPhilosophy(p: string): p is PhilosophyKey {
  return (
    p === "existential" ||
    p === "stoic" ||
    p === "eastern" ||
    p === "utilitarian" ||
    p === "religious" ||
    p === "unknown"
  );
}

function clientStatus(s: number): number {
  if (s >= 400 && s < 600) return s;
  return 502;
}

/**
 * 快速觉察反思：同一路由内两次 DeepSeek 调用——反思问句与六维 JSON 并行，降低 Vercel 等环境串行超时导致 analysis_table 为空。
 */
export async function POST(req: Request) {
  const apiKey = resolveDeepseekApiKey(req)?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
  }

  let summary = "";
  let tone: MirrorTone = "gentle";
  let seedQuote = "";
  let moduleId: QuickModuleId = "growth";
  let philosophy: PhilosophyKey = "existential";

  try {
    const body = (await req.json()) as {
      summary?: string;
      tone?: MirrorTone;
      seedQuote?: string;
      module?: string;
      philosophy?: string;
    };
    summary = (body.summary ?? "").trim();
    if (body.tone === "sharp" || body.tone === "gentle") tone = body.tone;
    seedQuote = (body.seedQuote ?? "").trim();
    if (body.module && isQuickModule(body.module)) moduleId = body.module;
    if (body.philosophy && isPhilosophy(body.philosophy)) philosophy = body.philosophy;
  } catch (e) {
    console.error("[reflection] body parse", e);
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  if (!summary) {
    return NextResponse.json({ error: "摘要为空" }, { status: 400 });
  }

  const toneLine = mirrorToneForSingleQuestion(tone);
  const userContent =
    `请基于以下「快速觉察」摘要学会自问一句：\n${summary.slice(0, 3500)}` +
    (seedQuote ? `\n\n用户今日选读的提示句（可作语气参照）：\n${seedQuote.slice(0, 400)}` : "");

  try {
    const dimUser = buildDimensionAnalysisUserMessage(moduleId, philosophy, summary);

    const [q1, q2] = await Promise.all([
      deepseekChat({
        apiKey,
        messages: [
          {
            role: "system",
            content: `你是哲学对话者。根据用户填答摘要与其自我标明的哲学取向，只输出一句开放式反思提问（中文）。禁止解释、禁止多个问题、禁止表情符号、禁止诊断或价值评判用语。${toneLine}`,
          },
          { role: "user", content: userContent },
        ],
        temperature: 0.55,
        max_tokens: 256,
      }),
      deepseekChat({
        apiKey,
        messages: [
          { role: "system", content: QUICK_DIMENSION_SYSTEM_PROMPT },
          { role: "user", content: dimUser },
        ],
        temperature: 0.35,
        max_tokens: 512,
        response_format: { type: "json_object" },
      }),
    ]);

    if (!q1.ok) {
      console.error("[reflection] question call", q1.message);
      return NextResponse.json({ error: q1.message }, { status: clientStatus(q1.httpStatus) });
    }

    const question = q1.content.replace(/^["「]|["」]$/g, "").trim();
    if (!question) {
      return NextResponse.json({ error: "空反思问句" }, { status: 502 });
    }

    let analysis_table: ReturnType<typeof parseQuickDimensionJson> = null;
    if (q2.ok) {
      try {
        analysis_table = parseQuickDimensionJson(q2.content);
      } catch (parseErr) {
        console.error("[reflection] analysis_table JSON parse", parseErr);
      }
    } else {
      console.error("[reflection] dimension call", q2.message);
    }

    return NextResponse.json({ question, analysis_table });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "错误";
    console.error("[reflection] unhandled", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
