import { Children, createContext, useContext, type ComponentProps } from 'react';
import { Text as RNText } from 'react-native';
import { translateText } from '@kotoventure/shared';

/** Current UI language (en, ko, ja, zh, es). Provided by the store; onboarding provides its own while choosing. */
export const LangContext = createContext<string>('en');

/**
 * Text that translates its plain-string children for dictionary languages (ja, zh, es).
 * Screens are written in English/Korean; for other languages the English strings are looked up here.
 */
const g = globalThis as { __i18nAdd?: (s: string) => void; __i18nSeen?: Set<string> };

export function Text(props: ComponentProps<typeof RNText>) {
  const lang = useContext(LangContext);
  // dev tooling (web tests): report every rendered string once
  if (g.__i18nAdd) {
    const seen = (g.__i18nSeen ??= new Set());
    Children.forEach(props.children, (c) => {
      if (typeof c === 'string' && !seen.has(c)) {
        seen.add(c);
        g.__i18nAdd!(c);
      }
    });
  }
  if (lang === 'en' || lang === 'ko') return <RNText {...props} />;
  const children = Children.map(props.children, (c) => (typeof c === 'string' ? translateText(c, lang) : c));
  return <RNText {...props}>{children}</RNText>;
}
