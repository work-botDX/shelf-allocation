import type { MapDefinition, Tile, EnemySpawn } from '../../types/map';
import type { StoryEvent, ChapterDefinition } from '../../types/event';
import { TERRAIN_DEFINITIONS } from '../../types/map';

/**
 * 第一章：絆
 * 童年期の回想 - 星見の花の丘
 */

// 15x12 マップのタイルデータ
function createChapter1Tiles(): Tile[][] {
  const tiles: Tile[][] = [];

  for (let y = 0; y < 12; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < 15; x++) {
      let terrain: Tile['terrain'] = 'plain';

      // 地形配置
      // 上部に森
      if (y <= 1 && x >= 3 && x <= 5) terrain = 'forest';
      if (y <= 1 && x >= 9 && x <= 11) terrain = 'forest';

      // 中央左に森
      if (y >= 4 && y <= 6 && x >= 1 && x <= 2) terrain = 'forest';

      // 中央右に森
      if (y >= 5 && y <= 7 && x >= 12 && x <= 13) terrain = 'forest';

      // 下部に森
      if (y >= 9 && x >= 4 && x <= 6) terrain = 'forest';
      if (y >= 10 && x >= 9 && x <= 11) terrain = 'forest';

      // 中央に砦（山賊の拠点）
      if (y === 5 && x === 7) terrain = 'fortress';

      // 左下に村
      if (y === 10 && x === 1) terrain = 'village';

      row.push({
        position: { x, y },
        terrain,
        effects: TERRAIN_DEFINITIONS[terrain],
      });
    }
    tiles.push(row);
  }

  return tiles;
}

/**
 * 第一章マップ定義
 */
export const CHAPTER1_MAP: MapDefinition = {
  id: 'map-ch1-bond',
  name: '星見の丘',
  description: '幼い頃、二人でよく遊んだ丘。星見の花が咲き乱れている。',
  chapter: 1,
  width: 15,
  height: 12,
  tiles: createChapter1Tiles(),
  playerStartPositions: [
    { x: 1, y: 5 },  // アレン
    { x: 2, y: 5 },  // エラ
  ],
  enemySpawns: [
    // 山賊×2
    { position: { x: 12, y: 3 }, unitDefinitionId: 'bandit', level: 1, equipment: ['iron_axe'], ai: 'aggressive' },
    { position: { x: 11, y: 4 }, unitDefinitionId: 'bandit', level: 1, equipment: ['iron_axe'], ai: 'aggressive' },
    // 傭兵×1
    { position: { x: 13, y: 6 }, unitDefinitionId: 'mercenary', level: 2, equipment: ['iron_sword'], ai: 'aggressive' },
    // ボス：山賊頭
    { position: { x: 7, y: 5 }, unitDefinitionId: 'bandit_chief', level: 3, equipment: ['steel_axe'], ai: 'stationary', isBoss: true },
  ],
  events: [],
  victoryCondition: { type: 'defeat_boss', target: 'bandit_chief' },
  defeatCondition: { type: 'lord_death', target: 'allen' },
  turnLimit: 15,
};

/**
 * 第一章オープニングイベント
 */
export const CHAPTER1_START_EVENT: StoryEvent = {
  id: 'event-ch1-start',
  chapterId: 'chapter-1',
  trigger: 'chapter_start',
  priority: 100,
  repeatable: false,
  title: '第一章：絆',
  dialogue: [
    {
      speakerId: 'narrator',
      text: '那是、幼い頃の記憶。',
    },
    {
      speakerId: 'narrator',
      text: '星見の花が咲き乱れる丘で、二人は出会った。',
    },
    {
      speakerId: 'allen',
      text: 'エラ、見て！ 花が光ってる！',
      emotion: 'happy',
    },
    {
      speakerId: 'ela',
      text: '本当だ......綺麗。',
      emotion: 'happy',
    },
    {
      speakerId: 'narrator',
      text: 'その日、二人は星見の花の下で、小さな約束を交わした。',
    },
    {
      speakerId: 'allen',
      text: 'ずっと一緒だね。',
      emotion: 'normal',
    },
    {
      speakerId: 'ela',
      text: 'うん、約束。',
      emotion: 'happy',
    },
    {
      speakerId: 'narrator',
      text: 'しかし、その平穏は長くは続かなかった——',
    },
    {
      speakerId: 'narrator',
      text: '山賊が村を襲いに来たのだ！',
    },
    {
      speakerId: 'allen',
      text: 'エラ、下がって！ 俺がやる！',
      emotion: 'serious',
    },
    {
      speakerId: 'ela',
      text: 'アレン......無理しないで。',
      emotion: 'sad',
    },
  ],
};

/**
 * 第一章クリアイベント
 */
export const CHAPTER1_END_EVENT: StoryEvent = {
  id: 'event-ch1-end',
  chapterId: 'chapter-1',
  trigger: 'chapter_end',
  priority: 100,
  repeatable: false,
  dialogue: [
    {
      speakerId: 'allen',
      text: 'ふう......何とか倒せた。',
      emotion: 'normal',
    },
    {
      speakerId: 'ela',
      text: 'アレン、怪我はない？',
      emotion: 'sad',
    },
    {
      speakerId: 'allen',
      text: '大丈夫。エラのおかげで無事に終わったよ。',
      emotion: 'happy',
    },
    {
      speakerId: 'narrator',
      text: '二人は協力して山賊を撃退した。',
    },
    {
      speakerId: 'narrator',
      text: 'まだ幼い二人だったが、その絆は誰よりも強かった。',
    },
    {
      speakerId: 'narrator',
      text: 'この日が、長い旅の始まりになるとは知らずに——',
    },
  ],
};

/**
 * 第一章定義
 */
export const CHAPTER_1: ChapterDefinition = {
  id: 'chapter-1',
  number: 1,
  title: '絆',
  subtitle: '星見の花の下で',
  mapId: 'map-ch1-bond',
  startEventId: 'event-ch1-start',
  endEventId: 'event-ch1-end',
  playerUnits: [
    { definitionId: 'allen', position: { x: 1, y: 5 }, level: 1, required: true },
    { definitionId: 'ela', position: { x: 2, y: 5 }, level: 1 },
  ],
  nextChapterId: 'chapter-2',
};

/**
 * 第一章のイベントリスト
 */
export const CHAPTER1_EVENTS: StoryEvent[] = [
  CHAPTER1_START_EVENT,
  CHAPTER1_END_EVENT,
];
