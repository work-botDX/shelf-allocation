# Phase 9: セーブ/ロードシステム実装計画

## Context

戦略SRPGのPhase 8（UI/UX改善）まで完了しており、次はPhase 9セーブ/ロードシステムを実装する。
既存コードには以下の準備が整っている：
- `SaveData`型が`src/types/game.ts`に定義済み
- `settingsStore`で`zustand/persist`の使用パターンあり
- UIコンポーネントはPauseMenu、MainMenuのパターンを再利用可能

## 実装内容

### 1. 型定義拡張

**ファイル**: `src/types/game.ts`

```typescript
// 既存のSaveDataを拡張
export interface SaveData {
  id: string;
  timestamp: number;
  playTime: number;
  currentChapter: number;
  version: string;  // セーブデータバージョン（例: "1.0.0"）
  gameState: {
    phase: GamePhase;
    turn: number;
    cursorPosition: Position;
    cameraPosition: Position;
    gameResult: GameResult | null;
  };
  units: Unit[];  // Map<string, Unit> を配列に変換して保存
  unitIds: {
    player: string[];
    enemy: string[];
    ally: string[];
  };
  currentMapId: string;  // マップはIDのみ保存、ロード時に再取得
  supportPoints: Record<string, Record<string, number>>;
  completedChapters: number[];
}

// スロットメタデータ（一覧表示用・軽量）
export interface SaveSlotMeta {
  slotNumber: number;  // 1-10
  exists: boolean;
  timestamp: number;
  playTime: number;
  currentChapter: number;
  playerUnitCount: number;
  averageLevel: number;
}
```

### 2. IndexedDBストレージ層

**ファイル**: `src/engine/storage/IndexedDBManager.ts`

**2ストア設計**（パフォーマンスのため分離）:
- `save_slots` - メタデータのみ（高速一覧取得）
- `save_data` - 完全なセーブデータ（サイズ大）

```typescript
class IndexedDBManager {
  private dbName = 'srpg-save-db';
  private version = 1;

  // セーブ保存（トランザクションで一貫性確保）
  async saveGame(slotNumber: number, data: SaveData): Promise<void>

  // セーブ読み込み
  async loadGame(slotNumber: number): Promise<SaveData | null>

  // スロットメタデータ一覧取得（高速・軽量）
  async getSaveSlotMetas(): Promise<SaveSlotMeta[]>

  // セーブ削除
  async deleteSave(slotNumber: number): Promise<void>

  // ストレージ容量チェック
  async checkStorageQuota(): Promise<{ available: boolean; usedBytes: number }>
}
```

### 3. セーブ/ロードロジック

**ファイル**: `src/engine/storage/SaveManager.ts`

```typescript
class SaveManager {
  // ゲーム状態からSaveDataを生成
  createSaveData(): SaveData {
    // unitStore.units (Map<string, Unit>) を配列に変換
    // mapStore.currentMap はIDのみ保存
    // プレイ時間を累計
  }

  // SaveDataからゲーム状態を復元
  async loadSaveData(data: SaveData): Promise<void> {
    // バージョンチェック
    // マップ定義をIDから再取得
    // ユニット配列をMapに復元
  }

  // バージョン移行
  migrateSaveData(data: unknown, fromVersion: string): SaveData

  // プレイ時間追跡（メモリ内で累計、保存時にコミット）
  private playTimeAccumulator: number;
  private sessionStartTime: number;
}
```

### 4. ストア拡張

**ファイル**: `src/store/gameStore.ts`

追加するstate:
```typescript
saveSlotMetas: SaveSlotMeta[];
isSaving: boolean;
isLoading: boolean;
lastSaveTime: number | null;
playTime: number; // 累計プレイ時間（秒）
saveError: string | null;
```

追加するactions:
```typescript
saveGame: (slotNumber: number) => Promise<{ success: boolean; error?: string }>;
loadGame: (slotNumber: number) => Promise<{ success: boolean; error?: string }>;
deleteSave: (slotNumber: number) => Promise<void>;
refreshSaveSlots: () => Promise<void>;
incrementPlayTime: () => void; // 1秒ごとに呼ぶ
```

