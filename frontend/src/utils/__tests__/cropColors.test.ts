import { describe, it, expect } from 'vitest';
import { getCropColor, CROP_COLORS, DEFAULT_CROP_COLOR } from '../cropColors';
import type { CropType } from '../../types/field';

describe('getCropColor', () => {
  it('returns default color for null', () => {
    expect(getCropColor(null)).toBe(DEFAULT_CROP_COLOR);
  });

  it('returns default color for undefined', () => {
    expect(getCropColor(undefined)).toBe(DEFAULT_CROP_COLOR);
  });

  it('returns default color for empty string', () => {
    expect(getCropColor('')).toBe(DEFAULT_CROP_COLOR);
  });

  it('returns default color for unknown crop', () => {
    expect(getCropColor('UnknownCrop')).toBe(DEFAULT_CROP_COLOR);
  });

  it('returns correct color for each known crop type', () => {
    const cropTypes: CropType[] = [
      'Wheat', 'Barley', 'Corn', 'Sunflower', 'Soybean',
      'Rapeseed', 'SugarBeet', 'Potato', 'Fallow', 'Other',
    ];
    for (const crop of cropTypes) {
      expect(getCropColor(crop)).toBe(CROP_COLORS[crop]);
      expect(getCropColor(crop)).not.toBe(DEFAULT_CROP_COLOR);
    }
  });

  it('CROP_COLORS covers all CropType values', () => {
    const expectedKeys: CropType[] = [
      'Wheat', 'Barley', 'Corn', 'Sunflower', 'Soybean',
      'Rapeseed', 'SugarBeet', 'Potato', 'Fallow', 'Other',
    ];
    for (const key of expectedKeys) {
      expect(CROP_COLORS[key]).toBeDefined();
      expect(typeof CROP_COLORS[key]).toBe('string');
      expect(CROP_COLORS[key]).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    }
  });
});
