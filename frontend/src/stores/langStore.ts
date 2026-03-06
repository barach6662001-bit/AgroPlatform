import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'uk' | 'en';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'uk',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'lang-storage',
    }
  )
);
