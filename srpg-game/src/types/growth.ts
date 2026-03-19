import type { BaseStats, Skill } from './unit';

// ステータスキー
export type StatKey = 'hp' | 'strength' | 'magic' | 'skill' | 'speed' | 'luck' | 'defense' | 'resistance';

// レベルアップ結果
export interface LevelUpResult {
  unitId: string;
  unitName: string;
  newLevel: number;
  previousStats: BaseStats;
  newStats: BaseStats;
  statIncreases: Partial<Record<StatKey, number>>;
  newSkills: Skill[];
}

// スキル習得定義
export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'trigger';
  levelRequired: number;
  icon?: string;
}

// クラスごとのスキル習得マップ
export type ClassSkillsMap = Record<string, string[]>;
