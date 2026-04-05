import crypto from "node:crypto";

const textEncoder = new TextEncoder();

type LineTextMessage = {
  type: "text";
  text: string;
};

export type LineWebhookEvent = {
  type: string;
  mode?: string;
  replyToken?: string;
  source?: {
    userId?: string;
  };
  message?: {
    type?: string;
    text?: string;
  };
};

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function verifyLineSignature(body: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const secret = getRequiredEnv("LINE_CHANNEL_SECRET");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");

  const signatureBuffer = textEncoder.encode(signature);
  const expectedBuffer = textEncoder.encode(expected);

  if (signatureBuffer.byteLength !== expectedBuffer.byteLength) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

export function isAllowedLineUser(userId?: string) {
  const rawAllowedUserIds = process.env.LINE_ALLOWED_USER_IDS?.trim();

  if (!rawAllowedUserIds) {
    return true;
  }

  if (!userId) {
    return false;
  }

  const allowedUserIds = rawAllowedUserIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return allowedUserIds.includes(userId);
}

export async function replyToLine(replyToken: string, message: string) {
  const payload = {
    replyToken,
    messages: [toTextMessage(message)],
  };

  await callLineApi("https://api.line.me/v2/bot/message/reply", payload);
}

export async function pushToLine(to: string, message: string) {
  const payload = {
    to,
    messages: [toTextMessage(message)],
  };

  await callLineApi("https://api.line.me/v2/bot/message/push", payload);
}

export async function startLineLoading(chatId: string, loadingSeconds = 10) {
  const payload = {
    chatId,
    loadingSeconds,
  };

  await callLineApi(
    "https://api.line.me/v2/bot/chat/loading/start",
    payload
  );
}

function toTextMessage(message: string): LineTextMessage {
  return {
    type: "text",
    text: truncateForLine(message),
  };
}

function truncateForLine(message: string) {
  const maxLength = 4500;

  if (message.length <= maxLength) {
    return message;
  }

  return `${message.slice(0, maxLength - 15)}\n\n...truncated`;
}

async function callLineApi(url: string, payload: unknown) {
  const channelAccessToken = getRequiredEnv("LINE_CHANNEL_ACCESS_TOKEN");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINE API failed: ${response.status} ${errorText}`);
  }
}
