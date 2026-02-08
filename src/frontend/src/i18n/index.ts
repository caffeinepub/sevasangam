import { en, TranslationKeys } from './locales/en';
import { hi } from './locales/hi';
import { assamese } from './locales/as';

export type Language = 'en' | 'hi' | 'as';

export const languages: Record<Language, TranslationKeys> = {
  en,
  hi,
  as: assamese,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  as: 'অসমীয়া',
};

export function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return key if not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

export function interpolate(template: string, values: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

export function translate(
  language: Language,
  key: string,
  values?: Record<string, any>
): string {
  const translations = languages[language];
  let text = getNestedValue(translations, key);
  
  // Handle pluralization
  if (values && 'count' in values) {
    const count = values.count as number;
    if (count !== 1) {
      const pluralKey = `${key}_plural`;
      const pluralText = getNestedValue(translations, pluralKey);
      if (pluralText !== pluralKey) {
        text = pluralText;
      }
    }
  }
  
  if (values) {
    text = interpolate(text, values);
  }
  
  return text;
}