### 5. UIコンポーネント

**新規ファイル**:
- `src/components/ui/SaveMenu.tsx` - セーブスロット選択UI
- `src/components/ui/LoadMenu.tsx` - ロードスロット選択UI
- `src/components/ui/SaveSlotCard.tsx` - 個別スロット表示

**修正ファイル**:
- `src/components/ui/PauseMenu.tsx` - セーブ/ロードオプション追加
- `src/components/ui/MainMenu.tsx` - コンティニューボタン追加

### 6. エクスポート

**ファイル**: `src/engine/storage/index.ts`
```typescript
export { IndexedDBManager } from './IndexedDBManager';
export { SaveManager } from './SaveManager';
```

## 実装順序

1. **型定義拡張** - SaveData修正、SaveSlotMeta追加
2. **IndexedDBManager** - 2ストア設計のストレージ基盤
3. **SaveManager** - セーブ/ロードロジック、バージョン移行
4. **gameStore拡張** - セーブ関連state/actions
5. **SaveSlotCard** - 個別スロットコンポーネント
6. **SaveMenu/LoadMenu** - メインUI
7. **PauseMenu/MainMenu統合** - エントリーポイント追加
8. **オートセーブ機能** - ターン終了時自動保存（スロット0を自動セーブ用に予約）

## 主要な考慮事項

### データ整合性
- セーブ/ロード時のバリデーション
- バージョン互換性チェックと移行ロジック
- 破損データの検出（try-catchでJSONパースエラー処理）
- トランザクションでスロットとデータの一貫性確保

### エラーハンドリング
- IndexedDBクォータ超過時のエラー表示
- プライベートブラウジングモードでのフォールバック
- 破損セーブデータの検出と通知
- マップ定義が見つからない場合の処理

### UX
- セーブ中のローディング表示
- 上書き確認ダイアログ
- 削除確認ダイアログ
- エラー時のフィードバック（toast通知）

### パフォーマンス
- 2ストア設計でメタデータ取得を高速化
- Map<string, Unit>の効率的な配列変換
- プレイ時間はメモリ内で累計、保存時にコミット
- スロット一覧はコンポーネントマウント時にキャッシュ

### プレイ時間追跡
- ゲーム中はsetIntervalで1秒ごとにインクリメント
- タブが非アクティブ時は停止（visibilitychangeイベント）
- ページ離脱時にbeforeunloadで緊急保存（オプション）

## 検証方法

1. `npm run dev`で開発サーバー起動
2. ゲームを開始し、適当にプレイ（ユニット移動、戦闘）
3. ESCキーでポーズメニューを開く
4. 「セーブ」を選択してスロット1に保存
5. さらにプレイしてからスロット2に保存
6. ブラウザをリロード
7. タイトル画面から「ロード」を選択
8. スロット一覧が正しく表示されるか確認
9. スロット1から復元できることを確認
10. ユニット位置、HP、ターン数などが正しく復元されているか確認
11. セーブ削除機能をテスト
12. オートセーブがターン終了時に動作することを確認

## 影響を受けるファイル

### 新規作成
- `srpg-game/src/engine/storage/IndexedDBManager.ts`
- `srpg-game/src/engine/storage/SaveManager.ts`
- `srpg-game/src/engine/storage/index.ts`
- `srpg-game/src/components/ui/SaveMenu.tsx`
- `srpg-game/src/components/ui/LoadMenu.tsx`
- `srpg-game/src/components/ui/SaveSlotCard.tsx`

### 修正
- `srpg-game/src/store/gameStore.ts` - セーブ関連state/actions追加
- `srpg-game/src/types/game.ts` - SaveData修正、SaveSlotMeta追加
- `srpg-game/src/components/ui/PauseMenu.tsx` - セーブ/ロードメニュー追加
- `srpg-game/src/components/ui/MainMenu.tsx` - コンティニューボタン追加
- `srpg-game/src/components/ui/index.ts` - 新コンポーネントエクスポート
