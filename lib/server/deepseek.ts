/**
 * 服务端 DeepSeek Chat Completions 封装。
 * - 业务路由优先从请求头 X-DeepSeek-Key 读取（与前端 localStorage 写入一致）；
 * - 也可在部署环境配置 DEEPSEEK_API_KEY（只读服务端密钥，勿暴露给浏览器）。
 */

export const DEEPSEEK_CHAT_COMPLETIONS_URL =
  (typeof process !== "undefined" && process.env.DEEPSEEK_BASE_URL?.trim()) ||
  "https://api.deepseek.com/v1/chat/completions";

export const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";

/** 优先请求头，其次环境变量 */
export function resolveDeepseekApiKey(req: Request): string | null {
  const header = req.headers.get("x-deepseek-key")?.trim();
  if (header) return header;
  const env = typeof process !== "undefined" ? process.env.DEEPSEEK_API_KEY?.trim() : "";
  return env || null;
}

function stripMarkdownFence(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  }
  return t;
}

/** 从夹杂说明文字的响应里截取第一个成对大括号 JSON（失败返回 null） */
function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** 安全解析 OpenAI 风格 chat/completions 响应体（允许首尾杂音、markdown 围栏、额外前缀） */
export function parseOpenAIStyleCompletionBody(rawBody: string): unknown | null {
  const stripped = stripMarkdownFence(rawBody);
  if (!stripped) return null;
  try {
    return JSON.parse(stripped);
  } catch {
    const slice = extractBalancedJsonObject(stripped);
    if (!slice) return null;
    try {
      return JSON.parse(slice);
    } catch {
      return null;
    }
  }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

/**
 * 规范化助手 message.content：string | 多段数组 | 带 text 字段的对象
 * 避免 content 非 string 时调用 .trim() 抛错导致 500
 */
export function normalizeAssistantContent(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const part of content) {
      if (typeof part === "string") parts.push(part);
      else if (isRecord(part)) {
        if (typeof part.text === "string") parts.push(part.text);
        else if (typeof part.content === "string") parts.push(part.content);
      }
    }
    return parts.join("").trim();
  }
  if (isRecord(content) && typeof content.text === "string") return content.text.trim();
  return String(content).trim();
}

export type DeepseekChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type DeepseekChatOptions = {
  apiKey: string;
  messages: DeepseekChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  /** DeepSeek 与 OpenAI 兼容：强制模型尽量输出合法 JSON 对象 */
  response_format?: { type: "json_object" };
};

export type DeepseekChatSuccess = { ok: true; content: string; rawBody: string };

export type DeepseekChatFailure = {
  ok: false;
  /** 便于路由映射 HTTP 状态 */
  httpStatus: number;
  message: string;
};

/** 调用 DeepSeek chat/completions，成功返回助手正文 */
export async function deepseekChat(
  options: DeepseekChatOptions
): Promise<DeepseekChatSuccess | DeepseekChatFailure> {
  const {
    apiKey,
    messages,
    model = DEFAULT_DEEPSEEK_MODEL,
    temperature = 0.5,
    max_tokens = 2048,
    response_format,
  } = options;

  try {
    const body: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens,
    };
    if (response_format) body.response_format = response_format;

    const res = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const rawBody = await res.text();

    if (!res.ok) {
      console.error("[deepseek] upstream error", res.status, rawBody.slice(0, 400));
      return {
        ok: false,
        httpStatus: res.status,
        message: `HTTP ${res.status}: ${rawBody.slice(0, 400)}`,
      };
    }

    const data = parseOpenAIStyleCompletionBody(rawBody);
    if (data == null || !isRecord(data)) {
      console.error("[deepseek] completion JSON parse failed, sample:", rawBody.slice(0, 500));
      return { ok: false, httpStatus: 502, message: "响应非合法 JSON（无法解析 DeepSeek 返回体）" };
    }

    const choices = data.choices;
    const first = Array.isArray(choices) && choices.length > 0 ? choices[0] : null;
    const messageObj = isRecord(first) && isRecord(first.message) ? first.message : null;
    const rawContent = messageObj ? messageObj.content : undefined;

    const content = normalizeAssistantContent(rawContent);
    if (!content) {
      console.error("[deepseek] empty assistant content, keys:", Object.keys(data));
      return { ok: false, httpStatus: 502, message: "模型返回空内容" };
    }

    return { ok: true, content, rawBody };
  } catch (e) {
    const message = e instanceof Error ? e.message : "网络或解析错误";
    console.error("[deepseek] fetch/parse exception", message);
    return { ok: false, httpStatus: 500, message };
  }
}
