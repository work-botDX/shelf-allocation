import React, { memo, useCallback } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useGameStore } from '../../store';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlight?: string; // ハイライトする要素のセレクタ（将来用）
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '戦略SRPGへようこそ！',
    content: 'このゲームはターン制の戦略シミュレーションRPGです。味方ユニットを操作して、全ての敵を倒しましょう！',
  },
  {
    id: 'select_unit',
    title: 'ユニットの選択',
    content: '青い枠のユニットが味方です。クリックすると選択できます。選択すると移動可能範囲が緑色で表示されます。',
  },
  {
    id: 'move_unit',
    title: 'ユニットの移動',
    content: '緑色のマスをクリックすると移動先を指定できます。移動後に「待機」を選ぶとそのターンの行動が終了します。',
  },
  {
    id: 'attack',
    title: '攻撃',
    content: '移動後に「攻撃」を選ぶと、赤いマスにいる敵を攻撃できます。戦闘前にダメージ予測が表示されます。',
  },
  {
    id: 'terrain',
    title: '地形効果',
    content: '地形によって回避率や守備力が上がります。森や砦を活用して有利に戦いましょう！',
  },
  {
    id: 'support',
    title: '支援システム',
    content: '特定のユニット同士は支援関係があります。隣接すると戦闘でボーナスが得られます。',
  },
  {
    id: 'end_turn',
    title: 'ターン終了',
    content: '全てのユニットが行動したら、画面左下の「ターン終了」ボタンを押して敵のターンに移行します。',
  },
];

export const TutorialOverlay: React.FC = memo(() => {
  const { tutorialCompleted, tutorialStep, setTutorialStep, completeTutorial } = useSettingsStore();
  const { gameState } = useGameStore();

  // ゲーム中のみ表示
  if (tutorialCompleted || gameState !== 'playing') {
    return null;
  }

  const currentStep = TUTORIAL_STEPS[tutorialStep];
  const isFirstStep = tutorialStep === 0;
  const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      completeTutorial();
    } else {
      setTutorialStep(tutorialStep + 1);
    }
  }, [isLastStep, completeTutorial, setTutorialStep, tutorialStep]);

  const handlePrev = useCallback(() => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  }, [tutorialStep, setTutorialStep]);

  const handleSkip = useCallback(() => {
    completeTutorial();
  }, [completeTutorial]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        {/* プログレス */}
        <div className="flex gap-1 mb-4">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index <= tutorialStep ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* タイトル */}
        <h2 className="text-xl font-bold text-white mb-2">{currentStep.title}</h2>

        {/* 内容 */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {currentStep.content}
        </p>

        {/* ナビゲーション */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            スキップ
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
              >
                戻る
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-bold"
            >
              {isLastStep ? '始める！' : '次へ'}
            </button>
          </div>
        </div>

        {/* ステップ番号 */}
        <div className="text-center mt-4 text-gray-500 text-xs">
          {tutorialStep + 1} / {TUTORIAL_STEPS.length}
        </div>
      </div>
    </div>
  );
});

TutorialOverlay.displayName = 'TutorialOverlay';
