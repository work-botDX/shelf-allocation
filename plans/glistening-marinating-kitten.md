# Phase 3: 戦闘システム実装計画

## Context

戦略SRPGプロジェクトのPhase 2（ユニットシステム）は完了済み。Phase 3ではファイアーエムブレム風の戦闘システムを実装する。

**目的**: ユニットが敵を攻撃できるようにし、ダメージ計算・命中率計算・戦闘プレビュー表示を行う。

**完了条件**: 敵を攻撃し、倒せる

---

## 実装タスク

### Step 1: BattleCalculator実装

**新規ファイル**: [src/engine/combat/BattleCalculator.ts](srpg-game/src/engine/combat/BattleCalculator.ts)

```typescript
export class BattleCalculator {
  // 戦闘プレビュー生成
  static generatePreview(attacker: Unit, defender: Unit): BattlePreviewData;

  // 戦闘実行
  static executeBattle(attacker: Unit, defender: Unit): BattleResult;

  // 追撃判定（速度差4以上）
  static canDoubleAttack(attacker: Unit, defender: Unit): boolean;
}
```

**計算式**:
- ダメージ = (力 + 武器威力 + 相性ボーナス) - 守備
- 命中率 = 武器命中 + 技*2 - 相手回避
- 相性ボーナス: 有利+15命中/+1威力, 不利-15命中/-1威力

---

### Step 2: gameStoreに攻撃状態追加

**ファイル**: [src/store/gameStore.ts](srpg-game/src/store/gameStore.ts)

**追加する型**:
```typescript
type AttackPhase = 'none' | 'selecting_target' | 'preview';
```

**追加する状態**:
- `attackPhase: AttackPhase`
- `attackableEnemies: Unit[]`
- `selectedTargetId: string | null`
- `battlePreviewData: BattlePreviewData | null`

**追加するアクション**:
- `startAttackMode()` - 攻撃モード開始
- `selectTarget(enemyId)` - ターゲット選択→プレビュー表示
- `executeAttack()` - 戦闘実行
- `cancelAttack()` - 攻撃キャンセル

---

### Step 3: ActionMenuに攻撃オプション追加

**ファイル**: [src/components/game/ActionMenu.tsx](srpg-game/src/components/game/ActionMenu.tsx)

```typescript
interface ActionMenuProps {
  // 既存...
  hasAttackableEnemies: boolean;  // 追加
  onAttack: () => void;           // 追加
}

// メニュー: 移動 | 攻撃 | 待機
```

---

### Step 4: BattlePreviewコンポーネント作成

**新規ファイル**: [src/components/game/BattlePreview.tsx](srpg-game/src/components/game/BattlePreview.tsx)

```
┌─────────────────────────────┐
│  攻撃者      vs      防御者  │
│  HP: 24/24          HP: 20/20│
│  武器: 鉄の剣       鉄の槍   │
│  与Dmg: 8           与Dmg: 6 │
│  命中: 92%          命中: 78%│
│  必殺: 3%           必殺: 0% │
│  追撃: あり         追撃: なし│
├─────────────────────────────┤
│      [攻撃]    [キャンセル]  │
└─────────────────────────────┘
```

---

### Step 5: MapRendererの拡張

**ファイル**: [src/components/game/MapRenderer.tsx](srpg-game/src/components/game/MapRenderer.tsx)

1. 攻撃モード時のクリック処理追加
2. BattlePreviewコンポーネントの表示
3. 敵ユニット強調表示

---

## インタラクションフロー

```
[idle]
  │ ユニット選択
  ▼
[unit_selected] → 移動範囲表示
  │ 移動先クリック
  ▼
[action_menu]
  │ 「攻撃」選択
  ▼
[attack_select] → 攻撃可能な敵を強調
  │ 敵クリック
  ▼
[preview] → BattlePreview表示
  │ 「攻撃」選択
  ▼
[idle] → 戦闘実行・HP更新・経験値獲得
```

---

## 変更ファイル一覧

| ファイル | 変更種別 | 説明 |
|---------|---------|------|
| `src/engine/combat/index.ts` | 新規 | エクスポート |
| `src/engine/combat/BattleCalculator.ts` | 新規 | 戦闘計算 |
| `src/store/gameStore.ts` | 修正 | 攻撃状態追加 |
| `src/components/game/ActionMenu.tsx` | 修正 | 攻撃オプション |
| `src/components/game/BattlePreview.tsx` | 新規 | プレビューUI |
| `src/components/game/MapRenderer.tsx` | 修正 | 攻撃フロー統合 |
| `src/components/game/index.ts` | 修正 | BattlePreviewエクスポート |
| `src/engine/index.ts` | 修正 | combatエクスポート |

---

## 検証方法

1. **開発サーバー起動**: `npm run dev`

2. **攻撃フローテスト**:
   - プレイヤーユニット選択 → 移動先選択
   - ActionMenuで「攻撃」が表示される
   - 「攻撃」選択で攻撃可能な敵が強調
   - 敵クリックでBattlePreview表示
   - 「攻撃」で戦闘実行、敵HP減少

3. **戦闘計算テスト**:
   - 武器相性で命中率・威力が変化
   - 追撃が発生する場合2回攻撃
   - HP0でユニットが消滅

---

## 既存コードの活用

- `types/combat.ts`: CombatUnit, BattleResult, BattlePreviewData, getWeaponAdvantage()
- `unitStore`: damageUnit(), addExperience(), setUnitAttacked(), removeUnit()
- `GridSystem`: calculateAttackRange()
