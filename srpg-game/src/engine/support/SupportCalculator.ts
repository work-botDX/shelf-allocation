import type { Unit, SupportBond } from '../../types';
import type { ActiveFormBonus } from '../../types/support';
import { getGridSystem } from '../grid';
import {
  getSupportDefinition,
  getRankBonus
} from '../../data/supportDefinitions';

export class SupportCalculator {
  /**
   * 2つのユニットが支援可能かチェック
   */
  static canSupport(unit1: Unit, unit2: Unit): boolean {
    if (unit1.faction !== unit2.faction) return false;
    if (unit1.id === unit2.id) return false;
    if (unit1.faction === 'enemy') return false

    const definition = getSupportDefinition(unit1.definitionId, unit2.definitionId)
    return definition !== undefined
  }

  /**
   * ユニットの既存支援ボンドを取得
   */
  static getSupportBond(unit: Unit, partnerId: string): SupportBond | undefined {
    return unit.supports.find(s => s.partnerId === partnerId)
  }

  /**
   * 2つのユニットが隣接（マンハッタン距離1）しているか
   */
  static isInSupportRange(unit1: Unit, unit2: Unit): boolean {
    const gridSystem = getGridSystem()
    if (!gridSystem) return false

    const distance = gridSystem.getManhattanDistance(unit1.position, unit2.position)
    return distance === 1
  }

  /**
   * 指定ユニットの隣接する支援パートナーを取得
   */
  static getAdjacentSupportPartners(unit: Unit, allUnits: Unit[]): Unit[] {
    const gridSystem = getGridSystem()
    if (!gridSystem) return []

    const neighbors = gridSystem.getNeighbors(unit.position)
    return allUnits.filter(u => {
      if (u.faction !== unit.faction) return false
      if (u.id === unit.id) return false
      // 隣接位置にいるか
      const isAdjacent = neighbors.some(n => n.x === u.position.x && n.y === u.position.y)
      if (!isAdjacent) return false
      // 支援関係があるか
      return this.getSupportBond(unit, u.id) !== undefined
    })
  }

  /**
   * 戦闘時の支援ボーナスを計算
   * 隣接する支援パートナーからのボーナスを集計
   */
  static calculateSupportBonuses(unit: Unit, allUnits: Unit[]): ActiveFormBonus | null {
    const partners = this.getAdjacentSupportPartners(unit, allUnits)
    if (partners.length === 0) return null

    const totalBonus = {
      attack: 0,
      hit: 0,
      avoid: 0,
      crit: 0,
      defense: 0,
      resistance: 0,
    }

    const partnerNames: string[] = []
    let highestRank: 'C' | 'B' | 'A' = 'C'

    for (const partner of partners) {
      const bond = this.getSupportBond(unit, partner.id)
      if (!bond) continue

      const definition = getSupportDefinition(unit.definitionId, partner.definitionId)
      if (!definition) continue

      const rankBonus = getRankBonus(definition, bond.currentRank)
      if (!rankBonus) continue

      totalBonus.attack += rankBonus.bonuses.strength ?? 0
      totalBonus.hit += rankBonus.hitBonus
      totalBonus.avoid += rankBonus.avoidBonus
      totalBonus.crit += rankBonus.critBonus
      totalBonus.defense += rankBonus.bonuses.defense ?? 0
      totalBonus.resistance += rankBonus.bonuses.resistance ?? 0

      partnerNames.push(partner.name)

      // 最高ランクを記録
      if (bond.currentRank === 'A') highestRank = 'A'
      else if (bond.currentRank === 'B' && highestRank === 'C') highestRank = 'B'
    }

    if (partnerNames.length === 0) return null

    return {
      partnerNames,
      rank: highestRank,
      bonuses: totalBonus,
    }
  }

  /**
   * 戦闘で獲得する支援ポイントを計算
   * 隣接する支援パートナー1人につき2ポイント
   */
  static calculateSupportPointGain(unit: Unit, allUnits: Unit[]): number {
    const partners = this.getAdjacentSupportPartners(unit, allUnits)
    return partners.length * 2
  }

  /**
   * 支援ポイントを加算してランクアップ処理
   * 更新された支援ボンドを返す
   */
  static processSupportPointGain(
    unit: Unit,
    pointsGained: number
  ): SupportBond[] {
    if (pointsGained <= 0) return unit.supports

    const updatedBonds: SupportBond[] = []

    for (const bond of unit.supports) {
      const newPoints = bond.currentPoints + pointsGained
      let newRank = bond.currentRank

      // ランクアップ判定
      const definition = SUPPORT_DEFINITIONS.find(d => d.id === bond.supportDefinitionId)
      if (definition) {
        // 次のランクの必要ポイントを確認
        const currentRankIndex = definition.rankBonuses.findIndex(r => r.rank === bond.currentRank)
        const nextRankBonus = definition.rankBonuses[currentRankIndex + 1]
        if (nextRankBonus && newPoints >= nextRankBonus.pointsRequired) {
          newRank = nextRankBonus.rank
        }
      }

      updatedBonds.push({
        ...bond,
        currentPoints: newPoints,
        currentRank: newRank,
      })
    }

    return updatedBonds
  }

  /**
   * ユニットの初期支援ボンドを作成
   */
  static initializeSupportBonds(unit: Unit, allPotentialPartners: Unit[]): SupportBond[] {
    const bonds: SupportBond[] = []

    for (const partner of allPotentialPartners) {
      if (partner.id === unit.id) continue
      if (partner.faction !== unit.faction) continue

      const definition = getSupportDefinition(unit.definitionId, partner.definitionId)
      if (definition) {
        bonds.push({
          partnerId: partner.id,
          supportDefinitionId: definition.id,
          currentRank: 'C',
          currentPoints: 0,
        })
      }
    }

    return bonds
  }
}

// SUPPORT_DEFINITIONSをインポート（ランクアップ判定で使用）
import { SUPPORT_DEFINITIONS } from '../../data/supportDefinitions'
