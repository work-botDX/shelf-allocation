import React, { memo, useState, useEffect } from 'react';
import { useGameStore } from '../../store';
import { LoadMenu } from './LoadMenu';

interface MenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  primary?: boolean;
  disabled?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = memo(({ onClick, children, primary, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full px-8 py-4 rounded-lg font-bold text-lg
      transition-all duration-200
      ${disabled
        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
        : primary
          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      }
      active:scale-95
    `}
  >
    {children}
  </button>
));
MenuButton.displayName = 'MenuButton';

// 操作説明コンポーネント
const HelpContent: React.FC<{ onClose: () => void }> = memo(({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-4">操作説明</h2>

      <div className="space-y-4 text-gray-300">
        <section>
          <h3 className="text-lg font-bold text-white mb-2">基本操作</h3>
          <ul className="space-y-1 text-sm">
            <li>• <span className="text-yellow-400">クリック</span>: タイル選択・ユニット選択</li>
            <li>• <span className="text-yellow-400">ESC</span>: ポーズメニューを開く</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-2">ユニット操作</h3>
          <ul className="space-y-1 text-sm">
            <li>1. 味方ユニットをクリックして選択</li>
            <li>2. 緑色のマスが移動可能範囲</li>
            <li>3. 移動先をクリックして行動メニューを表示</li>
            <li>4. 行動を選択（攻撃・待機など）</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-2">戦闘</h3>
          <ul className="space-y-1 text-sm">
            <li>• 赤いマスは攻撃可能な敵の位置</li>
            <li>• 武器の三すくみ（剣→斧→槍→剣）に注意</li>
            <li>• 戦闘前にダメージ予測が表示されます</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-2">ターン進行</h3>
          <ul className="space-y-1 text-sm">
            <li>• 全てのユニットが行動したら「ターン終了」</li>
            <li>• 敵フェーズ中は敵が自動で行動</li>
            <li>• 全ての敵を倒せば勝利！</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-2">成長・支援</h3>
          <ul className="space-y-1 text-sm">
            <li>• 戦闘で経験値を獲得してレベルアップ</li>
            <li>• 支援関係のあるユニットが近くにいるとボーナス</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-2">セーブ/ロード</h3>
          <ul className="space-y-1 text-sm">
            <li>• ポーズメニューからセーブ・ロード可能</li>
            <li>• 10個のセーブスロット + オートセーブ</li>
            <li>• ターン終了時にオートセーブ</li>
          </ul>
        </section>
      </div>

      <button
        onClick={onClose}
        className="mt-6 w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
      >
        閉じる
      </button>
    </div>
  </div>
));
HelpContent.displayName = 'HelpContent';

export const MainMenu: React.FC = memo(() => {
  const { startGame, saveSlotMetas, refreshSaveSlots } = useGameStore();
  const [showHelp, setShowHelp] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  // 起動時にセーブスロットを確認
  useEffect(() => {
    refreshSaveSlots();
  }, [refreshSaveSlots]);

  // セーブデータがあるかどうか
  const hasSaveData = saveSlotMetas.some((s) => s.exists);

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900 flex flex-col items-center justify-center z-40">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
            戦略SRPG
          </h1>
          <p className="text-gray-400 text-lg">Tactical Role-Playing Game</p>
          <div className="mt-2 text-gray-500 text-sm">Phase 9 - セーブ/ロード</div>
        </div>

        {/* メニューボタン */}
        <div className="space-y-4 w-64">
          <MenuButton onClick={startGame} primary>
            戦闘開始
          </MenuButton>
          <MenuButton onClick={() => setShowLoadMenu(true)} disabled={!hasSaveData}>
            コンティニュー
          </MenuButton>
          <MenuButton onClick={() => setShowHelp(true)}>
            操作説明
          </MenuButton>
        </div>

        {/* フッター */}
        <div className="absolute bottom-8 text-gray-500 text-sm">
          <p>© 2024 SRPG Demo</p>
        </div>

        {/* 装飾 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-32 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* 操作説明モーダル */}
      {showHelp && <HelpContent onClose={() => setShowHelp(false)} />}

      {/* ロードメニュー */}
      {showLoadMenu && <LoadMenu onClose={() => setShowLoadMenu(false)} />}
    </>
  );
});

MainMenu.displayName = 'MainMenu';
