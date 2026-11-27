import type { ComponentProps } from 'react';
import { Text } from 'react-native-svg';
import { fontFor } from './font';

/** SVG text in the app typeface: the weight picks the Pretendard file. */
export function SvgT({ fontWeight, fontFamily, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props} fontFamily={fontFamily ?? fontFor(fontWeight as string | number | undefined)} fontWeight="normal" />;
}
