import type { Unit, Weapon } from '../../types';
import type {
  BattlePreviewData,
  BattleResult,
  CombatUnit,
  CombatRound,
} from '../../types/combat';
import type { ActiveFormBonus } from '../../types/support';
import { getWeaponAdvantage } from '../../types/combat';
import { SupportCalculator } from '../support';

/**
 * 戦闘計算クラス
 * ファイアーエムブレム風の戦闘システム
 */
export class BattleCalculator {
  /**
   * 武器を取得（装備している武器）
   */
  private static getWeapon(unit: Unit): Weapon | null {
    return unit.equipment.weapon ?? null;
  }

  /**
   * 武器相性ボーナスを計算
   */
  private static getWeaponBonus(
    atkWeapon: Weapon | null,
    defWeapon: Weapon | null
  ): { hitBonus: number; mightBonus: number } {
    if (!atkWeapon) return { hitBonus: 0, mightBonus: 0 };

    const advantage = getWeaponAdvantage(atkWeapon.type, defWeapon?.type);

    switch (advantage) {
      case 'advantage':
        return { hitBonus: 15, mightBonus: 1 };
      case 'disadvantage':
        return { hitBonus: -15, mightBonus: -1 };
      default:
        return { hitBonus: 0, mightBonus: 0 };
    }
  }

  /**
   * 実効速度を計算（武器の重さを考慮）
   */
  private static getEffectiveSpeed(unit: Unit, weapon: Weapon | null): number {
    const weaponWeight = weapon?.weight ?? 0;
    const constitution = unit.stats.strength; // 体格の代わりに力を使用
    const speedPenalty = Math.max(0, weaponWeight - constitution);
    return unit.stats.speed - speedPenalty;
  }

  /**
   * 追撃判定（速度差が4以上で追撃）
   */
  static canDoubleAttack(attacker: Unit, defender: Unit): boolean {
    const atkWeapon = this.getWeapon(attacker);
    const defWeapon = this.getWeapon(defender);
    const atkSpeed = this.getEffectiveSpeed(attacker, atkWeapon);
    const defSpeed = this.getEffectiveSpeed(defender, defWeapon);
    return atkSpeed - defSpeed >= 4;
  }

  /**
   * ダメージ計算
   */
  private static calculateDamage(
    attacker: Unit,
    defender: Unit,
    weapon: Weapon | null,
    mightBonus: number
  ): number {
    if (!weapon) return 0;

    const attackStat = weapon.type === 'magic' ? attacker.stats.magic : attacker.stats.strength;
    const defenseStat = weapon.type === 'magic' ? defender.stats.resistance : defender.stats.defense;
    const damage = attackStat + weapon.might + mightBonus - defenseStat;

    return Math.max(0, damage);
  }

  /**
   * 命中率計算
   */
  private static calculateHitRate(
    attacker: Unit,
    defender: Unit,
    weapon: Weapon | null,
    hitBonus: number
  ): number {
    if (!weapon) return 0;

    const hitRate = weapon.hit + attacker.stats.skill * 2 + Math.floor(attacker.stats.luck / 2);
    const avoidRate = defender.stats.speed * 2 + defender.stats.luck;
    const actualHitRate = hitRate + hitBonus - avoidRate;

    return Math.max(0, Math.min(100, actualHitRate));
  }

  /**
   * 必殺率計算
   */
  private static calculateCriticalRate(attacker: Unit, defender: Unit, weapon: Weapon | null): number {
    if (!weapon) return 0;

    const critRate = weapon.critical + Math.floor(attacker.stats.skill / 2) - defender.stats.luck;
    return Math.max(0, critRate);
  }

  /**
   * CombatUnitを生成
   * @param unit ユニット
   * @param opponent 相手
   * @param allUnits 全ユニット（支援ボーナス計算用、オプション）
   */
  private static createCombatUnit(unit: Unit, opponent: Unit, allUnits?: Unit[]): CombatUnit {
    const weapon = this.getWeapon(unit);
    const opponentWeapon = this.getWeapon(opponent);
    const { hitBonus, mightBonus } = this.getWeaponBonus(weapon, opponentWeapon);

    // 支援ボーナス計算
    let supportHitBonus = 0;
    let supportMightBonus = 0;
    if (allUnits) {
      const supportBonus = SupportCalculator.calculateSupportBonuses(unit, allUnits);
      if (supportBonus) {
        supportHitBonus = supportBonus.bonuses.hit;
        supportMightBonus = supportBonus.bonuses.attack;
      }
    }

    return {
      unit,
      effectiveStats: { ...unit.stats },
      weapon: weapon!,
      hitRate: this.calculateHitRate(unit, opponent, weapon, hitBonus + supportHitBonus),
      avoidRate: unit.stats.speed * 2 + unit.stats.luck,
      criticalRate: this.calculateCriticalRate(unit, opponent, weapon),
      attackPower: this.calculateDamage(unit, opponent, weapon, mightBonus + supportMightBonus),
      canDouble: this.canDoubleAttack(unit, opponent),
    };
  }

