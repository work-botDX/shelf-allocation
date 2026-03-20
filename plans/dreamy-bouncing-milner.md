# VSCodeでOpenAI Codex APIを使用するためのセットアップ計画

## Context
ユーザーがVSCodeでOpenAI Codex API（GPT-4など）を使用してコーディング支援を受けたいという要望。Continue.dev拡張機能を使用する方法を採用する。

## セットアップ手順

### 1. VSCode拡張機能のインストール
VSCodeで「Continue」拡張機能をインストールする：
- 拡張機能ID: `Continue.continue`
- マーケットプレースで「Continue」を検索してインストール

### 2. Continue設定ファイルの作成
初回起動時に設定ファイルが自動生成されるが、以下のパスに設定が必要：
- パス: `~/.continue/config.json`

### 3. OpenAI API Keyの設定
Continue設定ファイルに以下のような設定を追加：

```json
{
  "models": [
    {
      "title": "GPT-4",
      "provider": "openai",
      "model": "gpt-4",
      "apiKey": "your-api-key-here"
    },
    {
      "title": "GPT-4 Turbo",
      "provider": "openai",
      "model": "gpt-4-turbo",
      "apiKey": "your-api-key-here"
    }
  ]
}
```

### 4. API Keyの安全な管理
- 環境変数を使用する方法も可能
- `apiKey: "${OPENAI_API_KEY}"` のように環境変数を参照できる

## 必要なもの
- OpenAI API Key（[OpenAI Platform](https://platform.openai.com/api-keys)で取得）

## 代替案：環境変数を使用
より安全な方法として、API Keyを環境変数で管理：

```json
{
  "models": [
    {
      "title": "GPT-4",
      "provider": "openai",
      "model": "gpt-4",
      "apiKey": "${OPENAI_API_KEY}"
    }
  ]
}
```

## Verification
1. VSCodeでContinue拡張機能がサイドバーに表示されることを確認
2. チャット欄で「Hello」と入力してGPT-4からの応答があることを確認
3. コードの補完機能が動作することを確認

## 参考リンク
- [Continue公式サイト](https://continue.dev)
- [Continue ドキュメント](https://docs.continue.dev)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
