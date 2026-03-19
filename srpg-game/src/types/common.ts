// 基本的な座標型
export interface Position {
  x: number;
  y: number;
}

// 方向
export type Direction = 'up' | 'down' | 'left' | 'right';

// 陣営
export type Faction = 'player' | 'enemy' | 'ally' | 'neutral';

// ユニットクラス（職業）
export type UnitClass =
  | 'lord'      // 主人公系
  | 'knight'    // 重装騎士
  | 'cavalier'  // 騎馬兵
  | 'archer'    // 弓兵
  | 'mage'      // 魔道士
  | 'priest'    // 僧侶
  | 'thief'     // 盗賊
  | 'fighter'   // 戦士
  | 'pegasus'   // ペガサスライダー
  | 'wyvern';   // ワイバーンライダー

// ユニットクラスの移動タイプ
export type MovementType = 'foot' | 'mounted' | 'flying' | 'armored';

// 武器タイプ
export type WeaponType = 'sword' | 'lance' | 'axe' | 'bow' | 'magic' | 'staff';

// 武器ランク
export type WeaponRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

// 状態異常
export type StatusEffect =
  | 'poison'    // 毒
  | 'sleep'     // 睡眠
  | 'silence'   // 沈黙
  | 'berserk'   // 暴走
  | 'freeze';   // 凍結
