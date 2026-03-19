import React from 'react';
import { useUnitStore } from '../../store/unitStore';
import { SUPPORT_DEFINITIONS, getPointsToNextRank } from '../../data/supportDefinitions';
import type { Unit } from '../../types';

interface SupportMenuProps {
  unit: Unit;
  onClose: () => void;
}

export const SupportMenu: React.FC<SupportMenuProps> = ({ unit, onClose }) => {
  const { units } = useUnitStore();

  // 支援パートナーの情報を取得
  const supportPartners = unit.supports.map((bond) => {
    const partner = units.get(bond.partnerId);
    const definition = SUPPORT_DEFINITIONS.find((d) => d.id === bond.supportDefinitionId);
    const pointsToNext = getPointsToNextRank(bond.currentRank);

    return {
      partner,
      bond,
      definition,
      pointsToNext: pointsToNext ? pointsToNext - bond.currentPoints : null,
    };
  }).filter((sp) => sp.partner);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gradient-to-b from-blue-900 to-indigo-950 p-6 rounded-xl max-w-md shadow-2xl border-2 border-blue-600">
        <h2 className="text-2xl font-bold text-blue-300 mb-4">
          {unit.name} - 支援関係
        </h2>

        {supportPartners.length === 0 ? (
          <p className="text-gray-400 mb-4">支援相手がいません</p>
        ) : (
          <div className="space-y-3 mb-4">
            {supportPartners.map(({ partner, bond, definition, pointsToNext }) => (
              <div key={bond.partnerId} className="bg-black/30 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">{partner!.name}</span>
                  <span className="text-yellow-400 font-bold">ランク {bond.currentRank}</span>
                </div>

                <p className="text-gray-400 text-sm mb-2">{definition?.name}</p>

                <div className="text-xs text-gray-300">
                  <div className="flex justify-between mb-1">
                    <span>支援ポイント:</span>
                    <span>{bond.currentPoints}</span>
                  </div>
                  {pointsToNext !== null && (
                    <div className="flex justify-between">
                      <span>次のランクまで:</span>
                      <span>{pointsToNext}</span>
                    </div>
                  )}
                  {bond.currentRank === 'A' && (
                    <p className="text-green-400 mt-1">最大ランク達成！</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-400 mb-4 p-2 bg-black/20 rounded">
          <p className="font-bold mb-1">支援効果（隣接時）</p>
          <ul className="space-y-1">
            <li>• C: 命中+5, 回避+5</li>
            <li>• B: 命中+10, 回避+10, 必殺+5</li>
            <li>• A: 命中+15, 回避+15, 必殺+10</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold cursor-pointer transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
