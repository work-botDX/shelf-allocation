import type { Unit, Weapon, BaseStats } from './unit';
import type { ActiveFormBonus } from './support';

// 武器の相性
export type WeaponAdvantage = 'advantage' | 'neutral' | 'disadvantage';

// 戦闘計算用の一時データ
export interface CombatUnit {
  unit: Unit;
  effectiveStats: BaseStats;
  weapon: Weapon;
  hitRate: number;
  avoidRate: number;
  criticalRate: number;
  attackPower: number;
  canDouble: boolean;
}

// 戦闘ラウンド（1回の攻撃）
export interface CombatRound {
  attacker: 'player' | 'enemy';
  hit: boolean;
  critical: boolean;
  damage: number;
  remainingHp: number;
}

// 戦闘結果
export interface BattleResult {
  attacker: CombatUnit;
  defender: CombatUnit;
  rounds: CombatRound[];
  totalDamage: {
    attacker: number;
    defender: number;
  };
  isDead: {
    attacker: boolean;
    defender: boolean;
  };
  experienceGained: number;
}

// 戦闘プレビュー表示用
export interface BattlePreviewData {
  attackerName: string;
  attackerHp: { current: number; max: number };
  attackerWeapon: string;
  attackerDamage: number;
  attackerHitRate: number;
  attackerCritRate: number;
  attackerDouble: boolean;
  attackerSupportBonus?: ActiveFormBonus;

  defenderName: string;
  defenderHp: { current: number; max: number };
  defenderWeapon: string;
  defenderDamage: number;
  defenderHitRate: number;
  defenderCritRate: number;
  defenderDouble: boolean;
  defenderSupportBonus?: ActiveFormBonus;
}

// 武器の三角相性マップ
export const WEAPON_TRIANGLE: Record<string, string> = {
  sword: 'axe',
  lance: 'sword',
  axe: 'lance',
};

// 武器相性の判定
export function getWeaponAdvantage(
  atkType: string,
  defType: string | undefined
): WeaponAdvantage {
  if (!defType) return 'neutral';
  if (WEAPON_TRIANGLE[atkType] === defType) return 'advantage';
  if (WEAPON_TRIANGLE[defType] === atkType) return 'disadvantage';
  return 'neutral';
}
