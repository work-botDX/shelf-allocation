import { after, NextResponse } from "next/server";
import {
  isAllowedLineUser,
  pushToLine,
  startLineLoading,
  type LineWebhookEvent,
  verifyLineSignature,
} from "@/lib/lineBot";
import { handleClaudeCommand } from "@/lib/claudeRemote";

export const runtime = "nodejs";

type LineWebhookPayload = {
  events?: LineWebhookEvent[];
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: LineWebhookPayload;

  try {
    payload = JSON.parse(body) as LineWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const events = payload.events || [];
  after(async () => {
    await processWebhookEvents(events);
  });

  return NextResponse.json({ ok: true });
}

async function processWebhookEvents(events: LineWebhookEvent[]) {
  await Promise.all(
    events.map(async (event) => {
      if (event.type !== "message" || event.message?.type !== "text") {
        return;
      }

      if (event.mode === "standby") {
        return;
      }

      const userId = event.source?.userId;

      if (!userId) {
        console.warn("LINE event missing source.userId");
        return;
      }

      if (!isAllowedLineUser(userId)) {
        await pushToLine(userId, "このユーザーは許可されていません。");
        return;
      }

      const messageText = event.message.text?.trim();

      if (!messageText) {
        await pushToLine(userId, "空のメッセージは処理できません。");
        return;
      }

      try {
        await startLineLoading(userId, 10);
      } catch (error) {
        console.warn("Failed to start LINE loading animation", error);
      }

      try {
        const result = await handleClaudeCommand(messageText);
        await pushToLine(userId, result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        await pushToLine(userId, `実行に失敗しました。\n${message.slice(0, 4000)}`);
      }
    })
  );
}
