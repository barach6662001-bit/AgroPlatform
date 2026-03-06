import { useLangStore } from '../stores/langStore';
import uk from './uk';
import en from './en';
import type { Translations } from './uk';

const translations: Record<string, Translations> = { uk, en };

export function useTranslation() {
  const { lang, setLang } = useLangStore();
  const t = translations[lang] ?? uk;
  return { t, lang, setLang };
}
