import { describe, it, expect, beforeEach } from 'vitest';
import { useLangStore } from '../langStore';

describe('langStore', () => {
  beforeEach(() => {
    useLangStore.setState({ lang: 'uk' });
  });

  it('has default lang "uk"', () => {
    const { lang } = useLangStore.getState();
    expect(lang).toBe('uk');
  });

  it('setLang updates the language', () => {
    const { setLang } = useLangStore.getState();
    setLang('en');
    expect(useLangStore.getState().lang).toBe('en');
  });

  it('setLang can switch back to "uk"', () => {
    useLangStore.setState({ lang: 'en' });
    const { setLang } = useLangStore.getState();
    setLang('uk');
    expect(useLangStore.getState().lang).toBe('uk');
  });
});
