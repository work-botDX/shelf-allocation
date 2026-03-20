# 戦略SRPG開発計画書

## 📍 現在の進捗状況

### 完了済み
- **Phase 1: 基盤構築** ✅
  - Vite + React + TypeScript プロジェクト作成 (`srpg-game/`)
  - 型定義実装 (`src/types/`)
  - Zustandストア実装 (`src/store/`)
  - グリッドシステム実装 (`src/engine/grid/`)
  - マップ・ユニット描画コンポーネント (`src/components/game/`)
  - デモ画面でマップとユニットが表示できる状態

- **Phase 2: ユニットシステム** ✅
  - ユニット選択時に移動範囲を表示（緑色オーバーレイ）
  - 行動メニュー（移動キャンセル・待機）
  - ユニット移動実行

- **Phase 3: 戦闘システム** ✅
  - BattleCalculator実装（ダメージ・命中・必殺・追撃計算）
  - 武器相性システム（三すくみ）
  - ActionMenuに攻撃オプション追加
  - BattlePreviewコンポーネント（戦闘予測表示）
  - 攻撃実行・HP更新・経験値獲得

- **Phase 4: フェーズ・ターン管理** ✅
  - PhaseManager 実装
  - ターン開始/終了処理
  - フェーズ表示UI
  - 勝利・敗北条件判定

- **Phase 5: 敵AI** ✅
  - AIController 実装
  - 脅威評価システム
  - 攻撃対象選択
  - 移動AI
  - 敵フェーズでの自動行動

### 次にやること
- **Phase 6: 成長システム** ✅
  - 経験値計算
  - レベルアップ処理
  - 成長率ベースのステータス上昇
  - スキル習得
  - レベルアップUI

- **Phase 7: 支援システム** ✅
  - 支援関係データ定義
  - 支援ポイントシステム
  - 支援ボーナス計算
  - 支援会話システム
  - 支援メニュー
  - 戦闘システムへの支援ボーナス統合

- **Phase 8: UI/UX改善** ✅
  - UnitHoverCard（ユニットホバー時の詳細表示）
  - UnitStatusPanel（選択中ユニット詳細パネル）
  - TerrainInfoPanel（地形情報表示）
  - MainMenu（タイトル画面）
  - PauseMenu（ポーズ機能、ESCキー）
  - TutorialOverlay（操作チュートリアル）
  - settingsStore（設定管理・永続化）

### 次にやること
- **Phase 9: セーブ/ロード** ✅
  - セーブデータ構造
  - IndexedDB統合（2ストア設計）
  - セーブUI（SaveMenu/LoadMenu）
  - スロット管理（10スロット + オートセーブ）
  - ターン終了時オートセーブ

### 次にやること
- **Phase 10: コンテンツ作成**

### プロジェクトの場所
```
/Users/yuukana/Git/shelf-allocation/srpg-game/
```

### 開発サーバー起動方法
```bash
cd srpg-game
npm run dev
```

---

## 概要

React + TypeScriptでWebブラウザ向けの戦略シミュレーションRPG（ファイアーエムブレム風）を開発する。

### ゲーム仕様
- **ジャンル**: 戦略シミュレーションRPG（グリッドベース）
- **プラットフォーム**: Webブラウザ
- **技術スタック**: React 18+ / TypeScript 5+ / Vite / Zustand / Tailwind CSS
- **戦闘システム**: フェーズ制（味方ターン→敵ターン）
- **スケール**: 中規模（5-15ユニット/マップ）

### 優先実装機能
1. 基本戦闘システム
2. レベルアップ・成長システム
3. 支援・会話システム

---

## プロジェクト構造

```
srpg-game/
├── src/
│   ├── core/                 # ゲームコアロジック
│   │   ├── GameLoop.ts       # ゲームループ管理
│   │   ├── PhaseManager.ts   # フェーズ遷移管理
│   │   └── TurnManager.ts    # ターン管理
│   │
│   ├── engine/               # ゲームエンジン
│   │   ├── grid/             # グリッドシステム
│   │   │   ├── GridSystem.ts       # グリッド計算
│   │   │   ├── PathFinder.ts       # A*経路探索
│   │   │   └── MovementRange.ts    # 移動範囲計算
│   │   │
│   │   ├── combat/           # 戦闘システム
│   │   │   ├── BattleCalculator.ts # 戦闘計算
│   │   │   ├── DamageFormula.ts    # ダメージ計算
│   │   │   └── HitRate.ts          # 命中率計算
│   │   │
│   │   ├── ai/               # 敵AI
│   │   │   ├── AIController.ts     # AI管理
│   │   │   └── strategies/         # AI戦略パターン
│   │   │
│   │   └── growth/           # 成長システム
│   │       ├── LevelUp.ts          # レベルアップ処理
│   │       └── StatGrowth.ts       # ステータス成長
│   │
│   ├── entities/             # ゲームエンティティ
│   │   ├── Unit.ts           # ユニットクラス
│   │   ├── Tile.ts           # マスタイル
│   │   ├── Skill.ts          # スキル
│   │   └── Support.ts        # 支援関係
│   │
│   ├── store/                # Zustandストア
│   │   ├── gameStore.ts      # ゲーム全体状態
│   │   ├── unitStore.ts      # ユニット管理
│   │   ├── mapStore.ts       # マップ状態
│   │   └── battleStore.ts    # 戦闘状態
│   │
│   ├── components/           # Reactコンポーネント
│   │   ├── game/             # ゲーム描画
│   │   │   ├── MapRenderer.tsx
│   │   │   ├── UnitLayer.tsx
│   │   │   └── Cursor.tsx
│   │   │
│   │   ├── ui/               # UI
│   │   │   ├── HUD.tsx
│   │   │   ├── ActionMenu.tsx
│   │   │   └── UnitStatus.tsx
│   │   │
│   │   └── battle/           # 戦闘UI
│   │       ├── BattlePreview.tsx
│   │       └── BattleAnimation.tsx
│   │
│   ├── types/                # 型定義
│   │   ├── unit.ts           # ユニット型
│   │   ├── map.ts            # マップ型
│   │   ├── combat.ts         # 戦闘型
│   │   └── game.ts           # ゲーム状態型
│   │
│   └── data/                 # データローダー
│       ├── UnitLoader.ts
│       └── MapLoader.ts
│
├── public/
│   └── assets/               # スプライト、音声など
│
└── tests/                    # テスト
```

