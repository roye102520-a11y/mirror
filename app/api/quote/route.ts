import { NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-deepseek-key")?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "未提供 API Key。请在设置页保存 Key。" }, { status: 401 });
  }

  let summary = "";
  try {
    const body = (await req.json()) as { summary?: string };
    summary = (body.summary ?? "").trim();
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  if (!summary) {
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
              "你只输出一句与受访者人格关系结构相关的中文哲学名言、诗句或学者短句，可附作者名；禁止解释、禁止换行多句、禁止表情符号与引号包裹。",
          },
          { role: "user", content: `以下为匿名问卷结构摘要，请给出一句话：\n${summary.slice(0, 1200)}` },
        ],
        temperature: 0.55,
        max_tokens: 128,
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `DeepSeek 错误 ${res.status}：${raw.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = JSON.parse(raw) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "模型未返回内容" }, { status: 502 });
    }

    return NextResponse.json({ quote: text.replace(/^["「]|["」]$/g, "") });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "网络错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
