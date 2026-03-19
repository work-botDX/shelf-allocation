import { useGameStore } from '../../store/gameStore';
import { useUnitStore } from '../../store/unitStore';
import { useMapStore } from '../../store/mapStore';

/**
 * 勝利・敗北画面モーダル
 * Phase 4: フェーズ・ターン管理
 */
export function GameResultModal() {
  const { gameResult, resetGame, setPhase, moveCursor } = useGameStore();
  const { clearUnits } = useUnitStore();
  const { clearMap } = useMapStore();

  if (gameResult === 'playing') {
    return null;
  }

  const isVictory = gameResult === 'victory';

  const handleRestart = () => {
    // ゲーム状態をリセット
    clearUnits();
    clearMap();
    resetGame();

    // 親コンポーネントで初期化をトリガーするため、
    // 少し遅延してからプレイヤーフェーズを設定
    setTimeout(() => {
      setPhase('player_phase');
      moveCursor({ x: 1, y: 4 });
    }, 100);

    // ページをリロードする簡易的な実装
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div
        className={`
          p-8 rounded-xl text-center max-w-md
          ${isVictory ? 'bg-gradient-to-b from-blue-900 to-blue-950' : 'bg-gradient-to-b from-red-900 to-red-950'}
        `}
      >
        <h2
          className={`text-4xl font-bold mb-4 ${
            isVictory ? 'text-yellow-400' : 'text-red-400'
          }`}
        >
          {isVictory ? '勝利！' : '敗北...'}
        </h2>

        <p className="text-gray-300 mb-6">
          {isVictory
            ? '敵を全滅させました！'
            : '味方が全滅してしまいました...'}
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors cursor-pointer"
          >
            再戦
          </button>
        </div>
      </div>
    </div>
  );
}
