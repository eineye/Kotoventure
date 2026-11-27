/**
 * App typeface: Pretendard (SIL Open Font License 1.1, https://github.com/orioncactus/pretendard).
 * Custom fonts can't be synthesised to other weights on Android, so each weight is its own file;
 * `fontFor` turns a fontWeight into the matching family (and the weight is then left 'normal').
 */
export const FONT_FILES = {
  'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
  'Pretendard-ExtraBold': require('../../assets/fonts/Pretendard-ExtraBold.otf'),
  'Pretendard-Black': require('../../assets/fonts/Pretendard-Black.otf'),
};

export type Weight = string | number | undefined | null;

export function fontFor(weight: Weight): keyof typeof FONT_FILES {
  const w = weight === 'bold' ? 700 : weight === 'normal' || weight == null ? 400 : Number(weight) || 400;
  if (w >= 900) return 'Pretendard-Black';
  if (w >= 800) return 'Pretendard-ExtraBold';
  if (w >= 700) return 'Pretendard-Bold';
  if (w >= 500) return 'Pretendard-SemiBold';
  return 'Pretendard-Regular';
}