  /**
   * 戦闘プレビューデータを生成
   * @param attacker 攻撃者
   * @param defender 防御者
   * @param allUnits 全ユニット（支援ボーナス計算用）
   */
  static generatePreview(attacker: Unit, defender: Unit, allUnits?: Unit[]): BattlePreviewData {
    const atkWeapon = this.getWeapon(attacker);
    const defWeapon = this.getWeapon(defender);

    const { hitBonus: atkHitBonus, mightBonus: atkMightBonus } = this.getWeaponBonus(
      atkWeapon,
      defWeapon
    );
    const { hitBonus: defHitBonus, mightBonus: defMightBonus } = this.getWeaponBonus(
      defWeapon,
      atkWeapon
    );

    // 支援ボーナス計算
    let atkSupportBonus: ActiveFormBonus | undefined;
    let defSupportBonus: ActiveFormBonus | undefined;
    let atkSupportHit = 0;
    let atkSupportDamage = 0;
    let defSupportHit = 0;
    let defSupportDamage = 0;

    if (allUnits) {
      atkSupportBonus = SupportCalculator.calculateSupportBonuses(attacker, allUnits) ?? undefined;
      defSupportBonus = SupportCalculator.calculateSupportBonuses(defender, allUnits) ?? undefined;

      if (atkSupportBonus) {
        atkSupportHit = atkSupportBonus.bonuses.hit;
        atkSupportDamage = atkSupportBonus.bonuses.attack;
      }
      if (defSupportBonus) {
        defSupportHit = defSupportBonus.bonuses.hit;
        defSupportDamage = defSupportBonus.bonuses.attack;
      }
    }

    return {
      attackerName: attacker.name,
      attackerHp: { current: attacker.stats.hp, max: attacker.stats.maxHp },
      attackerWeapon: atkWeapon?.name ?? 'なし',
      attackerDamage: this.calculateDamage(attacker, defender, atkWeapon, atkMightBonus + atkSupportDamage),
      attackerHitRate: this.calculateHitRate(attacker, defender, atkWeapon, atkHitBonus + atkSupportHit),
      attackerCritRate: this.calculateCriticalRate(attacker, defender, atkWeapon),
      attackerDouble: this.canDoubleAttack(attacker, defender),
      attackerSupportBonus: atkSupportBonus,

      defenderName: defender.name,
      defenderHp: { current: defender.stats.hp, max: defender.stats.maxHp },
      defenderWeapon: defWeapon?.name ?? 'なし',
      defenderDamage: this.calculateDamage(defender, attacker, defWeapon, defMightBonus + defSupportDamage),
      defenderHitRate: this.calculateHitRate(defender, attacker, defWeapon, defHitBonus + defSupportHit),
      defenderCritRate: this.calculateCriticalRate(defender, attacker, defWeapon),
      defenderDouble: this.canDoubleAttack(defender, attacker),
      defenderSupportBonus: defSupportBonus,
    };
  }

  /**
   * 1回の攻撃を処理
   */
  private static processAttack(
    attacker: CombatUnit,
    defenderHp: number,
    _defenderMaxHp: number
  ): CombatRound {
    const roll = Math.random() * 100;
    const hit = roll < attacker.hitRate;

    if (!hit) {
      return {
        attacker: attacker.unit.faction === 'player' ? 'player' : 'enemy',
        hit: false,
        critical: false,
        damage: 0,
        remainingHp: defenderHp,
      };
    }

    const critRoll = Math.random() * 100;
    const critical = critRoll < attacker.criticalRate;
    const damage = critical ? attacker.attackPower * 3 : attacker.attackPower;
    const newHp = Math.max(0, defenderHp - damage);

    return {
      attacker: attacker.unit.faction === 'player' ? 'player' : 'enemy',
      hit: true,
      critical,
      damage,
      remainingHp: newHp,
    };
  }

  /**
   * 戦闘を実行し結果を返す
   * @param attacker 攻撃者
   * @param defender 防御者
   * @param allUnits 全ユニット（支援ボーナス計算用、オプション）
   */
  static executeBattle(attacker: Unit, defender: Unit, allUnits?: Unit[]): BattleResult {
    const combatAttacker = this.createCombatUnit(attacker, defender, allUnits);
    const combatDefender = this.createCombatUnit(defender, attacker, allUnits);

    const rounds: CombatRound[] = [];
    let attackerHp = attacker.stats.hp;
    let defenderHp = defender.stats.hp;
    let totalDamageAttacker = 0;
    let totalDamageDefender = 0;

    // 攻撃側の攻撃
    const attack1 = this.processAttack(combatAttacker, defenderHp, defender.stats.maxHp);
    rounds.push(attack1);
    if (attack1.hit) {
      defenderHp = attack1.remainingHp;
      totalDamageAttacker += attack1.damage;
    }

    // 防御側が生存していれば反撃
    if (defenderHp > 0) {
      const counter1 = this.processAttack(combatDefender, attackerHp, attacker.stats.maxHp);
      rounds.push(counter1);
      if (counter1.hit) {
        attackerHp = counter1.remainingHp;
        totalDamageDefender += counter1.damage;
      }
    }

    // 攻撃側の追撃
    if (combatAttacker.canDouble && attackerHp > 0 && defenderHp > 0) {
      const attack2 = this.processAttack(combatAttacker, defenderHp, defender.stats.maxHp);
      rounds.push(attack2);
      if (attack2.hit) {
        defenderHp = attack2.remainingHp;
        totalDamageAttacker += attack2.damage;
      }
    }

    // 防御側の追撃（反撃後）
    if (combatDefender.canDouble && defenderHp > 0 && attackerHp > 0) {
      const counter2 = this.processAttack(combatDefender, attackerHp, attacker.stats.maxHp);
      rounds.push(counter2);
      if (counter2.hit) {
        attackerHp = counter2.remainingHp;
        totalDamageDefender += counter2.damage;
      }
    }

    // 経験値計算（敵を倒したらボーナス）
    let experienceGained = 10;
    if (defenderHp === 0) {
      experienceGained += 20 + defender.level * 2;
    } else {
      experienceGained += Math.floor(totalDamageAttacker / 2);
    }

    return {
      attacker: combatAttacker,
      defender: combatDefender,
      rounds,
      totalDamage: {
        attacker: totalDamageDefender,
        defender: totalDamageAttacker,
      },
      isDead: {
        attacker: attackerHp === 0,
        defender: defenderHp === 0,
      },
      experienceGained,
    };
  }
}
