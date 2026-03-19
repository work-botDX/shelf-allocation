import React, { memo } from 'react';
import type { TerrainType } from '../../types';

interface TileProps {
  terrain: TerrainType;
  x: number;
  y: number;
  tileSize: number;
  isMoveable?: boolean;
  isAttackable?: boolean;
  isDangerous?: boolean;  // 敵から攻撃される可能性があるマス
  canAttackFromHere?: boolean;  // そこから敵を攻撃できるマス
  isCursor?: boolean;
  isSelected?: boolean;
}

// 地形ごとの色
const TERRAIN_COLORS: Record<TerrainType, string> = {
  plain: '#4a7c59',
  forest: '#2d5a27',
  mountain: '#6b7280',
  water: '#3b82f6',
  wall: '#374151',
  fortress: '#92400e',
  village: '#a16207',
  throne: '#7c2d12',
  door: '#78350f',
  chest: '#ca8a04',
};

export const TileRenderer: React.FC<TileProps> = memo(
  ({ terrain, x, y, tileSize, isMoveable, isAttackable, isDangerous, canAttackFromHere, isCursor, isSelected }) => {
    const baseColor = TERRAIN_COLORS[terrain];

    // オーバーレイ色
    let overlayColor = 'transparent';
    let overlayOpacity = 0;

    if (isAttackable) {
      // 攻撃対象選択中の赤色（最優先）
      overlayColor = '#ef4444';
      overlayOpacity = 0.5;
    } else if (isMoveable) {
      if (canAttackFromHere) {
        // そこから敵を攻撃できる → 青色
        overlayColor = '#3b82f6';
        overlayOpacity = 0.5;
      } else if (isDangerous) {
        // 敵から攻撃される可能性がある → 赤色
        overlayColor = '#ef4444';
        overlayOpacity = 0.4;
      } else {
        // 通常の移動可能 → 緑色
        overlayColor = '#22c55e';
        overlayOpacity = 0.4;
      }
    }

    return (
      <g transform={`translate(${x * tileSize}, ${y * tileSize})`}>
        {/* ベースタイル */}
        <rect
          width={tileSize}
          height={tileSize}
          fill={baseColor}
          stroke="#1a1a2e"
          strokeWidth={1}
        />

        {/* 地形パターン（オプション） */}
        {terrain === 'forest' && (
          <circle cx={tileSize / 2} cy={tileSize / 2} r={tileSize / 4} fill="#1a472a" />
        )}
        {terrain === 'mountain' && (
          <polygon
            points={`${tileSize / 2},5 ${tileSize - 5},${tileSize - 5} 5,${tileSize - 5}`}
            fill="#4b5563"
          />
        )}
        {terrain === 'water' && (
          <path
            d={`M 0 ${tileSize / 2} Q ${tileSize / 4} ${tileSize / 2 - 5} ${tileSize / 2} ${tileSize / 2} T ${tileSize} ${tileSize / 2}`}
            stroke="#60a5fa"
            fill="none"
            strokeWidth={2}
          />
        )}

        {/* 移動/攻撃範囲オーバーレイ */}
        {overlayOpacity > 0 && (
          <rect
            width={tileSize}
            height={tileSize}
            fill={overlayColor}
            opacity={overlayOpacity}
          />
        )}

        {/* カーソル */}
        {isCursor && (
          <rect
            x={2}
            y={2}
            width={tileSize - 4}
            height={tileSize - 4}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={3}
            className="animate-pulse"
          />
        )}

        {/* 選択中ユニット */}
        {isSelected && (
          <rect
            x={1}
            y={1}
            width={tileSize - 2}
            height={tileSize - 2}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        )}
      </g>
    );
  }
);

TileRenderer.displayName = 'TileRenderer';
