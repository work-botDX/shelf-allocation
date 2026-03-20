import { useEffect } from 'react';
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
import { useGameStore, useMapStore, useUnitStore } from './store';
import type { MapDefinition, Unit, Tile } from './types';
import { TERRAIN_DEFINITIONS } from './types/map';

// デモマップ作成
function createDemoMap(): MapDefinition {
  const width = 12;
  const height = 10;
  const tiles: Tile[][] = [];

  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      let terrain: 'plain' | 'forest' | 'mountain' | 'water' | 'fortress' = 'plain';

      // 地形を配置
      if ((x === 3 && y >= 2 && y <= 5) || (x === 8 && y >= 4 && y <= 7)) {
        terrain = 'forest';
      }
      if (x >= 5 && x <= 6 && y >= 4 && y <= 5) {
        terrain = 'water';
      }
      if (x === 10 && y === 8) {
        terrain = 'fortress';
      }
      if ((x === 1 && y === 3) || (x === 2 && y === 7)) {
        terrain = 'mountain';
      }

      tiles[y][x] = {
        position: { x, y },
        terrain,
        effects: TERRAIN_DEFINITIONS[terrain],
      };
    }
  }

  return {
    id: 'demo-map-1',
    name: '序章：出会い',
    description: '最初の戦闘マップ',
    chapter: 1,
    width,
    height,
    tiles,
    playerStartPositions: [
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
    ],
    enemySpawns: [
      { position: { x: 10, y: 4 }, unitDefinitionId: 'soldier', level: 1, equipment: [], ai: 'aggressive' as const },
      { position: { x: 9, y: 3 }, unitDefinitionId: 'soldier', level: 1, equipment: [], ai: 'aggressive' as const },
      { position: { x: 10, y: 5 }, unitDefinitionId: 'archer', level: 1, equipment: [], ai: 'stationary' as const },
    ],
    events: [],
    victoryCondition: { type: 'defeat_all' },
    defeatCondition: { type: 'lord_death' },
  };
}

