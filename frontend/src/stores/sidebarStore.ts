import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Max number of recently visited routes to remember. */
const RECENT_LIMIT = 3;

/** Max number of pinned routes. Prevents accidental over-pinning. */
const PIN_LIMIT = 5;

/**
 * Default pinned routes per role. Applied one-shot on first login
 * (guarded by {@link SidebarState.hasAppliedRoleDefaults}).
 *
 * User remains free to repin/unpin afterwards — the defaults are a starting
 * point, not a lock. Unknown roles fall through to the `'*'` bucket.
 */
const DEFAULT_PINS_BY_ROLE: Record<string, string[]> = {
  SuperAdmin:       ['/dashboard', '/superadmin', '/fields', '/economics/marginality', '/machinery'],
  CompanyAdmin:     ['/dashboard', '/fields', '/operations', '/economics/marginality', '/machinery'],
  Manager:          ['/dashboard', '/fields', '/operations', '/economics/marginality', '/machinery'],
  WarehouseOperator:['/warehouses', '/warehouses/items', '/grain', '/fuel', '/dashboard'],
  Accountant:       ['/economics', '/sales', '/economics/budget', '/hr/salary', '/economics/pnl'],
  Viewer:           ['/dashboard', '/fields', '/economics/marginality'],
  '*':              ['/dashboard', '/fields', '/operations'],
};

interface SidebarState {
  /** Pinned route keys, shown in "Закріплені" section at the top. */
  pinnedItems: string[];
  /** Most-recently visited route keys, newest-first, capped at {@link RECENT_LIMIT}. */
  recentItems: string[];
  /** True once role-based defaults have been seeded for this browser. */
  hasAppliedRoleDefaults: boolean;

  /** Toggle pin for a route. No-op past {@link PIN_LIMIT}. */
  togglePin: (key: string) => void;
  /** Record a route visit. Moves to front, dedupes, caps list. */
  recordVisit: (key: string) => void;
  /** Wipe recents (for the user menu "clear history" action). */
  clearRecent: () => void;
  /**
   * Seed {@link pinnedItems} from {@link DEFAULT_PINS_BY_ROLE} exactly once per
   * browser+user. Safe to call on every login — subsequent calls are no-ops.
   * Does not override user's manual pins (only applies when pin list is empty).
   */
  applyDefaultPinsForRole: (role: string | null | undefined) => void;
  /** Reset the one-shot flag so defaults re-apply on next login (e.g. after logout). */
  resetRoleDefaults: () => void;
}

/** Zustand store for sidebar personalisation — pins + recent pages. */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      pinnedItems: [],
      recentItems: [],
      hasAppliedRoleDefaults: false,

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

      applyDefaultPinsForRole: (role) =>
        set((state) => {
          if (state.hasAppliedRoleDefaults) return state;
          // Respect user's existing pins — only seed when the list is empty.
          if (state.pinnedItems.length > 0) return { hasAppliedRoleDefaults: true };

          const defaults =
            (role && DEFAULT_PINS_BY_ROLE[role]) || DEFAULT_PINS_BY_ROLE['*'];
          return {
            pinnedItems: defaults.slice(0, PIN_LIMIT),
            hasAppliedRoleDefaults: true,
          };
        }),

      resetRoleDefaults: () => set({ hasAppliedRoleDefaults: false }),
    }),
    { name: 'agroplatform-sidebar' },
  ),
);
