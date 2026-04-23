import { create } from 'zustand';

type Theme = 'dark';

interface ThemeState {
  theme: Theme;
  /** No-op kept for backwards compatibility with existing callers. */
  setTheme: (theme: Theme) => void;
  /** No-op — the application is dark-only. */
  toggleTheme: () => void;
}

/**
 * Theme store — locked to `dark`. Light mode has been removed; the store is
 * kept only because a handful of components still read `theme` to pick
 * AntD tokens. `setTheme`/`toggleTheme` are intentionally no-ops so that
 * any stray caller can't flip the UI into a broken light variant.
 */
export const useThemeStore = create<ThemeState>()(() => ({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
}));
