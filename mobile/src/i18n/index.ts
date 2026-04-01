import { en } from './en';
import { uk } from './uk';
import { useLangStore } from '../stores/langStore';

const dictionary = { uk, en };

export function useTranslation() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  return {
    lang,
    setLang,
    t: dictionary[lang],
  };
}
