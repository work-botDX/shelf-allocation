import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Position, GamePhase, SelectedAction, Unit, InteractionPhase } from '../types';
import type { BattlePreviewData } from '../types/combat';
import type { GameResult } from '../types/game';
import type { LevelUpResult } from '../types/growth';
import type { SupportConversation } from '../types/support';
import { useUnitStore } from './unitStore';
import { useMapStore } from './mapStore';
import { BattleCalculator } from '../engine/combat';
import { getGridSystem } from '../engine/grid';
import { PhaseManager } from '../core/PhaseManager';
import { AIController } from '../engine/ai';
import { SupportCalculator } from '../engine/support';
import { getSupportConversation } from '../data/supportConversations';

interface GameStore {
  // 状態
  phase: GamePhase;
  turn: number;
  selectedUnitId: string | null;
  cursorPosition: Position;
  cameraPosition: Position;
  isPaused: boolean;
  gameSpeed: number;

  // フェーズ状態
  moveablePositions: Position[];
  attackablePositions: Position[];
  currentAction: SelectedAction;

  // インタラクション状態（Phase 2追加）
  interactionPhase: InteractionPhase;
  pendingMovePosition: Position | null;

  // 攻撃状態（Phase 3追加）
  attackableEnemies: Unit[];
  selectedTargetId: string | null;
  battlePreviewData: BattlePreviewData | null;

  // ゲーム結果（Phase 4追加）
  gameResult: GameResult;
  isPhaseTransitioning: boolean;

  // レベルアップ状態（Phase 6追加）
  levelUpQueue: LevelUpResult[];

  // 支援会話状態（Phase 7追加）
  activeSupportConversation: SupportConversation | null;
  supportRankUpInfo: { unitName: string; partnerName: string; newRank: 'C' | 'B' | 'A' } | null;

  // アクション
  setPhase: (phase: GamePhase) => void;
  nextTurn: () => void;
  selectUnit: (unit: Unit | null) => void;
  moveCursor: (position: Position) => void;
  moveCursorDelta: (delta: Position) => void;
  setMoveablePositions: (positions: Position[]) => void;
  setAttackablePositions: (positions: Position[]) => void;
  setCurrentAction: (action: SelectedAction) => void;
  togglePause: () => void;
  setGameSpeed: (speed: number) => void;

  // インタラクションアクション（Phase 2追加）
  setInteractionPhase: (phase: InteractionPhase) => void;
  setPendingMovePosition: (pos: Position | null) => void;
  showActionMenu: (position: Position) => void;
  hideActionMenu: () => void;
  cancelSelection: () => void;
  confirmMove: () => void;

  // 攻撃アクション（Phase 3追加）
  startAttackMode: () => void;
  selectTarget: (enemyId: string | null) => void;
  executeAttack: () => void;
  cancelAttack: () => void;

  // フェーズ・ターン管理（Phase 4追加）
  endPlayerTurn: () => void;
  endEnemyTurn: () => void;
  executeEnemyAI: () => void;
  executeActionsSequentially: (actions: import('../engine/ai').AIAction[], index: number) => void;
  checkGameEnd: () => GameResult;
  setGameResult: (result: GameResult) => void;
  resetGame: () => void;
  setPhaseTransitioning: (transitioning: boolean) => void;

  // レベルアップアクション（Phase 6追加）
  dismissLevelUp: () => void;

  // 支援会話アクション（Phase 7追加）
  showSupportConversation: (conversation: SupportConversation) => void;
  dismissSupportConversation: () => void;
  showSupportRankUp: (unitName: string, partnerName: string, newRank: 'C' | 'B' | 'A') => void;
  dismissSupportRankUp: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // 初期状態
      phase: 'player_phase',
      turn: 1,
      selectedUnitId: null,
      cursorPosition: { x: 0, y: 0 },
      cameraPosition: { x: 0, y: 0 },
      isPaused: false,
      gameSpeed: 1,

      moveablePositions: [],
      attackablePositions: [],
      currentAction: null,

      // Phase 2追加
      interactionPhase: 'idle',
      pendingMovePosition: null,

      // Phase 3追加
      attackableEnemies: [],
      selectedTargetId: null,
      battlePreviewData: null,

      // Phase 4追加
      gameResult: 'playing',
      isPhaseTransitioning: false,

      // Phase 6追加
      levelUpQueue: [],

      // Phase 7追加
      activeSupportConversation: null,
      supportRankUpInfo: null,

      // アクション
      setPhase: (phase) => set({ phase }),

