import React, { memo } from 'react';
import type { Position } from '../../types';
import type { BattlePreviewData } from '../../types/combat';

interface BattlePreviewProps {
  previewData: BattlePreviewData;
  position: Position;
  tileSize: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 200;
const BUTTON_WIDTH = 80;
const BUTTON_HEIGHT = 28;

// 支援ボーナス表示コンポーネント
const SupportBonusDisplay: React.FC<{
  supportBonus: BattlePreviewData['attackerSupportBonus'];
  x: number;
  y: number;
}> = ({ supportBonus, x, y }) => {
  if (!supportBonus) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        x={0}
        y={0}
        fill="#4ade80"
        fontSize={9}
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        ★支援
      </text>
      <text x={0} y={12} fill="#4ade80" fontSize={8} fontFamily="sans-serif">
        {supportBonus.partnerNames.join('・')}
      </text>
    </g>
  );
};

export const BattlePreview: React.FC<BattlePreviewProps> = memo(({
  previewData,
  position,
  tileSize,
  onConfirm,
  onCancel,
}) => {
  const pixelX = position.x * tileSize + tileSize + 4;
  const pixelY = position.y * tileSize;

  return (
    <g
      transform={`translate(${pixelX}, ${pixelY})`}
      style={{ pointerEvents: 'all' }}
    >
      {/* 背景 */}
      <rect
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
        fill="#1e293b"
        stroke="#475569"
        strokeWidth={2}
        rx={4}
      />

      {/* タイトル */}
      <text
        x={PANEL_WIDTH / 2}
        y={16}
        textAnchor="middle"
        fill="#f1f5f9"
        fontSize={14}
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        戦闘プレビュー
      </text>

      {/* 攻撃者情報 */}
      <g transform="translate(10, 30)">
        <text x={0} y={0} fill="#60a5fa" fontSize={12} fontFamily="sans-serif" fontWeight="bold">
          {previewData.attackerName}
        </text>
        <text x={0} y={18} fill="#e2e8f0" fontSize={10} fontFamily="sans-serif">
          HP: {previewData.attackerHp.current}/{previewData.attackerHp.max}
        </text>
        <text x={0} y={32} fill="#94a3b8" fontSize={10} fontFamily="sans-serif">
          武器: {previewData.attackerWeapon}
        </text>
        <text x={0} y={48} fill="#fbbf24" fontSize={10} fontFamily="sans-serif">
          与Dmg: {previewData.attackerDamage}
          {previewData.attackerSupportBonus && (
            <tspan fill="#4ade80"> (+{previewData.attackerSupportBonus.bonuses.attack})</tspan>
          )}
        </text>
        <text x={0} y={62} fill="#fbbf24" fontSize={10} fontFamily="sans-serif">
          命中: {previewData.attackerHitRate}%
          {previewData.attackerSupportBonus && (
            <tspan fill="#4ade80"> (+{previewData.attackerSupportBonus.bonuses.hit})</tspan>
          )}
        </text>
        <text x={0} y={76} fill="#f87171" fontSize={10} fontFamily="sans-serif">
          必殺: {previewData.attackerCritRate}%
        </text>
        <text x={0} y={90} fill="#a78bfa" fontSize={10} fontFamily="sans-serif">
          追撃: {previewData.attackerDouble ? 'あり' : 'なし'}
        </text>
        {/* 支援ボーナス */}
        <SupportBonusDisplay
          supportBonus={previewData.attackerSupportBonus}
          x={0}
          y={104}
        />
      </g>

      {/* VS */}
      <text
        x={PANEL_WIDTH / 2}
        y={70}
        textAnchor="middle"
        fill="#f87171"
        fontSize={16}
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        VS
      </text>

      {/* 防御者情報 */}
      <g transform="translate(170, 30)">
        <text x={0} y={0} fill="#f87171" fontSize={12} fontFamily="sans-serif" fontWeight="bold">
          {previewData.defenderName}
        </text>
        <text x={0} y={18} fill="#e2e8f0" fontSize={10} fontFamily="sans-serif">
          HP: {previewData.defenderHp.current}/{previewData.defenderHp.max}
        </text>
        <text x={0} y={32} fill="#94a3b8" fontSize={10} fontFamily="sans-serif">
          武器: {previewData.defenderWeapon}
        </text>
        <text x={0} y={48} fill="#fbbf24" fontSize={10} fontFamily="sans-serif">
          与Dmg: {previewData.defenderDamage}
          {previewData.defenderSupportBonus && (
            <tspan fill="#4ade80"> (+{previewData.defenderSupportBonus.bonuses.attack})</tspan>
          )}
        </text>
        <text x={0} y={62} fill="#fbbf24" fontSize={10} fontFamily="sans-serif">
          命中: {previewData.defenderHitRate}%
          {previewData.defenderSupportBonus && (
            <tspan fill="#4ade80"> (+{previewData.defenderSupportBonus.bonuses.hit})</tspan>
          )}
        </text>
        <text x={0} y={76} fill="#f87171" fontSize={10} fontFamily="sans-serif">
          必殺: {previewData.defenderCritRate}%
        </text>
        <text x={0} y={90} fill="#a78bfa" fontSize={10} fontFamily="sans-serif">
          追撃: {previewData.defenderDouble ? 'あり' : 'なし'}
        </text>
        {/* 支援ボーナス */}
        <SupportBonusDisplay
          supportBonus={previewData.defenderSupportBonus}
          x={0}
          y={104}
        />
      </g>

      {/* ボタン */}
      <g transform={`translate(${(PANEL_WIDTH - BUTTON_WIDTH * 2 - 20) / 2}, ${PANEL_HEIGHT - 40})`}>
        {/* 攻撃ボタン */}
        <g
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            width={BUTTON_WIDTH}
            height={BUTTON_HEIGHT}
            fill="#dc2626"
            stroke="#f87171"
            strokeWidth={1}
            rx={4}
          />
          <text
            x={BUTTON_WIDTH / 2}
            y={BUTTON_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={12}
            fontFamily="sans-serif"
          >
            攻撃
          </text>
        </g>

        {/* キャンセルボタン */}
        <g
          transform={`translate(${BUTTON_WIDTH + 20}, 0)`}
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            width={BUTTON_WIDTH}
            height={BUTTON_HEIGHT}
            fill="#475569"
            stroke="#64748b"
            strokeWidth={1}
            rx={4}
          />
          <text
            x={BUTTON_WIDTH / 2}
            y={BUTTON_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={12}
            fontFamily="sans-serif"
          >
            キャンセル
          </text>
        </g>
      </g>
    </g>
  );
});

BattlePreview.displayName = 'BattlePreview';
