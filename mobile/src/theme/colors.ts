export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  skeleton: string;
}

export const colors: ColorPalette = {
  primary: '#1B5E20',
  primaryLight: '#388E3C',
  primaryDark: '#0D3B13',
  accent: '#F9A825',
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textInverse: '#FFFFFF',
  border: '#E0E0E0',
  success: '#2E7D32',
  warning: '#F57F17',
  error: '#C62828',
  info: '#1565C0',
  skeleton: '#E0E0E0',
};

export const darkColors: ColorPalette = {
  primary: '#4CAF50',
  primaryLight: '#66BB6A',
  primaryDark: '#388E3C',
  accent: '#FFD54F',
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  surface: '#2C2C2C',
  text: '#E0E0E0',
  textSecondary: '#9E9E9E',
  textInverse: '#121212',
  border: '#3C3C3C',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  info: '#42A5F5',
  skeleton: '#3C3C3C',
};
