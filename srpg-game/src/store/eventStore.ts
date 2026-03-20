import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StoryEvent, EventContext, DialogueLine, EventTriggerType } from '../types/event';

interface EventStore {
  // 状態
  activeEvent: StoryEvent | null;
  currentDialogueIndex: number;
  eventQueue: StoryEvent[];
  completedEvents: Set<string>;
  eventFlags: Record<string, boolean>;
  isEventActive: boolean;

  // 現在の章ID
  currentChapterId: string | null;

  // アクション
  setCurrentChapter: (chapterId: string) => void;
  queueEvent: (event: StoryEvent) => void;
  startEvent: (event: StoryEvent) => void;
  advanceDialogue: () => void;
  completeEvent: () => void;
  setEventFlag: (flag: string, value: boolean) => void;
  getEventFlag: (flag: string) => boolean;
  isEventCompleted: (eventId: string) => boolean;
  clearEventQueue: () => void;
  reset: () => void;
}

export const useEventStore = create<EventStore>()(
  devtools(
    (set, get) => ({
      // 初期状態
      activeEvent: null,
      currentDialogueIndex: 0,
      eventQueue: [],
      completedEvents: new Set<string>(),
      eventFlags: {},
      isEventActive: false,
      currentChapterId: null,

      // アクション
      setCurrentChapter: (chapterId) => set({ currentChapterId: chapterId }),

      queueEvent: (event) => {
        set((state) => ({
          eventQueue: [...state.eventQueue, event],
        }));
      },

      startEvent: (event) => {
        set({
          activeEvent: event,
          currentDialogueIndex: 0,
          isEventActive: true,
        });
      },

      advanceDialogue: () => {
        const { activeEvent, currentDialogueIndex } = get();
        if (!activeEvent) return;

        const nextIndex = currentDialogueIndex + 1;
        if (nextIndex >= activeEvent.dialogue.length) {
          // 会話終了
          get().completeEvent();
        } else {
          set({ currentDialogueIndex: nextIndex });
        }
      },

      completeEvent: () => {
        const { activeEvent, eventQueue } = get();
        if (!activeEvent) return;

        // 完了済みに追加
        const newCompletedEvents = new Set(get().completedEvents);
        newCompletedEvents.add(activeEvent.id);

        // onCompleteアクションがあれば実行（フラグ設定など）
        if (activeEvent.onComplete) {
          for (const action of activeEvent.onComplete) {
            if (action.type === 'set_flag' && typeof action.data.flag === 'string') {
              get().setEventFlag(action.data.flag as string, true);
            }
          }
        }

        // 次のイベントがあれば開始
        const remainingQueue = eventQueue.filter(e => e.id !== activeEvent.id);
        const nextEvent = remainingQueue[0];

        if (nextEvent) {
          set({
            activeEvent: nextEvent,
            currentDialogueIndex: 0,
            eventQueue: remainingQueue.slice(1),
            completedEvents: newCompletedEvents,
          });
        } else {
          set({
            activeEvent: null,
            currentDialogueIndex: 0,
            isEventActive: false,
            eventQueue: [],
            completedEvents: newCompletedEvents,
          });
        }
      },

      setEventFlag: (flag, value) => {
        set((state) => ({
          eventFlags: { ...state.eventFlags, [flag]: value },
        }));
      },

      getEventFlag: (flag) => {
        return get().eventFlags[flag] ?? false;
      },

      isEventCompleted: (eventId) => {
        return get().completedEvents.has(eventId);
      },

      clearEventQueue: () => {
        set({ eventQueue: [] });
      },

      reset: () => {
        set({
          activeEvent: null,
          currentDialogueIndex: 0,
          eventQueue: [],
          completedEvents: new Set<string>(),
          eventFlags: {},
          isEventActive: false,
          currentChapterId: null,
        });
      },
    }),
    { name: 'event-store' }
  )
);

// セレクター
export const selectActiveEvent = (state: EventStore) => state.activeEvent;
export const selectCurrentDialogue = (state: EventStore) => {
  if (!state.activeEvent || state.currentDialogueIndex >= state.activeEvent.dialogue.length) {
    return null;
  }
  return state.activeEvent.dialogue[state.currentDialogueIndex];
};
export const selectIsEventActive = (state: EventStore) => state.isEventActive;
