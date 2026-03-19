import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MapDefinition, Tile, TerrainType } from '../types';
import { TERRAIN_DEFINITIONS } from '../types/map';

interface MapStore {
  // 状態
  currentMap: MapDefinition | null;
  tiles: Tile[][];

  // アクション
  loadMap: (map: MapDefinition) => void;
  getTile: (x: number, y: number) => Tile | undefined;
  setTile: (x: number, y: number, terrain: TerrainType) => void;
  clearMap: () => void;
}

export const useMapStore = create<MapStore>()(
  devtools(
    (set, get) => ({
      currentMap: null,
      tiles: [],

      loadMap: (map) => {
        set({
          currentMap: map,
          tiles: map.tiles,
        });
      },

      getTile: (x, y) => {
        const { tiles } = get();
        if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[y].length) {
          return tiles[y][x];
        }
        return undefined;
      },

      setTile: (x, y, terrain) =>
        set((state) => {
          const newTiles = state.tiles.map((row) => [...row]);
          if (y >= 0 && y < newTiles.length && x >= 0 && x < newTiles[y].length) {
            newTiles[y][x] = {
              ...newTiles[y][x],
              terrain,
              effects: TERRAIN_DEFINITIONS[terrain],
            };
          }
          return { tiles: newTiles };
        }),

      clearMap: () =>
        set({
          currentMap: null,
          tiles: [],
        }),
    }),
    { name: 'map-store' }
  )
);

// ユーティリティ関数
export function createEmptyMap(width: number, height: number): Tile[][] {
  const tiles: Tile[][] = [];

  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        position: { x, y },
        terrain: 'plain',
        effects: TERRAIN_DEFINITIONS.plain,
      };
    }
  }

  return tiles;
}
