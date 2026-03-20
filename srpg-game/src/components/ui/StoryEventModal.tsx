import { useState, useEffect, useCallback } from 'react';
import { useEventStore, selectCurrentDialogue } from '../../store/eventStore';
import type { DialogueLine } from '../../types/event';

/**
 * キャラクター定義（会話用）
 * TODO: 将来的にデータファイルに移動
 */
const DIALOGUE_CHARACTERS: Record<string, { name: string; color: string }> = {
  allen: { name: 'アレン', color: 'text-blue-300' },
  ela: { name: 'エラ', color: 'text-pink-300' },
  verdias: { name: 'ヴェルディアス', color: 'text-purple-400' },
  narrator: { name: '---', color: 'text-gray-400' },
};

/**
 * ストーリーイベントモーダル
 * Phase 10: コンテンツ作成
 * テキストベースの会話表示（名前＋セリフ）
 */
export function StoryEventModal() {
  const { activeEvent, isEventActive, advanceDialogue } = useEventStore();
  const currentDialogue = useEventStore(selectCurrentDialogue);

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // イベントがない場合は何も表示しない
  if (!isEventActive || !activeEvent || !currentDialogue) {
    return null;
  }

  const isLastLine = activeEvent.dialogue.indexOf(currentDialogue) >= activeEvent.dialogue.length - 1;

  // タイプライター効果
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const text = currentDialogue.text;

    const intervalId = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, 25); // 25msごとに1文字表示

    return () => clearInterval(intervalId);
  }, [currentDialogue]);

  // クリック/キー入力で次へ
  const handleAdvance = useCallback(() => {
    if (isTyping) {
      // タイピング中なら全文表示
      setDisplayedText(currentDialogue.text);
      setIsTyping(false);
      return;
    }

    advanceDialogue();
  }, [isTyping, currentDialogue, advanceDialogue]);

  // キー入力リスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  // 話者情報を取得
  const getSpeakerInfo = (speakerId: string) => {
    return DIALOGUE_CHARACTERS[speakerId] ?? { name: speakerId, color: 'text-white' };
  };

  // 表情に応じたスタイル
  const getEmotionStyle = (emotion?: string): string => {
    switch (emotion) {
      case 'happy': return 'border-yellow-400';
      case 'sad': return 'border-blue-400';
      case 'angry': return 'border-red-400';
      case 'surprised': return 'border-cyan-400';
      case 'serious': return 'border-gray-400';
      case 'pain': return 'border-red-500';
      default: return 'border-slate-500';
    }
  };

  const speakerInfo = getSpeakerInfo(currentDialogue.speakerId);
  const currentIndex = activeEvent.dialogue.indexOf(currentDialogue);

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/70 z-50 cursor-pointer"
      onClick={handleAdvance}
    >
      {/* 会話ウィンドウ */}
      <div className="w-full max-w-4xl mb-8 mx-4">
        {/* タイトル */}
        {activeEvent.title && (
          <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 px-4 py-2 rounded-t-lg border-t-2 border-x-2 border-slate-500">
            <h2 className="text-slate-200 font-bold text-lg">
              {activeEvent.title}
            </h2>
          </div>
        )}

        {/* メイン会話エリア */}
        <div className={`bg-gradient-to-b from-slate-900/95 to-slate-800/95 p-6 border-x-2 ${activeEvent.title ? '' : 'rounded-t-lg border-t-2'} ${getEmotionStyle(currentDialogue.emotion)} min-h-[180px] flex items-center`}>
          <div className="w-full">
            {/* 話者名 */}
            <div className="mb-3">
              <span className={`font-bold text-lg ${speakerInfo.color}`}>
                {speakerInfo.name}
              </span>
            </div>

            {/* セリフ */}
            <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-600 shadow-inner">
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse" />
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 操作ガイド */}
        <div className="bg-slate-900/90 px-4 py-3 rounded-b-lg border-b-2 border-x-2 border-slate-500 flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            <span className="text-slate-300">Enter</span> / <span className="text-slate-300">Space</span> / <span className="text-slate-300">クリック</span> で次へ
          </p>
          <p className="text-gray-500 text-xs">
            {currentIndex + 1} / {activeEvent.dialogue.length}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 章開始イベント表示コンポーネント
 * 章タイトルを表示してからイベントを開始
 */
export function ChapterStartOverlay({
  chapterNumber,
  chapterTitle,
  onComplete,
}: {
  chapterNumber: number;
  chapterTitle: string;
  onComplete: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    // フェードイン
    const fadeInTimer = setTimeout(() => {
      setShowTitle(true);
    }, 300);

    // フェードアウト
    const fadeOutTimer = setTimeout(() => {
      setShowTitle(false);
    }, 2500);

    // 完了
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div
        className={`text-center transition-opacity duration-500 ${
          showTitle ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-slate-400 text-lg mb-2">Chapter {chapterNumber}</p>
        <h1 className="text-4xl font-bold text-white tracking-wider">
          {chapterTitle}
        </h1>
      </div>
    </div>
  );
}
