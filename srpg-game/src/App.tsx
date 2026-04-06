import { useEffect, useState, useCallback, useRef } from 'react';
import { MapRenderer } from './components/game/MapRenderer';
import {
  PhaseIndicator,
  TurnEndButton,
  GameResultModal,
  MainMenu,
  PauseMenu,
  UnitStatusPanel,
  TerrainInfoPanel,
  TutorialOverlay,
} from './components/ui';
import { LevelUpModal } from './components/ui/LevelUpModal';
import { SupportConversationModal, SupportRankUpModal } from './components/ui/SupportConversationModal';
import { StoryEventModal, ChapterStartOverlay } from './components/ui/StoryEventModal';
import { useGameStore, useMapStore, useUnitStore, useSettingsStore, useEventStore } from './store';
import type { Unit } from './types';
import type { Weapon } from './types/unit';
import { CHAPTER1_MAP, CHAPTER1_EVENTS, CHAPTER_1 } from './data/chapters';
import { PLAYER_UNITS, ENEMY_UNITS } from './data/units';
import { WEAPONS } from './data/weapons';

// ユニット作成ヘルパー
let unitIdCounter = 0;

function createUnitFromDefinition(
  definitionId: string,
  faction: 'player' | 'enemy',
  position: { x: number; y: number },
  level: number,
  weaponId: string,
  isBoss: boolean = false
): Unit {
  const definition = faction === 'player'
    ? PLAYER_UNITS[definitionId]
    : ENEMY_UNITS[definitionId];

  if (!definition) {
    throw new Error(`Unit definition not found: ${definitionId}`);
  }

  const weapon = WEAPONS[weaponId];
  if (!weapon) {
    throw new Error(`Weapon not found: ${weaponId}`);
  }

  // レベルに応じたステータス調整
  const levelBonus = level - 1;
  const stats = { ...definition.baseStats };
  stats.maxHp += levelBonus * 2;
  stats.hp = stats.maxHp;
  stats.strength += Math.floor(levelBonus * 0.5);
  stats.skill += Math.floor(levelBonus * 0.3);
  stats.defense += Math.floor(levelBonus * 0.3);

  return {
    id: `unit-${++unitIdCounter}`,
    definitionId,
    name: definition.name,
    faction,
    class: definition.class,
    movementType: definition.movementType,
    level,
    experience: 0,
    stats,
    growthRates: definition.growthRates,
    position,
    equipment: {
      weapon: { ...weapon },
      item: null,
    },
    skills: [],
    supports: [],
    status: { effects: [], turnsRemaining: {} as Record<string, number> },
    hasMoved: false,
    hasAttacked: false,
    isBoss,
  };
}

// 第一章のユニット作成
function createChapter1Units(): Unit[] {
  const units: Unit[] = [];

  // プレイヤーユニット
  for (const playerUnit of CHAPTER_1.playerUnits) {
    const unit = createUnitFromDefinition(
      playerUnit.definitionId,
      'player',
      playerUnit.position,
      playerUnit.level,
      playerUnit.definitionId === 'allen' ? 'iron_sword' : 'fire'
    );
    units.push(unit);
  }

  // 敵ユニット
  for (const enemySpawn of CHAPTER1_MAP.enemySpawns) {
    const unit = createUnitFromDefinition(
      enemySpawn.unitDefinitionId,
      'enemy',
      enemySpawn.position,
      enemySpawn.level,
      enemySpawn.equipment[0] || 'iron_axe',
      enemySpawn.isBoss
    );
    units.push(unit);
  }

  return units;
}

