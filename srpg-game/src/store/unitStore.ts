import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Position, Faction, Unit, BaseStats } from '../types';
import type { LevelUpResult } from '../types/growth';
import type { SupportBond } from '../types/unit';
import type { SupportRank } from '../types/support';
import { LevelUpCalculator } from '../engine/growth';
import { SupportCalculator } from '../engine/support';
import { SKILL_DEFINITIONS, CLASS_SKILLS } from '../data/skillDefinitions';
import { SUPPORT_DEFINITIONS } from '../data/supportDefinitions';

// 支援ランクアップ情報
export interface SupportRankUpInfo {
  unitId: string;
  unitName: string;
  partnerId: string;
  partnerName: string;
  supportDefinitionId: string;
  oldRank: SupportRank;
  newRank: SupportRank;
}

interface UnitStore {
  // 状態
  units: Map<string, Unit>;
  playerUnitIds: string[];
  enemyUnitIds: string[];
  allyUnitIds: string[];

  // セレクター
  getUnit: (id: string) => Unit | undefined;
  getPlayerUnits: () => Unit[];
  getEnemyUnits: () => Unit[];
  getAllyUnits: () => Unit[];
  getUnitAt: (position: Position) => Unit | undefined;
  getUnitsByFaction: (faction: Faction) => Unit[];

  // アクション
  addUnit: (unit: Unit) => void;
  removeUnit: (id: string) => void;
  updateUnit: (id: string, updates: Partial<Unit>) => void;
  moveUnit: (id: string, newPosition: Position) => void;
  damageUnit: (id: string, damage: number) => void;
  healUnit: (id: string, amount: number) => void;
  setUnitMoved: (id: string, moved: boolean) => void;
  setUnitAttacked: (id: string, attacked: boolean) => void;
  resetAllMoved: (faction: Faction) => void;
  updateUnitStats: (id: string, stats: Partial<BaseStats>) => void;
  addExperience: (id: string, exp: number) => void;
  addExperienceWithLevelUp: (id: string, exp: number) => LevelUpResult[];
  initializeSupports: (unitId: string) => void;
  addSupportPoints: (unitId: string, points: number) => SupportRankUpInfo[];
  clearUnits: () => void;
}

