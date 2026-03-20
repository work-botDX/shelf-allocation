import React, { memo, useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SaveSlotCard } from './SaveSlotCard';

interface LoadMenuProps {
  onClose: () => void;
}

/**
 * ロードメニューコンポーネント
 */
export const LoadMenu: React.FC<LoadMenuProps> = memo(({ onClose }) => {
  const { saveSlotMetas, isLoading, refreshSaveSlots, loadGame } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshSaveSlots();
  }, [refreshSaveSlots]);

  const handleSlotClick = useCallback((slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setShowConfirm(true);
  }, []);

  const handleLoad = useCallback(async () => {
    if (selectedSlot === null) return;

    const result = await loadGame(selectedSlot);
    if (result.success) {
      setMessage('ロードしました');
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 500);
    } else {
      setMessage(result.error || 'ロードに失敗しました');
      setShowConfirm(false);
    }
  }, [selectedSlot, loadGame, onClose]);

  // データがあるスロットのみ表示
  const availableSlots = saveSlotMetas.filter((s) => s.exists);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">ロード</h2>
          <button
            className="text-gray-400 hover:text-white text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* メッセージ */}
        {message && (
          <div className="mb-4 p-3 bg-blue-600/50 rounded text-white text-center">
            {message}
          </div>
        )}

        {/* スロットリスト */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {availableSlots.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              セーブデータがありません
            </div>
          ) : (
            availableSlots.map((slot) => (
              <SaveSlotCard
                key={slot.slotNumber}
                slot={slot}
                isSelected={selectedSlot === slot.slotNumber}
                isSaveMode={false}
                onClick={() => handleSlotClick(slot.slotNumber)}
              />
            ))
          )}
        </div>

        {/* ロード中オーバーレイ */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="text-white text-lg">ロード中...</div>
          </div>
        )}

        {/* 確認ダイアログ */}
        {showConfirm && selectedSlot !== null && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
            <div className="bg-gray-700 p-6 rounded-lg text-center">
              <p className="text-white mb-4">
                スロット {selectedSlot === 0 ? 'オートセーブ' : selectedSlot} からロードしますか？
                <span className="text-yellow-400 block mt-2 text-sm">
                  ※ 現在のプレイ状況は失われます
                </span>
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                  onClick={handleLoad}
                  disabled={isLoading}
                >
                  ロード
                </button>
                <button
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                  onClick={() => setShowConfirm(false)}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-4 flex justify-end">
          <button
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
});

LoadMenu.displayName = 'LoadMenu';
