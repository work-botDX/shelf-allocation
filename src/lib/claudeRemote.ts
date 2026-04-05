import { execFile } from "node:child_process";
import { getRequiredEnv } from "@/lib/lineBot";

type ClaudeCommand =
  | {
      kind: "help";
    }
  | {
      kind: "status";
    }
  | {
      kind: "new";
      prompt: string;
    }
  | {
      kind: "resume";
      sessionId: string;
      prompt: string;
    }
  | {
      kind: "continue";
      prompt: string;
    };

type ClaudeJsonResult = {
  result?: string;
  session_id?: string;
  is_error?: boolean;
};

export function parseClaudeCommand(input: string): ClaudeCommand {
  const trimmed = input.trim();

  if (!trimmed || /^help$/i.test(trimmed)) {
    return { kind: "help" };
  }

  if (/^status$/i.test(trimmed)) {
    return { kind: "status" };
  }

  const resumeMatch = trimmed.match(/^resume\s+(\S+)\s+([\s\S]+)$/i);

  if (resumeMatch) {
    return {
      kind: "resume",
      sessionId: resumeMatch[1],
      prompt: resumeMatch[2].trim(),
    };
  }

  const continueMatch = trimmed.match(/^continue\s+([\s\S]+)$/i);

  if (continueMatch) {
    return {
      kind: "continue",
      prompt: continueMatch[1].trim(),
    };
  }

  return {
    kind: "new",
    prompt: trimmed,
  };
}

export async function handleClaudeCommand(input: string) {
  const command = parseClaudeCommand(input);

  switch (command.kind) {
    case "help":
      return [
        "使い方:",
        "そのまま送信: 新規セッションで Claude Code を実行",
        "resume <session_id> <指示>: 既存セッションを再開",
        "continue <指示>: 直近セッションを継続",
        "status: SSH/Tailscale 側の接続確認",
      ].join("\n");
    case "status":
      return runRemoteStatus();
    case "new":
      return runClaudeJsonCommand(["-p", command.prompt]);
    case "resume":
      return runClaudeJsonCommand(["-p", "--resume", command.sessionId, command.prompt]);
    case "continue":
      return runClaudeJsonCommand(["-p", "--continue", command.prompt]);
  }
}

async function runRemoteStatus() {
  const cdClause = buildCdClause();
  const remoteScript = [
    cdClause,
    "printf 'ssh=ok\\n'",
    "printf 'host=%s\\n' \"$(hostname)\"",
    "printf 'cwd=%s\\n' \"$PWD\"",
    "if command -v claude >/dev/null 2>&1; then",
    "  printf 'claude=%s\\n' \"$(command -v claude)\"",
    "else",
    "  printf 'claude=missing\\n'",
    "fi",
  ].join("; ");

  const { stdout, stderr } = await runSsh(remoteScript);
  return formatOutput(stdout || stderr || "No response from remote host");
}

async function runClaudeJsonCommand(baseArgs: string[]) {
  const remoteCli = process.env.LINE_CLAUDE_REMOTE_CLI || "claude";
  const cdClause = buildCdClause();
  const permissionMode = process.env.LINE_CLAUDE_PERMISSION_MODE;
  const allowedTools = process.env.LINE_CLAUDE_ALLOWED_TOOLS;
  const extraArgs = process.env.LINE_CLAUDE_EXTRA_ARGS?.trim();
  const args = [...baseArgs, "--output-format", "json"];

  if (permissionMode) {
    args.push("--permission-mode", permissionMode);
  }

  if (allowedTools) {
    args.push("--allowedTools", allowedTools);
  }

  if (extraArgs) {
    args.push(...splitArgs(extraArgs));
  }

  const command = [remoteCli, ...args].map(shellEscape).join(" ");
  const remoteScript = `${cdClause} && ${command}`;
  const { stdout, stderr } = await runSsh(remoteScript);
  const output = stdout.trim() || stderr.trim();

  if (!output) {
    return "Claude Code から出力が返りませんでした。";
  }

  try {
    const parsed = JSON.parse(output) as ClaudeJsonResult;
    const sessionLine = parsed.session_id
      ? `session: ${parsed.session_id}\n`
      : "";
    const resultText = parsed.result?.trim() || "(empty response)";
    const errorPrefix = parsed.is_error ? "[error]\n" : "";

    return formatOutput(`${errorPrefix}${sessionLine}${resultText}`);
  } catch {
    return formatOutput(output);
  }
}

async function runSsh(remoteScript: string) {
  const sshTarget = getRequiredEnv("LINE_CLAUDE_SSH_TARGET");
  const timeoutMs = Number(process.env.LINE_CLAUDE_TIMEOUT_MS || "25000");
  const sshArgs = [
    "-o",
    "BatchMode=yes",
    "-o",
    "StrictHostKeyChecking=yes",
    "-o",
    "ConnectTimeout=10",
  ];

  if (process.env.LINE_CLAUDE_SSH_PORT) {
    sshArgs.push("-p", process.env.LINE_CLAUDE_SSH_PORT);
  }

  sshArgs.push(sshTarget, `bash -lc ${shellEscape(remoteScript)}`);

  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    execFile(
      "ssh",
      sshArgs,
      {
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          const details = stderr.trim() || stdout.trim() || error.message;
          reject(new Error(details));
          return;
        }

        resolve({ stdout, stderr });
      }
    );
  });
}

function shellEscape(value: string) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function splitArgs(value: string) {
  return value.match(/(?:[^\s"]+|"[^"]*")+/g)?.map((part) => part.replace(/^"|"$/g, "")) || [];
}

function formatOutput(value: string) {
  return value.trim().slice(0, 4300);
}

function buildCdClause() {
  const cwd = process.env.LINE_CLAUDE_REMOTE_CWD?.trim();
  return cwd ? `cd ${shellEscape(cwd)}` : "cd \"$HOME\"";
}
