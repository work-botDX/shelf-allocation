import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  // チュートリアル
  tutorialCompleted: boolean;
  tutorialStep: number;

  // ゲーム設定
  gameSpeed: number; // 0.5, 1, 1.5, 2
  autoCursor: boolean; // 行動終了後に自動で次のユニットへ
  showDangerZone: boolean; // 危険マスを表示
  showRangeIndicator: boolean; // 射程範囲を表示
  showDamageNumbers: boolean; // ダメージ数値を表示

  // オーディオ（将来用）
  bgmVolume: number; // 0-100
  seVolume: number; // 0-100
}

interface SettingsStore extends Settings {
  // アクション
  completeTutorial: () => void;
  setTutorialStep: (step: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  tutorialCompleted: false,
  tutorialStep: 0,
  gameSpeed: 1,
  autoCursor: true,
  showDangerZone: true,
  showRangeIndicator: true,
  showDamageNumbers: true,
  bgmVolume: 50,
  seVolume: 70,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      completeTutorial: () => set({ tutorialCompleted: true }),

      setTutorialStep: (step) => set({ tutorialStep: step }),

      updateSettings: (newSettings) =>
        set((state) => ({ ...state, ...newSettings })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'srpg-settings',
    }
  )
);