// デモユニット作成
function createDemoUnits(): Unit[] {
  return [
    {
      id: 'unit-1',
      definitionId: 'lord',
      name: 'アラン',
      faction: 'player',
      class: 'lord',
      movementType: 'foot',
      level: 1,
      experience: 0,
      stats: {
        hp: 24,
        maxHp: 24,
        strength: 7,
        magic: 3,
        skill: 8,
        speed: 9,
        luck: 5,
        defense: 5,
        resistance: 2,
        move: 5,
      },
      growthRates: {
        hp: 80,
        strength: 45,
        magic: 20,
        skill: 50,
        speed: 55,
        luck: 40,
        defense: 30,
        resistance: 25,
      },
      position: { x: 1, y: 4 },
      equipment: {
        weapon: {
          id: 'iron-sword',
          name: '鉄の剣',
          type: 'sword',
          might: 5,
          hit: 90,
          critical: 0,
          range: [1],
          weight: 5,
          durability: 46,
          rank: 'E',
          effects: [],
        },
        item: null,
      },
      skills: [],
      supports: [],
      status: { effects: [], turnsRemaining: {} as Record<string, number> },
      hasMoved: false,
      hasAttacked: false,
      isBoss: false,
    },
    {
      id: 'unit-2',
      definitionId: 'knight',
      name: 'ベラ',
      faction: 'player',
      class: 'knight',
      movementType: 'armored',
      level: 1,
      experience: 0,
      stats: {
        hp: 28,
        maxHp: 28,
        strength: 8,
        magic: 1,
        skill: 6,
        speed: 4,
        luck: 3,
        defense: 10,
        resistance: 2,
        move: 4,
      },
      growthRates: {
        hp: 90,
        strength: 50,
        magic: 10,
        skill: 40,
        speed: 20,
        luck: 25,
        defense: 60,
        resistance: 20,
      },
      position: { x: 1, y: 5 },
      equipment: {
        weapon: {
          id: 'iron-lance',
          name: '鉄の槍',
          type: 'lance',
          might: 6,
          hit: 85,
          critical: 0,
          range: [1],
          weight: 8,
          durability: 40,
          rank: 'E',
          effects: [],
        },
        item: null,
      },
      skills: [],
      supports: [],
      status: { effects: [], turnsRemaining: {} as Record<string, number> },
      hasMoved: false,
      hasAttacked: false,
      isBoss: false,
    },
    {
      id: 'enemy-1',
      definitionId: 'soldier',
      name: '敵兵A',
      faction: 'enemy',
      class: 'knight',
      movementType: 'armored',
      level: 1,
      experience: 0,
      stats: {
        hp: 20,
        maxHp: 20,
        strength: 6,
        magic: 0,
        skill: 5,
        speed: 3,
        luck: 0,
        defense: 7,
        resistance: 1,
        move: 4,
      },
      growthRates: {
        hp: 0,
        strength: 0,
        magic: 0,
        skill: 0,
        speed: 0,
        luck: 0,
        defense: 0,
        resistance: 0,
      },
      position: { x: 10, y: 4 },
      equipment: {
        weapon: {
          id: 'iron-lance',
          name: '鉄の槍',
          type: 'lance',
          might: 6,
          hit: 85,
          critical: 0,
          range: [1],
          weight: 8,
          durability: 40,
          rank: 'E',
          effects: [],
        },
        item: null,
      },
      skills: [],
      supports: [],
      status: { effects: [], turnsRemaining: {} as Record<string, number> },
      hasMoved: false,
      hasAttacked: false,
      isBoss: false,
    },
    {
      id: 'enemy-2',
      definitionId: 'archer',
      name: '敵弓兵',
      faction: 'enemy',
      class: 'archer',
      movementType: 'foot',
      level: 1,
      experience: 0,
      stats: {
        hp: 18,
        maxHp: 18,
        strength: 5,
        magic: 0,
        skill: 6,
        speed: 5,
        luck: 0,
        defense: 3,
        resistance: 1,
        move: 5,
      },
      growthRates: {
        hp: 0,
        strength: 0,
        magic: 0,
        skill: 0,
        speed: 0,
        luck: 0,
        defense: 0,
        resistance: 0,
      },
      position: { x: 9, y: 3 },
      equipment: {
        weapon: {
          id: 'iron-bow',
          name: '鉄の弓',
          type: 'bow',
          might: 5,
          hit: 80,
          critical: 5,
          range: [2],
          weight: 5,
          durability: 40,
          rank: 'E',
          effects: [],
        },
        item: null,
      },
      skills: [],
      supports: [],
      status: { effects: [], turnsRemaining: {} as Record<string, number> },
      hasMoved: false,
      hasAttacked: false,
      isBoss: false,
    },
  ];
}

function App() {
  const { loadMap, clearMap } = useMapStore();
  const { addUnit, initializeSupports, clearUnits } = useUnitStore();
  const { setPhase, moveCursor, gameState } = useGameStore();

  // ゲーム初期化（初回のみ実行）
  useEffect(() => {
    // 既存のデータをクリア
    clearUnits();
    clearMap();

    // デモマップをロード
    const demoMap = createDemoMap();
    loadMap(demoMap);

    // デモユニットを追加
    const demoUnits = createDemoUnits();
    demoUnits.forEach((unit) => addUnit(unit));

    // 支援関係を初期化（Phase 7追加）
    // 少し遅延させて、ユニットが追加された後に実行
    setTimeout(() => {
      demoUnits.forEach((unit) => {
        if (unit.faction === 'player') {
          initializeSupports(unit.id);
        }
      });
    }, 100);

    // フェーズ設定
    setPhase('player_phase');

    // カーソル初期位置
    moveCursor({ x: 1, y: 4 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ実行

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

      {/* ポーズメニュー（Phase 8追加） */}
      <PauseMenu />

      {/* チュートリアル（Phase 8追加） */}
      <TutorialOverlay />

      {/* メインゲームエリア */}
      <main className="flex-1 flex relative">
        {/* マップエリア */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <MapRenderer tileSize={48} />
        </div>

        {/* ターン終了ボタン（左下） */}
        <div className="absolute bottom-4 left-4">
          <TurnEndButton />
        </div>

        {/* サイドパネル（Phase 8: 再構成） */}
        <aside className="w-72 bg-gray-800 p-4 text-white overflow-y-auto">
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
