import type { Weapon } from '../../types/unit';

/**
 * 剣武器データ
 */
export const SWORDS: Record<string, Weapon> = {
  iron_sword: {
    id: 'iron_sword',
    name: '鉄の剣',
    type: 'sword',
    might: 5,
    hit: 90,
    critical: 0,
    range: [1],
    weight: 5,
    durability: 46,
    rank: 'E',
  },
  steel_sword: {
    id: 'steel_sword',
    name: '鋼の剣',
    type: 'sword',
    might: 8,
    hit: 75,
    critical: 0,
    range: [1],
    weight: 10,
    durability: 30,
    rank: 'D',
  },
  silver_sword: {
    id: 'silver_sword',
    name: '銀の剣',
    type: 'sword',
    might: 13,
    hit: 80,
    critical: 0,
    range: [1],
    weight: 8,
    durability: 20,
    rank: 'B',
  },
  holy_sword: {
    id: 'holy_sword',
    name: '聖剣',
    type: 'sword',
    might: 15,
    hit: 95,
    critical: 10,
    range: [1],
    weight: 5,
    durability: 255, // 無限
    rank: 'S',
    effects: ['holy_damage'],
  },
};

/**
 * 槍武器データ
 */
export const LANCES: Record<string, Weapon> = {
  iron_lance: {
    id: 'iron_lance',
    name: '鉄の槍',
    type: 'lance',
    might: 7,
    hit: 80,
    critical: 0,
    range: [1],
    weight: 8,
    durability: 40,
    rank: 'E',
  },
  steel_lance: {
    id: 'steel_lance',
    name: '鋼の槍',
    type: 'lance',
    might: 10,
    hit: 70,
    critical: 0,
    range: [1],
    weight: 13,
    durability: 25,
    rank: 'D',
  },
};

/**
 * 斧武器データ
 */
export const AXES: Record<string, Weapon> = {
  iron_axe: {
    id: 'iron_axe',
    name: '鉄の斧',
    type: 'axe',
    might: 8,
    hit: 70,
    critical: 0,
    range: [1],
    weight: 10,
    durability: 40,
    rank: 'E',
  },
  steel_axe: {
    id: 'steel_axe',
    name: '鋼の斧',
    type: 'axe',
    might: 11,
    hit: 60,
    critical: 0,
    range: [1],
    weight: 15,
    durability: 25,
    rank: 'D',
  },
};

/**
 * 弓武器データ
 */
export const BOWS: Record<string, Weapon> = {
  iron_bow: {
    id: 'iron_bow',
    name: '鉄の弓',
    type: 'bow',
    might: 6,
    hit: 85,
    critical: 0,
    range: [2],
    weight: 5,
    durability: 40,
    rank: 'E',
  },
  steel_bow: {
    id: 'steel_bow',
    name: '鋼の弓',
    type: 'bow',
    might: 9,
    hit: 75,
    critical: 0,
    range: [2],
    weight: 9,
    durability: 25,
    rank: 'D',
  },
};

/**
 * 魔法データ
 */
export const MAGIC: Record<string, Weapon> = {
  fire: {
    id: 'fire',
    name: 'ファイアー',
    type: 'magic',
    might: 5,
    hit: 100,
    critical: 0,
    range: [1, 2],
    weight: 4,
    durability: 40,
    rank: 'E',
  },
  thunder: {
    id: 'thunder',
    name: 'サンダー',
    type: 'magic',
    might: 8,
    hit: 80,
    critical: 5,
    range: [1, 2],
    weight: 6,
    durability: 35,
    rank: 'D',
  },
  wind: {
    id: 'wind',
    name: 'ウィンド',
    type: 'magic',
    might: 4,
    hit: 100,
    critical: 10,
    range: [1, 2],
    weight: 2,
    durability: 50,
    rank: 'E',
  },
};

/**
 * 全武器統合
 */
export const WEAPONS: Record<string, Weapon> = {
  ...SWORDS,
  ...LANCES,
  ...AXES,
  ...BOWS,
  ...MAGIC,
};

/**
 * 武器をIDで取得
 */
export function getWeapon(id: string): Weapon | undefined {
  return WEAPONS[id];
}
