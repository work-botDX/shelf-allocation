import type { Position } from './common';

// イベントトリガー種別
export type EventTriggerType =
  | 'chapter_start'      // 章開始時
  | 'chapter_end'        // 章クリア時
  | 'turn_start'         // ターン開始時
  | 'turn_end'           // ターン終了時
  | 'unit_death'         // ユニット死亡時
  | 'position_reached'   // 特定位置到達時
  | 'unit_talk'          // ユニット会話時
  | 'enemy_hp_below'     // 敵HP低下時
  | 'battle_start'       // 戦闘開始時
  | 'battle_end'         // 戦闘終了時
  | 'custom';            // カスタム条件

// 表情タイプ
export type EmotionType = 'normal' | 'happy' | 'sad' | 'angry' | 'surprised' | 'serious' | 'pain';

// 会話ライン
export interface DialogueLine {
  speakerId: string;           // キャラクターID
  text: string;                // セリフ
  emotion?: EmotionType;       // 表情
  effect?: 'shake' | 'flash' | 'fade';  // 画面効果
}

// キャラクター定義（会話用）
export interface DialogueCharacter {
  id: string;
  name: string;
  color: string;              // 名前表示色 (Tailwind class)
}

// イベント条件
export interface EventCondition {
  type: 'turn' | 'unit_alive' | 'unit_at_position' | 'flag_set' | 'enemy_count' | 'unit_hp_below';
  params: Record<string, unknown>;
}

// イベントアクション（拡張版）
export interface StoryEventAction {
  type: 'dialogue' | 'spawn_unit' | 'remove_unit' | 'give_item' | 'change_terrain'
      | 'camera_move' | 'wait' | 'set_flag' | 'unlock_chapter' | 'game_over' | 'heal_unit';
  data: Record<string, unknown>;
}

// ストーリーイベント定義
export interface StoryEvent {
  id: string;
  chapterId: string;
  trigger: EventTriggerType;
  conditions?: EventCondition[];
  priority: number;           // 実行優先度（高いほど先）
  repeatable: boolean;        // 繰り返し可能か

  // 表示内容
  title?: string;
  dialogue: DialogueLine[];
  actions?: StoryEventAction[];

  // 終了後処理
  onComplete?: StoryEventAction[];
}

// イベントコンテキスト（実行時情報）
export interface EventContext {
  currentTurn: number;
  currentPhase: string;
  triggerUnitId?: string;
  targetPosition?: Position;
  additionalData?: Record<string, unknown>;
}

// 章定義
export interface ChapterDefinition {
  id: string;
  number: number;
  title: string;
  subtitle?: string;

  // マップ情報
  mapId: string;

  // イベントID
  startEventId?: string;
  endEventId?: string;

  // プレイヤーユニット初期配置
  playerUnits: Array<{
    definitionId: string;
    position: Position;
    level: number;
    required?: boolean;  // 必須ユニット（死亡で敗北）
  }>;

  // 次の章
  nextChapterId?: string;
}
