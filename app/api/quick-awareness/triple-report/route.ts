import { deepseekChat, resolveDeepseekApiKey } from "@/lib/server/deepseek";
import { NextResponse } from "next/server";

/** 三项快速觉察（关系/工作/自我成长）合并后的简易报告，约 280–400 字 */

function mapUpstreamStatus(httpStatus: number): number {
  if (httpStatus >= 400 && httpStatus < 600) return httpStatus;
  return 502;
}

export async function POST(req: Request) {
  try {
    const apiKey = resolveDeepseekApiKey(req)?.trim();
    if (!apiKey) {
      console.warn("[triple-report] missing API key");
      return NextResponse.json({ error: "未提供 API Key" }, { status: 401 });
    }

    let bundle = "";
    let philosophyLabel = "";

    try {
      const body = (await req.json()) as { bundle?: string; philosophyLabel?: string };
      bundle = (body.bundle ?? "").trim();
      philosophyLabel = (body.philosophyLabel ?? "").trim();
    } catch (e) {
      console.error("[triple-report] invalid JSON body", e);
      return NextResponse.json({ error: "请求体无效" }, { status: 400 });
    }

    if (!bundle) {
      return NextResponse.json({ error: "摘要为空" }, { status: 400 });
    }

    console.log("[triple-report] request ok, bundleChars=", bundle.length, "philosophyLabel=", philosophyLabel || "(empty)");

    const result = await deepseekChat({
      apiKey,
      messages: [
        {
          role: "system",
          content: `你是偏哲学取向的书写者，语气清醒、有温度，不写鸡汤、不做心理诊断。请根据「三个快速觉察模块」的结构化摘要（选择题轨迹 + 规则生成的情绪/执着 + 各模块一句反思问句 + 简易交叉观察），写一段**简易整合报告**。

要求：严格 280–400 个汉字；**单段**；不要标题、不要分点列表、不要引号包裹整段；可自然提到关系/工作/成长三个面向如何彼此映照；结尾给 **1 个** 开放式自问收束。
禁止：说教、讨好用户、替用户定罪或预言关系/职场结局。
用户哲学取向参考：${philosophyLabel || "未标明"}。`,
        },
        { role: "user", content: bundle.slice(0, 12000) },
      ],
      temperature: 0.45,
      max_tokens: 700,
    });

    if (!result.ok) {
      console.error("[triple-report] deepseek failed", result.httpStatus, result.message.slice(0, 300));
      return NextResponse.json(
        { error: result.message },
        { status: mapUpstreamStatus(result.httpStatus) }
      );
    }

    let report = result.content.replace(/^["「『]|["」』]$/g, "").trim();
    if (!report) {
      console.warn("[triple-report] empty report after strip");
      return NextResponse.json({ error: "模型无输出" }, { status: 502 });
    }

    console.log("[triple-report] success, reportChars=", report.length);
    return NextResponse.json({ report });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "服务器内部错误";
    console.error("[triple-report] unhandled", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
