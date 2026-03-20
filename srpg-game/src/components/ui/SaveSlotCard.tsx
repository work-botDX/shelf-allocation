import React, { memo } from 'react';
import type { SaveSlotMeta } from '../../types/game';

interface SaveSlotCardProps {
  slot: SaveSlotMeta;
  isSelected: boolean;
  isSaveMode: boolean; // true: セーブ, false: ロード
  onClick: () => void;
  onDelete?: () => void;
}

/**
 * セーブスロットカードコンポーネント
 */
export const SaveSlotCard: React.FC<SaveSlotCardProps> = memo(
  ({ slot, isSelected, isSaveMode, onClick, onDelete }) => {
    const formatDate = (timestamp: number) => {
      if (timestamp === 0) return '--/--/-- --:--';
      const date = new Date(timestamp);
      return date.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatPlayTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getSlotLabel = (slotNumber: number) => {
      if (slotNumber === 0) return 'オートセーブ';
      return `スロット ${slotNumber}`;
    };

    const isEmpty = !slot.exists;
    const canClick = isSaveMode || !isEmpty;

    return (
      <div
        className={`
          relative p-4 rounded-lg border-2 transition-all cursor-pointer
          ${isSelected
            ? 'border-blue-500 bg-blue-500/20'
            : canClick
              ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
              : 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-50'
          }
        `}
        onClick={canClick ? onClick : undefined}
      >
        {/* スロットラベル */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-white font-bold">{getSlotLabel(slot.slotNumber)}</span>
          {slot.slotNumber === 0 && (
            <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">
              自動
            </span>
          )}
        </div>

        {isEmpty ? (
          <div className="text-gray-500 text-sm">--- 空のスロット ---</div>
        ) : (
          <>
            {/* メタデータ */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <div>
                <span className="text-gray-400">章:</span>
                <span className="text-white ml-1">{slot.currentChapter}</span>
              </div>
              <div>
                <span className="text-gray-400">時間:</span>
                <span className="text-white ml-1">{formatPlayTime(slot.playTime)}</span>
              </div>
              <div>
                <span className="text-gray-400">ユニット:</span>
                <span className="text-white ml-1">{slot.playerUnitCount}人</span>
              </div>
              <div>
                <span className="text-gray-400">平均Lv:</span>
                <span className="text-white ml-1">{slot.averageLevel}</span>
              </div>
            </div>

            {/* 保存日時 */}
            <div className="text-xs text-gray-500">
              保存: {formatDate(slot.timestamp)}
            </div>
          </>
        )}

        {/* 削除ボタン（セーブモードでデータがある場合のみ） */}
        {isSaveMode && !isEmpty && slot.slotNumber !== 0 && onDelete && (
          <button
            className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs px-2 py-1 hover:bg-red-500/20 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            削除
          </button>
        )}
      </div>
    );
  }
);

SaveSlotCard.displayName = 'SaveSlotCard';
