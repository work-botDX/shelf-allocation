import type { Unit, GrowthRates, BaseStats } from '../../types/unit';
import type { LevelUpResult, StatKey, SkillDefinition } from '../../types/growth';

const MAX_LEVEL = 20;

export class LevelUpCalculator {
  /**
   * 次のレベルに必要な経験値を計算
   * ファイアーエムブレム風: level * 100
   */
  static getExperienceToNextLevel(level: number): number {
    return level * 100;
  }

  /**
   * レベルアップ可能かチェック
   */
  static canLevelUp(unit: Unit): boolean {
    if (unit.level >= MAX_LEVEL) return false;
    const threshold = this.getExperienceToNextLevel(unit.level);
    return unit.experience >= threshold;
  }

  /**
   * 成長率に基づくステータス上昇を計算
   * 各ステータスについて成長率%の確率で+1
   */
  static calculateStatIncreases(growthRates: GrowthRates): Partial<Record<StatKey, number>> {
    const increases: Partial<Record<StatKey, number>> = {};
    const stats: StatKey[] = ['hp', 'strength', 'magic', 'skill', 'speed', 'luck', 'defense', 'resistance'];

    for (const stat of stats) {
      const rate = growthRates[stat];
      if (Math.random() * 100 < rate) {
        increases[stat] = 1;
      }
    }

    return increases;
  }

  /**
   * ステータスに成長結果を適用
   */
  private static applyStatIncreases(
    stats: BaseStats,
    increases: Partial<Record<StatKey, number>>
  ): BaseStats {
    const newStats = { ...stats };

    if (increases.hp) {
      newStats.maxHp += increases.hp;
      newStats.hp += increases.hp; // HP上昇時は現在HPも回復
    }
    if (increases.strength) newStats.strength += increases.strength;
    if (increases.magic) newStats.magic += increases.magic;
    if (increases.skill) newStats.skill += increases.skill;
    if (increases.speed) newStats.speed += increases.speed;
    if (increases.luck) newStats.luck += increases.luck;
    if (increases.defense) newStats.defense += increases.defense;
    if (increases.resistance) newStats.resistance += increases.resistance;

    return newStats;
  }

  /**
   * 習得可能なスキルを取得
   */
  private static getNewSkills(
    currentSkills: Unit['skills'],
    newLevel: number,
    skillDefinitions: SkillDefinition[],
    classSkillIds: string[]
  ): Unit['skills'] {
    const currentSkillIds = new Set(currentSkills.map(s => s.id));
    const newSkills: Unit['skills'] = [];

    for (const skillId of classSkillIds) {
      if (currentSkillIds.has(skillId)) continue;

      const definition = skillDefinitions.find(d => d.id === skillId);
      if (definition && definition.levelRequired <= newLevel) {
        newSkills.push({
          id: definition.id,
          name: definition.name,
          description: definition.description,
          type: definition.type,
          levelRequired: definition.levelRequired,
          icon: definition.icon,
        });
      }
    }

    return newSkills;
  }

  /**
   * レベルアップ処理を実行
   * 注: このメソッドは単一のレベルアップ処理のみを行う
   * 連続レベルアップは呼び出し元でループ処理すること
   */
  static processLevelUp(
    unit: Unit,
    skillDefinitions: SkillDefinition[],
    classSkillsMap: Record<string, string[]>
  ): LevelUpResult {
    const previousStats = { ...unit.stats };
    const statIncreases = this.calculateStatIncreases(unit.growthRates);
    const newStats = this.applyStatIncreases(unit.stats, statIncreases);
    const newLevel = unit.level + 1;

    // スキル習得チェック
    const classSkillIds = classSkillsMap[unit.class] || [];
    const newSkills = this.getNewSkills(
      unit.skills,
      newLevel,
      skillDefinitions,
      classSkillIds
    );

    return {
      unitId: unit.id,
      unitName: unit.name,
      newLevel,
      previousStats,
      newStats,
      statIncreases,
      newSkills,
    };
  }
}
