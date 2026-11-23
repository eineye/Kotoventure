import React, { useId, useState } from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { breakdownKRW, type Cash, type Effects, type PartyType, type SimStep } from '@kotoventure/shared';
import { Banknote, Coin } from '../art/Money';
import { Btn, H, P, won } from '../ui/kit';
import { C, R, shadow } from '../ui/theme';

export interface SimCtx {
  lang: string;
  party: PartyType;
  partySize: number;
  country: string;
  fxRates: Record<string, number>;
  /** physical cash in the wallet (denomination → count) */
  cash: Cash;
  /** current energy and consequence flags */
  energy: number;
  flags: string[];
}

export interface SimResult {
  score: number;
  effects?: Effects;
  /** short log of what the player did, shown on the result card */
  log: string[];
  /** wallet after the simulation (omit = unchanged) */
  cash?: Cash;
  /** flags to add (e.g. visit:bukchon) */
  flags?: string[];
  /** day planner: when the planned day starts and ends (minutes since midnight) */
  startMin?: number;
  endMin?: number;
}

export interface SimProps {
  step: SimStep;
  ctx: SimCtx;
  onDone: (r: SimResult) => void;
}

export const PARTY_SIZE: Record<PartyType, number> = { solo: 1, couple: 2, friends: 3, group: 6 };

export type Feedback = { kind: 'ok' | 'err' | 'info'; text: string } | null;

/** Score keeper: starts at 100, each mistake costs points (never below 20 when finished). */
export function useScore(penalty = 12) {
  const [mistakes, setMistakes] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  return {
    mistakes,
    fb,
    ok: (text: string) => setFb({ kind: 'ok', text }),
    info: (text: string) => setFb({ kind: 'info', text }),
    miss: (text: string) => {
      setMistakes((m) => m + 1);
      setFb({ kind: 'err', text });
    },
    addBonus: (n: number) => setBonus((b) => b + n),
    clear: () => setFb(null),
    final: () => Math.max(20, Math.min(100, 100 - mistakes * penalty + bonus)),
  };
}

export function SimShell({
  title,
  stage,
  stages,
  fb,
  children,
  scroll = true,
}: {
  title: string;
  stage: number;
  stages: string[];
  fb: Feedback;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const body = <View style={{ padding: 14, paddingBottom: 30, gap: 12 }}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: '#EEF2F7' }}>
      <View style={{ backgroundColor: C.navy, paddingHorizontal: 14, paddingVertical: 10 }}>
        <Text style={{ color: C.yellow, fontWeight: '900', fontSize: 12 }}>🎮 SIMULATION</Text>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 17 }}>{title}</Text>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
          {stages.map((s, i) => (
            <View key={s} style={{ flex: 1 }}>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: i < stage ? C.green : i === stage ? C.yellow : '#FFFFFF33' }} />
              <Text numberOfLines={1} style={{ color: i === stage ? '#FFF' : '#FFFFFF88', fontSize: 9, fontWeight: '800', marginTop: 2 }}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>
      {fb && (
        <View
          style={{
            backgroundColor: fb.kind === 'ok' ? '#DCFCE7' : fb.kind === 'err' ? '#FEE2E2' : '#E0F2FE',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#0001',
          }}
        >
          <Text style={{ fontWeight: '800', color: fb.kind === 'ok' ? '#166534' : fb.kind === 'err' ? '#991B1B' : '#075985' }}>
            {fb.kind === 'ok' ? '✅ ' : fb.kind === 'err' ? '⚠️ ' : '💡 '}
            {fb.text}
          </Text>
        </View>
      )}
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{body}</ScrollView> : body}
    </View>
  );
}

export function Box({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: '#FFF', borderRadius: R.m, padding: 12, ...shadow }, style]}>{children}</View>;
}

