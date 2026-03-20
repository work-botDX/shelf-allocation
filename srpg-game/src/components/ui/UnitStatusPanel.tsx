import React, { memo } from 'react';
import { useGameStore, useUnitStore } from '../../store';
import type { SupportBond } from '../../types/unit';

// クラス名を取得
function getClassName(unitClass: string): string {
  const classNames: Record<string, string> = {
    lord: 'ロード',
    knight: 'アーマーナイト',
    cavalier: 'ソシアルナイト',
    archer: 'アーチャー',
    mage: '魔道士',
    priest: '僧侶',
    thief: '盗賊',
    fighter: '戦士',
    pegasus: 'ペガサスライダー',
    wyvern: 'ワイバーンライダー',
  };
  return classNames[unitClass] ?? unitClass;
}

// 陣営カラー
const FACTION_COLORS: Record<string, string> = {
  player: 'bg-blue-600',
  enemy: 'bg-red-600',
  ally: 'bg-green-600',
  neutral: 'bg-gray-600',
};

// ステータス行
const StatRow: React.FC<{ label: string; value: number; growth?: number }> = memo(
  ({ label, value, growth }) => (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-mono">
        {value.toString().padStart(2, ' ')}
        {growth !== undefined && (
          <span className="text-xs text-gray-500 ml-1">({growth}%)</span>
        )}
      </span>
    </div>
  )
);
StatRow.displayName = 'StatRow';

// 支援バッジ
const SupportBadge: React.FC<{ rank: string; partnerName: string }> = memo(
  ({ rank, partnerName }) => (
    <div className="inline-flex items-center gap-1 bg-purple-900/50 px-2 py-0.5 rounded text-xs">
      <span className="text-purple-300">{partnerName}</span>
      <span className="text-yellow-400 font-bold">{rank}</span>
    </div>
  )
);
SupportBadge.displayName = 'SupportBadge';

export const UnitStatusPanel: React.FC = memo(() => {
  const { selectedUnitId } = useGameStore();
  const { units } = useUnitStore();

  const selectedUnit = selectedUnitId ? units.get(selectedUnitId) : null;

  // パートナー名を取得する関数
  const getPartnerName = (support: SupportBond): string => {
    const partner = units.get(support.partnerId);
    return partner?.name ?? '???';
  };

  if (!selectedUnit) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 text-gray-400 text-sm">
        <p>ユニットを選択してください</p>
      </div>
    );
  }

  const hpPercentage = (selectedUnit.stats.hp / selectedUnit.stats.maxHp) * 100;
  const expForNextLevel = selectedUnit.level * 100;
  const expPercentage = (selectedUnit.experience / expForNextLevel) * 100;

  return (
    <div className="bg-gray-800/80 rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div className={`${FACTION_COLORS[selectedUnit.faction]} px-4 py-2`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold">{selectedUnit.name}</h3>
            <p className="text-white/80 text-xs">
              Lv.{selectedUnit.level} {getClassName(selectedUnit.class)}
            </p>
          </div>
          {selectedUnit.isBoss && (
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
              ボス
            </span>
          )}
        </div>
      </div>

      {/* HP/EXP バー */}
      <div className="px-4 py-2 space-y-2">
        {/* HP */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">HP</span>
            <span className="text-white">
              {selectedUnit.stats.hp}/{selectedUnit.stats.maxHp}
            </span>
          </div>
          <div className="h-3 bg-gray-700 rounded overflow-hidden">
            <div
              className={`h-full transition-all ${
                hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        {/* EXP */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">EXP</span>
            <span className="text-white">
              {selectedUnit.experience}/{expForNextLevel}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ステータス */}
      <div className="px-4 py-2 border-t border-gray-700">
        <h4 className="text-gray-300 text-xs font-bold mb-2">ステータス</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <StatRow label="力" value={selectedUnit.stats.strength} growth={selectedUnit.growthRates.strength} />
          <StatRow label="魔力" value={selectedUnit.stats.magic} growth={selectedUnit.growthRates.magic} />
          <StatRow label="技" value={selectedUnit.stats.skill} growth={selectedUnit.growthRates.skill} />
          <StatRow label="速さ" value={selectedUnit.stats.speed} growth={selectedUnit.growthRates.speed} />
          <StatRow label="幸運" value={selectedUnit.stats.luck} growth={selectedUnit.growthRates.luck} />
          <StatRow label="守備" value={selectedUnit.stats.defense} growth={selectedUnit.growthRates.defense} />
          <StatRow label="魔防" value={selectedUnit.stats.resistance} growth={selectedUnit.growthRates.resistance} />
          <StatRow label="移動" value={selectedUnit.stats.move} />
        </div>
      </div>

      {/* 装備 */}
      <div className="px-4 py-2 border-t border-gray-700">
        <h4 className="text-gray-300 text-xs font-bold mb-2">装備</h4>
        {selectedUnit.equipment.weapon ? (
          <div className="bg-gray-700/50 rounded p-2">
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 text-sm">{selectedUnit.equipment.weapon.name}</span>
              <span className="text-gray-400 text-xs">
                {selectedUnit.equipment.weapon.type.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-1 text-xs">
              <div className="text-center">
                <div className="text-gray-400">威力</div>
                <div className="text-white">{selectedUnit.equipment.weapon.might}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">命中</div>
                <div className="text-white">{selectedUnit.equipment.weapon.hit}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">必殺</div>
                <div className="text-white">{selectedUnit.equipment.weapon.critical}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">射程</div>
                <div className="text-white">{selectedUnit.equipment.weapon.range.join('-')}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">装備なし</div>
        )}
      </div>

      {/* スキル */}
      {selectedUnit.skills.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-700">
          <h4 className="text-gray-300 text-xs font-bold mb-2">スキル</h4>
          <div className="flex flex-wrap gap-1">
            {selectedUnit.skills.map((skill) => (
              <span
                key={skill.id}
                className="bg-purple-900/50 text-purple-200 text-xs px-2 py-0.5 rounded"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 支援 */}
      {selectedUnit.supports.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-700">
          <h4 className="text-gray-300 text-xs font-bold mb-2">支援</h4>
          <div className="flex flex-wrap gap-1">
            {selectedUnit.supports.map((support) => (
              <SupportBadge
                key={support.supportDefinitionId}
                rank={support.currentRank}
                partnerName={getPartnerName(support)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 状態 */}
      <div className="px-4 py-2 border-t border-gray-700">
        <h4 className="text-gray-300 text-xs font-bold mb-2">状態</h4>
        <div className="flex gap-2 text-xs">
          {selectedUnit.hasMoved ? (
            <span className="bg-gray-600 text-gray-300 px-2 py-0.5 rounded">移動済み</span>
          ) : (
            <span className="bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">行動可能</span>
          )}
          {selectedUnit.hasAttacked && (
            <span className="bg-red-900/50 text-red-300 px-2 py-0.5 rounded">攻撃済み</span>
          )}
          {selectedUnit.status.effects.length > 0 && (
            <span className="bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded">
              状態異常
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

UnitStatusPanel.displayName = 'UnitStatusPanel';
