# LINE + Tailscale SSH + Claude Code

この構成では、LINE Messaging API の webhook を公開 URL で受け、そのサーバーから Tailscale SSH 経由で作業マシン上の Claude Code を実行します。

このリポジトリの実装は、LINE webhook にはすぐ `200 OK` を返し、処理結果は `push message` で返す構成です。長めの Claude 実行でも webhook タイムアウトを避けやすくしています。

## 構成

1. LINE -> 公開 webhook (`/api/line/webhook`)
2. webhook サーバー -> `ssh` -> `your-machine.tailnet.ts.net`
3. リモート側で `claude -p ...` を実行

重要:
- LINE は Tailscale ネットワークへ直接 webhook を送れません。
- Tailscale は `SSH の経路` に使います。
- webhook は公開 URL が必要です。Cloudflare Tunnel、公開 VPS、または自前の HTTPS 公開環境を使ってください。

## 必要条件

- webhook を受ける Next.js サーバーが HTTPS で公開されていること
- そのサーバーに `ssh` クライアントが入っていること
- リモート作業マシンで Tailscale と Tailscale SSH が使えること
- リモート作業マシンで `claude` コマンドが使えること
- リモート側で Z.ai / GLM 用の環境変数や gateway 設定が済んでいること

## リモート作業マシンの設定

1. Tailscale をインストールしてログイン
2. Tailscale SSH を有効化
3. webhook サーバーから `ssh your-user@your-machine.tailnet.ts.net` が通るように ACL / SSH policy を設定
4. `claude -p "test" --output-format json` が単体で動くことを確認

## webhook サーバーの設定

`.env` に最低限これを入れます。

```dotenv
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_ALLOWED_USER_IDS=U...
LINE_CLAUDE_SSH_TARGET=your-user@your-machine.tailnet.ts.net
LINE_CLAUDE_REMOTE_CWD=/absolute/path/to/project
LINE_CLAUDE_PERMISSION_MODE=acceptEdits
LINE_CLAUDE_ALLOWED_TOOLS=Bash,Read,Edit,Write,Grep,Glob,LS
```

必要なら SSH ポートも指定します。

```dotenv
LINE_CLAUDE_SSH_PORT=22
```

## LINE Developers 側

1. Messaging API channel を作成
2. Webhook URL を `https://your-public-host/api/line/webhook` に設定
3. Webhook を有効化
4. 応答メッセージは webhook 側に寄せるため、不要な自動応答は止める
5. 最初に bot へメッセージを送って `source.userId` を確認し、`LINE_ALLOWED_USER_IDS` に入れる

## 送信コマンド

- `status`
  - SSH/Tailscale/Claude Code の基本疎通確認
- `任意の指示`
  - 新規セッションで `claude -p` 実行
- `resume <session_id> <指示>`
  - 指定セッションを再開
- `continue <指示>`
  - 直近セッションを継続

## 制約

- Claude 実行自体は webhook 応答後に非同期で進み、結果は push 返信されます
- ただし webhook サーバーが serverless のようにレスポンス後タスクを継続できない環境だと、この実装のままでは不安定です
- 返答は LINE のメッセージ長に合わせて切り詰めています
- 公開サーバーからリモートへ SSH できないと動きません

## Cloudflare Tunnel

この用途では Cloudflare Tunnel で `localhost:3000` を公開するのが最短です。

- 手順: [cloudflare-tunnel-macos.md](/Users/yuukana/Git/shelf-allocation/docs/cloudflare-tunnel-macos.md#L1)
- 設定例: [config.example.yml](/Users/yuukana/Git/shelf-allocation/cloudflared/config.example.yml#L1)

## 初回確認

1. 公開サーバーで `npm run dev`
2. 別ターミナルで `curl -X POST http://localhost:3000/api/line/webhook` では署名検証で 401 になることを確認
3. LINE bot から `status` を送信
4. `ssh=ok` と `claude=...` が返ることを確認
