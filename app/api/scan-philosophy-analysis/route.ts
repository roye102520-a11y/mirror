import { NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

/** 约 280–320 字整体哲学短析：根据选择题结构摘要 + 开放题原文，循循善诱，不说教、不讨好 */
export async function POST(req: Request) {
  const apiKey = req.headers.get("x-deepseek-key")?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
  }

  let bundle = "";
  let philosophyLabel = "";
  let toneLabel = "";
  try {
    const body = (await req.json()) as {
      bundle?: string;
      philosophyLabel?: string;
      toneLabel?: string;
    };
    bundle = (body.bundle ?? "").trim();
    philosophyLabel = (body.philosophyLabel ?? "").trim();
    toneLabel = (body.toneLabel ?? "").trim();
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
            content: `你是书写者，语气清醒、有哲学厚度，像一位耐心的对话者。请根据「匿名问卷结构摘要」与「对方亲手写的开放句」写一段整体反思（严格 280–320 个汉字，仅一段，不要分点、不要标题、不要引号包裹整段）。

禁止：说教腔、心理诊断式断言、讨好用户、替用户定罪或原谅他人、预测关系结局。
鼓励：提出 1–2 个可供自检的问题；点出可能的内在张力而不贴标签；用语含蓄、可留白。

取向提示：${philosophyLabel || "未标明"}。语气偏好：${toneLabel || "温和"}（温和则句式留余地；尖锐则可追问前提，但仍保持尊重）。`,
          },
          {
            role: "user",
            content: bundle.slice(0, 4500),
          },
        ],
        temperature: 0.5,
        max_tokens: 512,
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `DeepSeek ${res.status}：${raw.slice(0, 180)}` },
        { status: 502 }
      );
    }

    const data = JSON.parse(raw) as { choices?: { message?: { content?: string } }[] };
    let text = data.choices?.[0]?.message?.content?.trim() ?? "";
    text = text.replace(/^["「『]|["」』]$/g, "").trim();
    if (!text) {
      return NextResponse.json({ error: "模型无输出" }, { status: 502 });
    }

    return NextResponse.json({ analysis: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
