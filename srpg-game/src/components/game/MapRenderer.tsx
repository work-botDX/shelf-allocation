import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useGameStore, useMapStore, useUnitStore } from '../../store';
import { TileRenderer } from './TileRenderer';
import { UnitRenderer } from './UnitRenderer';
import { ActionMenu } from './ActionMenu';
import { BattlePreview } from './BattlePreview';
import { SupportMenu } from '../ui/SupportMenu';
import { UnitHoverCard } from '../ui/UnitHoverCard';
import { initGridSystem, getGridSystem } from '../../engine/grid';

interface MapRendererProps {
  tileSize?: number;
}

export const MapRenderer: React.FC<MapRendererProps> = ({ tileSize = 48 }) => {
  const { tiles, currentMap } = useMapStore();
  const {
    cursorPosition,
    moveablePositions,
    attackablePositions,
    selectedUnitId,
    interactionPhase,
    pendingMovePosition,
    attackableEnemies,
    battlePreviewData,
    hoveredUnitId,
    moveCursor,
    selectUnit,
    setMoveablePositions,
    setInteractionPhase,
    showActionMenu,
    confirmMove,
    startAttackMode,
    selectTarget,
    executeAttack,
    cancelAttack,
    cancelSelection,
    setHoveredUnit,
  } = useGameStore();
  const { units, getUnitAt, getEnemyUnits } = useUnitStore();

  // 支援メニュー表示状態
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [supportMenuUnit, setSupportMenuUnit] = useState<import('../../types/unit').Unit | null>(null);

  // グリッドシステム初期化
  useEffect(() => {
    if (tiles.length > 0) {
      initGridSystem(tiles);
    }
  }, [tiles]);

  // 移動可能位置のセット
  const moveableSet = useMemo(() => {
    return new Set(moveablePositions.map((p) => `${p.x},${p.y}`));
  }, [moveablePositions]);

  // 攻撃可能位置のセット
  const attackableSet = useMemo(() => {
    return new Set(attackablePositions.map((p) => `${p.x},${p.y}`));
  }, [attackablePositions]);

  // 危険マス（敵から攻撃される可能性があるマス）のセット
  const dangerousSet = useMemo(() => {
    if (interactionPhase !== 'unit_selected' || moveablePositions.length === 0) {
      return new Set<string>();
    }

    const gridSystem = getGridSystem();
    if (!gridSystem) return new Set<string>();

    const enemies = getEnemyUnits();
    const dangerousPositions = new Set<string>();

    // 各敵ユニットの攻撃範囲を計算
    for (const enemy of enemies) {
      if (!enemy.equipment.weapon) continue;

      const weapon = enemy.equipment.weapon;
      const ranges = weapon.range;

      // 敵の現在位置から攻撃可能な範囲
      for (const range of ranges) {
        const attackPositions = gridSystem.getPositionsAtDistance(enemy.position, range);
        for (const pos of attackPositions) {
          // 移動可能マスと重なる部分を危険マスとする
          if (moveableSet.has(`${pos.x},${pos.y}`)) {
            dangerousPositions.add(`${pos.x},${pos.y}`);
          }
        }
      }
    }

    return dangerousPositions;
  }, [interactionPhase, moveablePositions, moveableSet, getEnemyUnits]);

  // 攻撃可能マス（そこから敵を攻撃できるマス）のセット
  const canAttackFromHereSet = useMemo(() => {
    if (interactionPhase !== 'unit_selected' || !selectedUnitId || moveablePositions.length === 0) {
      return new Set<string>();
    }

    const gridSystem = getGridSystem();
    if (!gridSystem) return new Set<string>();

    const selectedUnit = units.get(selectedUnitId);
    if (!selectedUnit || !selectedUnit.equipment.weapon) return new Set<string>();

    const weapon = selectedUnit.equipment.weapon;
    const ranges = weapon.range;
    const enemies = getEnemyUnits();
    const enemyPositions = new Set(enemies.map(e => `${e.position.x},${e.position.y}`));

    const canAttackPositions = new Set<string>();

    // 各移動可能マスについて、そこから敵を攻撃できるかチェック
    for (const movePos of moveablePositions) {
      for (const range of ranges) {
        const attackPositions = gridSystem.getPositionsAtDistance(movePos, range);
        for (const pos of attackPositions) {
          if (enemyPositions.has(`${pos.x},${pos.y}`)) {
            canAttackPositions.add(`${movePos.x},${movePos.y}`);
            break; // 1つでも攻撃できる敵があればOK
          }
        }
        if (canAttackPositions.has(`${movePos.x},${movePos.y}`)) break;
      }
    }

    return canAttackPositions;
  }, [interactionPhase, selectedUnitId, moveablePositions, units, getEnemyUnits]);

  // 支援パートナーがいるかチェック
  const hasSupportPartners = useMemo(() => {
    if (!selectedUnitId) return false;
    const selectedUnit = units.get(selectedUnitId);
    if (!selectedUnit) return false;
    return selectedUnit.supports.length > 0;
  }, [selectedUnitId, units]);

  // 支援メニューを開く
  const handleOpenSupportMenu = useCallback(() => {
    if (!selectedUnitId) return;
    const unit = units.get(selectedUnitId);
    if (unit) {
      setSupportMenuUnit(unit);
      setShowSupportMenu(true);
    }
  }, [selectedUnitId, units]);

  // 支援メニューを閉じる
  const handleCloseSupportMenu = useCallback(() => {
    setShowSupportMenu(false);
    setSupportMenuUnit(null);
  }, []);

  // マップ幅・高さ
  const mapWidth = tiles[0]?.length ?? 0;
  const mapHeight = tiles.length;

  // タイルクリック処理
  const handleTileClick = useCallback(
    (x: number, y: number) => {
      const clickedPos = { x, y };
      moveCursor(clickedPos);

      // 戦闘プレビュー表示中は無視
      if (interactionPhase === 'battle_preview') return;

      // 行動メニュー表示中は無視
      if (interactionPhase === 'action_menu') return;

      // 攻撃対象選択中
      if (interactionPhase === 'attack_select') {
        // クリックした位置に敵がいるか確認
        const unit = getUnitAt(clickedPos);
        if (unit && unit.faction === 'enemy' && attackableSet.has(`${x},${y}`)) {
          selectTarget(unit.id);
        }
        return;
      }

      // ユニット選択済み状態でのクリック
      if (interactionPhase === 'unit_selected') {
        // 選択中のユニットを再クリックしたらキャンセル
        const unit = getUnitAt(clickedPos);
        if (unit && unit.id === selectedUnitId) {
          cancelSelection();
          return;
        }

        const isMoveable = moveableSet.has(`${x},${y}`);
        if (isMoveable) {
          showActionMenu(clickedPos);
        }
        return;
      }

      // 待機状態でのクリック
      if (interactionPhase === 'idle') {
        const unit = getUnitAt(clickedPos);
        if (unit && unit.faction === 'player' && !unit.hasMoved) {
          selectUnit(unit);
          setInteractionPhase('unit_selected');

          // 移動範囲計算
          const gridSystem = getGridSystem();
          if (gridSystem) {
            const moveable = gridSystem.calculateMoveableRange(unit, unit.position);
            setMoveablePositions(moveable);
          }
        }
      }
    },
    [
      moveCursor,
      getUnitAt,
      selectUnit,
      setMoveablePositions,
      interactionPhase,
      moveableSet,
      attackableSet,
      showActionMenu,
      setInteractionPhase,
      selectTarget,
      selectedUnitId,
      cancelSelection,
    ]
  );

  if (!currentMap || tiles.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white">
        <p>マップを読み込んでください</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <svg
        width={mapWidth * tileSize}
        height={mapHeight * tileSize}
        className="block"
      >
        {/* タイルレイヤー */}
        {tiles.map((row, y) =>
          row.map((tile, x) => {
            const key = `${x},${y}`;
            const isCursor =
              cursorPosition.x === x && cursorPosition.y === y;
            const isMoveable = moveableSet.has(key);
            const isAttackable = attackableSet.has(key);
            const isDangerous = dangerousSet.has(key);
            const canAttackFromHere = canAttackFromHereSet.has(key);

            return (
              <g key={key} onClick={() => handleTileClick(x, y)} style={{ cursor: 'pointer' }}>
                <TileRenderer
                  terrain={tile.terrain}
                  x={x}
                  y={y}
                  tileSize={tileSize}
                  isMoveable={isMoveable}
                  isAttackable={isAttackable}
                  isDangerous={isDangerous}
                  canAttackFromHere={canAttackFromHere}
                  isCursor={isCursor}
                />
              </g>
            );
          })
        )}

        {/* ユニットレイヤー */}
        {Array.from(units.values()).map((unit) => (
          <UnitRenderer
            key={unit.id}
            unit={unit}
            tileSize={tileSize}
            isSelected={selectedUnitId === unit.id}
            hasMoved={unit.hasMoved}
            isHovered={hoveredUnitId === unit.id}
            onClick={() => handleTileClick(unit.position.x, unit.position.y)}
            onMouseEnter={() => setHoveredUnit(unit.id)}
            onMouseLeave={() => setHoveredUnit(null)}
          />
        ))}

        {/* ホバーカード */}
        {hoveredUnitId && (() => {
          const hoveredUnit = units.get(hoveredUnitId);
          if (!hoveredUnit) return null;
          return (
            <UnitHoverCard
              unit={hoveredUnit}
              pixelPosition={{
                x: hoveredUnit.position.x * tileSize,
                y: hoveredUnit.position.y * tileSize,
              }}
              tileSize={tileSize}
              mapWidth={mapWidth}
              mapHeight={mapHeight}
            />
          );
        })()}

        {/* 行動メニュー */}
        {interactionPhase === 'action_menu' && pendingMovePosition && (
          <ActionMenu
            mapPosition={pendingMovePosition}
            tileSize={tileSize}
            hasAttackableEnemies={attackableEnemies.length > 0}
            hasSupportPartners={hasSupportPartners}
            onCancel={cancelSelection}
            onAttack={startAttackMode}
            onSupport={handleOpenSupportMenu}
            onWait={confirmMove}
          />
        )}

        {/* 戦闘プレビュー */}
        {interactionPhase === 'battle_preview' && battlePreviewData && pendingMovePosition && (
          <BattlePreview
            previewData={battlePreviewData}
            position={pendingMovePosition}
            tileSize={tileSize}
            onConfirm={executeAttack}
            onCancel={cancelAttack}
          />
        )}
      </svg>

      {/* 支援メニュー */}
      {showSupportMenu && supportMenuUnit && (
        <SupportMenu
          unit={supportMenuUnit}
          onClose={handleCloseSupportMenu}
        />
      )}
    </div>
  );
};
