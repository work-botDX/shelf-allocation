import type { SaveData, SaveSlotMeta } from '../../types/game';
import type { MapDefinition } from '../../types/map';
import { indexedDBManager } from './IndexedDBManager';
import { useGameStore } from '../../store/gameStore';
import { useUnitStore } from '../../store/unitStore';
import { useMapStore } from '../../store/mapStore';
import { TERRAIN_DEFINITIONS } from '../../types/map';

const SAVE_VERSION = '1.0.0';

/**
 * セーブ/ロードロジックを管理
 */
class SaveManager {
  private sessionStartTime: number = 0;
  private accumulatedPlayTime: number = 0;

  constructor() {
    // セッション開始時刻を記録
    this.sessionStartTime = Date.now();

    // タブの可視性変更を監視
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // タブが非アクティブになったら時間を累計
        this.accumulateTime();
      } else {
        // タブがアクティブになったら時間計測を再開
        this.sessionStartTime = Date.now();
      }
    });
  }

  /**
   * 現在のプレイ時間を取得（秒）
   */
  getPlayTime(): number {
    const sessionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    return this.accumulatedPlayTime + sessionTime;
  }

  /**
   * セッション時間を累計
   */
  private accumulateTime(): void {
    const sessionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    this.accumulatedPlayTime += sessionTime;
  }

  /**
   * ゲーム状態からセーブデータを作成
   */
  createSaveData(): SaveData {
    const gameStore = useGameStore.getState();
    const unitStore = useUnitStore.getState();
    const mapStore = useMapStore.getState();

    // Map<string, Unit> を配列に変換
    const units = Array.from(unitStore.units.values());

    // プレイ時間を累計
    this.accumulateTime();
    this.sessionStartTime = Date.now();

    const saveData: SaveData = {
      id: `save-${Date.now()}`,
      timestamp: Date.now(),
      playTime: this.accumulatedPlayTime,
      currentChapter: mapStore.currentMap?.chapter || 1,
      version: SAVE_VERSION,
      gameState: {
        phase: gameStore.phase,
        turn: gameStore.turn,
        cursorPosition: gameStore.cursorPosition,
        cameraPosition: gameStore.cameraPosition,
        gameResult: gameStore.gameResult,
      },
      units,
      unitIds: {
        player: unitStore.playerUnitIds,
        enemy: unitStore.enemyUnitIds,
        ally: unitStore.allyUnitIds,
      },
      currentMapId: mapStore.currentMap?.id || '',
      supportPoints: this.extractSupportPoints(units),
      completedChapters: [], // TODO: 実装
    };

    return saveData;
  }

  /**
   * セーブデータからゲーム状態を復元
   */
  async loadSaveData(data: SaveData): Promise<{ success: boolean; error?: string }> {
    try {
      // バージョンチェック
      const migratedData = this.migrateSaveData(data);

      const gameStore = useGameStore.getState();
      const unitStore = useUnitStore.getState();
      const mapStore = useMapStore.getState();

      // 現在の状態をクリア
      unitStore.clearUnits();
      mapStore.clearMap();

      // ユニットを復元
      for (const unit of migratedData.units) {
        unitStore.addUnit(unit);
      }

      // マップを復元（IDから再取得 - 現在はデモマップのみ）
      // TODO: マップ定義をIDから取得する仕組みを実装
      // 現在はデモマップを再作成
      const demoMap = this.createDemoMapFromId(migratedData.currentMapId);
      if (demoMap) {
        mapStore.loadMap(demoMap);
      }

      // ゲーム状態を復元
      gameStore.setPhase(migratedData.gameState.phase);
      // ターンとカーソル位置は直接セットする必要がある
      useGameStore.setState({
        turn: migratedData.gameState.turn,
        cursorPosition: migratedData.gameState.cursorPosition,
        cameraPosition: migratedData.gameState.cameraPosition,
        gameResult: migratedData.gameState.gameResult ?? 'playing',
      });

      // プレイ時間を復元
      this.accumulatedPlayTime = migratedData.playTime;
      this.sessionStartTime = Date.now();

      return { success: true };
    } catch (error) {
      console.error('Load save data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー',
      };
    }
  }

  /**
   * セーブデータのバージョン移行
   */
  migrateSaveData(data: SaveData): SaveData {
    // 現在はバージョン1.0.0のみなので、そのまま返す
    // 将来的にバージョンが変わった場合、ここで移行処理を行う
    return data;
  }

  /**
   * セーブ実行
   */
  async saveGame(slotNumber: number): Promise<{ success: boolean; error?: string }> {
    try {
      const saveData = this.createSaveData();
      await indexedDBManager.saveGame(slotNumber, saveData);
      return { success: true };
    } catch (error) {
      console.error('Save game error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'セーブに失敗しました',
      };
    }
  }

  /**
   * ロード実行
   */
  async loadGame(slotNumber: number): Promise<{ success: boolean; error?: string }> {
    try {
      const saveData = await indexedDBManager.loadGame(slotNumber);
      if (!saveData) {
        return { success: false, error: 'セーブデータが見つかりません' };
      }
      return await this.loadSaveData(saveData);
    } catch (error) {
      console.error('Load game error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ロードに失敗しました',
      };
    }
  }

  /**
   * セーブ削除
   */
  async deleteSave(slotNumber: number): Promise<{ success: boolean; error?: string }> {
    try {
      await indexedDBManager.deleteSave(slotNumber);
      return { success: true };
    } catch (error) {
      console.error('Delete save error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '削除に失敗しました',
      };
    }
  }

  /**
   * スロットメタデータ一覧取得
   */
  async getSaveSlotMetas(): Promise<SaveSlotMeta[]> {
    return await indexedDBManager.getSaveSlotMetas();
  }

  /**
   * オートセーブ（スロット0）
   */
  async autoSave(): Promise<void> {
    try {
      await this.saveGame(0);
      console.log('Auto save completed');
    } catch (error) {
      console.error('Auto save failed:', error);
    }
  }

  /**
   * 支援ポイントを抽出
   */
  private extractSupportPoints(units: SaveData['units']): Record<string, Record<string, number>> {
    const supportPoints: Record<string, Record<string, number>> = {};

    for (const unit of units) {
      if (unit.supports.length > 0) {
        supportPoints[unit.id] = {};
        for (const bond of unit.supports) {
          supportPoints[unit.id][bond.partnerId] = bond.currentPoints;
        }
      }
    }

    return supportPoints;
  }

  /**
   * マップIDからマップ定義を作成（現在はデモマップのみ）
   */
  private createDemoMapFromId(mapId: string): MapDefinition | null {
    if (mapId === 'demo-map-1') {
      const width = 12;
      const height = 10;
      const tiles: MapDefinition['tiles'] = [];

      for (let y = 0; y < height; y++) {
        tiles[y] = [];
        for (let x = 0; x < width; x++) {
          let terrain: 'plain' | 'forest' | 'mountain' | 'water' | 'fortress' = 'plain';

          if ((x === 3 && y >= 2 && y <= 5) || (x === 8 && y >= 4 && y <= 7)) {
            terrain = 'forest';
          }
          if (x >= 5 && x <= 6 && y >= 4 && y <= 5) {
            terrain = 'water';
          }
          if (x === 10 && y === 8) {
            terrain = 'fortress';
          }
          if ((x === 1 && y === 3) || (x === 2 && y === 7)) {
            terrain = 'mountain';
          }

          tiles[y][x] = {
            position: { x, y },
            terrain,
            effects: TERRAIN_DEFINITIONS[terrain],
          };
        }
      }

      return {
        id: 'demo-map-1',
        name: '序章：出会い',
        description: '最初の戦闘マップ',
        chapter: 1,
        width,
        height,
        tiles,
        playerStartPositions: [
          { x: 0, y: 4 },
          { x: 0, y: 5 },
          { x: 1, y: 4 },
          { x: 1, y: 5 },
        ],
        enemySpawns: [
          { position: { x: 10, y: 4 }, unitDefinitionId: 'soldier', level: 1, equipment: [], ai: 'aggressive' as const },
          { position: { x: 9, y: 3 }, unitDefinitionId: 'soldier', level: 1, equipment: [], ai: 'aggressive' as const },
          { position: { x: 10, y: 5 }, unitDefinitionId: 'archer', level: 1, equipment: [], ai: 'stationary' as const },
        ],
        events: [],
        victoryCondition: { type: 'defeat_all' as const },
        defeatCondition: { type: 'lord_death' as const },
      };
    }

    return null;
  }
}

// シングルトンインスタンス
export const saveManager = new SaveManager();
