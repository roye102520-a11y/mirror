import { NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

const SCHEMA_HINT = `输出一个 JSON 对象，键名必须完全一致且仅包含四个字符串字段：
"radar"：1–2 句，点评六轴人格雷达的整体轮廓与关系含义；
"risks"：1–2 句，综合四项关系风险，避免恐吓语气；
"career"：1–2 句，对职业结构类型在人际互动中的影响作温和引申；
"cycle"：1–2 句，呼应对方的「关系循环」，给可试行的小提醒。
全文使用简体中文，禁止 markdown、禁止代码围栏、禁止换行键值以外的多余包裹。`;

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
            content: `你是心理咨询取向的书面助理，语气克制、具体。${SCHEMA_HINT}`,
          },
          {
            role: "user",
            content: `以下为用户问卷与叙事的匿名结构摘要，请严格只输出 JSON：\n${summary.slice(0, 2000)}`,
          },
        ],
        temperature: 0.45,
        max_tokens: 512,
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
    let text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "模型未返回内容" }, { status: 502 });
    }

    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "模型返回非 JSON，请重试。" },
        { status: 502 }
      );
    }

    const o = parsed as Record<string, unknown>;
    const radar = String(o.radar ?? "").trim();
    const risks = String(o.risks ?? "").trim();
    const career = String(o.career ?? "").trim();
    const cycle = String(o.cycle ?? "").trim();

    if (!radar || !risks || !career || !cycle) {
      return NextResponse.json({ error: "JSON 缺少字段" }, { status: 502 });
    }

    return NextResponse.json({ radar, risks, career, cycle });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "网络错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