/** Big tappable option button used inside machine screens and quizzes. */
export function OptBtn({
  label,
  sub,
  onPress,
  color = '#1D4ED8',
  disabled,
  selected,
  testID,
  style,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  selected?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: selected ? color : '#FFF',
          borderColor: color,
          borderWidth: 2,
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 10,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
          minHeight: 46,
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ color: selected ? '#FFF' : color, fontWeight: '900', fontSize: 14, textAlign: 'center' }}>{label}</Text>
      {sub ? <Text style={{ color: selected ? '#FFFD' : C.inkSoft, fontSize: 11, textAlign: 'center', marginTop: 2, fontWeight: '700' }}>{sub}</Text> : null}
    </Pressable>
  );
}

/** Numeric keypad used by the ATM and ticket machines. */
export function Keypad({ onKey, testPrefix = 'key' }: { onKey: (k: string) => void; testPrefix?: string }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, width: 156 }}>
      {keys.map((k) => (
        <Pressable
          key={k}
          testID={`${testPrefix}-${k}`}
          onPress={() => onKey(k)}
          style={({ pressed }) => ({
            width: 46,
            height: 34,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: k === 'C' ? '#FCD34D' : k === 'OK' ? '#22C55E' : '#E5E7EB',
            borderBottomWidth: 3,
            borderBottomColor: '#0003',
            transform: [{ translateY: pressed ? 2 : 0 }],
          })}
        >
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: k.length > 1 ? 12 : 16 }}>{k === 'C' ? '정정' : k === 'OK' ? '확인' : k}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Shows an amount as the real notes/coins you would receive (true relative size). */
export function MoneyTray({ amount, noteWidth = 150 }: { amount: number; noteWidth?: number }) {
  const parts = breakdownKRW(amount);
  const pxPerMm = noteWidth / 154;
  return (
    <View style={{ gap: 6 }}>
      {parts.map((p) => (
        <View key={p.value} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {p.value >= 1000 ? (
            <View style={{ width: noteWidth + Math.min(p.count - 1, 4) * 6 }}>
              {Array.from({ length: Math.min(p.count, 5) }).map((_, i) => (
                <View key={i} style={{ position: i === 0 ? 'relative' : 'absolute', left: i * 6, top: i * 3 }}>
                  <Banknote value={p.value} width={(noteWidth * notePx(p.value)) / 154} />
                </View>
              ))}
            </View>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              {Array.from({ length: Math.min(p.count, 6) }).map((_, i) => (
                <View key={i} style={{ marginLeft: i ? -8 : 0 }}>
                  <Coin value={p.value} pxPerMm={pxPerMm * 1.6} />
                </View>
              ))}
            </View>
          )}
          <Text style={{ fontWeight: '900', color: C.ink }}>
            {won(p.value)} × {p.count}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** real note length in mm */
export const notePx = (v: number) => ({ 1000: 136, 5000: 142, 10000: 148, 50000: 154 })[v as 1000] ?? 154;

/** End of a practice simulation: what you did (no score – this is a travel simulation). */
export function DoneCard({ title, log, onContinue, lang }: { title: string; score?: number; log: string[]; onContinue: () => void; lang: string }) {
  return (
    <Box style={{ alignItems: 'center', gap: 8 }}>
      <Text style={{ fontSize: 40 }}>✅</Text>
      <H size={20}>{title}</H>
      <View style={{ alignSelf: 'stretch', gap: 4 }}>
        {log.map((l, i) => (
          <P key={i} style={{ fontSize: 14 }}>
            • {l}
          </P>
        ))}
      </View>
      <Btn testID="sim-continue" label={lang === 'ko' ? '미션 계속하기' : 'Continue mission'} onPress={onContinue} style={{ alignSelf: 'stretch' }} />
    </Box>
  );
}

/** Wallet strip with items the player can hold (card, passbook, notes). */
export function WalletBar({
  items,
  selected,
  onSelect,
  title = 'Your wallet – tap an item, then tap where to use it',
}: {
  items: { id: string; label: string; icon: string; disabled?: boolean }[];
  selected: string | null;
  onSelect: (id: string) => void;
  title?: string;
}) {
  return (
    <View style={{ backgroundColor: '#3F2A1D', borderRadius: R.m, padding: 8 }}>
      <Text style={{ color: '#FDE68A', fontWeight: '800', fontSize: 11, marginBottom: 6 }}>👛 {title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {items.map((it) => (
          <Pressable
            key={it.id}
            testID={`wallet-${it.id}`}
            disabled={it.disabled}
            onPress={() => onSelect(it.id)}
            style={{
              backgroundColor: selected === it.id ? C.yellow : '#FFF',
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 9,
              opacity: it.disabled ? 0.35 : 1,
              borderWidth: 2,
              borderColor: selected === it.id ? '#B45309' : 'transparent',
            }}
          >
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 13 }}>
              {it.icon} {it.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Small labelled hardware slot on a machine (card slot, passbook slot, cash outlet…). */
export function Slot({
  label,
  sub,
  onPress,
  width = 120,
  height = 26,
  blink,
  testID,
  color = '#111827',
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  width?: number;
  height?: number;
  blink?: boolean;
  testID?: string;
  color?: string;
}) {
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ alignItems: 'center' }}>
      <View
        style={{
          width,
          height,
          borderRadius: 6,
          backgroundColor: color,
          borderWidth: 3,
          borderTopColor: blink ? '#4ADE80' : '#E5E7EB',
          borderLeftColor: blink ? '#4ADE80' : '#D1D5DB',
          borderRightColor: blink ? '#16A34A' : '#6B7280',
          borderBottomColor: blink ? '#16A34A' : '#4B5563',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: width - 24, height: 4, borderRadius: 2, backgroundColor: '#000' }} />
      </View>
      <Text style={{ fontSize: 10, fontWeight: '900', color: '#F8FAFC', marginTop: 2 }}>{label}</Text>
      {sub ? <Text style={{ fontSize: 9, fontWeight: '700', color: '#CBD5E1' }}>{sub}</Text> : null}
    </Pressable>
  );
}

const cleanId = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '');

/** Brushed-metal machine body: vertical gradient, fine brushing lines, top highlight and bevel. */
export function Metal({
  colors,
  children,
  style,
  radius = 14,
}: {
  colors: [string, string, string];
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}) {
  const id = 'm' + cleanId(useId());
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden', borderWidth: 1, borderColor: '#0006', backgroundColor: colors[1], ...shadowStrong }, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" pointerEvents="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0.25" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="0.45" stopColor={colors[1]} />
            <Stop offset="1" stopColor={colors[2]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
        <Path d={Array.from({ length: 50 }, (_, i) => `M0 ${i * 2 + 0.5}H100`).join('')} stroke="#FFFFFF" strokeWidth="0.15" opacity={0.08} />
        <Rect x="0" y="0" width="100" height="2.5" fill="#FFFFFF" opacity={0.25} />
        <Rect x="0" y="97.5" width="100" height="2.5" fill="#000000" opacity={0.25} />
      </Svg>
      {children}
    </View>
  );
}

/** Touch screen: dark bezel, softly lit LCD and a diagonal glass reflection. */
export function Glass({ children, minHeight = 160, tint = '#E8F4FF', style }: { children: React.ReactNode; minHeight?: number; tint?: string; style?: StyleProp<ViewStyle> }) {
  const id = 'g' + cleanId(useId());
  return (
    <View style={[{ backgroundColor: '#0B1220', borderRadius: 10, padding: 6, borderWidth: 2, borderColor: '#334155' }, style]}>
      <View style={{ borderRadius: 5, overflow: 'hidden', minHeight, backgroundColor: tint }}>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" pointerEvents="none">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" />
              <Stop offset="1" stopColor={tint} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
        </Svg>
        <View style={{ padding: 8, gap: 8, flexGrow: 1, justifyContent: 'center' }}>{children}</View>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" pointerEvents="none">
          <Path d="M0 0 L42 0 L18 100 L0 100 Z" fill="#FFFFFF" opacity={0.18} />
          <Path d="M50 0 L56 0 L32 100 L26 100 Z" fill="#FFFFFF" opacity={0.12} />
        </Svg>
      </View>
    </View>
  );
}

const shadowStrong = { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 8 };
