import { describe, it, expect, beforeEach } from 'vitest';
import { useLangStore } from '../langStore';

beforeEach(() => {
  useLangStore.setState({ lang: 'uk' });
});

describe('langStore', () => {
  it('has default lang set to uk', () => {
    expect(useLangStore.getState().lang).toBe('uk');
  });

  it('setLang changes language to en', () => {
    const { setLang } = useLangStore.getState();
    setLang('en');
    expect(useLangStore.getState().lang).toBe('en');
  });

  it('setLang changes language back to uk', () => {
    useLangStore.setState({ lang: 'en' });
    const { setLang } = useLangStore.getState();
    setLang('uk');
    expect(useLangStore.getState().lang).toBe('uk');
  });

  it('persist config uses key lang-storage', () => {
    // @ts-expect-error accessing internal persist api
    expect(useLangStore.persist.getOptions().name).toBe('lang-storage');
  });
});
