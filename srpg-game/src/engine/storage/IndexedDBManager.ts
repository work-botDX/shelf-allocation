import type { SaveData, SaveSlotMeta } from '../../types/game';

const DB_NAME = 'srpg-save-db';
const DB_VERSION = 1;
const STORE_SLOTS = 'save_slots';
const STORE_DATA = 'save_data';
const MAX_SLOTS = 10; // スロット1-10（スロット0はオートセーブ用）

/**
 * IndexedDBを使用したセーブデータ管理
 * 2ストア設計: メタデータ（save_slots）と実データ（save_data）を分離
 */
class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * データベースを初期化
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    if (this.initPromise) {
      await this.initPromise;
      if (this.db) return this.db;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(new Error('IndexedDBを開けませんでした'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // スロットメタデータストア（高速一覧取得用）
        if (!db.objectStoreNames.contains(STORE_SLOTS)) {
          db.createObjectStore(STORE_SLOTS, { keyPath: 'slotNumber' });
        }

        // セーブデータストア（完全なデータ）
        if (!db.objectStoreNames.contains(STORE_DATA)) {
          db.createObjectStore(STORE_DATA, { keyPath: 'slotNumber' });
        }
      };
    });

    await this.initPromise;
    if (!this.db) throw new Error('Database initialization failed');
    return this.db;
  }

  /**
   * セーブデータを保存
   */
  async saveGame(slotNumber: number, data: SaveData): Promise<void> {
    if (slotNumber < 0 || slotNumber > MAX_SLOTS) {
      throw new Error(`Invalid slot number: ${slotNumber}`);
    }

    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_SLOTS, STORE_DATA], 'readwrite');

      transaction.onerror = () => {
        reject(new Error('セーブに失敗しました'));
      };

      transaction.oncomplete = () => {
        resolve();
      };

      // メタデータを作成
      const meta: SaveSlotMeta = {
        slotNumber,
        exists: true,
        timestamp: data.timestamp,
        playTime: data.playTime,
        currentChapter: data.currentChapter,
        playerUnitCount: data.unitIds.player.length,
        averageLevel: this.calculateAverageLevel(data.units, data.unitIds.player),
      };

      const slotsStore = transaction.objectStore(STORE_SLOTS);
      const dataStore = transaction.objectStore(STORE_DATA);

      // 両方のストアに保存
      slotsStore.put(meta);
      dataStore.put({ slotNumber, data });
    });
  }

  /**
   * セーブデータを読み込み
   */
  async loadGame(slotNumber: number): Promise<SaveData | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DATA, 'readonly');
      const store = transaction.objectStore(STORE_DATA);
      const request = store.get(slotNumber);

      request.onerror = () => {
        reject(new Error('ロードに失敗しました'));
      };

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * 全スロットのメタデータを取得（高速・軽量）
   */
  async getSaveSlotMetas(): Promise<SaveSlotMeta[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SLOTS, 'readonly');
      const store = transaction.objectStore(STORE_SLOTS);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error('スロット情報の取得に失敗しました'));
      };

      request.onsuccess = () => {
        const slots: SaveSlotMeta[] = [];

        // 0-10のスロットを生成
        for (let i = 0; i <= MAX_SLOTS; i++) {
          const existing = request.result?.find((s: SaveSlotMeta) => s.slotNumber === i);
          if (existing) {
            slots.push(existing);
          } else {
            slots.push({
              slotNumber: i,
              exists: false,
              timestamp: 0,
              playTime: 0,
              currentChapter: 0,
              playerUnitCount: 0,
              averageLevel: 0,
            });
          }
        }

        resolve(slots);
      };
    });
  }

  /**
   * セーブデータを削除
   */
  async deleteSave(slotNumber: number): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_SLOTS, STORE_DATA], 'readwrite');

      transaction.onerror = () => {
        reject(new Error('削除に失敗しました'));
      };

      transaction.oncomplete = () => {
        resolve();
      };

      const slotsStore = transaction.objectStore(STORE_SLOTS);
      const dataStore = transaction.objectStore(STORE_DATA);

      slotsStore.delete(slotNumber);
      dataStore.delete(slotNumber);
    });
  }

  /**
   * ストレージ使用状況を確認
   */
  async checkStorageQuota(): Promise<{ available: boolean; usedBytes: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        available: true,
        usedBytes: estimate.usage || 0,
      };
    }

    return { available: true, usedBytes: 0 };
  }

  /**
   * IndexedDBが利用可能か確認
   */
  static isAvailable(): boolean {
    try {
      return typeof indexedDB !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * プレイヤーユニットの平均レベルを計算
   */
  private calculateAverageLevel(units: SaveData['units'], playerIds: string[]): number {
    if (playerIds.length === 0) return 0;

    const playerUnits = units.filter((u) => playerIds.includes(u.id));
    if (playerUnits.length === 0) return 0;

    const totalLevel = playerUnits.reduce((sum, u) => sum + u.level, 0);
    return Math.round(totalLevel / playerUnits.length);
  }
}

// シングルトンインスタンス
export const indexedDBManager = new IndexedDBManager();
