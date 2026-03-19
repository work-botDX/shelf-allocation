import { useGameStore } from '../../store/gameStore';
import type { StatKey } from '../../types/growth';

const STAT_NAMES: Record<StatKey, string> = {
  hp: 'HP',
  strength: '力',
  magic: '魔力',
  skill: '技',
  speed: '速さ',
  luck: '幸運',
  defense: '守備',
  resistance: '魔防',
};

/**
 * レベルアップ通知モーダル
 * Phase 6: 成長システム
 */
export function LevelUpModal() {
  const { levelUpQueue, dismissLevelUp } = useGameStore();

  if (levelUpQueue.length === 0) {
    return null;
  }

  const currentResult = levelUpQueue[0];
  const { unitName, newLevel, statIncreases, newSkills } = currentResult;

  const hasStatIncreases = Object.keys(statIncreases).length > 0;
  const hasNewSkills = newSkills.length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gradient-to-b from-yellow-900 to-amber-950 p-6 rounded-xl text-center max-w-sm shadow-2xl border-2 border-yellow-600">
        {/* ヘッダー */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-yellow-400 animate-pulse drop-shadow-lg">
            レベルアップ！
          </h2>
          <p className="text-white text-xl mt-2">
            {unitName} <span className="text-yellow-300">Lv.{newLevel}</span>
          </p>
        </div>

        {/* ステータス上昇 */}
        {hasStatIncreases && (
          <div className="bg-black/30 rounded-lg p-3 mb-4">
            <h3 className="text-yellow-300 text-sm mb-2 font-bold">ステータス上昇</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {(Object.entries(statIncreases) as [StatKey, number][]).map(([stat, value]) => (
                <div key={stat} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{STAT_NAMES[stat]}</span>
                  <span className="text-green-400 font-bold">+{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 新スキル習得 */}
        {hasNewSkills && (
          <div className="bg-black/30 rounded-lg p-3 mb-4">
            <h3 className="text-purple-300 text-sm mb-2 font-bold">スキル習得</h3>
            {newSkills.map((skill) => (
              <div key={skill.id} className="text-left">
                <p className="text-purple-200 font-bold">{skill.name}</p>
                <p className="text-gray-400 text-xs">{skill.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* 何も上昇しなかった場合 */}
        {!hasStatIncreases && !hasNewSkills && (
          <div className="bg-black/30 rounded-lg p-3 mb-4">
            <p className="text-gray-400 text-sm">ステータスは上がらなかった...</p>
          </div>
        )}

        {/* 閉じるボタン */}
        <button
          onClick={dismissLevelUp}
          className="px-8 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-colors cursor-pointer shadow-lg"
        >
          閉じる
        </button>

        {/* 複数レベルアップ時のインジケーター */}
        {levelUpQueue.length > 1 && (
          <p className="text-gray-400 text-xs mt-3">
            残り {levelUpQueue.length - 1} 回のレベルアップ
          </p>
        )}
      </div>
    </div>
  );
}