function App() {
  const { loadMap, clearMap } = useMapStore();
  const { addUnit, initializeSupports, clearUnits } = useUnitStore();
  const { setPhase, moveCursor, gameState, gameResult, setGameResult, startGame, phase } = useGameStore();
  const { tutorialCompleted } = useSettingsStore();
  const { startEvent, isEventActive, setCurrentChapter } = useEventStore();

  // 章開始フラグ
  const [chapterStarted, setChapterStarted] = useState(false);

  // ゲーム開始時にマップとユニットを初期化
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (chapterStarted) return; // 既に初期化済み

    // 既存のデータをクリア
    clearUnits();
    clearMap();

    // 第一章マップをロード
    loadMap(CHAPTER1_MAP);

    // 第一章ユニットを追加
    const chapter1Units = createChapter1Units();
    chapter1Units.forEach((unit) => addUnit(unit));

    // 支援関係を初期化
    setTimeout(() => {
      chapter1Units.forEach((unit) => {
        if (unit.faction === 'player') {
          initializeSupports(unit.id);
        }
      });
    }, 100);

    // フェーズ設定
    setPhase('player_phase');

    // カーソル初期位置
    moveCursor({ x: 1, y: 5 });

    // 現在の章を設定
    setCurrentChapter('chapter-1');
    setChapterStarted(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, chapterStarted]);

  // ゲーム開始時にオープニングイベントを表示
  useEffect(() => {
    if (gameState === 'playing' && chapterStarted && !isEventActive) {
      const evt = CHAPTER1_EVENTS.find(e => e.trigger === 'chapter_start');
      // 既に完了したイベントは開始しない
      const isCompleted = useEventStore.getState().completedEvents.has(evt?.id || '');
      if (evt && !isCompleted) {
        startEvent(evt);
        setPhase('event');
      }
    }
  }, [gameState, chapterStarted, isEventActive]);

  // イベント完了時にプレイヤーフェーズに戻す
  // isEventActiveがtrue→falseに変化したときのみ実行
  const prevIsEventActive = useRef(isEventActive);

  useEffect(() => {
    // イベント完了時（true → false の変化）のみフェーズを戻す
    if (prevIsEventActive.current && !isEventActive && phase === 'event') {
      setPhase('player_phase');
    }
    prevIsEventActive.current = isEventActive;
  }, [isEventActive, phase, setPhase]);

  // タイトル画面表示中
  if (gameState === 'title') {
    return <MainMenu />;
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">戦略SRPG - Phase 8</h1>
        <PhaseIndicator />
      </header>

      {/* ゲーム結果モーダル */}
      <GameResultModal />

      {/* レベルアップモーダル */}
      <LevelUpModal />

      {/* 支援会話モーダル（Phase 7追加） */}
      <SupportConversationModal />

      {/* 支援ランクアップモーダル（Phase 7追加） */}
      <SupportRankUpModal />

      {/* ストーリーイベントモーダル（Phase 10追加） */}
      <StoryEventModal />

      {/* ポーズメニュー（Phase 8追加） */}
      <PauseMenu />

      {/* チュートリアル（Phase 8追加） */}
      {!tutorialCompleted && <TutorialOverlay />}

      {/* メインゲームエリア */}
      <main className="flex-1 flex relative">
        {/* マップエリア */}
        <div className="flex-1 flex items-start justify-center p-4 overflow-hidden pt-8">
          <MapRenderer tileSize={48} />
        </div>

        {/* ターン終了ボタン（左下） */}
        <div className="absolute bottom-4 left-4">
          <TurnEndButton />
        </div>

        {/* サイドパネル（Phase 8: 再構成） */}
        <aside className="w-72 bg-gray-800 p-4 text-white overflow-y-auto h-full">
          {/* ユニットステータス */}
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-400 mb-2">ユニット情報</h2>
            <UnitStatusPanel />
          </div>

          {/* 地形情報 */}
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-400 mb-2">地形情報</h2>
            <TerrainInfoPanel />
          </div>

          {/* 操作方法 */}
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-400 mb-2">操作方法</h2>
            <ul className="text-xs space-y-1 text-gray-400">
              <li>• クリック: タイル選択</li>
              <li>• ユニットクリック: 選択</li>
              <li>• ESC: ポーズ</li>
            </ul>
          </div>

          {/* 凡例 */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 mb-2">凡例</h2>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">プレイヤー</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-300">敵</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/40 rounded"></div>
                <span className="text-gray-300">移動可能</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/50 rounded"></div>
                <span className="text-gray-300">攻撃可能</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500/50 rounded"></div>
                <span className="text-gray-300">行動済み</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
