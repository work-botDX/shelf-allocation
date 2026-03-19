import type { GamePhase, GameResult } from '../types/game';
import type { VictoryCondition, DefeatCondition } from '../types/map';
import type { Unit } from '../types/unit';

/**
 * フェーズ遷移を管理するクラス
 * Phase 4: フェーズ・ターン管理
 */
export class PhaseManager {
  /**
   * 勝利条件をチェック
   */
  static checkVictoryCondition(
    condition: VictoryCondition,
    enemies: Unit[],
    playerUnits: Unit[]
  ): boolean {
    switch (condition.type) {
      case 'defeat_all':
        // 敵を全滅
        return enemies.length === 0;

      case 'defeat_boss':
        // ボス撃破
        return !enemies.some((e) => e.isBoss);

      case 'seize':
        // 特定位置到達（プレイヤーユニットが目標地点にいるか）
        if (condition.target) {
          const targetPos =
            typeof condition.target === 'string'
              ? null
              : condition.target;
          if (targetPos) {
            return playerUnits.some(
              (u) => u.position.x === targetPos.x && u.position.y === targetPos.y
            );
          }
        }
        return false;

      case 'escape':
        // 脱出（全員がマップ外へ）- 今回は未実装
        return false;

      case 'survive':
        // ターン経過 - 呼び出し元でターン数をチェック
        return false;

      default:
        return false;
    }
  }

  /**
   * 敗北条件をチェック
   */
  static checkDefeatCondition(
    condition: DefeatCondition,
    playerUnits: Unit[],
    currentTurn: number
  ): boolean {
    switch (condition.type) {
      case 'lord_death':
        // 主人公（lordクラス）が死亡
        return !playerUnits.some((u) => u.class === 'lord');

      case 'all_death':
        // 全滅
        return playerUnits.length === 0;

      case 'turn_limit':
        // ターン制限超過
        if (condition.turns) {
          return currentTurn > condition.turns;
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * ゲーム結果を判定
   */
  static checkGameResult(
    victoryCondition: VictoryCondition,
    defeatCondition: DefeatCondition,
    enemies: Unit[],
    playerUnits: Unit[],
    currentTurn: number
  ): GameResult {
    // 敗北条件を先にチェック
    if (
      this.checkDefeatCondition(defeatCondition, playerUnits, currentTurn)
    ) {
      return 'defeat';
    }

    // 勝利条件をチェック
    if (
      this.checkVictoryCondition(victoryCondition, enemies, playerUnits)
    ) {
      return 'victory';
    }

    return 'playing';
  }

  /**
   * 次のフェーズを取得
   */
  static getNextPhase(currentPhase: GamePhase): GamePhase {
    switch (currentPhase) {
      case 'player_phase':
        return 'enemy_phase';
      case 'enemy_phase':
        return 'player_phase';
      case 'ally_phase':
        return 'player_phase';
      default:
        return 'player_phase';
    }
  }

  /**
   * フェーズ名を日本語で取得
   */
  static getPhaseLabel(phase: GamePhase): string {
    switch (phase) {
      case 'player_phase':
        return 'プレイヤーフェーズ';
      case 'enemy_phase':
        return '敵フェーズ';
      case 'ally_phase':
        return '味方フェーズ';
      case 'battle':
        return '戦闘中';
      case 'event':
        return 'イベント中';
      case 'menu':
        return 'メニュー';
      default:
        return '';
    }
  }
}
