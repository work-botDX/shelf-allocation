import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { SupportConversationLine } from '../../types/support';

/**
 * 支援会話モーダル
 * Phase 7: 支援システム
 * タイプライター風のテキスト表示とキャラクター会話UI
 */
export function SupportConversationModal() {
  const { activeSupportConversation, dismissSupportConversation } = useGameStore();

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const conversation = activeSupportConversation;

  // 会話がない場合は何も表示しない
  if (!conversation) {
    return null;
  }

  const currentLine: SupportConversationLine | undefined = conversation.lines[currentLineIndex];
  const isLastLine = currentLineIndex >= conversation.lines.length - 1;

  // タイプライター効果
  useEffect(() => {
    if (!currentLine) return;

    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const text = currentLine.text;

    const intervalId = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, 30); // 30msごとに1文字表示

    return () => clearInterval(intervalId);
  }, [currentLineIndex, currentLine?.text]);

  // 会話リセット
  useEffect(() => {
    setCurrentLineIndex(0);
    setDisplayedText('');
  }, [conversation]);

  // クリック/キー入力で次へ
  const handleAdvance = useCallback(() => {
    if (isTyping) {
      // タイピング中なら全文表示
      if (currentLine) {
        setDisplayedText(currentLine.text);
        setIsTyping(false);
      }
      return;
    }

    if (isLastLine) {
      // 会話終了
      dismissSupportConversation();
    } else {
      // 次のセリフへ
      setCurrentLineIndex(prev => prev + 1);
    }
  }, [isTyping, isLastLine, currentLine, dismissSupportConversation]);

  // キー入力リスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z') {
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  // 話者の表示名を取得
  const getSpeakerName = (speakerId: string): string => {
    const names: Record<string, string> = {
      lord: 'アラン',
      knight: 'ベラ',
      archer: '弓兵',
    };
    return names[speakerId] ?? speakerId;
  };

  // 表情に応じたアイコン
  const getEmotionIcon = (emotion?: string): string => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😲';
      default: return '😐';
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/60 z-50 cursor-pointer"
      onClick={handleAdvance}
    >
      {/* 会話ウィンドウ */}
      <div className="w-full max-w-4xl mb-8 mx-4">
        {/* タイトル */}
        <div className="bg-gradient-to-r from-purple-900/90 to-indigo-900/90 px-4 py-2 rounded-t-lg border-t-2 border-x-2 border-purple-400">
          <h2 className="text-purple-200 font-bold text-lg">
            {conversation.title}
            <span className="ml-3 text-sm text-purple-400">
              支援ランク {conversation.rank}
            </span>
          </h2>
        </div>

        {/* メイン会話エリア */}
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 p-6 border-x-2 border-purple-400 min-h-[200px] flex items-center">
          {currentLine && (
            <div className="flex items-start gap-6 w-full">
              {/* キャラクターアイコン */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-4xl shadow-lg border-2 border-purple-300">
                  {getEmotionIcon(currentLine.emotion)}
                </div>
                <p className="text-center mt-2 text-purple-300 font-bold text-sm">
                  {getSpeakerName(currentLine.speakerId)}
                </p>
              </div>

              {/* セリフ */}
              <div className="flex-1 bg-slate-800/80 rounded-lg p-4 border border-slate-600 shadow-inner">
                <p className="text-white text-lg leading-relaxed">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 操作ガイド */}
        <div className="bg-slate-900/90 px-4 py-3 rounded-b-lg border-b-2 border-x-2 border-purple-400 flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            <span className="text-purple-300">Enter</span> / <span className="text-purple-300">クリック</span> で次へ
          </p>
          <p className="text-gray-500 text-xs">
            {currentLineIndex + 1} / {conversation.lines.length}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 支援ランクアップ通知モーダル
 */
export function SupportRankUpModal() {
  const { supportRankUpInfo, dismissSupportRankUp } = useGameStore();

  if (!supportRankUpInfo) {
    return null;
  }

  const { unitName, partnerName, newRank } = supportRankUpInfo;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gradient-to-b from-purple-900 to-indigo-950 p-6 rounded-xl text-center max-w-sm shadow-2xl border-2 border-purple-400">
        {/* ヘッダー */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-purple-300 animate-pulse drop-shadow-lg">
            支援ランクアップ！
          </h2>
        </div>

        {/* ランク情報 */}
        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <p className="text-white text-xl mb-2">
            {unitName} × {partnerName}
          </p>
          <p className="text-5xl font-bold text-yellow-400">
            {newRank}
          </p>
          <p className="text-purple-300 mt-2">
            支援関係が深まりました
          </p>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={dismissSupportRankUp}
          className="px-8 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors cursor-pointer shadow-lg"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
