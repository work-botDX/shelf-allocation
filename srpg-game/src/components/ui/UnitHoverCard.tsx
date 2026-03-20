import React, { memo } from 'react';
import type { Unit } from '../../types';

interface UnitHoverCardProps {
  unit: Unit;
  pixelPosition: { x: number; y: number };
  tileSize: number;
  mapWidth: number;
  mapHeight: number;
}

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

// 陣営名を取得
function getFactionName(faction: string): string {
  const factionNames: Record<string, string> = {
    player: '味方',
    enemy: '敵',
    ally: '同盟',
    neutral: '中立',
  };
  return factionNames[faction] ?? faction;
}

export const UnitHoverCard: React.FC<UnitHoverCardProps> = memo(
  ({ unit, pixelPosition, tileSize, mapWidth, mapHeight }) => {
    // カードのサイズ
    const cardWidth = 160;
    const cardHeight = 140;

    // カードの位置を計算（マップからはみ出さないように）
    let cardX = pixelPosition.x + tileSize + 8;
    let cardY = pixelPosition.y - 10;

    // 右端にはみ出す場合は左に表示
    if (cardX + cardWidth > mapWidth * tileSize) {
      cardX = pixelPosition.x - cardWidth - 8;
    }

    // 下端にはみ出す場合は上に調整
    if (cardY + cardHeight > mapHeight * tileSize) {
      cardY = mapHeight * tileSize - cardHeight - 10;
    }

    // 上端にはみ出す場合は調整
    if (cardY < 10) {
      cardY = 10;
    }

    const hpPercentage = (unit.stats.hp / unit.stats.maxHp) * 100;

    return (
      <g transform={`translate(${cardX}, ${cardY})`}>
        {/* カード背景 */}
        <rect
          x={0}
          y={0}
          width={cardWidth}
          height={cardHeight}
          rx={8}
          fill="rgba(17, 24, 39, 0.95)"
          stroke={unit.faction === 'player' ? '#3b82f6' : unit.faction === 'enemy' ? '#ef4444' : '#22c55e'}
          strokeWidth={2}
        />

        {/* ヘッダー */}
        <rect
          x={0}
          y={0}
          width={cardWidth}
          height={28}
          rx={8}
          fill={unit.faction === 'player' ? '#3b82f6' : unit.faction === 'enemy' ? '#ef4444' : '#22c55e'}
        />
        <rect
          x={0}
          y={16}
          width={cardWidth}
          height={12}
          fill={unit.faction === 'player' ? '#3b82f6' : unit.faction === 'enemy' ? '#ef4444' : '#22c55e'}
        />

        {/* 名前 */}
        <text
          x={10}
          y={19}
          fill="white"
          fontSize={12}
          fontWeight="bold"
        >
          {unit.name}
        </text>

        {/* クラス・レベル */}
        <text
          x={cardWidth - 10}
          y={19}
          fill="white"
          fontSize={10}
          textAnchor="end"
        >
          Lv{unit.level} {getClassName(unit.class)}
        </text>

        {/* HPバー */}
        <text x={10} y={45} fill="#9ca3af" fontSize={10}>
          HP
        </text>
        <rect x={30} y={36} width={120} height={12} rx={2} fill="#374151" />
        <rect
          x={30}
          y={36}
          width={120 * (hpPercentage / 100)}
          height={12}
          rx={2}
          fill={hpPercentage > 50 ? '#22c55e' : hpPercentage > 25 ? '#f59e0b' : '#ef4444'}
        />
        <text
          x={90}
          y={45}
          fill="white"
          fontSize={9}
          textAnchor="middle"
          fontWeight="bold"
        >
          {unit.stats.hp}/{unit.stats.maxHp}
        </text>

        {/* ステータス */}
        <text x={10} y={65} fill="#d1d5db" fontSize={10}>
          力:{unit.stats.strength} 魔力:{unit.stats.magic}
        </text>
        <text x={90} y={65} fill="#d1d5db" fontSize={10}>
          技:{unit.stats.skill} 速さ:{unit.stats.speed}
        </text>
        <text x={10} y={80} fill="#d1d5db" fontSize={10}>
          守備:{unit.stats.defense} 魔防:{unit.stats.resistance}
        </text>
        <text x={90} y={80} fill="#d1d5db" fontSize={10}>
          幸運:{unit.stats.luck} 移動:{unit.stats.move}
        </text>

        {/* 装備武器 */}
        {unit.equipment.weapon && (
          <>
            <text x={10} y={100} fill="#9ca3af" fontSize={9}>
              武器:
            </text>
            <text x={40} y={100} fill="#fbbf24" fontSize={9}>
              {unit.equipment.weapon.name}
            </text>
          </>
        )}

        {/* 陣営 */}
        <text x={10} y={120} fill="#6b7280" fontSize={9}>
          [{getFactionName(unit.faction)}]
        </text>

        {/* ボスマーク */}
        {unit.isBoss && (
          <text x={cardWidth - 10} y={120} fill="#fbbf24" fontSize={10} textAnchor="end" fontWeight="bold">
            ★ボス
          </text>
        )}
      </g>
    );
  }
);

UnitHoverCard.displayName = 'UnitHoverCard';
