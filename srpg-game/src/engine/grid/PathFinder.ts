import type { Position, Tile, Unit } from '../../types';

interface PathNode {
  pos: Position;
  g: number; // 開始からのコスト
  h: number; // ヒューリスティック（ゴールまでの推定コスト）
  f: number; // g + h
  parent: PathNode | null;
}

/**
 * A*経路探索
 */
export class PathFinder {
  private tiles: Tile[][];

  constructor(tiles: Tile[][]) {
    this.tiles = tiles;
  }

  /**
   * 経路探索（A*アルゴリズム）
   */
  findPath(start: Position, end: Position, unit: Unit): Position[] {
    if (!this.isValidPosition(start) || !this.isValidPosition(end)) {
      return [];
    }

    const openList: PathNode[] = [];
    const closedSet = new Set<string>();

    // 開始ノード
    const startNode: PathNode = {
      pos: start,
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    while (openList.length > 0) {
      // f値が最小のノードを取得
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      // ゴールに到達
      if (current.pos.x === end.x && current.pos.y === end.y) {
        return this.reconstructPath(current);
      }

      const currentKey = `${current.pos.x},${current.pos.y}`;
      closedSet.add(currentKey);

      // 隣接ノードを探索
      const neighbors = this.getNeighbors(current.pos);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        if (closedSet.has(neighborKey)) continue;

        const tile = this.getTile(neighbor);
        if (!tile) continue;

        const moveCost = this.getMovementCost(tile, unit.movementType);
        if (moveCost === 255) continue; // 通行不可

        const g = current.g + moveCost;
        const h = this.heuristic(neighbor, end);
        const f = g + h;

        // 既にオープンリストにあるか確認
        const existingNode = openList.find(
          (n) => n.pos.x === neighbor.x && n.pos.y === neighbor.y
        );

        if (existingNode) {
          // より良い経路が見つかった場合
          if (g < existingNode.g) {
            existingNode.g = g;
            existingNode.f = f;
            existingNode.parent = current;
          }
        } else {
          openList.push({
            pos: neighbor,
            g,
            h,
            f,
            parent: current,
          });
        }
      }
    }

    // 経路が見つからなかった
    return [];
  }

  /**
   * 経路の再構築
   */
  private reconstructPath(node: PathNode): Position[] {
    const path: Position[] = [];
    let current: PathNode | null = node;

    while (current) {
      path.unshift(current.pos);
      current = current.parent;
    }

    return path;
  }

  /**
   * ヒューリスティック関数（マンハッタン距離）
   */
  private heuristic(from: Position, to: Position): number {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
  }

  /**
   * 有効な位置かチェック
   */
  private isValidPosition(pos: Position): boolean {
    return (
      pos.x >= 0 &&
      pos.x < this.tiles[0]?.length &&
      pos.y >= 0 &&
      pos.y < this.tiles.length
    );
  }

  /**
   * タイルを取得
   */
  private getTile(pos: Position): Tile | undefined {
    return this.tiles[pos.y]?.[pos.x];
  }

  /**
   * 隣接する4方向の位置を取得
   */
  private getNeighbors(pos: Position): Position[] {
    return [
      { x: pos.x, y: pos.y - 1 },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x - 1, y: pos.y },
      { x: pos.x + 1, y: pos.y },
    ].filter((p) => this.isValidPosition(p));
  }

  /**
   * 移動コストを取得
   */
  private getMovementCost(tile: Tile, movementType: string): number {
    return tile.effects.movementCost[movementType] ?? 1;
  }

  /**
   * タイル更新
   */
  updateTiles(tiles: Tile[][]): void {
    this.tiles = tiles;
  }
}
