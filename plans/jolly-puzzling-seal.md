# Claude Code と Chrome の連携設定

## Context
Claude CodeでChrome ブラウザを直接操作できるようにするための設定を行う。これにより、Webアプリのテスト、コンソールログでのデバッグ、フォーム入力の自動化などが可能になる。

## 現在の状況
- **Claude Code バージョン**: 2.1.71 ✅（要件2.0.73以上を満たす）
- **Claude in Chrome 拡張機能**: 未インストール ❌

## 手順

### 手順 1: Chrome拡張機能のインストール（ユーザー操作）
Chrome Web Store で「Claude in Chrome」拡張機能をインストールする。

1. Chrome で以下のURLを開く:
   `https://chromewebstore.google.com/search/Claude`
2. 「Claude in Chrome」拡張機能を見つけて「Chromeに追加」をクリック
3. 拡張機能がインストールされたら、ChromeのツールバーにClaudeアイコンが表示される

### 手順 2: Chrome統合の有効化
Claude Code で `/chrome` コマンドを実行して接続を確立する。

1. Claude Code で `/chrome` を実行
2. 初回はネイティブメッセージングホスト設定ファイルがインストールされる
3. Chrome を再起動して設定を反映

### 手順 3: デフォルトで有効にする
`/chrome` を実行して「Enabled by default」を選択すると、セッションごとに `--chrome` を渡す必要がなくなる。

## 検証方法
1. `/chrome` を実行して接続ステータスが「connected」になることを確認
2. Chrome で適当なページを開き、Claude に操作を依頼して動作確認

## 注意点
- 直接 Anthropic プラン（Pro、Max、Team、または Enterprise）が必要
- Chrome統合はベータ版機能

## トラブルシューティング
- 拡張機能が検出されない場合: Chrome を再起動
- 接続が切れる場合: `/chrome` で「Reconnect extension」を選択
