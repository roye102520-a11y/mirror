import { mirrorPhilosophyCoach } from "@/lib/mirror-prompts";
import type { MirrorTone } from "@/lib/mirror-tone";
import { mirrorToneForSingleQuestion } from "@/lib/mirror-tone";
import type { PhilosophyKey } from "@/lib/result-narratives";
import { NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-deepseek-key")?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
  }

  let philosophy: PhilosophyKey = "existential";
  let emotion = "";
  let obsession = "";
  let question = "";
  let userText = "";
  let priorFollowUps: string[] = [];
  let tone: MirrorTone = "gentle";

  try {
    const body = (await req.json()) as {
      philosophy?: PhilosophyKey;
      emotion?: string;
      obsession?: string;
      question?: string;
      userText?: string;
      priorFollowUps?: string[];
      tone?: MirrorTone;
    };
    philosophy = body.philosophy ?? "existential";
    if (body.tone === "sharp" || body.tone === "gentle") tone = body.tone;
    emotion = (body.emotion ?? "").trim();
    obsession = (body.obsession ?? "").trim();
    question = (body.question ?? "").trim();
    userText = (body.userText ?? "").trim();
    priorFollowUps = Array.isArray(body.priorFollowUps) ? body.priorFollowUps.map((s) => String(s).trim()).filter(Boolean) : [];
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  if (!emotion && !obsession && !question) {
    return NextResponse.json({ error: "缺少反思内容" }, { status: 400 });
  }

  const coach = mirrorPhilosophyCoach(philosophy);
  const bundle = [
    coach,
    `已给出的三要素：\n情绪快照：${emotion}\n执着点：${obsession}\n反思问题：${question}`,
    userText ? `用户原始表述（节选）：\n${userText.slice(0, 3000)}` : "",
    priorFollowUps.length
      ? `已追问过：\n${priorFollowUps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : "",
    "请再给出一句不同的开放式反思提问（中文），切入另一个角度；禁止解释、禁止多句、禁止表情符号。",
  ]
    .filter(Boolean)
    .join("\n\n");

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
            content: `你只输出一句中文问句本身，不要引号包裹，不要前缀说明。${mirrorToneForSingleQuestion(tone)}`,
          },
          { role: "user", content: bundle.slice(0, 8000) },
        ],
        temperature: 0.55,
        max_tokens: 200,
      }),
    });

    const rawText = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `DeepSeek ${res.status}: ${rawText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = JSON.parse(rawText) as { choices?: { message?: { content?: string } }[] };
    let out = data.choices?.[0]?.message?.content?.trim() ?? "";
    out = out.replace(/^["「]|["」]$/g, "").replace(/^[？?]\s*/, "");
    if (!out) {
      return NextResponse.json({ error: "空回复" }, { status: 502 });
    }

    return NextResponse.json({ question: out });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