      nextTurn: () =>
        set((state) => ({
          turn: state.turn + 1,
          phase: 'player_phase',
        })),

      selectUnit: (unit) =>
        set({
          selectedUnitId: unit?.id ?? null,
          currentAction: unit ? 'move' : null,
        }),

      moveCursor: (position) => set({ cursorPosition: position }),

      moveCursorDelta: (delta) =>
        set((state) => ({
          cursorPosition: {
            x: Math.max(0, state.cursorPosition.x + delta.x),
            y: Math.max(0, state.cursorPosition.y + delta.y),
          },
        })),

      setMoveablePositions: (positions) => set({ moveablePositions: positions }),

      setAttackablePositions: (positions) =>
        set({ attackablePositions: positions }),

      setCurrentAction: (action) => set({ currentAction: action }),

      togglePause: () =>
        set((state) => ({ isPaused: !state.isPaused })),

      setGameSpeed: (speed) => set({ gameSpeed: speed }),

      // Phase 2追加アクション
      setInteractionPhase: (phase) => set({ interactionPhase: phase }),
      setPendingMovePosition: (pos) => set({ pendingMovePosition: pos }),

      showActionMenu: (position) => {
        const { selectedUnitId } = get();
        if (!selectedUnitId) {
          set({
            pendingMovePosition: position,
            interactionPhase: 'action_menu',
          });
          return;
        }

        const unit = useUnitStore.getState().getUnit(selectedUnitId);
        const gridSystem = getGridSystem();

        // 攻撃可能な敵を計算
        let attackableEnemies: Unit[] = [];
        if (unit && gridSystem) {
          const attackPositions = gridSystem.calculateAttackRange(unit, [position]);
          for (const pos of attackPositions) {
            const enemy = useUnitStore.getState().getUnitAt(pos);
            if (enemy && enemy.faction === 'enemy') {
              attackableEnemies.push(enemy);
            }
          }
        }

        set({
          pendingMovePosition: position,
          interactionPhase: 'action_menu',
          attackableEnemies,
        });
      },

      hideActionMenu: () => set({
        pendingMovePosition: null,
        interactionPhase: 'unit_selected',
      }),

      cancelSelection: () => set({
        selectedUnitId: null,
        currentAction: null,
        moveablePositions: [],
        attackablePositions: [],
        interactionPhase: 'idle',
        pendingMovePosition: null,
      }),

      confirmMove: () => {
        const { pendingMovePosition, selectedUnitId } = get();
        if (pendingMovePosition && selectedUnitId) {
          const { moveUnit, setUnitMoved } = useUnitStore.getState();
          moveUnit(selectedUnitId, pendingMovePosition);
          setUnitMoved(selectedUnitId, true);
        }
        set({
          selectedUnitId: null,
          currentAction: null,
          moveablePositions: [],
          attackablePositions: [],
          interactionPhase: 'idle',
          pendingMovePosition: null,
        });
      },

      // Phase 3追加アクション
      startAttackMode: () => {
        const { selectedUnitId, pendingMovePosition } = get();
        if (!selectedUnitId || !pendingMovePosition) return;

        const unit = useUnitStore.getState().getUnit(selectedUnitId);
        if (!unit) return;

        const gridSystem = getGridSystem();
        if (!gridSystem) return;

        // 移動後の位置から攻撃範囲を計算
        const attackPositions = gridSystem.calculateAttackRange(unit, [pendingMovePosition]);

        // 攻撃範囲内の敵を特定
        const enemies: Unit[] = [];
        for (const pos of attackPositions) {
          const enemy = useUnitStore.getState().getUnitAt(pos);
          if (enemy && enemy.faction === 'enemy') {
            enemies.push(enemy);
          }
        }

        set({
          interactionPhase: 'attack_select',
          attackableEnemies: enemies,
          attackablePositions: attackPositions,
          currentAction: 'attack',
        });
      },

      selectTarget: (enemyId) => {
        if (!enemyId) {
          set({
            selectedTargetId: null,
            battlePreviewData: null,
          });
          return;
        }

        const { selectedUnitId, pendingMovePosition } = get();
        if (!selectedUnitId) return;

        // 攻撃者の位置を一時的に移動先に更新してプレビュー計算
        const attacker = useUnitStore.getState().getUnit(selectedUnitId);
        const defender = useUnitStore.getState().getUnit(enemyId);

        if (!attacker || !defender) return;

        // 全ユニットを取得（支援ボーナス計算用）
        const allUnits = Array.from(useUnitStore.getState().units.values());

        // 移動後の位置を反映した攻撃者を作成
        const movedAttacker = { ...attacker, position: pendingMovePosition ?? attacker.position };
        const previewData = BattleCalculator.generatePreview(movedAttacker, defender, allUnits);

        set({
          selectedTargetId: enemyId,
          battlePreviewData: previewData,
          interactionPhase: 'battle_preview',
        });
      },

