import { useGameStore } from '../../store/gameStore';

/**
 * ターン終了ボタン
 * Phase 4: フェーズ・ターン管理
 */
export function TurnEndButton() {
  const { phase, gameResult, endPlayerTurn, isPhaseTransitioning } =
    useGameStore();

  const isPlayerPhase = phase === 'player_phase';
  const isDisabled = !isPlayerPhase || gameResult !== 'playing' || isPhaseTransitioning;

  const handleClick = () => {
    if (!isDisabled) {
      endPlayerTurn();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        px-6 py-3 rounded-lg font-bold text-white transition-all
        ${
          isDisabled
            ? 'bg-gray-600 cursor-not-allowed opacity-50'
            : 'bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700 cursor-pointer'
        }
      `}
    >
      ターン終了
    </button>
  );
}
