import React, { memo, useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SaveSlotCard } from './SaveSlotCard';

interface SaveMenuProps {
  onClose: () => void;
}

/**
 * セーブメニューコンポーネント
 */
export const SaveMenu: React.FC<SaveMenuProps> = memo(({ onClose }) => {
  const { saveSlotMetas, isSaving, refreshSaveSlots, saveGame, deleteSave } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshSaveSlots();
  }, [refreshSaveSlots]);

  const handleSlotClick = useCallback((slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setShowConfirm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (selectedSlot === null) return;

    const result = await saveGame(selectedSlot);
    if (result.success) {
      setMessage('セーブしました');
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1000);
    } else {
      setMessage(result.error || 'セーブに失敗しました');
    }
    setShowConfirm(false);
  }, [selectedSlot, saveGame, onClose]);

  const handleDelete = useCallback(async (slotNumber: number) => {
    const result = await deleteSave(slotNumber);
    if (result.success) {
      setMessage('削除しました');
      setTimeout(() => setMessage(null), 1500);
    } else {
      setMessage(result.error || '削除に失敗しました');
    }
    setShowDeleteConfirm(null);
  }, [deleteSave]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">セーブ</h2>
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
          {/* 手動セーブスロット（1-10） */}
          {saveSlotMetas.filter((s) => s.slotNumber > 0).map((slot) => (
            <SaveSlotCard
              key={slot.slotNumber}
              slot={slot}
              isSelected={selectedSlot === slot.slotNumber}
              isSaveMode={true}
              onClick={() => handleSlotClick(slot.slotNumber)}
              onDelete={() => setShowDeleteConfirm(slot.slotNumber)}
            />
          ))}
        </div>

        {/* セーブ中オーバーレイ */}
        {isSaving && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="text-white text-lg">セーブ中...</div>
          </div>
        )}

        {/* 確認ダイアログ */}
        {showConfirm && selectedSlot !== null && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
            <div className="bg-gray-700 p-6 rounded-lg text-center">
              <p className="text-white mb-4">
                スロット {selectedSlot} にセーブしますか？
                {saveSlotMetas.find((s) => s.slotNumber === selectedSlot)?.exists && (
                  <span className="text-yellow-400 block mt-2 text-sm">
                    ※ 既存のデータは上書きされます
                  </span>
                )}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  セーブ
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

        {/* 削除確認ダイアログ */}
        {showDeleteConfirm !== null && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
            <div className="bg-gray-700 p-6 rounded-lg text-center">
              <p className="text-white mb-4">
                スロット {showDeleteConfirm} を削除しますか？
                <span className="text-red-400 block mt-2 text-sm">
                  ※ この操作は取り消せません
                </span>
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  削除
                </button>
                <button
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                  onClick={() => setShowDeleteConfirm(null)}
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

SaveMenu.displayName = 'SaveMenu';
