import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLangStore } from '../stores/langStore';
import { useTranslation } from '../i18n';
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
});
