# Phase 4: フェーズ・ターン管理 実装計画

## Context
Phase 3（戦闘システム）が完了し、次はフェーズ・ターン管理を実装する。
現在は `player_phase` しか実装されておらず、敵ターンへの遷移や勝利・敗北条件判定がない。

## 実装内容

### 1. PhaseManager.ts（新規作成）
**ファイル**: `srpg-game/src/core/PhaseManager.ts`

フェーズ遷移ロジックを管理するクラス:
- `startPlayerPhase()` - プレイヤーフェーズ開始（hasMoved/hasAttackedリセット）
- `startEnemyPhase()` - 敵フェーズ開始
- `endPhase()` - 現在のフェーズ終了
- `checkVictoryCondition()` - 勝利条件判定
- `checkDefeatCondition()` - 敗北条件判定

### 2. gameStore.ts 拡張
**ファイル**: `srpg-game/src/store/gameStore.ts`

追加する状態とアクション:
- `gameResult: 'playing' | 'victory' | 'defeat'` - ゲーム結果
- `endPlayerTurn()` - プレイヤーターン終了
- `endEnemyTurn()` - 敵ターン終了
- `checkGameEnd()` - 勝利・敗北判定
- `resetGame()` - ゲームリセット

### 3. フェーズ表示UI（新規作成）
**ファイル**: `srpg-game/src/components/ui/PhaseIndicator.tsx`

- 現在のフェーズを表示（プレイヤー/敵）
- ターン数表示
- フェーズ切り替え時のアニメーション表示

### 4. ターン終了ボタン（新規作成）
**ファイル**: `srpg-game/src/components/ui/TurnEndButton.tsx`

- 「ターン終了」ボタン
- クリックで `endPlayerTurn()` を呼び出し
- 敵フェーズ中は無効化

### 5. 勝利・敗北画面（新規作成）
**ファイル**: `srpg-game/src/components/ui/GameResultModal.tsx`

- 勝利/敗北時に表示
- 「再戦」「タイトルへ」ボタン

### 6. App.tsx 更新
**ファイル**: `srpg-game/src/App.tsx`

- 新UIコンポーネントを統合
- ゲーム結果に応じた表示切り替え

## 実装順序

1. `PhaseManager.ts` 作成
2. `gameStore.ts` にフェーズ遷移ロジック追加
3. `PhaseIndicator.tsx` 作成
4. `TurnEndButton.tsx` 作成
5. `GameResultModal.tsx` 作成
6. `App.tsx` 更新

## 勝利・敗北条件

### 勝利条件（mapStore.victoryCondition）
- `defeat_all`: 敵を全滅
- `defeat_boss`: ボス撃破
- `seize`: 特定位置到達
- `escape`: 脱出
- `survive`: ターン経過

### 敗北条件（mapStore.defeatCondition）
- `lord_death`: 主人公死亡
- `all_death`: 全滅
- `turn_limit`: ターン制限超過

## 検証方法

1. `npm run dev` でサーバー起動
2. ユニットを移動・攻撃後、「ターン終了」ボタンで敵フェーズへ
3. 敵フェーズ後、プレイヤーフェーズに戻りターン数が増える
4. 敵を全滅させると勝利画面表示
5. 主人公が倒れると敗北画面表示

## 備考

- 敵AIは Phase 5 で実装するため、敵フェーズは即座に終了する仮実装とする
- Phase 5 完了後、敵が自律的に行動するようになる
