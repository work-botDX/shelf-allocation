# Cloudflare Tunnel on macOS

このプロジェクトの LINE webhook を公開するための `cloudflared` 手順です。ここでは `2026-04-05` 時点の Cloudflare 公式ドキュメントに沿って、`locally-managed tunnel` を使います。

前提:
- Cloudflare に載っているドメインがある
- この Mac で Next.js サーバーを動かす
- webhook URL を `https://line-bot.example.com/api/line/webhook` のように公開したい

## 1. cloudflared を入れる

Cloudflare の公式 docs では macOS は Homebrew でのインストール案内があります。

```bash
brew install cloudflared
```

## 2. Cloudflare にログイン

```bash
cloudflared login
```

この操作で `~/.cloudflared/cert.pem` が作られます。

## 3. named tunnel を作る

```bash
cloudflared tunnel create line-claude-bot
```

成功すると:
- tunnel UUID
- `~/.cloudflared/<TUNNEL_UUID>.json`

が作られます。

確認:

```bash
cloudflared tunnel list
```

## 4. config.yml を置く

テンプレートは [config.example.yml](/Users/yuukana/Git/shelf-allocation/cloudflared/config.example.yml#L1) にあります。

実ファイルは `~/.cloudflared/config.yml` に置きます。

例:

```yaml
tunnel: YOUR_TUNNEL_UUID
credentials-file: /Users/YOUR_USER/.cloudflared/YOUR_TUNNEL_UUID.json

ingress:
  - hostname: line-bot.example.com
    service: http://localhost:3000
  - service: http_status:404
```

## 5. DNS を tunnel に向ける

Cloudflare 公式 docs の通り、DNS route を作ります。

```bash
cloudflared tunnel route dns line-claude-bot line-bot.example.com
```

これは `line-bot.example.com` を `<UUID>.cfargotunnel.com` に向ける CNAME を作ります。

## 6. まずは手動で動かす

Next.js:

```bash
npm run dev
```

別ターミナル:

```bash
cloudflared tunnel run line-claude-bot
```

この状態で:

```bash
curl https://line-bot.example.com/api/line/webhook
```

に対して `405` か `401` が返れば、少なくとも公開経路は見えています。

## 7. 常駐化する

Cloudflare 公式 docs では macOS では launch agent または launch daemon として動かせます。

ログイン時に起動:

```bash
cloudflared service install
```

起動確認:

```bash
sudo launchctl start com.cloudflare.cloudflared
```

ログ:
- `/Library/Logs/com.cloudflare.cloudflared.err.log`
- `/Library/Logs/com.cloudflare.cloudflared.out.log`

## 8. LINE Developers に設定する

Webhook URL:

```text
https://line-bot.example.com/api/line/webhook
```

設定後に LINE bot へ `status` を送ると、今回追加した webhook 実装はバックグラウンドで処理して結果を push 返信します。

## 9. 運用メモ

- Cloudflare Tunnel は公開入口
- Tailscale SSH は webhook サーバーから Claude 実行マシンへの内部経路
- 同じ Mac で webhook サーバーと Claude Code を動かす場合でも、今回の実装では `LINE_CLAUDE_SSH_TARGET` に自分の tailnet 名を入れて SSH します
- Cloudflare 公式 docs では `remotely-managed tunnel` 推奨ですが、この用途では CLI ベースの `locally-managed tunnel` の方が再現しやすいです
