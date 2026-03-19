import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PhaseManager } from '../../core/PhaseManager';

/**
 * 現在のフェーズとターン数を表示するコンポーネント
 * Phase 4: フェーズ・ターン管理
 */
export function PhaseIndicator() {
  const { phase, turn, isPhaseTransitioning } = useGameStore();
  const [showTransition, setShowTransition] = useState(false);

  // フェーズ遷移時のアニメーション
  useEffect(() => {
    if (isPhaseTransitioning) {
      setShowTransition(true);
      const timer = setTimeout(() => setShowTransition(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isPhaseTransitioning, phase]);

  const phaseLabel = PhaseManager.getPhaseLabel(phase);
  const isPlayerPhase = phase === 'player_phase';
  const isEnemyPhase = phase === 'enemy_phase';

  return (
    <>
      {/* フェーズ遷移オーバーレイ */}
      {showTransition && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 animate-fade-in">
          <div
            className={`text-4xl font-bold px-8 py-4 rounded-lg ${
              isEnemyPhase
                ? 'bg-red-900 text-red-100'
                : 'bg-blue-900 text-blue-100'
            }`}
          >
            {phaseLabel}
          </div>
        </div>
      )}

      {/* 通常表示 */}
      <div className="flex items-center gap-4">
        <div
          className={`px-4 py-2 rounded-lg font-bold ${
            isPlayerPhase
              ? 'bg-blue-600 text-white'
              : isEnemyPhase
                ? 'bg-red-600 text-white'
                : 'bg-gray-600 text-gray-200'
          }`}
        >
          {phaseLabel}
        </div>
        <div className="text-gray-400">ターン {turn}</div>
      </div>
    </>
  );
}
