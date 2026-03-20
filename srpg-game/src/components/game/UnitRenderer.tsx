import React, { memo } from 'react';
import type { Unit, Faction } from '../../types';

interface UnitRendererProps {
  unit: Unit;
  tileSize: number;
  isSelected?: boolean;
  hasMoved?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// 陣営ごとの色
const FACTION_COLORS: Record<Faction, { primary: string; secondary: string }> = {
  player: { primary: '#3b82f6', secondary: '#1d4ed8' },
  enemy: { primary: '#ef4444', secondary: '#b91c1c' },
  ally: { primary: '#22c55e', secondary: '#15803d' },
  neutral: { primary: '#a3a3a3', secondary: '#737373' },
};

export const UnitRenderer: React.FC<UnitRendererProps> = memo(
  ({ unit, tileSize, isSelected, hasMoved, isHovered, onClick, onMouseEnter, onMouseLeave }) => {
    const colors = FACTION_COLORS[unit.faction];
    const x = unit.position.x * tileSize;
    const y = unit.position.y * tileSize;

    return (
      <g
        transform={`translate(${x}, ${y})`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {/* ユニット本体 */}
        <rect
          x={tileSize * 0.15}
          y={tileSize * 0.15}
          width={tileSize * 0.7}
          height={tileSize * 0.7}
          rx={4}
          fill={hasMoved ? '#6b7280' : colors.primary}
          stroke={isSelected ? '#fbbf24' : isHovered ? '#fbbf24' : colors.secondary}
          strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
          opacity={isHovered && !isSelected ? 0.9 : 1}
        />

        {/* クラス略称 */}
        <text
          x={tileSize / 2}
          y={tileSize / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={tileSize * 0.35}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {getClassAbbreviation(unit.class)}
        </text>

        {/* HPバー */}
        <rect
          x={tileSize * 0.1}
          y={tileSize * 0.85}
          width={tileSize * 0.8}
          height={tileSize * 0.1}
          fill="#1f2937"
          rx={2}
        />
        <rect
          x={tileSize * 0.1}
          y={tileSize * 0.85}
          width={tileSize * 0.8 * (unit.stats.hp / unit.stats.maxHp)}
          height={tileSize * 0.1}
          fill={unit.stats.hp / unit.stats.maxHp > 0.5 ? '#22c55e' : '#ef4444'}
          rx={2}
        />

        {/* ボスマーク */}
        {unit.isBoss && (
          <circle
            cx={tileSize * 0.85}
            cy={tileSize * 0.15}
            r={tileSize * 0.12}
            fill="#fbbf24"
          />
        )}
      </g>
    );
  }
);

UnitRenderer.displayName = 'UnitRenderer';

// クラス略称を取得
function getClassAbbreviation(unitClass: string): string {
  const abbreviations: Record<string, string> = {
    lord: '主',
    knight: '重',
    cavalier: '騎',
    archer: '弓',
    mage: '魔',
    priest: '僧',
    thief: '盗',
    fighter: '戦',
    pegasus: '天',
    wyvern: '竜',
  };
  return abbreviations[unitClass] ?? '?';
}
