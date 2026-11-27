import { Children, createContext, useContext, type ComponentProps } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { fontFor } from './font';
import { translateText } from '@kotoventure/shared';

/** Current UI language (en, ko, ja, zh, es). Provided by the store; onboarding provides its own while choosing. */
export const LangContext = createContext<string>('en');
/** weight of the enclosing Text, so nested Text keeps it (each weight is its own font file) */
const WeightContext = createContext<string | number | undefined>(undefined);

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
  // app typeface: the weight picks the Pretendard file (custom fonts can't be bolded synthetically on Android)
  const parentWeight = useContext(WeightContext);
  const flat = StyleSheet.flatten(props.style) ?? {};
  const weight = flat.fontWeight ?? parentWeight;
  const style = flat.fontFamily ? props.style : [props.style, { fontFamily: fontFor(weight), fontWeight: 'normal' as const }];
  const children = lang === 'en' || lang === 'ko' ? props.children : Children.map(props.children, (c) => (typeof c === 'string' ? translateText(c, lang) : c));
  return (
    <WeightContext.Provider value={weight}>
      <RNText {...props} style={style}>
        {children}
      </RNText>
    </WeightContext.Provider>
  );
}
