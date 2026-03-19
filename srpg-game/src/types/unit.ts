import type { Position, Faction, UnitClass, StatusEffect, WeaponType, MovementType } from './common';

// 基本ステータス
export interface BaseStats {
  hp: number;           // 現在HP
  maxHp: number;        // 最大HP
  strength: number;     // 力（物理攻撃力）
  magic: number;        // 魔力（魔法攻撃力）
  skill: number;        // 技（命中率・必殺率）
  speed: number;        // 速さ（回避率・追撃判定）
  luck: number;         // 幸運（回避・必殺回避）
  defense: number;      // 守備（物理防御）
  resistance: number;   // 魔防（魔法防御）
  move: number;         // 移動力
}

// 成長率（レベルアップ時の上昇確率 %）
export interface GrowthRates {
  hp: number;
  strength: number;
  magic: number;
  skill: number;
  speed: number;
  luck: number;
  defense: number;
  resistance: number;
}

// ユニット状態
export interface UnitStatus {
  effects: StatusEffect[];
  turnsRemaining: Record<StatusEffect, number>;
}

// 武器定義
export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  might: number;        // 威力
  hit: number;          // 命中率
  critical: number;     // 必殺率
  range: number[];      // 射程（[1] or [1,2] etc）
  weight: number;       // 重さ
  durability: number;   // 耐久度
  rank: string;
  effective?: UnitClass[]; // 特効対象クラス
  effects?: string[];    // 武器効果
}

// アイテム
export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'key' | 'accessory';
  effect: string;
}

// 装備スロット
export interface EquipmentSlots {
  weapon: Weapon | null;
  item: Item | null;
}

// スキル
export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'trigger';
  levelRequired?: number;  // 習得レベル
  icon?: string;
}

// 支援ボンド
export interface SupportBond {
  partnerId: string;
  supportDefinitionId: string;
  currentRank: 'C' | 'B' | 'A';
  currentPoints: number;
}

// ユニット定義（テンプレート）
export interface UnitDefinition {
  id: string;
  name: string;
  class: UnitClass;
  movementType: MovementType;
  baseStats: BaseStats;
  growthRates: GrowthRates;
  baseSkills: string[];
  portrait?: string;
  sprite?: string;
  description: string;
}

// ユニットインスタンス（マップ上の実体）
export interface Unit {
  id: string;
  definitionId: string;
  name: string;
  faction: Faction;
  class: UnitClass;
  movementType: MovementType;
  level: number;
  experience: number;
  stats: BaseStats;
  growthRates: GrowthRates;
  position: Position;
  equipment: EquipmentSlots;
  skills: Skill[];
  supports: SupportBond[];
  status: UnitStatus;
  hasMoved: boolean;
  hasAttacked: boolean;
  isBoss: boolean;
}

// ユニットクラス情報
export interface UnitClassInfo {
  class: UnitClass;
  name: string;
  movementType: MovementType;
  canUse: WeaponType[];
  baseMovement: number;
  description: string;
}
