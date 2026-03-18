import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLangStore } from '../stores/langStore';
import { useTranslation, languages } from '../i18n';
import uk from '../i18n/uk';
import en from '../i18n/en';

describe('i18n', () => {
  beforeEach(() => {
    useLangStore.setState({ lang: 'uk' });
  });

  it('useTranslation returns Ukrainian translations by default', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.lang).toBe('uk');
    expect(result.current.t.app.name).toBe(uk.app.name);
    expect(result.current.t.auth.login).toBe(uk.auth.login);
  });

  it('useTranslation returns English translations when lang is "en"', () => {
    useLangStore.setState({ lang: 'en' });
    const { result } = renderHook(() => useTranslation());
    expect(result.current.lang).toBe('en');
    expect(result.current.t.app.name).toBe(en.app.name);
    expect(result.current.t.auth.login).toBe(en.auth.login);
  });

  it('all top-level keys in en match keys in uk', () => {
    const ukKeys = Object.keys(uk).sort();
    const enKeys = Object.keys(en).sort();
    expect(enKeys).toEqual(ukKeys);
  });

  it('all nested keys in en match keys in uk for each section', () => {
    for (const section of Object.keys(uk) as Array<keyof typeof uk>) {
      const ukSection = uk[section];
      const enSection = en[section];
      const ukSectionKeys = Object.keys(ukSection).sort();
      const enSectionKeys = Object.keys(enSection).sort();
      expect(enSectionKeys, `Section "${section}" key mismatch`).toEqual(ukSectionKeys);
    }
  });

  it('setLang switches translations', () => {
    const { result } = renderHook(() => useTranslation());
    act(() => {
      result.current.setLang('en');
    });
    expect(result.current.lang).toBe('en');
    expect(result.current.t.nav.dashboard).toBe(en.nav.dashboard);
  });

  it('all dynamic maintenance type keys are defined in both locales', () => {
    // MaintenancePage and MachineDetail build keys as `type${maintenanceType}`
    const MAINTENANCE_TYPES = ['Scheduled', 'Repair', 'Inspection'] as const;
    for (const type of MAINTENANCE_TYPES) {
      const key = `type${type}` as keyof typeof uk.maintenance;
      expect(uk.maintenance[key], `uk.maintenance.${key} should be defined`).toBeTruthy();
      expect(en.maintenance[key], `en.maintenance.${key} should be defined`).toBeTruthy();
    }
  });

  it('all dynamic machinery-type keys are defined in both locales', () => {
    const MACHINERY_TYPES = ['Tractor', 'Combine', 'Sprayer', 'Seeder', 'Cultivator', 'Truck', 'Other'] as const;
    for (const type of MACHINERY_TYPES) {
      const key = type as keyof typeof uk.machineryTypes;
      expect(uk.machineryTypes[key], `uk.machineryTypes.${key} should be defined`).toBeTruthy();
      expect(en.machineryTypes[key], `en.machineryTypes.${key} should be defined`).toBeTruthy();
    }
  });

  it('all dynamic machinery-status keys are defined in both locales', () => {
    const MACHINERY_STATUSES = ['Active', 'UnderRepair', 'Decommissioned'] as const;
    for (const status of MACHINERY_STATUSES) {
      const key = status as keyof typeof uk.machineryStatuses;
      expect(uk.machineryStatuses[key], `uk.machineryStatuses.${key} should be defined`).toBeTruthy();
      expect(en.machineryStatuses[key], `en.machineryStatuses.${key} should be defined`).toBeTruthy();
    }
  });

  it('all dynamic operation-type keys are defined in both locales', () => {
    const OPERATION_TYPES = ['Sowing', 'Fertilizing', 'PlantProtection', 'SoilTillage', 'Harvesting'] as const;
    for (const type of OPERATION_TYPES) {
      const key = type as keyof typeof uk.operationTypes;
      expect(uk.operationTypes[key], `uk.operationTypes.${key} should be defined`).toBeTruthy();
      expect(en.operationTypes[key], `en.operationTypes.${key} should be defined`).toBeTruthy();
    }
  });

  it('all dynamic move-type keys are defined in both locales', () => {
    const MOVE_TYPES = ['Receipt', 'Issue', 'Transfer', 'Adjustment'] as const;
    for (const type of MOVE_TYPES) {
      const key = type as keyof typeof uk.moveTypes;
      expect(uk.moveTypes[key], `uk.moveTypes.${key} should be defined`).toBeTruthy();
      expect(en.moveTypes[key], `en.moveTypes.${key} should be defined`).toBeTruthy();
    }
  });

  it('all dynamic fleet connection-state keys are defined in both locales', () => {
    const CONNECTION_STATES = ['connected', 'reconnecting', 'disconnected'] as const;
    for (const state of CONNECTION_STATES) {
      const key = state as keyof typeof uk.fleet;
      expect(uk.fleet[key], `uk.fleet.${key} should be defined`).toBeTruthy();
      expect(en.fleet[key], `en.fleet.${key} should be defined`).toBeTruthy();
    }
  });

  describe('languages array', () => {
    it('contains Ukrainian and English entries', () => {
      const codes = languages.map(l => l.code);
      expect(codes).toContain('uk');
      expect(codes).toContain('en');
    });

    it('each language has a flag emoji', () => {
      for (const lang of languages) {
        expect(lang.flag, `${lang.code} should have a flag`).toBeTruthy();
        // Emoji flags are surrogate pairs — length > 1
        expect(lang.flag.length, `${lang.code} flag should be an emoji`).toBeGreaterThan(1);
      }
    });

    it('Ukrainian entry has correct flag and shortLabel', () => {
      const uk = languages.find(l => l.code === 'uk');
      expect(uk?.flag).toBe('🇺🇦');
      expect(uk?.shortLabel).toBe('UA');
    });

    it('English entry has correct flag and shortLabel', () => {
      const en = languages.find(l => l.code === 'en');
      expect(en?.flag).toBe('🇬🇧');
      expect(en?.shortLabel).toBe('EN');
    });
  });
});
