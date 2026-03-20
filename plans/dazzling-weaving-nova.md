# Phase 8: UI/UX改善 実装計画

## Context
Phase 1-7まで完了。基本的なゲームシステム（移動、戦闘、ターン管理、敵AI、成長、支援）は実装済み。Phase 8ではプレイアビリティ向上のためのUI/UX改善を実装する。

## 優先度別実装項目

### Priority 1: ユニットステータス表示（最優先）

#### 1.1 UnitHoverCard
**ファイル**: `src/components/ui/UnitHoverCard.tsx`
- ユニットにマウスホバー時に詳細情報を表示
- HP/最大HP、レベル、クラス、装備武器
- 主要ステータス（力/魔力/技/速さ/守備/魔防）

**修正ファイル**:
- `src/components/game/UnitRenderer.tsx` - onMouseEnter/onMouseLeaveイベント追加
- `src/store/gameStore.ts` - `hoveredUnitId: string | null` 追加

#### 1.2 UnitStatusPanel
**ファイル**: `src/components/ui/UnitStatusPanel.tsx`
- 選択中ユニットの詳細パネル（サイドパネルに配置）
- 全ステータス、スキル一覧、支援関係

**修正ファイル**:
- `src/App.tsx` - サイドパネルにUnitStatusPanelを追加

#### 1.3 TerrainInfoPanel
**ファイル**: `src/components/ui/TerrainInfoPanel.tsx`
- カーソル位置の地形情報を表示
- 地形名、回避/守備/魔防ボーナス

**修正ファイル**:
- `src/App.tsx` - サイドパネル下部に配置

---

### Priority 2: メニューシステム

#### 2.1 gameStore拡張
```typescript
// 追加する状態
gameState: 'title' | 'playing' | 'paused';
showTutorial: boolean;
tutorialStep: number;

// 追加するアクション
setGameState: (state) => void;
togglePause: () => void;
```

#### 2.2 MainMenu
**ファイル**: `src/components/ui/MainMenu.tsx`
- タイトル画面（「戦闘開始」「操作説明」ボタン）
- gameState === 'title' の時に表示

#### 2.3 PauseMenu
**ファイル**: `src/components/ui/PauseMenu.tsx`
- ESCキーで開閉
- 「ゲームに戻る」「タイトルに戻る」

---

### Priority 3: チュートリアルシステム

#### 3.1 TutorialOverlay
**ファイル**: `src/components/ui/TutorialOverlay.tsx`
- 初回プレイ時に順次表示
- ステップ: ユニット選択 → 移動 → 攻撃 → ターン終了

#### 3.2 settingsStore（新規）
**ファイル**: `src/store/settingsStore.ts`
```typescript
interface SettingsStore {
  tutorialCompleted: boolean;
  gameSpeed: number;
  showRangeIndicator: boolean;
}
```

---

## 実装順序

1. **gameStore拡張** - gameState, hoveredUnitId 追加
2. **UnitHoverCard** - ホバー時の詳細表示
3. **UnitStatusPanel** - 選択中ユニット詳細
4. **TerrainInfoPanel** - 地形情報
5. **MainMenu** - タイトル画面
6. **PauseMenu** - ポーズ機能
7. **settingsStore** - 設定管理
8. **TutorialOverlay** - チュートリアル

---

## Critical Files

1. `src/store/gameStore.ts` - gameState, hoveredUnitId 追加
2. `src/components/game/UnitRenderer.tsx` - ホバーイベント追加
3. `src/App.tsx` - サイドパネル再構成、メニュー統合
4. `src/store/settingsStore.ts` - 新規作成

---

## 検証方法

1. ユニットにホバー → カードが表示される
2. ユニット選択 → サイドパネルに詳細表示
3. カーソル移動 → 地形情報が更新される
4. ゲーム開始 → タイトル画面が表示される
5. ESCキー → ポーズメニューが開く
6. 初回プレイ → チュートリアルが開始される

```bash
cd /Users/yuukana/Git/shelf-allocation/srpg-game
npm run dev
```
