import {
  DEFAULT_DEEPSEEK_MODEL,
  deepseekChat,
  resolveDeepseekApiKey,
} from "@/lib/server/deepseek";
import { NextResponse } from "next/server";

const MAX_SYSTEM_CHARS = 8000;
const MAX_USER_CHARS = 12000;

/**
 * 通用 DeepSeek 分析接口：传入 system + user，返回模型主文 `text`。
 *
 * POST JSON:
 * - system: string（必填）
 * - user: string（必填）
 * - temperature?: number（0–2，默认 0.5）
 * - maxTokens?: number（1–8192，默认 2048）
 * - model?: string（默认 deepseek-chat）
 *
 * 鉴权：请求头 X-DeepSeek-Key，或服务端环境变量 DEEPSEEK_API_KEY。
 */
export async function POST(req: Request) {
  const apiKey = resolveDeepseekApiKey(req);
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "未提供 API Key：请在请求头设置 X-DeepSeek-Key，或在服务器环境配置 DEEPSEEK_API_KEY。",
      },
      { status: 401 }
    );
  }

  let system = "";
  let user = "";
  let temperature = 0.5;
  let maxTokens = 2048;
  let model: string | undefined;

  try {
    const body = (await req.json()) as {
      system?: string;
      user?: string;
      temperature?: number;
      maxTokens?: number;
      model?: string;
    };
    system = (body.system ?? "").trim();
    user = (body.user ?? "").trim();
    if (typeof body.temperature === "number" && Number.isFinite(body.temperature)) {
      temperature = Math.min(2, Math.max(0, body.temperature));
    }
    if (typeof body.maxTokens === "number" && Number.isFinite(body.maxTokens)) {
      maxTokens = Math.min(8192, Math.max(1, Math.floor(body.maxTokens)));
    }
    if (typeof body.model === "string" && body.model.trim()) {
      model = body.model.trim().slice(0, 64);
    }
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  if (!system || !user) {
    return NextResponse.json(
      { error: "system 与 user 均为必填，且不能为空字符串" },
      { status: 400 }
    );
  }

  if (system.length > MAX_SYSTEM_CHARS || user.length > MAX_USER_CHARS) {
    return NextResponse.json(
      {
        error: `字符过长：system 最多 ${MAX_SYSTEM_CHARS}，user 最多 ${MAX_USER_CHARS}`,
      },
      { status: 400 }
    );
  }

  const result = await deepseekChat({
    apiKey,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    model: model ?? DEFAULT_DEEPSEEK_MODEL,
    temperature,
    max_tokens: maxTokens,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }

  return NextResponse.json({
    text: result.content,
    model: model ?? DEFAULT_DEEPSEEK_MODEL,
  });
}
