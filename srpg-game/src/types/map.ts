import type { Position } from './common';
import type { Unit } from './unit';

// 地形タイプ
export type TerrainType =
  | 'plain'      // 平地
  | 'forest'     // 森
  | 'mountain'   // 山
  | 'water'      // 水
  | 'wall'       // 壁
  | 'fortress'   // 砦
  | 'village'    // 村
  | 'throne'     // 玉座
  | 'door'       // 扉
  | 'chest';     // 宝箱

// 地形効果
export interface TerrainEffect {
  avoidBonus: number;       // 回避率ボーナス
  defenseBonus: number;     // 守備ボーナス
  resistanceBonus: number;  // 魔防ボーナス
  healRate: number;         // ターン開始時HP回復率
  movementCost: Record<string, number>; // 移動タイプごとのコスト
}

// タイル
export interface Tile {
  position: Position;
  terrain: TerrainType;
  effects: TerrainEffect;
  unit?: Unit;              // このタイルにいるユニット
}

// 勝利条件
export type VictoryType = 'defeat_all' | 'defeat_boss' | 'seize' | 'escape' | 'survive';

export interface VictoryCondition {
  type: VictoryType;
  target?: Position | string;
}

// 敗北条件
export type DefeatType = 'lord_death' | 'all_death' | 'turn_limit';

export interface DefeatCondition {
  type: DefeatType;
  target?: string;
  turns?: number;
}

// 敵出現情報
export interface EnemySpawn {
  position: Position;
  unitDefinitionId: string;
  level: number;
  equipment: string[];
  ai: 'aggressive' | 'defensive' | 'stationary' | 'patrol';
  patrolRoute?: Position[];
  isBoss?: boolean;
}

// マップイベント
export interface MapEvent {
  id: string;
  trigger: 'turn_start' | 'turn_end' | 'unit_visit' | 'unit_death' | 'position';
  condition?: string;
  actions: EventAction[];
}

export interface EventAction {
  type: 'dialogue' | 'spawn' | 'remove' | 'give_item' | 'change_terrain' | 'victory';
  data: Record<string, unknown>;
}

// マップ定義
export interface MapDefinition {
  id: string;
  name: string;
  description: string;
  chapter: number;
  width: number;
  height: number;
  tiles: Tile[][];
  playerStartPositions: Position[];
  enemySpawns: EnemySpawn[];
  events: MapEvent[];
  victoryCondition: VictoryCondition;
  defeatCondition: DefeatCondition;
  turnLimit?: number;
  bgm?: string;
}

// 地形の定義
export const TERRAIN_DEFINITIONS: Record<TerrainType, TerrainEffect> = {
  plain: {
    avoidBonus: 0,
    defenseBonus: 0,
    resistanceBonus: 0,
    healRate: 0,
    movementCost: { foot: 1, mounted: 1, flying: 1, armored: 1 },
  },
  forest: {
    avoidBonus: 20,
    defenseBonus: 1,
    resistanceBonus: 0,
    healRate: 0,
    movementCost: { foot: 2, mounted: 3, flying: 1, armored: 3 },
  },
  mountain: {
    avoidBonus: 30,
    defenseBonus: 2,
    resistanceBonus: 0,
    healRate: 0,
    movementCost: { foot: 4, mounted: 255, flying: 1, armored: 255 },
  },
  water: {
    avoidBonus: 10,
    defenseBonus: 0,
    resistanceBonus: 0,
    healRate: 0,
    movementCost: { foot: 255, mounted: 255, flying: 1, armored: 255 },
  },
  wall: {
    avoidBonus: 0,
    defenseBonus: 0,
    resistanceBonus: 0,
    healRate: 0,
    movementCost: { foot: 255, mounted: 255, flying: 255, armored: 255 },
  },
  fortress: {
    avoidBonus: 20,
    defenseBonus: 2,
    resistanceBonus: 2,
    healRate: 0.2,
    movementCost: { foot: 1, mounted: 1, flying: 1, armored: 1 },
  },
  village: {
    avoidBonus: 10,
    defenseBonus: 0,
    resistanceBonus: 0,
    healRate: 0,
    movementCost: { foot: 1, mounted: 1, flying: 1, armored: 1 },
  },
  throne: {
    avoidBonus: 30,
    defenseBonus: 3,
    resistanceBonus: 3,
    healRate: 0.1,
    movementCost: { foot: 1, mounted: 1, flying: 1, armored: 1 },
  },
  door: {
    avoidBonus: 0,
    defenseBonus: 0,
    resistanceBonus: 0,
    healRate: 0,
    movementCost: { foot: 255, mounted: 255, flying: 255, armored: 255 },
  },
  chest: {
    avoidBonus: 0,
    defenseBonus: 0,
    resistanceBonus: 0,
    healRate: 0,
    movementCost: { foot: 1, mounted: 1, flying: 1, armored: 1 },
  },
};
