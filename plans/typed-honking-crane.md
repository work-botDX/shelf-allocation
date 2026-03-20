# Phase 7: 支援システム実装計画

## Context

戦略SRPG開発のPhase 7。ファイアーエムブレム風の支援システムを実装する。ユニット同士が隣接して戦闘することで支援ポイントを獲得し、ランクが上がると戦闘時にボーナスを得られるシステム。

**現状:**
- `SupportBond`型は定義済み（`partnerId`, `supportDefinitionId`, `currentRank`, `currentPoints`）
- `Unit.supports`配列は存在
- グリッドシステムに`getNeighbors()`あり
- 実際の支援機能は未実装

**目的:** 支援関係のあるユニットが隣接して戦闘するとボーナスを得られるシステムを構築する。

---

## Implementation Plan

### Step 1: 型定義作成

**新規ファイル:** `src/types/support.ts`

```typescript
export type SupportRank = 'C' | 'B' | 'A';

export interface SupportRankBonus {
  rank: SupportRank;
  pointsRequired: number;
  bonuses: Partial<Record<StatKey, number>>;
  hitBonus: number;
  avoidBonus: number;
  critBonus: number;
}

export interface SupportDefinition {
  id: string;
  unit1DefinitionId: string;
  unit2DefinitionId: string;
  name: string;
  rankBonuses: SupportRankBonus[];
}

export interface ActiveSupportBonus {
  partnerName: string;
  rank: SupportRank;
  bonuses: {
    attack: number;
    hit: number;
    avoid: number;
    crit: number;
    defense: number;
    resistance: number;
  };
}
```

### Step 2: 支援データ定義

**新規ファイル:** `src/data/supportDefinitions.ts`

- アラン（lord）とベラ（knight）の支援関係
- ランクごとのボーナス定義（C/B/A）
- `getSupportDefinition()`ヘルパー関数

**ランクボーナス例:**
- C: 命中+5, 回避+5
- B: 命中+10, 回避+10, 必殺+5
- A: 命中+15, 回避+15, 必殺+10

### Step 3: SupportCalculator実装

**新規ファイル:** `src/engine/support/SupportCalculator.ts`

```typescript
export class SupportCalculator {
  // 支援可能かチェック
  static canSupport(unit1: Unit, unit2: Unit): boolean

  // 隣接しているか（マンハッタン距離1）
  static isInSupportRange(unit1: Unit, unit2: Unit): boolean

  // 隣接する支援パートナーを取得
  static getAdjacentSupportPartners(unit: Unit, allUnits: Unit[]): Unit[]

  // 戦闘時の支援ボーナス計算
  static calculateSupportBonuses(unit: Unit, allUnits: Unit[]): ActiveSupportBonus | null

  // 支援ポイント獲得量計算（隣接パートナー数 × 2）
  static calculateSupportPointGain(unit: Unit, allUnits: Unit[]): number

  // 支援ポイント加算とランクアップ処理
  static processSupportPointGain(unit: Unit, points: number): SupportBond[]
}
```

### Step 4: BattleCalculator統合

**修正ファイル:** `src/engine/combat/BattleCalculator.ts`

- `createCombatUnit()`に支援ボーナス適用
- `generatePreview()`にallUnitsパラメータ追加
- `executeBattle()`で支援ポイント計算

**ボーナス適用箇所:**
- 命中率: `hitBonus + supportBonus.bonuses.hit`
- 回避率: `avoidRate + supportBonus.bonuses.avoid`
- 必殺率: `criticalRate + supportBonus.bonuses.crit`
- 攻撃力: `attackPower + supportBonus.bonuses.attack`

### Step 5: unitStore拡張

**修正ファイル:** `src/store/unitStore.ts`

```typescript
// 追加アクション
initializeSupports: (unitId: string, allUnits: Unit[]) => void
addSupportPoints: (unitId: string, points: number) => void
```

### Step 6: gameStore統合

**修正ファイル:** `src/store/gameStore.ts`

- `executeAttack()`で支援ポイント獲得処理
- 戦闘後に`addSupportPoints()`呼び出し

### Step 7: 支援メニュUI

**新規ファイル:** `src/components/ui/SupportMenu.tsx`

- 支援相手一覧表示
- 現在ランクとポイント表示
- ボーナス内容表示

### Step 8: ActionMenu拡張

**修正ファイル:** `src/components/game/ActionMenu.tsx`

- 「支援」メニューアイテム追加
- 支援相手がいる場合のみ有効化

### Step 9: MapRenderer統合

**修正ファイル:** `src/components/game/MapRenderer.tsx`

- SupportMenu表示状態管理
- ActionMenuに支援コールバック渡す

---

## Critical Files

| ファイル | 変更種別 | 説明 |
|---------|---------|------|
| `src/types/support.ts` | 新規 | 支援システム型定義 |
| `src/data/supportDefinitions.ts` | 新規 | 支援関係データ |
| `src/engine/support/SupportCalculator.ts` | 新規 | 支援計算エンジン |
| `src/engine/combat/BattleCalculator.ts` | 修正 | 支援ボーナス統合 |
| `src/store/unitStore.ts` | 修正 | 支援ポイント管理 |
| `src/store/gameStore.ts` | 修正 | 戦闘時支援処理 |
| `src/components/ui/SupportMenu.tsx` | 新規 | 支援メニューUI |
| `src/components/game/ActionMenu.tsx` | 修正 | 支援メニュー追加 |
| `src/components/game/MapRenderer.tsx` | 修正 | 統合 |

---

## Verification

1. **開発サーバー起動**
   ```bash
   cd srpg-game && npm run dev
   ```

2. **テストシナリオ**
   - アランとベラを隣接させる
   - アランで敵を攻撃
   - 戦闘プレビューで支援ボーナスが表示される
   - 戦闘後に支援ポイントが増加
   - 「支援」メニューから支援関係を確認

3. **確認項目**
   - 隣接時のみボーナス適用
   - ランクアップでボーナス増加
   - 支援メニューが正しく表示

---

## Notes

- 支援会話システムは簡略化（実装しない）
- 支援ポイントは戦闘時に隣接している場合のみ獲得
- 最大ランクはA
