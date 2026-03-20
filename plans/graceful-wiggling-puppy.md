# Phase 10: コンテンツ作成 実装計画

## Context

戦略SRPGのPhase 1-9（ゲームシステム全般）が完了済み。現在はマップ・ユニットデータが`App.tsx`にハードコーディングされており、ストーリー・イベントシステムが未実装。

**今回のスコープ:** 第一章のみのMVP実装（動作確認後に拡張）
**ポートレイト:** テキストのみ（名前とセリフ表示）

## 実装内容

1. **イベントシステム基盤** - 会話表示、イベントトリガー
2. **データファイル分離** - ユニット・武器・マップデータ
3. **第一章コンテンツ** - 「絆」童年期回想マップ
4. **基本バランス調整**

---

## 実装フェーズ

### Phase 10.1: イベントシステム基盤

**新規ファイル:**
- `src/types/event.ts` - イベント型定義
- `src/store/eventStore.ts` - イベント状態管理
- `src/engine/event/EventManager.ts` - イベント実行管理
- `src/components/ui/StoryEventModal.tsx` - 会話表示UI

**型定義:**
```typescript
type EventTriggerType = 'chapter_start' | 'chapter_end' | 'turn_start' | 'position_reached' | 'unit_talk' | ...;

interface DialogueLine {
  speakerId: string;
  text: string;
  emotion?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised';
}

interface StoryEvent {
  id: string;
  trigger: EventTriggerType;
  dialogue: DialogueLine[];
  actions?: EventAction[];
}
```

### Phase 10.2: データ構造分離

**新規ディレクトリ:**
```
src/data/
├── chapters/          # 章データ
│   ├── index.ts
│   └── chapter1.ts
├── units/             # ユニット定義
│   ├── index.ts
│   ├── playerUnits.ts
│   └── enemyUnits.ts
└── weapons/           # 武器データ
    └── index.ts
```

**修正ファイル:**
- `src/App.tsx` - `createDemoMap()`/`createDemoUnits()`をデータファイル参照に変更

### Phase 10.3: コンテンツ作成

**ストーリー構成（plot-final.md準拠）:**
1. **第一章：絆** - 童年期回想、星見の花、聖剣選定
2. **第二章：裂け目** - 冒険、禁術発動
3. **第三章：再来** - 7年後のエラ登場
4. **第四章：邂逅** - 対決、魂の真相
5. **第五章：約束** - 黒幕討伐、結末

**キャラクター:**
- アレン（主人公・聖剣使い）
- エラ（ヒロイン・禁術使い）
- ヴェルディアス（黒幕）

### Phase 10.4: バランス調整

- 敵パラメータ調整
- 経験値バランス
- 難易度カーブ

---

## MVP（最小実装）

まず第一章のみ完全実装してテスト：
- マップデータ（15x12程度）
- 敵配置（3-4体）
- オープニングイベント
- クリア後イベント
- アレン・エラの2人のみ

---

## Critical Files

| ファイル | 操作 | 説明 |
|---------|------|------|
| `src/types/event.ts` | 新規 | イベント型定義 |
| `src/store/eventStore.ts` | 新規 | イベント状態管理 |
| `src/engine/event/EventManager.ts` | 新規 | イベント実行エンジン |
| `src/components/ui/StoryEventModal.tsx` | 新規 | 会話表示UI |
| `src/data/chapters/chapter1.ts` | 新規 | 第一章データ |
| `src/data/units/playerUnits.ts` | 新規 | プレイヤーユニット |
| `src/data/units/enemyUnits.ts` | 新規 | 敵ユニット |
| `src/data/weapons/index.ts` | 新規 | 武器データ |
| `src/App.tsx` | 修正 | データファイル参照に変更 |

---

## Verification

1. `npm run dev` で開発サーバー起動
2. 章開始時にオープニングイベントが表示される
3. マップが正しくロードされる
4. ユニット配置・移動・戦闘が動作する
5. 勝利条件で章クリア
6. クリア後イベントが表示される

---

## 実装順序（詳細）

### Step 1: イベント型定義
- `src/types/event.ts` 作成
- `EventTriggerType`, `DialogueLine`, `StoryEvent` などを定義

### Step 2: イベントストア
- `src/store/eventStore.ts` 作成
- `activeEvent`, `eventQueue`, `advanceDialogue()` など

### Step 3: 会話表示UI
- `src/components/ui/StoryEventModal.tsx` 作成
- テキストベースの会話表示（名前＋セリフ）
- SupportConversationModal のパターンを踏襲

### Step 4: ユニットデータ分離
- `src/data/units/playerUnits.ts` - アレン、エラの定義
- `src/data/units/enemyUnits.ts` - 汎用敵ユニット
- `src/data/weapons/index.ts` - 基本武器データ

### Step 5: 第一章マップデータ
- `src/data/chapters/chapter1.ts` 作成
- 15x12程度のマップ
- 敵3-4体配置
- オープニング/エンディングイベント定義

### Step 6: App.tsx統合
- `createDemoMap()`/`createDemoUnits()`を削除
- データファイルから読み込み
- イベントシステムと連携

---

## 推定工数

- Step 1-3（イベント基盤）: 1-2時間
- Step 4-5（データ作成）: 1-2時間
- Step 6（統合・テスト）: 1時間

**合計: 3-5時間**
