import React, { memo, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '../../store';
import { SaveMenu } from './SaveMenu';
import { LoadMenu } from './LoadMenu';

interface PauseButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}

const PauseButton: React.FC<PauseButtonProps> = memo(({ onClick, children, danger }) => (
  <button
    onClick={onClick}
    className={`
      w-full px-6 py-3 rounded-lg font-bold
      transition-all duration-200
      ${danger
        ? 'bg-red-600/80 hover:bg-red-500 text-white'
        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      }
      active:scale-95
    `}
  >
    {children}
  </button>
));
PauseButton.displayName = 'PauseButton';

export const PauseMenu: React.FC = memo(() => {
  const { gameState, setGameState, phase, turn, playTime } = useGameStore();
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  // ESCキーでポーズ切り替え
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (gameState === 'playing') {
        setGameState('paused');
      } else if (gameState === 'paused') {
        setGameState('playing');
      }
    }
  }, [gameState, setGameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ポーズ中でない場合は何も表示しない
  if (gameState !== 'paused') {
    return null;
  }

  const handleResume = () => {
    setGameState('playing');
  };

  const handleTitle = () => {
    setGameState('title');
  };

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 w-80 shadow-2xl border border-gray-700">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">ポーズ</h2>
            <p className="text-gray-400 text-sm mt-1">ESCキーで閉じる</p>
          </div>

          {/* メニューボタン */}
          <div className="space-y-3">
            <PauseButton onClick={handleResume}>
              ゲームに戻る
            </PauseButton>
            <PauseButton onClick={() => setShowSaveMenu(true)}>
              セーブ
            </PauseButton>
            <PauseButton onClick={() => setShowLoadMenu(true)}>
              ロード
            </PauseButton>
            <PauseButton onClick={handleTitle} danger>
              タイトルに戻る
            </PauseButton>
          </div>

          {/* 戦況表示 */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h3 className="text-gray-400 text-sm font-bold mb-2">戦況</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p>ターン: {turn}</p>
              <p>フェーズ: {phase === 'player_phase' ? 'プレイヤー' : phase === 'enemy_phase' ? '敵' : phase}</p>
              <p>プレイ時間: {formatPlayTime(playTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* セーブメニュー */}
      {showSaveMenu && (
        <SaveMenu onClose={() => setShowSaveMenu(false)} />
      )}

      {/* ロードメニュー */}
      {showLoadMenu && (
        <LoadMenu onClose={() => setShowLoadMenu(false)} />
      )}
    </>
  );
});

PauseMenu.displayName = 'PauseMenu';
