import { useState, useEffect, useCallback, useRef } from 'react';
import { useEventStore } from '../../store/eventStore';

/**
 * キャラクター定義（会話用）
 */
const DIALOGUE_CHARACTERS: Record<string, { name: string; color: string }> = {
  allen: { name: 'アレン', color: 'text-blue-300' },
  ela: { name: 'エラ', color: 'text-pink-300' },
  verdias: { name: 'ヴェルディアス', color: 'text-purple-400' },
  narrator: { name: '---', color: 'text-gray-400' },
};

/**
 * 表情に応じた枠線スタイルを返す
 */
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

/**
 * ストーリーイベントモーダル
 */
export function StoryEventModal() {
  const activeEvent = useEventStore((state) => state.activeEvent);
  const isEventActive = useEventStore((state) => state.isEventActive);
  const advanceDialogue = useEventStore((state) => state.advanceDialogue);
  const currentDialogueIndex = useEventStore((state) => state.currentDialogueIndex);

  // タイプライター効果用のstate
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // currentDialogueを計算
  const currentDialogue = activeEvent && activeEvent.dialogue[currentDialogueIndex];

  // タイプライター効果
  useEffect(() => {
    if (!activeEvent) return;
    const dialogue = activeEvent.dialogue[currentDialogueIndex];
    if (!dialogue?.text) return;

    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const text = dialogue.text;

    intervalRef.current = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 35);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentDialogueIndex, activeEvent?.id]);

  // クリック/キー入力で次へ
  const handleAdvance = useCallback(() => {
    if (isTyping) {
      // タイピング中なら全文表示
      if (intervalRef.current) clearInterval(intervalRef.current);
      const dialogue = activeEvent?.dialogue[currentDialogueIndex];
      if (dialogue) setDisplayedText(dialogue.text);
      setIsTyping(false);
      return;
    }
    advanceDialogue();
  }, [isTyping, activeEvent, currentDialogueIndex, advanceDialogue]);

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

  // イベントがない場合は何も表示しない
  if (!isEventActive || !activeEvent || !currentDialogue) {
    return null;
  }

  const speakerInfo = DIALOGUE_CHARACTERS[currentDialogue.speakerId] || { name: currentDialogue.speakerId, color: 'text-white' };
  const emotionStyle = getEmotionStyle(currentDialogue.emotion);

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/70 z-50 cursor-pointer"
      onClick={handleAdvance}
    >
      <div className="w-full max-w-4xl mb-8 mx-4">
        {activeEvent.title && (
          <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 px-4 py-2 rounded-t-lg border-t-2 border-x-2 border-slate-500">
            <h2 className="text-slate-200 font-bold text-lg">{activeEvent.title}</h2>
          </div>
        )}

        <div className={`bg-gradient-to-b from-slate-900/95 to-slate-800/95 p-6 border-x-2 ${emotionStyle} min-h-[180px] flex items-center`}>
          <div className="w-full">
            <div className="mb-3">
              <span className={`font-bold text-lg ${speakerInfo.color}`}>
                {speakerInfo.name}
              </span>
            </div>
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

        <div className="bg-slate-900/90 px-4 py-3 rounded-b-lg border-b-2 border-x-2 border-slate-500 flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            <span className="text-slate-300">Enter</span> / <span className="text-slate-300">Space</span> / <span className="text-slate-300">クリック</span> で次へ
          </p>
          <p className="text-gray-500 text-xs">
            {currentDialogueIndex + 1} / {activeEvent.dialogue.length}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 章開始イベント表示コンポーネント
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
    const fadeInTimer = setTimeout(() => setShowTitle(true), 300);
    const fadeOutTimer = setTimeout(() => setShowTitle(false), 2500);
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
      <div className={`text-center transition-opacity duration-500 ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-slate-400 text-lg mb-2">Chapter {chapterNumber}</p>
        <h1 className="text-4xl font-bold text-white tracking-wider">{chapterTitle}</h1>
      </div>
    </div>
  );
}
