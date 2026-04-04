import type { MirrorTone } from "@/lib/mirror-tone";
import { mirrorToneForSingleQuestion } from "@/lib/mirror-tone";
import { NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-deepseek-key")?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
  }

  let bundle = "";
  let tone: MirrorTone = "gentle";
  try {
    const body = (await req.json()) as { bundle?: string; tone?: MirrorTone };
    bundle = (body.bundle ?? "").trim();
    if (body.tone === "sharp" || body.tone === "gentle") tone = body.tone;
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  if (!bundle) {
    return NextResponse.json({ error: "摘要为空" }, { status: 400 });
  }

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              `用户已完成两个主题的「快速觉察」并有规则生成的交叉摘要。请根据其哲学取向，只输出一句统整两个场域的开放式反思提问（中文）。禁止多句、禁止表情符号、禁止诊断用语。${mirrorToneForSingleQuestion(tone)}`,
          },
          {
            role: "user",
            content: bundle.slice(0, 4000),
          },
        ],
        temperature: 0.55,
        max_tokens: 300,
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `DeepSeek ${res.status}: ${raw.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = JSON.parse(raw) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "空回复" }, { status: 502 });
    }

    return NextResponse.json({ question: text.replace(/^["「]|["」]$/g, "") });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
