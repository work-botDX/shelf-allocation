import type { SkillDefinition, ClassSkillsMap } from '../types/growth';

/**
 * スキル定義
 * 全スキルのマスターデータ
 */
export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // ロード系スキル
  {
    id: 'charisma',
    name: 'カリスマ',
    description: '周囲の味方の命中・回避を+10',
    type: 'passive',
    levelRequired: 1,
  },
  {
    id: 'sol',
    name: '太陽',
    description: '攻撃時に与えたダメージの半分をHP回復',
    type: 'trigger',
    levelRequired: 5,
  },
  {
    id: 'luna',
    name: '月光',
    description: '攻撃時、敵の守備・魔防を半減してダメージ計算',
    type: 'trigger',
    levelRequired: 10,
  },
  {
    id: 'aether',
    name: '天空',
    description: '太陽と月光を連続発動',
    type: 'trigger',
    levelRequired: 15,
  },

  // ナイト系スキル
  {
    id: 'defensive_formation',
    name: '守備陣形',
    description: '待機時、守備+4',
    type: 'passive',
    levelRequired: 1,
  },
  {
    id: 'pavise',
    name: '大盾',
    description: '敵の攻撃時、確率でダメージ半減',
    type: 'trigger',
    levelRequired: 10,
  },
  {
    id: 'miracle',
    name: '祈り',
    description: 'HP1で耐える確率が発生',
    type: 'trigger',
    levelRequired: 15,
  },

  // 剣士系スキル
  {
    id: 'vantage',
    name: '待ち伏せ',
    description: 'HPが半分以下の時、敵より先に攻撃',
    type: 'passive',
    levelRequired: 5,
  },
  {
    id: 'astra',
    name: '流星',
    description: '5連続攻撃を繰り出す',
    type: 'trigger',
    levelRequired: 10,
  },
  {
    id: 'swordfaire',
    name: '剣の達人',
    description: '剣装備時、力+5',
    type: 'passive',
    levelRequired: 15,
  },

  // 魔道士系スキル
  {
    id: 'magic_talent',
    name: '魔道の才',
    description: '魔法攻撃時、魔力+3',
    type: 'passive',
    levelRequired: 1,
  },
  {
    id: 'wrath',
    name: '怒り',
    description: 'HPが減少しているほど必殺率アップ',
    type: 'passive',
    levelRequired: 5,
  },
  {
    id: 'tomefaire',
    name: '魔道の達人',
    description: '魔法装備時、魔力+5',
    type: 'passive',
    levelRequired: 15,
  },

  // アーチャー系スキル
  {
    id: 'skillful_aim',
    name: '的確',
    description: '必中攻撃を行う',
    type: 'active',
    levelRequired: 5,
  },
  {
    id: 'bowfaire',
    name: '弓の達人',
    description: '弓装備時、力+5',
    type: 'passive',
    levelRequired: 10,
  },
  {
    id: 'long_range_shot',
    name: '長射程',
    description: '射程+1',
    type: 'passive',
    levelRequired: 15,
  },

  // 汎用スキル
  {
    id: 'strength_boost',
    name: '力の覚醒',
    description: '力+2',
    type: 'passive',
    levelRequired: 1,
  },
  {
    id: 'speed_boost',
    name: '速さの覚醒',
    description: '速さ+2',
    type: 'passive',
    levelRequired: 1,
  },
  {
    id: 'luck_boost',
    name: '幸運の覚醒',
    description: '幸運+2',
    type: 'passive',
    levelRequired: 1,
  },
];

/**
 * クラスごとの習得スキルマップ
 */
export const CLASS_SKILLS: ClassSkillsMap = {
  // ロード系
  lord: ['charisma', 'sol', 'luna', 'aether'],

  // ナイト系
  knight: ['defensive_formation', 'pavise', 'miracle'],
  cavalier: ['defensive_formation'],
  paladin: ['defensive_formation', 'pavise'],

  // 剣士系
  myrmidon: ['vantage'],
  swordmaster: ['vantage', 'astra', 'swordfaire'],

  // 魔道士系
  mage: ['magic_talent'],
  sage: ['magic_talent', 'wrath', 'tomefaire'],

  // アーチャー系
  archer: ['skillful_aim'],
  sniper: ['skillful_aim', 'bowfaire', 'long_range_shot'],

  // 回復系
  cleric: ['luck_boost'],
  priest: ['luck_boost'],
  bishop: ['luck_boost', 'magic_talent'],

  // デフォルト
  warrior: ['strength_boost'],
  fighter: ['strength_boost'],
  mercenary: ['vantage'],
  thief: ['speed_boost'],
};

/**
 * スキルIDからスキル定義を取得
 */
export function getSkillDefinition(skillId: string): SkillDefinition | undefined {
  return SKILL_DEFINITIONS.find(s => s.id === skillId);
}
