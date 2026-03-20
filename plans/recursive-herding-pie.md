# 計画：CLAUDE.mdへCodexレビュー指示を追加

## Context
Plan modeで作成した計画書を、実装前に外部のCodex（Cursor、GitHub Copilot、OpenAI Codexなど）でレビューする習慣を確立したい。CLAUDE.mdにこのワークフローを指示として追加することで、今後のセッションでも自動的にこの手順に従うようにする。

## 変更内容

### 対象ファイル
- `/Users/yuukana/.claude/CLAUDE.md`

### 追加するセクション
ファイルの末尾に「ワークフロー」セクションを新規追加：

```markdown
## ワークフロー

### Plan modeでの計画作成時
Plan modeで計画書を作成した後は、**必ずCodex（Cursor、GitHub Copilot、OpenAI Codexなどの外部AIツール）でレビューを行うこと**。

レビューの観点：
- 実装の妥当性
- 設計上の問題点
- より良い代替案の有無
- セキュリティやパフォーマンスの懸念

Codexのレビュー結果を反映してから、ExitPlanModeでユーザーの承認を求めること。
```

## 実装手順
1. CLAUDE.mdの末尾に「## ワークフロー」セクションを追加
2. Plan modeでのCodexレビュー手順を記載

## 検証方法
- ファイルが正しく更新されていることを確認
- 今後のPlan modeセッションでこの指示が参照されることを確認
