import type { Unit, Position } from '../../types';
import { getGridSystem } from '../grid';
import { BattleCalculator } from '../combat';

/**
 * 敵ユニットの行動結果
 */
export interface AIAction {
  unitId: string;
  type: 'move' | 'attack' | 'wait';
  from: Position;
  to: Position;
  targetId?: string;
}

/**
 * 脅威評価の結果
 */
interface ThreatAssessment {
  target: Unit;
  score: number;
  canAttack: boolean;
  attackPosition?: Position;
}

/**
 * 敵AIコントローラー
 * Phase 5: 敵AI
 */
export class AIController {
  /**
   * 敵フェーズの全行動を計算
   */
  static calculateEnemyActions(
    enemies: Unit[],
    playerUnits: Unit[],
    _tiles: unknown[][]
  ): AIAction[] {
    const actions: AIAction[] = [];
    const gridSystem = getGridSystem();

    if (!gridSystem) return actions;

    // 各敵ユニットについて行動を決定
    for (const enemy of enemies) {
      if (enemy.hasMoved) continue;

      const action = this.decideAction(enemy, playerUnits, gridSystem);
      if (action) {
        actions.push(action);
      }
    }

    return actions;
  }

  /**
   * 単一の敵ユニットの行動を決定
   */
  static decideAction(
    enemy: Unit,
    playerUnits: Unit[],
    gridSystem: ReturnType<typeof getGridSystem>
  ): AIAction | null {
    if (!gridSystem) return null;

    // 1. 脅威評価を行う
    const threats = this.assessThreats(enemy, playerUnits, gridSystem);

    // 2. 最適なターゲットを選択
    const bestTarget = this.selectBestTarget(threats);

    if (bestTarget) {
      // 攻撃可能な場合
      if (bestTarget.canAttack && bestTarget.attackPosition) {
        return {
          unitId: enemy.id,
          type: 'attack',
          from: enemy.position,
          to: bestTarget.attackPosition,
          targetId: bestTarget.target.id,
        };
      }

      // 攻撃位置に移動
      const movePosition = this.findApproachPosition(
        enemy,
        bestTarget.target,
        gridSystem
      );
      if (movePosition) {
        return {
          unitId: enemy.id,
          type: 'move',
          from: enemy.position,
          to: movePosition,
        };
      }
    }

    // 待機
    return {
      unitId: enemy.id,
      type: 'wait',
      from: enemy.position,
      to: enemy.position,
    };
  }

  /**
   * 全プレイヤーユニットの脅威評価
   */
  static assessThreats(
    enemy: Unit,
    playerUnits: Unit[],
    gridSystem: ReturnType<typeof getGridSystem>
  ): ThreatAssessment[] {
    const threats: ThreatAssessment[] = [];

    for (const player of playerUnits) {
      const assessment = this.assessSingleThreat(enemy, player, gridSystem);
      threats.push(assessment);
    }

    // スコア順にソート
    return threats.sort((a, b) => b.score - a.score);
  }

  /**
   * 単一ターゲットの脅威評価
   */
  static assessSingleThreat(
    enemy: Unit,
    target: Unit,
    gridSystem: ReturnType<typeof getGridSystem>
  ): ThreatAssessment {
    const distance = this.getDistance(enemy.position, target.position);
    const weapon = enemy.equipment.weapon;

    // 攻撃可能範囲内かチェック
    let canAttack = false;
    let attackPosition: Position | undefined;

    if (weapon) {
      const attackRange = weapon.range;

      // 移動範囲を計算
      const moveablePositions = gridSystem?.calculateMoveableRange(
        enemy,
        enemy.position
      ) ?? [];

      // 攻撃可能な位置を探す
      for (const pos of moveablePositions) {
        const distFromPos = this.getDistance(pos, target.position);
        if (attackRange.includes(distFromPos)) {
          canAttack = true;
          attackPosition = pos;
          break;
        }
      }
    }

    // 脅威スコア計算
    const score = this.calculateThreatScore(enemy, target, distance, canAttack);

    return {
      target,
      score,
      canAttack,
      attackPosition,
    };
  }

  /**
   * 脅威スコア計算
   */
  static calculateThreatScore(
    enemy: Unit,
    target: Unit,
    distance: number,
    canAttack: boolean
  ): number {
    let score = 0;

    // 距離が近いほど高スコア
    score += Math.max(0, 10 - distance) * 5;

    // 攻撃可能なら高スコア
    if (canAttack) {
      score += 50;
    }

    // HPが低いターゲットを優先
    const hpRatio = target.stats.hp / target.stats.maxHp;
    score += (1 - hpRatio) * 30;

    // lord（主人公）を優先
    if (target.class === 'lord') {
      score += 40;
    }

    // 倒せるなら最優先
    if (enemy.equipment.weapon) {
      const preview = BattleCalculator.generatePreview(enemy, target);
      if (preview.attackerDamage >= target.stats.hp) {
        score += 100;
      }
    }

    return score;
  }

  /**
   * 最適なターゲットを選択
   */
  static selectBestTarget(threats: ThreatAssessment[]): ThreatAssessment | null {
    if (threats.length === 0) return null;
    return threats[0];
  }

  /**
   * ターゲットに接近する位置を探索
   */
  static findApproachPosition(
    enemy: Unit,
    target: Unit,
    gridSystem: ReturnType<typeof getGridSystem>
  ): Position | null {
    if (!gridSystem) return null;

    const moveablePositions = gridSystem.calculateMoveableRange(
      enemy,
      enemy.position
    );

    if (moveablePositions.length === 0) return null;

    // ターゲットに最も近い位置を選択
    let bestPosition: Position | null = null;
    let bestDistance = Infinity;

    for (const pos of moveablePositions) {
      const dist = this.getDistance(pos, target.position);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestPosition = pos;
      }
    }

    return bestPosition;
  }

  /**
   * 2点間のマンハッタン距離
   */
  static getDistance(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
}