---

## 主要な型定義

### ユニット
```typescript
interface Unit {
  id: string;
  name: string;
  faction: 'player' | 'enemy' | 'ally';
  class: UnitClass;
  level: number;
  experience: number;
  stats: BaseStats;           // HP, 力, 魔力, 技, 速さ, 幸運, 守備, 魔防
  position: Position;
  equipment: EquipmentSlots;
  skills: Skill[];
  supports: SupportBond[];
  hasMoved: boolean;
}
```

### 戦闘
```typescript
interface BattleResult {
  attacker: CombatUnit;
  defender: CombatUnit;
  rounds: CombatRound[];      // 各攻撃の結果
  totalDamage: { attacker: number; defender: number };
  isDead: { attacker: boolean; defender: boolean };
  experienceGained: number;
}
```

### マップ
```typescript
interface MapDefinition {
  id: string;
  width: number;
  height: number;
  tiles: Tile[][];
  playerStartPositions: Position[];
  enemySpawnPoints: EnemySpawn[];
  victoryCondition: VictoryCondition;
}
```

---

## 実装フェーズ

### Phase 1: 基盤構築（1-2週間）✅ **完了**
- [x] Vite + React + TypeScript プロジェクト作成
- [x] ディレクトリ構造作成
- [x] 型定義の実装
- [x] グリッドシステム基礎実装
- [x] マップ描画コンポーネント
- [x] Zustandストア基本実装

**完了条件**: グリッドが表示され、カーソルを移動できる ✅

### Phase 2: ユニットシステム（1-2週間）🔄 **次に実装**
- [x] Unit エンティティ実装（型定義済み）
- [x] ユニット描画コンポーネント（UnitRenderer実装済み）
- [ ] 移動システム（A*経路探索）→ GridSystemとPathFinderは実装済み、統合が必要
- [ ] 移動範囲可視化 → 選択時に移動範囲を表示
- [ ] 行動メニュー（移動・待機）

**完了条件**: ユニットを配置・選択・移動できる

### Phase 3: 戦闘システム（2-3週間）
- [ ] 武器システム・三角相性
- [ ] BattleCalculator 実装
- [ ] 命中率・回避率・ダメージ計算
- [ ] 攻撃範囲表示
- [ ] 戦闘プレビューUI
- [ ] 戦闘アニメーション
- [ ] 経験値獲得処理

**完了条件**: 敵を攻撃し、倒せる

### Phase 4: フェーズ・ターン管理（1週間）
- [ ] PhaseManager 実装
- [ ] ターン開始/終了処理
- [ ] フェーズ表示UI
- [ ] 勝利・敗北条件判定

**完了条件**: ターン制が機能する

### Phase 5: 敵AI（2週間）
- [ ] AIController 実装
- [ ] 脅威評価システム
- [ ] 攻撃対象選択
- [ ] 移動AI
- [ ] AI戦略パターン

**完了条件**: 敵が自律的に行動する

### Phase 6: 成長システム（1-2週間）
- [ ] 経験値計算
- [ ] レベルアップ処理
- [ ] 成長率ベースのステータス上昇
- [ ] スキル習得
- [ ] レベルアップUI

**完了条件**: レベルアップが発生し、ステータスが上昇する

### Phase 7: 支援システム（1-2週間）
- [ ] 支援関係データ定義
- [ ] 支援ポイントシステム
- [ ] 支援ボーナス計算
- [ ] 支援会話システム
- [ ] 支援メニュー

**完了条件**: 支援ランクが上がり、ボーナスが適用される

### Phase 8: UI/UX改善（1週間）
- [ ] HUD実装
- [ ] メニューシステム
- [ ] ユニット詳細表示
- [ ] 操作チュートリアル

### Phase 9: セーブ/ロード（1週間）
- [ ] セーブデータ構造
- [ ] IndexedDB統合
- [ ] セーブUI

### Phase 10: コンテンツ作成（2-3週間）
- [ ] マップ作成
- [ ] ユニットデータ
- [ ] ストーリー・会話
- [ ] バランス調整

### Phase 11: 最適化・polish（1-2週間）
- [ ] パフォーマンス最適化
- [ ] サウンド実装
- [ ] アニメーション改善
- [ ] テスト・バグ修正

---

## 推定スケジュール

**合計**: 14-23週間（約3.5-6ヶ月）

---

## 技術的な考慮事項

### パフォーマンス
- React.memo / useMemo / useCallback の活用
- requestAnimationFrame によるゲームループ
- Zustand Selector による不要な再レンダリング回避

### 拡張性
- データ駆動設計（JSONでコンテンツ定義）
- スキルシステムのプラグイン化
- AI戦略のプラグイン化

---

## 最初のステップ

1. `srpg-game` ディレクトリを作成
2. ViteでReact + TypeScriptプロジェクト初期化
3. 基本的な型定義を作成
4. グリッド描画のプロトタイプ実装
