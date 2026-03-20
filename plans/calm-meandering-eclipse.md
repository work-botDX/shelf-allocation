# Phase 7: 支援システム実装計画

## 📍 Context

戦略SRPG開発のPhase 7として、ファイアーエムブレム風の支援システム（Support System）を実装する。
Phase 6（成長システム）が完了しており、既存のコードベースを調査した結果、**約70-80%の基盤が既に実装済み**であることが判明。

### 既存の実装状況
- ✅ `SupportBond` 型定義 (src/types/unit.ts)
- ✅ `SupportCalculator` エンジン (src/engine/support/SupportCalculator.ts)
- ✅ `SupportMenu` UIコンポーネント (src/components/ui/SupportMenu.tsx)
- ✅ 支援定義データ (src/data/supportDefinitions.ts)
- ✅ `unitStore` の支援アクション (src/store/unitStore.ts)

### 残りの実装が必要な機能
- 型定義の整理・補完
- 支援会話システム（会話UI、会話データ）
- 戦闘システムへの支援ボーナス統合
- 支援ポイント獲得の視覚的フィードバック

---

## 🎯 実装目標

Phase 7の完了条件: **支援ランクが上がり、ボーナスが適用される**

---

## 📋 実装タスク

### Task 1: 型定義の整理・補完
**ファイル**: `src/types/support.ts`（新規作成）

以下の型を定義：
```typescript
// 支援定義（ユニット間の支援可能性）
interface SupportDefinition {
  id: string;
  unitId1: string;
  unitId2: string;
  name: string;           // 支援名（例：「主従の誓い」）
  rankBonuses: Map<SupportRank, SupportRankBonus>;
}

// 支援ランクボーナス
interface SupportRankBonus {
  attack: number;         // 攻撃力ボーナス
  defense: number;        // 守備力ボーナス
  hitRate: number;        // 命中率ボーナス
  avoidRate: number;      // 回避率ボーナス
  criticalRate: number;   // 必殺率ボーナス
}

// アクティブ支援ボーナス（戦闘時計算用）
interface ActiveSupportBonus {
  totalBonus: SupportRankBonus;
  activePartners: { unitId: string; rank: SupportRank }[];
}

type SupportRank = 'C' | 'B' | 'A';
```

### Task 2: 支援会話システム

**2a. 会話データ定義** `src/data/supportConversations.ts`
- 各支援ランク到達時の会話内容
- キャラクター名、セリフ、表情変化
- 支援ランク別の会話（C会話、B会話、A会話）

**2b. 会話UIコンポーネント** `src/components/ui/SupportConversation.tsx`
- 会話ウィンドウ表示
- キャラクタースプライト
- テキスト表示（タイプライター風）
- 次へボタン・スキップ機能

### Task 3: 戦闘システムへの統合

**3a. BattleCalculator修正** `src/engine/combat/BattleCalculator.ts`
- 攻撃計算時に `SupportCalculator.calculateSupportBonuses()` を呼び出し
- 支援ボーナスを命中・回避・必殺・ダメージに反映

**3b. 戦闘プレビュー修正** `src/components/battle/BattlePreview.tsx`
- 支援ボーナスの表示を追加
- 「(+2)」のような緑色のボーナス表記

### Task 4: 支援ポイント獲得フィードバック

**4a. 戦闘結果UI** `src/components/battle/BattleResult.tsx`
- 支援ポイント獲得時の通知
- 「支援ポイント +5」のポップアップ

**4b. 支援ランクアップ演出**
- ランクアップ時のエフェクト
- 「支援C → B」の通知

### Task 5: 統合テスト・動作確認

- [ ] ユニットを隣接させて戦闘
- [ ] 支援ボーナスが戦闘計算に反映される
- [ ] 支援ポイントが蓄積される
- [ ] ランクアップが発生する
- [ ] 支援会話が表示される

---

## 📁 変更ファイル一覧

### 新規作成
- `src/types/support.ts` - 支援関連型定義
- `src/data/supportConversations.ts` - 支援会話データ
- `src/components/ui/SupportConversation.tsx` - 会話UI

### 修正
- `src/engine/combat/BattleCalculator.ts` - 支援ボーナス統合
- `src/components/battle/BattlePreview.tsx` - ボーナス表示
- `src/store/unitStore.ts` - ランクアップ時の会話トリガー

---

## 🔍 検証方法

1. 開発サーバー起動: `cd srpg-game && npm run dev`
2. デモマップで2体のプレイヤーユニットを隣接配置
3. 片方のユニットで敵を攻撃
4. 戦闘プレビューで支援ボーナスを確認
5. 戦闘後、支援ポイント獲得を確認
6. 十分なポイント蓄積でランクアップ確認

---

## ⏱️ 推定作業時間

- Task 1: 30分
- Task 2: 2-3時間
- Task 3: 1時間
- Task 4: 1時間
- Task 5: 30分

**合計**: 約5-6時間
