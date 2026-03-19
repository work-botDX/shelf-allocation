import React, { memo } from 'react';
import type { Position } from '../../types';

interface ActionMenuProps {
  mapPosition: Position;    // マップ上の位置
  tileSize: number;         // タイルサイズ
  hasAttackableEnemies: boolean;  // 攻撃可能な敵がいるか
  hasSupportPartners: boolean;    // 支援相手がいるか
  onMove: () => void;       // 移動選択時（キャンセル）
  onAttack: () => void;     // 攻撃選択時
  onSupport: () => void;    // 支援選択時
  onWait: () => void;       // 待機選択時（移動確定）
}

const MENU_WIDTH = 80;
const MENU_ITEM_HEIGHT = 28;

export const ActionMenu: React.FC<ActionMenuProps> = memo(({
  mapPosition,
  tileSize,
  hasAttackableEnemies,
  hasSupportPartners,
  onMove,
  onAttack,
  onSupport,
  onWait,
}) => {
  const pixelX = mapPosition.x * tileSize + tileSize + 4;
  const pixelY = mapPosition.y * tileSize;

  const menuItems = [
    { id: 'move', label: '移動', action: onMove, enabled: true },
    { id: 'attack', label: '攻撃', action: onAttack, enabled: hasAttackableEnemies },
    { id: 'support', label: '支援', action: onSupport, enabled: hasSupportPartners },
    { id: 'wait', label: '待機', action: onWait, enabled: true },
  ];

  return (
    <g
      transform={`translate(${pixelX}, ${pixelY})`}
      style={{ pointerEvents: 'all' }}
    >
      {/* 背景 */}
      <rect
        width={MENU_WIDTH}
        height={menuItems.length * MENU_ITEM_HEIGHT}
        fill="#1e293b"
        stroke="#475569"
        strokeWidth={2}
        rx={4}
      />

      {/* メニューアイテム */}
      {menuItems.map((item, index) => (
        <g
          key={item.id}
          onClick={(e) => {
            e.stopPropagation();
            if (item.enabled) {
              item.action();
            }
          }}
          style={{ cursor: item.enabled ? 'pointer' : 'not-allowed' }}
        >
          <rect
            y={index * MENU_ITEM_HEIGHT}
            width={MENU_WIDTH}
            height={MENU_ITEM_HEIGHT}
            fill="transparent"
            className={item.enabled ? 'hover:fill-slate-700' : ''}
          />
          <text
            x={MENU_WIDTH / 2}
            y={index * MENU_ITEM_HEIGHT + MENU_ITEM_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={item.enabled ? 'white' : '#6b7280'}
            fontSize={12}
            fontFamily="sans-serif"
          >
            {item.label}
          </text>
        </g>
      ))}
    </g>
  );
});

ActionMenu.displayName = 'ActionMenu';
