import {
  buildDimensionAnalysisUserMessage,
  buildFullScanDimensionUserMessage,
  FULL_SCAN_DIMENSION_PROMPT_APPEND,
  parseQuickDimensionJson,
  QUICK_DIMENSION_SYSTEM_PROMPT,
} from "@/lib/quick-awareness/dimension-analysis";
import { deepseekChat, resolveDeepseekApiKey } from "@/lib/server/deepseek";
import type { PhilosophyKey, QuickModuleId } from "@/lib/quick-awareness/types";
import { NextResponse } from "next/server";

export const maxDuration = 60;

function mapClientStatus(httpStatus: number): number {
  if (httpStatus >= 400 && httpStatus < 600) return httpStatus;
  return 502;
}

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

/** 快速觉察或完整扫描 /result · 六维多维觉察表（JSON 六字段）。body.fullScan === true 时为整卷扫描语境。 */
export async function POST(req: Request) {
  try {
    const apiKey = resolveDeepseekApiKey(req)?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
    }

    let summary = "";
    let moduleId: QuickModuleId = "relation";
    let philosophy: PhilosophyKey = "existential";
    let fullScan = false;

    try {
      const body = (await req.json()) as {
        summary?: string;
        module?: string;
        philosophy?: string;
        fullScan?: boolean;
      };
      summary = (body.summary ?? "").trim();
      fullScan = body.fullScan === true;
      if (body.module && isQuickModule(body.module)) moduleId = body.module;
      if (body.philosophy && isPhilosophy(body.philosophy)) philosophy = body.philosophy;
    } catch (e) {
      console.error("[dimension-analysis] invalid body", e);
      return NextResponse.json({ error: "请求体无效" }, { status: 400 });
    }

    if (!summary) {
      return NextResponse.json({ error: "摘要为空" }, { status: 400 });
    }

    const userContent = fullScan
      ? buildFullScanDimensionUserMessage(philosophy, summary)
      : buildDimensionAnalysisUserMessage(moduleId, philosophy, summary);

    const systemContent = fullScan
      ? QUICK_DIMENSION_SYSTEM_PROMPT + FULL_SCAN_DIMENSION_PROMPT_APPEND
      : QUICK_DIMENSION_SYSTEM_PROMPT;

    console.log("[dimension-analysis] request, fullScan=", fullScan, "summaryChars=", summary.length);

    const chat = await deepseekChat({
      apiKey,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
      temperature: 0.35,
      max_tokens: 512,
      response_format: { type: "json_object" },
    });

    if (!chat.ok) {
      console.error("[dimension-analysis] deepseek failed", chat.httpStatus, chat.message.slice(0, 240));
      return NextResponse.json({ error: chat.message }, { status: mapClientStatus(chat.httpStatus) });
    }

    let parsed = null as ReturnType<typeof parseQuickDimensionJson>;
    try {
      parsed = parseQuickDimensionJson(chat.content);
    } catch (e) {
      console.error("Report generation failed:", e);
      parsed = null;
    }

    if (!parsed) {
      console.warn("[dimension-analysis] unparseable model JSON, sample:", chat.content.slice(0, 280));
      return NextResponse.json({ error: "模型未返回可解析的 JSON" }, { status: 502 });
    }

    console.log("[dimension-analysis] success");
    return NextResponse.json({ analysis: parsed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "错误";
    console.error("[dimension-analysis] unhandled", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
