import type { Position, Tile, Unit } from '../../types';

/**
 * グリッドシステム
 * マップ上の位置計算、移動範囲計算などを担当
 */
export class GridSystem {
  private width: number;
  private height: number;
  private tiles: Tile[][];

  constructor(tiles: Tile[][]) {
    this.tiles = tiles;
    this.height = tiles.length;
    this.width = tiles[0]?.length ?? 0;
  }

  /**
   * 移動可能範囲を計算（BFSベース）
   */
  calculateMoveableRange(unit: Unit, startPosition: Position): Position[] {
    const movePower = unit.stats.move;
    const visited = new Set<string>();
    const result: Position[] = [];
    const queue: Array<{ pos: Position; remainingMove: number }> = [
      { pos: startPosition, remainingMove: movePower },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.pos.x},${current.pos.y}`;

      if (visited.has(key)) continue;
      visited.add(key);
      result.push(current.pos);

      // 4方向を探索
      const neighbors = this.getNeighbors(current.pos);
      for (const neighbor of neighbors) {
        const tile = this.getTile(neighbor);
        if (!tile) continue;

        // 移動コストを取得（ユニットの移動タイプに基づく）
        const moveCost = this.getMovementCost(tile, unit.movementType);
        if (moveCost === 255) continue; // 通行不可

        const remainingMove = current.remainingMove - moveCost;

        if (remainingMove >= 0) {
          queue.push({ pos: neighbor, remainingMove });
        }
      }
    }

    return result;
  }

  /**
   * 攻撃可能範囲を計算
   */
  calculateAttackRange(
    unit: Unit,
    moveablePositions: Position[]
  ): Position[] {
    const weapon = unit.equipment.weapon;
    if (!weapon) return [];

    const ranges = weapon.range;
    const attackPositions = new Set<string>();

    for (const movePos of moveablePositions) {
      for (const range of ranges) {
        // マンハッタン距離でrange以内の位置を追加
        this.getPositionsAtDistance(movePos, range).forEach((pos) =>
          attackPositions.add(`${pos.x},${pos.y}`)
        );
      }
    }

    return Array.from(attackPositions).map((key) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y };
    });
  }

  /**
   * 指定距離にある全ての位置を取得
   */
  getPositionsAtDistance(center: Position, distance: number): Position[] {
    const positions: Position[] = [];

    for (let dx = -distance; dx <= distance; dx++) {
      for (let dy = -distance; dy <= distance; dy++) {
        if (Math.abs(dx) + Math.abs(dy) === distance) {
          const pos = { x: center.x + dx, y: center.y + dy };
          if (this.isValidPosition(pos)) {
            positions.push(pos);
          }
        }
      }
    }

    return positions;
  }

  /**
   * 2点間のマンハッタン距離を計算
   */
  getManhattanDistance(from: Position, to: Position): number {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
  }

  /**
   * 2点間のチェビシェフ距離を計算
   */
  getChebyshevDistance(from: Position, to: Position): number {
    return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
  }

  /**
   * 有効な位置かチェック
   */
  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
  }

  /**
   * タイルを取得
   */
  getTile(pos: Position): Tile | undefined {
    if (!this.isValidPosition(pos)) return undefined;
    return this.tiles[pos.y]?.[pos.x];
  }

  /**
   * 隣接する4方向の位置を取得
   */
  getNeighbors(pos: Position): Position[] {
    return [
      { x: pos.x, y: pos.y - 1 }, // 上
      { x: pos.x, y: pos.y + 1 }, // 下
      { x: pos.x - 1, y: pos.y }, // 左
      { x: pos.x + 1, y: pos.y }, // 右
    ].filter((p) => this.isValidPosition(p));
  }

  /**
   * 移動コストを取得
   */
  private getMovementCost(
    tile: Tile,
    movementType: string
  ): number {
    return tile.effects.movementCost[movementType] ?? 1;
  }

  /**
   * 通行可能かチェック
   */
  isPassable(pos: Position, unit: Unit): boolean {
    const tile = this.getTile(pos);
    if (!tile) return false;

    const moveCost = this.getMovementCost(tile, unit.movementType);
    return moveCost < 255;
  }

  /**
   * タイル更新
   */
  updateTiles(tiles: Tile[][]): void {
    this.tiles = tiles;
    this.height = tiles.length;
    this.width = tiles[0]?.length ?? 0;
  }
}

// シングルトンインスタンス
let gridSystemInstance: GridSystem | null = null;

export function getGridSystem(): GridSystem | null {
  return gridSystemInstance;
}

export function initGridSystem(tiles: Tile[][]): GridSystem {
  gridSystemInstance = new GridSystem(tiles);
  return gridSystemInstance;
}
