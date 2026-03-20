# サブエージェント設定計画

## Context
ユーザーがClaude Codeのサブエージェント機能を利用するため、以下の3つのカスタムサブエージェントをユーザースコープ（`~/.claude/agents/`）に作成する。

## 作成するサブエージェント

### 1. code-reviewer（コードレビュアー）
- **場所**: `~/.claude/agents/code-reviewer.md`
- **用途**: コード品質・セキュリティ・ベストプラクティスをレビューする読み取り専用エージェント
- **ツール**: Read, Grep, Glob, Bash（読み取り専用）
- **モデル**: inherit

### 2. debugger（デバッガー）
- **場所**: `~/.claude/agents/debugger.md`
- **用途**: エラー分析・バグ修正を行うエージェント
- **ツール**: Read, Edit, Bash, Grep, Glob
- **モデル**: inherit

### 3. test-runner（テストランナー）
- **場所**: `~/.claude/agents/test-runner.md`
- **用途**: テスト実行・結果報告を行うエージェント
- **ツール**: Bash, Read, Grep, Glob
- **モデル**: inherit

## 実装手順

1. `~/.claude/agents/` ディレクトリの存在確認（必要に応じて作成）
2. 各サブエージェントのMarkdownファイルを作成
   - YAMLフロントマターでメタデータを定義
   - システムプロンプトを記述

## 各ファイルの内容

### code-reviewer.md
```yaml
---
name: code-reviewer
description: Expert code reviewer. Proactively reviews code for quality, security, and best practices. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---
```
- 読み取り専用でコードを分析
- 品質・セキュリティ・保守性をチェック
- 優先度別にフィードバックを提供

### debugger.md
```yaml
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
model: inherit
---
```
- エラーメッセージとスタックトレースを分析
- 根本原因を特定
- 修正を実装して検証

### test-runner.md
```yaml
---
name: test-runner
description: Test execution specialist. Runs tests and reports results. Use when needing to execute tests or verify code changes.
tools: Bash, Read, Grep, Glob
model: inherit
---
```
- テストスイートを実行
- 失敗したテストを特定
- 結果を整理して報告

## Verification
- `/agents` コマンドを実行してサブエージェントが認識されることを確認
- 各サブエージェントを簡単なタスクで呼び出して動作確認

## 備考
- 「カスタム」サブエージェントは後で決めるため、今回は作成しない
- ユーザースコープで作成するため、全プロジェクトで利用可能