      executeAttack: () => {
        const { selectedUnitId, selectedTargetId, pendingMovePosition } = get();
        if (!selectedUnitId || !selectedTargetId) return;

        // 1. 移動を確定
        const { moveUnit } = useUnitStore.getState();
        if (pendingMovePosition) {
          moveUnit(selectedUnitId, pendingMovePosition);
        }

        // 2. 戦闘実行（移動後の攻撃者を取得）
        const attacker = useUnitStore.getState().getUnit(selectedUnitId);
        const defender = useUnitStore.getState().getUnit(selectedTargetId);

        if (!attacker || !defender) return;

        // 全ユニットを取得（支援ボーナス計算用）
        const allUnits = Array.from(useUnitStore.getState().units.values());

        const result = BattleCalculator.executeBattle(attacker, defender, allUnits);

        // 3. 結果反映
        const { damageUnit, addExperienceWithLevelUp, setUnitAttacked } = useUnitStore.getState();

        // 防御者へのダメージ
        if (result.totalDamage.defender > 0) {
          damageUnit(selectedTargetId, result.totalDamage.defender);
        }

        // 攻撃者へのダメージ（反撃）
        if (result.totalDamage.attacker > 0) {
          damageUnit(selectedUnitId, result.totalDamage.attacker);
        }

        // 経験値獲得とレベルアップ処理
        const levelUpResults = addExperienceWithLevelUp(selectedUnitId, result.experienceGained);

        // 支援ポイント獲得処理（allUnitsは上で定義済み）
        const supportPoints = SupportCalculator.calculateSupportPointGain(attacker, allUnits);
        if (supportPoints > 0) {
          const rankUpInfos = useUnitStore.getState().addSupportPoints(selectedUnitId, supportPoints);

          // 最初のランクアップがあれば会話を表示
          if (rankUpInfos.length > 0) {
            const firstRankUp = rankUpInfos[0];
            const conversation = getSupportConversation(
              firstRankUp.supportDefinitionId,
              firstRankUp.newRank
            );
            if (conversation) {
              set({ activeSupportConversation: conversation });
            } else {
              // 会話がない場合はランクアップ通知のみ
              set({
                supportRankUpInfo: {
                  unitName: firstRankUp.unitName,
                  partnerName: firstRankUp.partnerName,
                  newRank: firstRankUp.newRank,
                },
              });
            }
          }
        }

        // 行動済みフラグ
        setUnitAttacked(selectedUnitId, true);

        // 4. 状態リセット
        set({
          selectedUnitId: null,
          selectedTargetId: null,
          pendingMovePosition: null,
          battlePreviewData: null,
          attackableEnemies: [],
          attackablePositions: [],
          moveablePositions: [],
          currentAction: null,
          interactionPhase: 'idle',
          levelUpQueue: levelUpResults,
        });

        // 5. ゲーム終了チェック
        get().checkGameEnd();
      },

      cancelAttack: () => {
        set({
          selectedTargetId: null,
          battlePreviewData: null,
          attackableEnemies: [],
          attackablePositions: [],
          currentAction: 'move',
          interactionPhase: 'action_menu',
        });
      },

      // Phase 4追加アクション
      endPlayerTurn: () => {
        const { gameResult } = get();
        if (gameResult !== 'playing') return;

        // 敵フェーズ開始
        set({
          phase: 'enemy_phase',
          interactionPhase: 'idle',
          selectedUnitId: null,
          currentAction: null,
          moveablePositions: [],
          attackablePositions: [],
          isPhaseTransitioning: true,
        });

        // 敵の行動済みフラグをリセット
        const { resetAllMoved } = useUnitStore.getState();
        resetAllMoved('enemy');

        // フェーズ遷移アニメーション後に敵AI実行
        setTimeout(() => {
          const state = get();
          if (state.phase === 'enemy_phase') {
            state.executeEnemyAI();
          }
        }, 800);
      },

      executeEnemyAI: () => {
        const { tiles } = useMapStore.getState();
        const enemies = useUnitStore.getState().getEnemyUnits();
        const playerUnits = useUnitStore.getState().getPlayerUnits();

        // 敵AIの行動を計算
        const actions = AIController.calculateEnemyActions(
          enemies,
          playerUnits,
          tiles
        );

        // 行動を順番に実行
        get().executeActionsSequentially(actions, 0);
      },

