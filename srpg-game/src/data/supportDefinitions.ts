import type { SupportDefinition, SupportRankBonus } from '../types/support';
import type { StatKey } from '../types/growth';

// 標準的なランクボーナス設定
const C_RANK: SupportRankBonus = {
  rank: 'C',
  pointsRequired: 10,
  bonuses: { strength: 1, skill: 1 },
  hitBonus: 5,
  avoidBonus: 5,
  critBonus: 0,
};

const B_RANK: SupportRankBonus = {
  rank: 'B',
  pointsRequired: 30,
  bonuses: { strength: 2, skill: 2, defense: 1 },
  hitBonus: 10,
  avoidBonus: 10,
  critBonus: 5,
};
const A_RANK: SupportRankBonus = {
  rank: 'A',
  pointsRequired: 60,
  bonuses: { strength: 3, skill: 3, defense: 2, speed: 1 },
  hitBonus: 15,
  avoidBonus: 15,
  critBonus: 10,
};

/**
 * 支援関係定義
 * デモ用のアラン（lord）とベラ（knight）の支援
 */
export const SUPPORT_DEFINITIONS: SupportDefinition[] = [
  {
    id: 'alan-bella',
    unit1DefinitionId: 'lord',
    unit2DefinitionId: 'knight',
    name: '主従の誓い',
    rankBonuses: [C_RANK, B_RANK, A_RANK],
  },
  // 弓兵（archer)は追加 - 将来の拡張用
  {
    id: 'alan-archer',
    unit1DefinitionId: 'lord',
    unit2DefinitionId: 'archer',
    name: '信頼の絆',
    rankBonuses: [C_RANK, B_RANK, A_RANK],
  },
];

/**
 * ユニット定義IDから支援可能な相手を探す
 */
export function getSupportDefinition(
  defId1: string,
  defId2: string
): SupportDefinition | undefined {
  return SUPPORT_DEFINITIONS.find(
    (s) =>
      (s.unit1DefinitionId === defId1 && s.unit2DefinitionId === defId2) ||
      (s.unit1DefinitionId === defId2 && s.unit2DefinitionId === defId1)
  );
}

/**
 * 次のランクに必要なポイント数を取得
 */
export function getPointsToNextRank(currentRank: 'C' | 'B' | 'A' | null): number | null {
  if (currentRank === null) return 10;  // C rank
  if (currentRank === 'C') return 30;   // B rank
  if (currentRank === 'B') return 60;   // A rank
  return null;  // A rank is max
}

/**
 * ランク別ボーナスを取得
 */
export function getRankBonus(
  definition: SupportDefinition,
  rank: 'C' | 'B' | 'A'
): SupportRankBonus | undefined {
  return definition.rankBonuses.find(r => r.rank === rank);
}
