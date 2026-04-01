import { useColorScheme } from 'react-native';
import { colors, darkColors, type ColorPalette } from '../theme/colors';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const systemScheme = useColorScheme();

  const resolved = mode === 'system' ? (systemScheme ?? 'light') : mode;
  const isDark = resolved === 'dark';
  const palette: ColorPalette = isDark ? darkColors : colors;

  return { colors: palette, isDark, mode, setMode };
}