export const useUnitStore = create<UnitStore>()(
  devtools(
    (set, get) => ({
      units: new Map(),
      playerUnitIds: [],
      enemyUnitIds: [],
      allyUnitIds: [],

      getUnit: (id) => get().units.get(id),

      getPlayerUnits: () =>
        get()
          .playerUnitIds.map((id) => get().units.get(id)!)
          .filter(Boolean),

      getEnemyUnits: () =>
        get()
          .enemyUnitIds.map((id) => get().units.get(id)!)
          .filter(Boolean),

      getAllyUnits: () =>
        get()
          .allyUnitIds.map((id) => get().units.get(id)!)
          .filter(Boolean),

      getUnitAt: (position) => {
        for (const unit of get().units.values()) {
          if (
            unit.position.x === position.x &&
            unit.position.y === position.y
          ) {
            return unit;
          }
        }
        return undefined;
      },

      getUnitsByFaction: (faction) => {
        const units: Unit[] = [];
        for (const unit of get().units.values()) {
          if (unit.faction === faction) {
            units.push(unit);
          }
        }
        return units;
      },

      addUnit: (unit) =>
        set((state) => {
          const newUnits = new Map(state.units);
          newUnits.set(unit.id, unit);

          const updates: Partial<UnitStore> = { units: newUnits };

          if (unit.faction === 'player') {
            updates.playerUnitIds = [...state.playerUnitIds, unit.id];
          } else if (unit.faction === 'enemy') {
            updates.enemyUnitIds = [...state.enemyUnitIds, unit.id];
          } else if (unit.faction === 'ally') {
            updates.allyUnitIds = [...state.allyUnitIds, unit.id];
          }

          return updates;
        }),

      removeUnit: (id) =>
        set((state) => {
          const newUnits = new Map(state.units);
          const unit = newUnits.get(id);
          newUnits.delete(id);

          if (!unit) return { units: newUnits };

          return {
            units: newUnits,
            playerUnitIds: state.playerUnitIds.filter((uid) => uid !== id),
            enemyUnitIds: state.enemyUnitIds.filter((uid) => uid !== id),
            allyUnitIds: state.allyUnitIds.filter((uid) => uid !== id),
          };
        }),

      updateUnit: (id, updates) =>
        set((state) => {
          const unit = state.units.get(id);
          if (!unit) return state;

          const newUnits = new Map(state.units);
          newUnits.set(id, { ...unit, ...updates });

          return { units: newUnits };
        }),

      moveUnit: (id, newPosition) =>
        set((state) => {
          const unit = state.units.get(id);
          if (!unit) return state;

          const newUnits = new Map(state.units);
          newUnits.set(id, { ...unit, position: newPosition });

          return { units: newUnits };
        }),

      damageUnit: (id, damage) =>
        set((state) => {
          const unit = state.units.get(id);
          if (!unit) return state;

          const newHp = Math.max(0, unit.stats.hp - damage);
          const newUnits = new Map(state.units);

          if (newHp === 0) {
            newUnits.delete(id);
            return {
              units: newUnits,
              playerUnitIds: state.playerUnitIds.filter((uid) => uid !== id),
              enemyUnitIds: state.enemyUnitIds.filter((uid) => uid !== id),
              allyUnitIds: state.allyUnitIds.filter((uid) => uid !== id),
            };
          }

          newUnits.set(id, {
            ...unit,
            stats: { ...unit.stats, hp: newHp },
          });

          return { units: newUnits };
        }),

      healUnit: (id, amount) =>
        set((state) => {
          const unit = state.units.get(id);
          if (!unit) return state;

          const newHp = Math.min(unit.stats.maxHp, unit.stats.hp + amount);
          const newUnits = new Map(state.units);
          newUnits.set(id, {
            ...unit,
            stats: { ...unit.stats, hp: newHp },
          });

          return { units: newUnits };
        }),

      setUnitMoved: (id, moved) =>
        set((state) => {
          const unit = state.units.get(id);
          if (!unit) return state;

          const newUnits = new Map(state.units);
          newUnits.set(id, { ...unit, hasMoved: moved });

          return { units: newUnits };
        }),

      setUnitAttacked: (id, attacked) =>
        set((state) => {
          const unit = state.units.get(id);
          if (!unit) return state;

          const newUnits = new Map(state.units);
          newUnits.set(id, { ...unit, hasAttacked: attacked });

          return { units: newUnits };
        }),

      resetAllMoved: (faction) =>
        set((state) => {
          const newUnits = new Map(state.units);

          for (const [id, unit] of newUnits) {
            if (unit.faction === faction) {
              newUnits.set(id, { ...unit, hasMoved: false, hasAttacked: false });
            }
          }

          return { units: newUnits };
        }),

      updateUnitStats: (id, stats) =>
        set((state) => {
          const unit = state.units.get(id);
          if (!unit) return state;

          const newUnits = new Map(state.units);
          newUnits.set(id, {
            ...unit,
            stats: { ...unit.stats, ...stats },
          });

          return { units: newUnits };
        }),

      addExperience: (id, exp) =>
        set((state) => {
          const unit = state.units.get(id);
          if (!unit) return state;

          const newUnits = new Map(state.units);
          newUnits.set(id, {
            ...unit,
            experience: unit.experience + exp,
          });

          return { units: newUnits };
        }),

      addExperienceWithLevelUp: (id, exp) => {
        const unit = get().units.get(id);
        if (!unit || unit.faction !== 'player') return [];

        const levelUpResults: LevelUpResult[] = [];
        let currentExp = unit.experience + exp;
        let currentLevel = unit.level;
        let currentStats = { ...unit.stats };
        let currentSkills = [...unit.skills];

        // 連続レベルアップ対応
        while (currentLevel < 20 && currentExp >= LevelUpCalculator.getExperienceToNextLevel(currentLevel)) {
          const tempUnit: Unit = {
            ...unit,
            level: currentLevel,
            experience: currentExp,
            stats: currentStats,
            skills: currentSkills,
          };

          const result = LevelUpCalculator.processLevelUp(
            tempUnit,
            SKILL_DEFINITIONS,
            CLASS_SKILLS
          );

          levelUpResults.push(result);

          // 経験値を消費
          currentExp -= LevelUpCalculator.getExperienceToNextLevel(currentLevel);
          currentLevel = result.newLevel;
          currentStats = { ...result.newStats };

          // 新スキルを追加
          if (result.newSkills.length > 0) {
            currentSkills = [...currentSkills, ...result.newSkills];
          }
        }

        // ユニットを更新
        set((state) => {
          const newUnits = new Map(state.units);
          newUnits.set(id, {
            ...unit,
            level: currentLevel,
            experience: currentExp,
            stats: currentStats,
            skills: currentSkills,
          });
          return { units: newUnits };
        });

        return levelUpResults;
      },

      initializeSupports: (unitId) => {
        const unit = get().units.get(unitId);
        if (!unit || unit.faction !== 'player') return;

        // 全プレイヤーユニットを取得
        const allUnits = Array.from(get().units.values());
        const bonds = SupportCalculator.initializeSupportBonds(unit, allUnits);

        if (bonds.length > 0) {
          get().updateUnit(unitId, { supports: bonds });
        }
      },

      addSupportPoints: (unitId, points) => {
        const unit = get().units.get(unitId);
        if (!unit || unit.faction !== 'player') return [];
        if (unit.supports.length === 0) return [];

        const rankUpInfos: SupportRankUpInfo[] = [];
        const updatedBonds: SupportBond[] = [];

        for (const bond of unit.supports) {
          const newPoints = bond.currentPoints + points;
          let newRank = bond.currentRank;
          const oldRank = bond.currentRank;

          // ランクアップ判定
          const definition = SUPPORT_DEFINITIONS.find(d => d.id === bond.supportDefinitionId);
          if (definition) {
            const currentRankIndex = definition.rankBonuses.findIndex(r => r.rank === bond.currentRank);
            const nextRankBonus = definition.rankBonuses[currentRankIndex + 1];
            if (nextRankBonus && newPoints >= nextRankBonus.pointsRequired) {
              newRank = nextRankBonus.rank;

              // ランクアップ情報を記録
              const partner = get().units.get(bond.partnerId);
              if (partner) {
                rankUpInfos.push({
                  unitId: unitId,
                  unitName: unit.name,
                  partnerId: bond.partnerId,
                  partnerName: partner.name,
                  supportDefinitionId: bond.supportDefinitionId,
                  oldRank,
                  newRank,
                });
              }
            }
          }

          updatedBonds.push({
            ...bond,
            currentPoints: newPoints,
            currentRank: newRank,
          });
        }

        get().updateUnit(unitId, { supports: updatedBonds });
        return rankUpInfos;
      },

      clearUnits: () =>
        set({
          units: new Map(),
          playerUnitIds: [],
          enemyUnitIds: [],
          allyUnitIds: [],
        }),
    }),
    { name: 'unit-store' }
  )
);
