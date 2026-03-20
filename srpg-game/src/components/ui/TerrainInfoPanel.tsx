import React, { memo, useMemo } from 'react';
import { useGameStore, useMapStore } from '../../store';
import { TERRAIN_DEFINITIONS } from '../../types/map';
import type { TerrainType } from '../../types/map';

// 地形名を取得
function getTerrainName(terrain: TerrainType): string {
  const terrainNames: Record<TerrainType, string> = {
    plain: '平地',
    forest: '森',
    mountain: '山',
    water: '水',
    wall: '壁',
    fortress: '砦',
    village: '村',
    throne: '玉座',
    door: '扉',
    chest: '宝箱',
  };
  return terrainNames[terrain] ?? terrain;
}

// 地形アイコン（簡易版）
function getTerrainIcon(terrain: TerrainType): string {
  const icons: Record<TerrainType, string> = {
    plain: '🌿',
    forest: '🌲',
    mountain: '⛰️',
    water: '💧',
    fortress: '🏰',
    village: '🏘️',
    wall: '🧱',
    throne: '👑',
    chest: '📦',
    door: '🚪',
  };
  return icons[terrain] ?? '?';
}

// 地形カラー
function getTerrainColor(terrain: TerrainType): string {
  const colors: Record<TerrainType, string> = {
    plain: 'bg-green-900/50',
    forest: 'bg-emerald-900/50',
    mountain: 'bg-stone-700/50',
    water: 'bg-blue-900/50',
    fortress: 'bg-amber-900/50',
    village: 'bg-yellow-900/50',
    wall: 'bg-gray-700/50',
    throne: 'bg-yellow-700/50',
    chest: 'bg-orange-900/50',
    door: 'bg-amber-800/50',
  };
  return colors[terrain] ?? 'bg-gray-700/50';
}

// 移動コスト表示
const MovementCost: React.FC<{ type: string; cost: number }> = memo(({ type, cost }) => {
  const typeNames: Record<string, string> = {
    foot: '歩兵',
    armored: '重装',
    mounted: '騎馬',
    flying: '飛行',
  };

  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{typeNames[type] ?? type}</span>
      <span className={cost >= 99 ? 'text-red-400' : 'text-white'}>{cost >= 99 ? '不可' : cost}</span>
    </div>
  );
});
MovementCost.displayName = 'MovementCost';

export const TerrainInfoPanel: React.FC = memo(() => {
  const { cursorPosition } = useGameStore();
  const { tiles } = useMapStore();

  // カーソル位置の地形を取得
  const terrain = useMemo(() => {
    if (!tiles.length) return null;
    const row = tiles[cursorPosition.y];
    if (!row) return null;
    return row[cursorPosition.x];
  }, [tiles, cursorPosition]);

  if (!terrain) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 text-gray-400 text-sm">
        <p>地形情報なし</p>
      </div>
    );
  }

  const terrainDef = TERRAIN_DEFINITIONS[terrain.terrain];

  return (
    <div className={`${getTerrainColor(terrain.terrain)} rounded-lg overflow-hidden`}>
      {/* ヘッダー */}
      <div className="bg-gray-900/50 px-3 py-2 flex items-center gap-2">
        <span className="text-lg">{getTerrainIcon(terrain.terrain)}</span>
        <div>
          <h3 className="text-white font-bold text-sm">{getTerrainName(terrain.terrain)}</h3>
          <p className="text-gray-400 text-xs">
            ({cursorPosition.x}, {cursorPosition.y})
          </p>
        </div>
      </div>

      {/* 地形効果 */}
      <div className="px-3 py-2 space-y-1">
        <h4 className="text-gray-300 text-xs font-bold">地形効果</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-400">回避</div>
            <div className="text-white font-mono">+{terrainDef.avoidBonus}%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">守備</div>
            <div className="text-white font-mono">+{terrainDef.defenseBonus}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">魔防</div>
            <div className="text-white font-mono">+{terrainDef.resistanceBonus}</div>
          </div>
        </div>

        {/* 回復効果 */}
        {terrainDef.healRate > 0 && (
          <div className="mt-2 text-xs">
            <span className="text-green-400">💚 ターン開始時HP回復: {terrainDef.healRate}%</span>
          </div>
        )}
      </div>

      {/* 移動コスト */}
      <div className="px-3 py-2 border-t border-gray-700/50">
        <h4 className="text-gray-300 text-xs font-bold mb-1">移動コスト</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <MovementCost type="foot" cost={terrainDef.movementCost.foot} />
          <MovementCost type="armored" cost={terrainDef.movementCost.armored} />
          <MovementCost type="mounted" cost={terrainDef.movementCost.mounted} />
          <MovementCost type="flying" cost={terrainDef.movementCost.flying} />
        </div>
      </div>
    </div>
  );
});

TerrainInfoPanel.displayName = 'TerrainInfoPanel';
