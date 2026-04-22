import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Max number of recently visited routes to remember. */
const RECENT_LIMIT = 3;

/** Max number of pinned routes. Prevents accidental over-pinning. */
const PIN_LIMIT = 5;

interface SidebarState {
  /** Pinned route keys, shown in "Закріплені" section at the top. */
  pinnedItems: string[];
  /** Most-recently visited route keys, newest-first, capped at {@link RECENT_LIMIT}. */
  recentItems: string[];

  /** Toggle pin for a route. No-op past {@link PIN_LIMIT}. */
  togglePin: (key: string) => void;
  /** Record a route visit. Moves to front, dedupes, caps list. */
  recordVisit: (key: string) => void;
  /** Wipe recents (for the user menu "clear history" action). */
  clearRecent: () => void;
}

/** Zustand store for sidebar personalisation — pins + recent pages. */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      pinnedItems: [],
      recentItems: [],

      togglePin: (key) =>
        set((state) => {
          if (state.pinnedItems.includes(key)) {
            return { pinnedItems: state.pinnedItems.filter((k) => k !== key) };
          }
          if (state.pinnedItems.length >= PIN_LIMIT) return state;
          return { pinnedItems: [...state.pinnedItems, key] };
        }),

      recordVisit: (key) =>
        set((state) => {
          // Don't pollute recents with pinned routes (user already has them).
          if (state.pinnedItems.includes(key)) return state;
          const next = [key, ...state.recentItems.filter((k) => k !== key)].slice(
            0,
            RECENT_LIMIT,
          );
          return { recentItems: next };
        }),

      clearRecent: () => set({ recentItems: [] }),
    }),
    { name: 'agroplatform-sidebar' },
  ),
);
