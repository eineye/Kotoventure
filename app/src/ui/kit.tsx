import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { TOPICS, tr, type KnowledgeCard, type TopicId } from '@kotoventure/shared';
import { Prop } from '../art/props';
import { C, R, shadow } from './theme';

export function Btn({
  label,
  onPress,
  kind = 'primary',
  style,
  disabled,
  small,
  testID,
}: {
  label: string;
  testID?: string;
  onPress?: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  small?: boolean;
}) {
  const bg = { primary: C.red, secondary: C.navy, ghost: 'transparent', danger: '#9B1C1C' }[kind];
  const fg = kind === 'ghost' ? C.ink : '#FFF';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        kind === 'ghost' && { borderWidth: 2, borderColor: C.line },
        kind !== 'ghost' && shadow,
        style,
      ]}
    >
      <Text style={[s.btnText, small && { fontSize: 14 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function H({ children, style, size = 22 }: { children: React.ReactNode; style?: StyleProp<TextStyle>; size?: number }) {
  return <Text style={[{ fontSize: size, fontWeight: '900', color: C.ink, letterSpacing: -0.3 }, style]}>{children}</Text>;
}

export function P({ children, style, dim }: { children: React.ReactNode; style?: StyleProp<TextStyle>; dim?: boolean }) {
  return <Text style={[{ fontSize: 15, lineHeight: 22, color: dim ? C.inkSoft : C.ink }, style]}>{children}</Text>;
}

export function Chip({ label, color = C.navy, active, onPress, style }: { label: string; color?: string; active?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, { borderColor: color, backgroundColor: active ? color : '#FFF' }, style]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <Text style={{ color: active ? '#FFF' : color, fontWeight: '800', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function TopicChip({ topic, lang, active = true, count }: { topic: TopicId; lang: string; active?: boolean; count?: number }) {
  const m = TOPICS.find((x) => x.id === topic)!;
  return (
    <View style={[s.chip, { borderColor: m.color, backgroundColor: active ? m.color + '18' : '#F4F4F5', opacity: active ? 1 : 0.5 }]}>
      <Text style={{ color: m.color, fontWeight: '800', fontSize: 12 }}>
        {m.icon} {tr(m.name, lang)}
        {count !== undefined ? ` · ${count}` : ''}
      </Text>
    </View>
  );
}

export function Bar({ value, max = 100, color, label, right }: { value: number; max?: number; color: string; label: string; right?: string }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={s.barLabel}>{label}</Text>
        <Text style={s.barLabel}>{right ?? Math.round(value)}</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function Stars({ n, max = 5, color = C.yellow }: { n: number; max?: number; color?: string }) {
  return (
    <Text style={{ color, fontSize: 14, letterSpacing: 1 }}>
      {'★'.repeat(n)}
      <Text style={{ color: '#D4D4D8' }}>{'★'.repeat(Math.max(0, max - n))}</Text>
    </Text>
  );
}

export const won = (n: number) => '₩' + Math.round(n).toLocaleString('en-US');

export function CardView({ card, lang, compact }: { card: KnowledgeCard; lang: string; compact?: boolean }) {
  const m = TOPICS.find((x) => x.id === card.topic)!;
  return (
    <View style={[s.card, { borderTopColor: m.color }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={[s.propBox, { backgroundColor: m.color + '14' }]}>
          <Prop id={card.prop} size={compact ? 64 : 92} />
        </View>
        <View style={{ flex: 1 }}>
          <TopicChip topic={card.topic} lang={lang} />
          <H size={compact ? 16 : 19} style={{ marginTop: 6 }}>
            {tr(card.title, lang)}
          </H>
        </View>
      </View>
      <P style={{ marginTop: 10 }}>{tr(card.body, lang)}</P>
      {!compact &&
        (card.tips ?? []).map((tip, i) => (
          <P key={i} dim style={{ marginTop: 6 }}>
            💡 {tr(tip, lang)}
          </P>
        ))}
      {card.phrase && <PhraseBox phrase={card.phrase} />}
    </View>
  );
}

export function PhraseBox({ phrase }: { phrase: { hangul: string; roman: string; meaning: string } }) {
  return (
    <View style={s.phrase}>
      <Text style={{ fontSize: 20, fontWeight: '900', color: C.blue }}>{phrase.hangul}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.inkSoft, marginTop: 2 }}>{phrase.roman}</Text>
      <Text style={{ fontSize: 13, color: C.ink, marginTop: 2 }}>“{phrase.meaning}”</Text>
    </View>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.panel, style]}>{children}</View>;
}

const s = StyleSheet.create({
  btn: { paddingVertical: 15, paddingHorizontal: 22, borderRadius: R.m, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  btnSmall: { paddingVertical: 9, paddingHorizontal: 14, minHeight: 40 },
  btnText: { fontSize: 17, fontWeight: '900', letterSpacing: 0.2 },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11, alignSelf: 'flex-start' },
  barLabel: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  barTrack: { height: 7, backgroundColor: '#FFFFFF33', borderRadius: 4, marginTop: 3, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 4 },
  card: { backgroundColor: '#FFF', borderRadius: R.l, padding: 16, borderTopWidth: 6, ...shadow },
  propBox: { borderRadius: R.m, padding: 6 },
  phrase: { marginTop: 12, backgroundColor: '#EEF4FF', borderRadius: R.m, padding: 12, borderLeftWidth: 4, borderLeftColor: C.blue },
  panel: { backgroundColor: '#FFF', borderRadius: R.l, padding: 16, ...shadow },
});
