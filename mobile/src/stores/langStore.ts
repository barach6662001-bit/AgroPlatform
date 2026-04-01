import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

type Lang = 'uk' | 'en';

const storage = createMMKV({ id: 'lang-storage' });

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

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
    { name: 'lang-storage', storage: createJSONStorage(() => mmkvStorage) }
  )
);
