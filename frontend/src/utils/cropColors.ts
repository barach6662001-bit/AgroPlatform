import type { CropType } from '../types/field';

export const CROP_COLORS: Record<CropType, string> = {
  Wheat: '#f5c842',
  Barley: '#d4a017',
  Corn: '#ffcc00',
  Sunflower: '#ffd700',
  Soybean: '#90ee90',
  Rapeseed: '#adff2f',
  SugarBeet: '#ff69b4',
  Potato: '#d2b48c',
  Fallow: '#c8c8c8',
  Other: '#a9a9a9',
};

export const DEFAULT_CROP_COLOR = '#3388ff';

export function getCropColor(crop?: CropType | string | null): string {
  if (!crop) return DEFAULT_CROP_COLOR;
  return CROP_COLORS[crop as CropType] ?? DEFAULT_CROP_COLOR;
}
