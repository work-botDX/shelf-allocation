import type { UnitDefinition } from '../../types/unit';

/**
 * プレイヤーユニット定義
 * Phase 10: コンテンツ作成
 */

/**
 * アレン（主人公・聖剣使い）
 */
export const ALLEN: UnitDefinition = {
  id: 'allen',
  name: 'アレン',
  class: 'lord',
  movementType: 'foot',
  baseStats: {
    hp: 24,
    maxHp: 24,
    strength: 7,
    magic: 3,
    skill: 8,
    speed: 9,
    luck: 5,
    defense: 5,
    resistance: 2,
    move: 5,
  },
  growthRates: {
    hp: 80,
    strength: 45,
    magic: 20,
    skill: 50,
    speed: 55,
    luck: 40,
    defense: 30,
    resistance: 25,
  },
  baseSkills: ['holy_sword_bond'],
  description: '聖剣に選ばれた青年。幼馴染のエラとの絆を大切にしている。',
};

/**
 * エラ（ヒロイン・魔道士）
 */
export const ELA: UnitDefinition = {
  id: 'ela',
  name: 'エラ',
  class: 'mage',
  movementType: 'foot',
  baseStats: {
    hp: 20,
    maxHp: 20,
    strength: 2,
    magic: 8,
    skill: 6,
    speed: 7,
    luck: 6,
    defense: 3,
    resistance: 5,
    move: 5,
  },
  growthRates: {
    hp: 60,
    strength: 15,
    magic: 60,
    skill: 45,
    speed: 50,
    luck: 55,
    defense: 20,
    resistance: 45,
  },
  baseSkills: ['soul_connection'],
  description: 'アレンの幼馴染。星見の花の下で魂の儀式を行った。',
};

/**
 * 全プレイヤーユニット定義
 */
export const PLAYER_UNITS: Record<string, UnitDefinition> = {
  allen: ALLEN,
  ela: ELA,
};

/**
 * ユニット定義をIDで取得
 */
export function getPlayerUnitDefinition(id: string): UnitDefinition | undefined {
  return PLAYER_UNITS[id];
}
