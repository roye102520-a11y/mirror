import { PHILOSOPHY_LABELS } from "@/lib/quick-awareness/types";
import type { PhilosophyKey } from "@/lib/result-narratives";
import { deepseekChat, resolveDeepseekApiKey } from "@/lib/server/deepseek";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const KINDS = ["daily", "random_question", "free_seed"] as const;
type Kind = (typeof KINDS)[number];

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

/**
 * Mirror 首页短内容：今日一句 / 随机一问 / 自由书写开头。
 * refreshToken 由客户端传入（时间戳+随机串），便于每次请求生成不同文案。
 */
export async function POST(req: Request) {
  const apiKey = resolveDeepseekApiKey(req)?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
  }

  let kind: Kind = "daily";
  let philosophy: PhilosophyKey = "existential";
  let refreshToken = "";
  try {
    const body = (await req.json()) as {
      kind?: string;
      philosophy?: string;
      refreshToken?: string;
    };
    if (body.kind && KINDS.includes(body.kind as Kind)) kind = body.kind as Kind;
    if (body.philosophy && isPhilosophy(body.philosophy)) philosophy = body.philosophy;
    refreshToken = String(body.refreshToken ?? `${Date.now()}`);
  } catch (e) {
    console.error("[inspiration] body", e);
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  const label = PHILOSOPHY_LABELS[philosophy];

  const specs: Record<
    Kind,
    { system: string; user: string; temperature: number; max_tokens: number }
  > = {
    daily: {
      system:
        "你是 mirror「今日一句」生成器。只输出一句中文短句（≤40 字），清醒、可带入日常，贴合用户哲学取向。禁止书名号长篇、禁止人名介绍、禁止解释、禁止换行与分列。",
      user: `哲学取向：${label}\n【本次变体】${refreshToken}\n请写与此前请求不同的一句全新省思（避免泛泛鸡汤）。`,
      temperature: 0.9,
      max_tokens: 120,
    },
    random_question: {
      system:
        "你只输出一句中文开放式反思提问（≤45 字）。禁止多个问号连发、禁止编号列表、禁止表情符号、禁止前缀说明。",
      user: `哲学取向：${label}\n【本次变体】${refreshToken}\n生成一个新鲜、可操作思考的问题，便于用户书写回应。`,
      temperature: 0.85,
      max_tokens: 120,
    },
    free_seed: {
      system:
        "你只输出一句中文「书写邀请」（≤38 字），温柔、可落笔，像轻声起头而非命题作文。禁止引号包裹整句、禁止换行。",
      user: `哲学取向：${label}\n【本次变体】${refreshToken}\n为自由书写生成一个全新的开头钩子。`,
      temperature: 0.88,
      max_tokens: 100,
    },
  };

  const spec = specs[kind];

  try {
    const out = await deepseekChat({
      apiKey,
      messages: [
        { role: "system", content: spec.system },
        { role: "user", content: spec.user },
      ],
      temperature: spec.temperature,
      max_tokens: spec.max_tokens,
    });

    if (!out.ok) {
      console.error("[inspiration] deepseek", out.message);
      return NextResponse.json({ error: out.message }, { status: 502 });
    }

    const text = out.content.replace(/^["「『]|["」』]$/g, "").trim();
    if (!text) {
      return NextResponse.json({ error: "空输出" }, { status: 502 });
    }

    return NextResponse.json({ text, kind });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "错误";
    console.error("[inspiration]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
