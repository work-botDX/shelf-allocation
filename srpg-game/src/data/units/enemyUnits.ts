import type { UnitDefinition } from '../../types/unit';

/**
 * 敵ユニット定義（汎用テンプレート）
 * Phase 10: コンテンツ作成
 */

/**
 * 山賊（序盤の雑魚敵）
 */
export const BANDIT: UnitDefinition = {
  id: 'bandit',
  name: '山賊',
  class: 'fighter',
  movementType: 'foot',
  baseStats: {
    hp: 22,
    maxHp: 22,
    strength: 6,
    magic: 0,
    skill: 4,
    speed: 4,
    luck: 2,
    defense: 3,
    resistance: 0,
    move: 5,
  },
  growthRates: {
    hp: 70,
    strength: 40,
    magic: 0,
    skill: 30,
    speed: 25,
    luck: 15,
    defense: 25,
    resistance: 5,
  },
  baseSkills: [],
  description: '山道を荒らす無法者。',
};

/**
 * 傭兵（標準的な近接敵）
 */
export const MERCENARY: UnitDefinition = {
  id: 'mercenary',
  name: '傭兵',
  class: 'mercenary',
  movementType: 'foot',
  baseStats: {
    hp: 20,
    maxHp: 20,
    strength: 5,
    magic: 0,
    skill: 7,
    speed: 8,
    luck: 3,
    defense: 4,
    resistance: 1,
    move: 5,
  },
  growthRates: {
    hp: 60,
    strength: 35,
    magic: 0,
    skill: 50,
    speed: 45,
    luck: 25,
    defense: 20,
    resistance: 10,
  },
  baseSkills: [],
  description: '金で雇われる剣士。',
};

/**
 * 弓兵（遠距離攻撃）
 */
export const ARCHER_ENEMY: UnitDefinition = {
  id: 'archer_enemy',
  name: '弓兵',
  class: 'archer',
  movementType: 'foot',
  baseStats: {
    hp: 18,
    maxHp: 18,
    strength: 5,
    magic: 0,
    skill: 6,
    speed: 6,
    luck: 3,
    defense: 2,
    resistance: 1,
    move: 5,
  },
  growthRates: {
    hp: 50,
    strength: 35,
    magic: 0,
    skill: 45,
    speed: 40,
    luck: 20,
    defense: 15,
    resistance: 10,
  },
  baseSkills: [],
  description: '弓で攻撃する兵士。',
};

/**
 * 魔道士（魔法攻撃）
 */
export const MAGE_ENEMY: UnitDefinition = {
  id: 'mage_enemy',
  name: '魔道士',
  class: 'mage',
  movementType: 'foot',
  baseStats: {
    hp: 18,
    maxHp: 18,
    strength: 1,
    magic: 7,
    skill: 5,
    speed: 6,
    luck: 4,
    defense: 2,
    resistance: 4,
    move: 5,
  },
  growthRates: {
    hp: 45,
    strength: 10,
    magic: 55,
    skill: 40,
    speed: 45,
    luck: 30,
    defense: 10,
    resistance: 40,
  },
  baseSkills: [],
  description: '魔法を操る敵。',
};

/**
 * ボス：山賊頭（第一章ボス）
 */
export const BANDIT_CHIEF: UnitDefinition = {
  id: 'bandit_chief',
  name: '山賊頭',
  class: 'fighter',
  movementType: 'foot',
  baseStats: {
    hp: 35,
    maxHp: 35,
    strength: 10,
    magic: 0,
    skill: 7,
    speed: 5,
    luck: 4,
    defense: 6,
    resistance: 1,
    move: 5,
  },
  growthRates: {
    hp: 80,
    strength: 50,
    magic: 0,
    skill: 35,
    speed: 30,
    luck: 20,
    defense: 35,
    resistance: 10,
  },
  baseSkills: [],
  description: '山賊たちの頭目。粗野だが強い。',
};

/**
 * 全敵ユニット定義
 */
export const ENEMY_UNITS: Record<string, UnitDefinition> = {
  bandit: BANDIT,
  mercenary: MERCENARY,
  archer_enemy: ARCHER_ENEMY,
  mage_enemy: MAGE_ENEMY,
  bandit_chief: BANDIT_CHIEF,
};

/**
 * 敵ユニット定義をIDで取得
 */
export function getEnemyUnitDefinition(id: string): UnitDefinition | undefined {
  return ENEMY_UNITS[id];
}
