// 支援ランク
export type SupportRank = 'C' | 'B' | 'A';

// ステータスボーナス（部分適用可能）
export interface StatBonuses {
  strength?: number;
  magic?: number;
  skill?: number;
  speed?: number;
  luck?: number;
  defense?: number;
  resistance?: number;
}

// 支援ランク別ボーナス定義
export interface SupportRankBonus {
  rank: SupportRank;
  pointsRequired: number;     // このランクに必要なポイント
  bonuses: StatBonuses;       // ステータスボーナス
  hitBonus: number;           // 命中ボーナス
  avoidBonus: number;         // 回避ボーナス
  critBonus: number;          // 必殺ボーナス
}

// 支援関係定義（ユニット間の支援可能性）
export interface SupportDefinition {
  id: string;
  unit1DefinitionId: string;  // 片方のユニット定義ID
  unit2DefinitionId: string;  // もう片方のユニット定義ID
  name: string;               // 支援名（例：「主従の誓い」）
  rankBonuses: SupportRankBonus[];  // ランク別ボーナス
}

// アクティブ支援ボーナス（戦闘時計算用）
export interface ActiveFormBonus {
  partnerNames: string[];
  rank: SupportRank;
  bonuses: {
    attack: number;
    hit: number;
    avoid: number;
    crit: number;
    defense: number;
    resistance: number;
  };
}

// 支援会話データ
export interface SupportConversationLine {
  speakerId: string;          // 話者のユニット定義ID
  text: string;               // セリフ
  emotion?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised';
}

export interface SupportConversation {
  supportDefinitionId: string;
  rank: SupportRank;
  title: string;              // 会話タイトル
  lines: SupportConversationLine[];
}
