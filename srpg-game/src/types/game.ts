import type { Position } from './common';
import type { Unit } from './unit';
import type { MapDefinition } from './map';
import type { BattleResult } from './combat';

// ゲームフェーズ
export type GamePhase =
  | 'player_phase'    // プレイヤーターン
  | 'enemy_phase'     // 敵ターン
  | 'ally_phase'      // 味方ターン（NPC）
  | 'battle'          // 戦闘中
  | 'event'           // イベント中
  | 'menu';           // メニュー開いている

// ゲーム結果
export type GameResult = 'playing' | 'victory' | 'defeat';

// インタラクションフェーズ（ユーザー操作状態）
export type InteractionPhase =
  | 'idle'            // 待機状態
  | 'unit_selected'   // ユニット選択済み
  | 'action_menu'     // 行動メニュー表示中
  | 'attack_select'   // 攻撃対象選択中
  | 'battle_preview'; // 戦闘プレビュー表示中

// 選択中の行動
export type SelectedAction = 'move' | 'attack' | 'wait' | 'item' | 'trade' | null;

// ゲーム全体の状態
export interface GameState {
  // 基本状態
  currentPhase: GamePhase;
  currentTurn: number;

  // 選択状態
  selectedUnit: Unit | null;
  cursorPosition: Position;

  // カメラ
  cameraPosition: Position;

  // ゲーム設定
  isPaused: boolean;
  gameSpeed: number;

  // 現在のマップ
  currentMap: MapDefinition | null;

  // フェーズごとの状態
  phaseState: {
    moveablePositions: Position[];
    attackablePositions: Position[];
    currentAction: SelectedAction;
  };

  // 戦闘中のデータ
  battleState: {
    isActive: boolean;
    attacker: Unit | null;
    defender: Unit | null;
    preview: BattleResult | null;
  };
}

// セーブデータ
export interface SaveData {
  id: string;
  timestamp: number;
  playTime: number;
  currentChapter: number;
  gameState: Partial<GameState>;
  units: Unit[];
  inventory: unknown[];
  gold: number;
  supportPoints: Record<string, Record<string, number>>;
  completedChapters: number[];
}

// ゲーム設定
export interface GameSettings {
  textSpeed: 'slow' | 'normal' | 'fast';
  animationSpeed: 'slow' | 'normal' | 'fast';
  autoCursor: boolean;
  showDamagePreview: boolean;
  showEnemyRange: boolean;
  musicVolume: number;
  sfxVolume: number;
}