      executeActionsSequentially: (actions: import('../engine/ai').AIAction[], index: number) => {
        if (index >= actions.length) {
          // 全行動完了、プレイヤーフェーズへ
          setTimeout(() => {
            get().endEnemyTurn();
          }, 300);
          return;
        }

        const action = actions[index];
        const { moveUnit, setUnitMoved, setUnitAttacked, damageUnit, getUnit } =
          useUnitStore.getState();

        // 移動実行
        if (action.to.x !== action.from.x || action.to.y !== action.from.y) {
          moveUnit(action.unitId, action.to);
        }

        // 攻撃実行
        if (action.type === 'attack' && action.targetId) {
          const attacker = getUnit(action.unitId);
          const defender = getUnit(action.targetId);

          if (attacker && defender) {
            // 全ユニットを取得（支援ボーナス計算用）
            const allUnitsForAI = Array.from(useUnitStore.getState().units.values());
            const result = BattleCalculator.executeBattle(attacker, defender, allUnitsForAI);

            // 防御者へのダメージ
            if (result.totalDamage.defender > 0) {
              damageUnit(action.targetId, result.totalDamage.defender);
            }

            // 攻撃者へのダメージ（反撃）
            if (result.totalDamage.attacker > 0) {
              damageUnit(action.unitId, result.totalDamage.attacker);
            }

            setUnitAttacked(action.unitId, true);
          }
        }

        setUnitMoved(action.unitId, true);

        // 各行動後にゲーム終了チェック（プレイヤーユニットが倒されたか）
        const gameResult = get().checkGameEnd();
        if (gameResult !== 'playing') {
          // ゲーム終了したら行動を中断
          return;
        }

        // 次の行動へ（少し遅延）
        setTimeout(() => {
          get().executeActionsSequentially(actions, index + 1);
        }, 400);
      },

      endEnemyTurn: () => {
        const { gameResult } = get();
        if (gameResult !== 'playing') return;

        // ターン数を増やしてプレイヤーフェーズへ
        set((state) => ({
          turn: state.turn + 1,
          phase: 'player_phase',
          isPhaseTransitioning: false,
        }));

        // プレイヤーユニットの行動済みフラグをリセット
        const { resetAllMoved } = useUnitStore.getState();
        resetAllMoved('player');

        // ゲーム終了チェック
        get().checkGameEnd();
      },

      checkGameEnd: () => {
        const map = useMapStore.getState().currentMap;
        if (!map) return 'playing';

        const enemies = useUnitStore.getState().getEnemyUnits();
        const playerUnits = useUnitStore.getState().getPlayerUnits();
        const { turn } = get();

        const result = PhaseManager.checkGameResult(
          map.victoryCondition,
          map.defeatCondition,
          enemies,
          playerUnits,
          turn
        );

        if (result !== 'playing') {
          set({ gameResult: result });
        }

        return result;
      },

      setGameResult: (result) => set({ gameResult: result }),

      resetGame: () => {
        set({
          phase: 'player_phase',
          turn: 1,
          selectedUnitId: null,
          cursorPosition: { x: 0, y: 0 },
          currentAction: null,
          moveablePositions: [],
          attackablePositions: [],
          interactionPhase: 'idle',
          pendingMovePosition: null,
          attackableEnemies: [],
          selectedTargetId: null,
          battlePreviewData: null,
          gameResult: 'playing',
          isPhaseTransitioning: false,
          levelUpQueue: [],
        });
      },

      setPhaseTransitioning: (transitioning) =>
        set({ isPhaseTransitioning: transitioning }),

      dismissLevelUp: () => {
        set((state) => ({
          levelUpQueue: state.levelUpQueue.slice(1),
        }));
      },

      // Phase 7追加アクション
      showSupportConversation: (conversation) => {
        set({ activeSupportConversation: conversation });
      },

      dismissSupportConversation: () => {
        set({ activeSupportConversation: null });
      },

      showSupportRankUp: (unitName, partnerName, newRank) => {
        set({ supportRankUpInfo: { unitName, partnerName, newRank } });
      },

      dismissSupportRankUp: () => {
        set({ supportRankUpInfo: null });
      },
    }),
    { name: 'game-store' }
  )
);

// セレクター
export const selectPhase = (state: GameStore) => state.phase;
export const selectTurn = (state: GameStore) => state.turn;
export const selectCursorPosition = (state: GameStore) => state.cursorPosition;
export const selectSelectedUnitId = (state: GameStore) => state.selectedUnitId;
