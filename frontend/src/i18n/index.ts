import { useLangStore } from '../stores/langStore';
import uk from './uk';
import en from './en';
import type { Translations } from './uk';

const translations: Record<string, Translations> = { uk, en };

export const languages = [
  { code: 'uk', label: 'Українська', flag: 'https://flagcdn.com/w40/ua.png', shortLabel: 'UA' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png', shortLabel: 'EN' },
];

export function useTranslation() {
  const { lang, setLang } = useLangStore();
  const t = translations[lang] ?? uk;
  return { t, lang, setLang };
}
