import type { ReactNode } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { PartyType, Speaker } from '@kotoventure/shared';

/* ──────────────────────────────────────────────────────────────
 * Friendly, softly shaded travellers (original characters).
 * Every avatar is drawn in a 100×140 box.
 * ────────────────────────────────────────────────────────────── */

export interface AvatarDef {
  id: string;
  name: string;
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'bun' | 'cap' | 'curly' | 'ponytail';
  top: string;
  bottom: string;
  pack: string;
}

export const AVATARS: AvatarDef[] = [
  { id: 'alex', name: 'Alex', skin: '#F6D2B4', hair: '#6B3E26', hairStyle: 'cap', top: '#2F6FE0', bottom: '#2B3245', pack: '#F08A24' },
  { id: 'mina', name: 'Mina', skin: '#EFC4A0', hair: '#1E1A1A', hairStyle: 'long', top: '#E5484D', bottom: '#3D405B', pack: '#FFC93C' },
  { id: 'kofi', name: 'Kofi', skin: '#8D5524', hair: '#141414', hairStyle: 'curly', top: '#22A06B', bottom: '#2B3245', pack: '#E5484D' },
  { id: 'lena', name: 'Lena', skin: '#F8D9C0', hair: '#E3B04B', hairStyle: 'ponytail', top: '#8B5CF6', bottom: '#1E3A8A', pack: '#22A06B' },
  { id: 'raj', name: 'Raj', skin: '#C68642', hair: '#1B1B1B', hairStyle: 'short', top: '#F08A24', bottom: '#374151', pack: '#2F6FE0' },
  { id: 'yui', name: 'Yui', skin: '#F8D9C0', hair: '#3B2416', hairStyle: 'bun', top: '#F472B6', bottom: '#334155', pack: '#7DD3FC' },
];

export const avatarById = (id?: string) => AVATARS.find((a) => a.id === id) ?? AVATARS[0];

/* colour helpers */
const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return `#${[r, g, b].map((c) => clamp(c + (t - c) * p).toString(16).padStart(2, '0')).join('')}`;
}

function AvatarDefs({ a }: { a: AvatarDef }) {
  const k = a.id;
  return (
    <Defs>
      <RadialGradient id={`${k}-skin`} cx="0.38" cy="0.32" r="0.75">
        <Stop offset="0" stopColor={shade(a.skin, 0.25)} />
        <Stop offset="0.7" stopColor={a.skin} />
        <Stop offset="1" stopColor={shade(a.skin, -0.18)} />
      </RadialGradient>
      <LinearGradient id={`${k}-hair`} x1="0" y1="0" x2="0.4" y2="1">
        <Stop offset="0" stopColor={shade(a.hair, 0.25)} />
        <Stop offset="1" stopColor={shade(a.hair, -0.25)} />
      </LinearGradient>
      <LinearGradient id={`${k}-top`} x1="0" y1="0" x2="1" y2="0.3">
        <Stop offset="0" stopColor={shade(a.top, 0.22)} />
        <Stop offset="0.6" stopColor={a.top} />
        <Stop offset="1" stopColor={shade(a.top, -0.3)} />
      </LinearGradient>
      <LinearGradient id={`${k}-bottom`} x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor={shade(a.bottom, 0.15)} />
        <Stop offset="1" stopColor={shade(a.bottom, -0.25)} />
      </LinearGradient>
      <LinearGradient id={`${k}-pack`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={shade(a.pack, 0.2)} />
        <Stop offset="1" stopColor={shade(a.pack, -0.3)} />
      </LinearGradient>
      <RadialGradient id={`${k}-blush`} cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#FF7A93" stopOpacity="0.55" />
        <Stop offset="1" stopColor="#FF7A93" stopOpacity="0" />
      </RadialGradient>
      <RadialGradient id={`${k}-shadow`} cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#000" stopOpacity="0.28" />
        <Stop offset="1" stopColor="#000" stopOpacity="0" />
      </RadialGradient>
    </Defs>
  );
}

function Hair({ a, back }: { a: AvatarDef; back?: boolean }) {
  const h = `url(#${a.id}-hair)`;
  if (back) {
    if (a.hairStyle === 'long') return <Path d="M27 38 Q22 70 30 92 Q40 96 50 95 Q60 96 70 92 Q78 70 73 38 Z" fill={h} />;
    if (a.hairStyle === 'ponytail')
      return (
        <G>
          <Path d="M69 36 Q90 44 84 76 Q80 84 74 80 Q80 64 70 52 Z" fill={h} />
          <Circle cx="70" cy="36" r="3" fill="#E5484D" />
        </G>
      );
    return null;
  }
  switch (a.hairStyle) {
    case 'cap':
      return (
        <G>
          <Path d="M48 15 Q30 15 27 35 Q36 30 40 30 Z" fill={h} />
          <Path d="M27 36 Q28 13 50 13 Q72 13 73 36 Q50 30 27 36 Z" fill="#E5484D" />
          <Path d="M33 26 Q50 18 67 26" stroke="#FF8A8D" strokeWidth="2" fill="none" opacity={0.7} />
          <Path d="M64 31 Q84 30 88 37 Q76 39 64 36 Z" fill="#B91C1C" />
          <Circle cx="50" cy="14" r="2.5" fill="#B91C1C" />
        </G>
      );
    case 'curly':
      return (
        <G fill={h}>
          {[28, 35, 42, 50, 58, 65, 72].map((x, i) => (
            <Circle key={i} cx={x} cy={24 + (i % 2) * 3 + Math.abs(3 - i) * 1.2} r="8" />
          ))}
          <Circle cx="27" cy="35" r="6" />
          <Circle cx="73" cy="35" r="6" />
          <Path d="M36 20 Q44 16 52 18" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.25} fill="none" />
        </G>
      );
    case 'bun':
      return (
        <G>
          <Circle cx="50" cy="12" r="9" fill={h} />
          <Path d="M45 8 Q50 5 55 8" stroke="#FFFFFF" strokeWidth="1.4" opacity={0.3} fill="none" />
          <Path d="M27 42 Q24 16 50 17 Q76 16 73 42 Q66 26 50 26 Q36 26 27 42Z" fill={h} />
          <Path d="M36 22 Q46 18 56 20" stroke="#FFFFFF" strokeWidth="2" opacity={0.25} fill="none" />
        </G>
      );
    case 'long':
    case 'ponytail':
      return (
        <G>
          <Path d="M26 44 Q22 14 50 15 Q78 14 74 44 Q68 26 52 28 Q50 34 40 30 Q32 34 26 44Z" fill={h} />
          <Path d="M36 21 Q46 17 58 20" stroke="#FFFFFF" strokeWidth="2.2" opacity={0.28} fill="none" />
        </G>
      );
    default:
      return (
        <G>
          <Path d="M27 38 Q24 14 50 15 Q76 14 73 38 Q68 24 56 26 Q50 22 44 26 Q34 25 27 38Z" fill={h} />
          <Path d="M38 20 Q48 16 58 19" stroke="#FFFFFF" strokeWidth="2" opacity={0.25} fill="none" />
        </G>
      );
  }
}

/** The drawing itself, as a <G> so it can be composed into scenes and groups. */
function TravellerG({ a, flip, wave }: { a: AvatarDef; flip?: boolean; wave?: boolean }) {
  const k = a.id;
  const skin = `url(#${k}-skin)`;
  return (
    <G transform={flip ? 'translate(100,0) scale(-1,1)' : undefined}>
      <Ellipse cx="50" cy="133" rx="30" ry="6" fill={`url(#${k}-shadow)`} />
      <Hair a={a} back />
      {/* backpack */}
      <Rect x="20" y="64" width="20" height="38" rx="7" fill={`url(#${k}-pack)`} />
      <Rect x="22" y="82" width="14" height="12" rx="3" fill={shade(a.pack, -0.15)} />
      <Rect x="22" y="82" width="14" height="3" rx="1.5" fill={shade(a.pack, 0.25)} />
      {/* legs + shoes */}
      <Rect x="37.5" y="102" width="11" height="27" rx="4.5" fill={`url(#${k}-bottom)`} />
      <Rect x="52.5" y="102" width="11" height="27" rx="4.5" fill={`url(#${k}-bottom)`} />
      <Path d="M34 132 Q34 125 43 125 Q50 126 50 132 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
      <Path d="M51 132 Q51 125 60 125 Q67 126 67 132 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
      <Rect x="34" y="130" width="16" height="2.5" rx="1" fill="#E5484D" />
      <Rect x="51" y="130" width="16" height="2.5" rx="1" fill="#E5484D" />
      {/* body */}
      <Path d="M32 74 Q32 61 50 61 Q68 61 68 74 L68 104 Q50 108 32 104 Z" fill={`url(#${k}-top)`} />
      <Path d="M43 62 L50 70 L57 62" stroke={shade(a.top, -0.35)} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <Path d="M40 84 Q44 88 41 96 M60 80 Q57 86 60 92" stroke={shade(a.top, -0.3)} strokeWidth="1.2" fill="none" opacity={0.6} />
      <Path d="M36 66 Q38 82 37 100" stroke="#FFFFFF" strokeWidth="2" opacity={0.18} fill="none" />
      {/* straps */}
      <Path d="M37 63 Q35 78 37 96" stroke={shade(a.pack, -0.35)} strokeWidth="3" fill="none" />
      {/* arms */}
      <Rect x="25" y="66" width="10" height="31" rx="5" fill={`url(#${k}-top)`} />
      <Circle cx="30" cy="99" r="5.5" fill={skin} />
      {wave ? (
        <G transform="rotate(-145 70 68)">
          <Rect x="65" y="66" width="10" height="31" rx="5" fill={`url(#${k}-top)`} />
          <Circle cx="70" cy="99" r="5.5" fill={skin} />
        </G>
      ) : (
        <G>
          <Rect x="65" y="66" width="10" height="31" rx="5" fill={`url(#${k}-top)`} />
          <Circle cx="70" cy="99" r="5.5" fill={skin} />
        </G>
      )}
      {/* neck + head */}
      <Rect x="45" y="53" width="10" height="11" rx="3" fill={shade(a.skin, -0.15)} />
      <Ellipse cx="27.5" cy="42" rx="3.5" ry="4.5" fill={skin} />
      <Ellipse cx="72.5" cy="42" rx="3.5" ry="4.5" fill={skin} />
      <Circle cx="50" cy="39" r="23" fill={skin} />
      <Hair a={a} />
      {/* face */}
      <Ellipse cx="37" cy="49" rx="5.5" ry="3.6" fill={`url(#${k}-blush)`} />
      <Ellipse cx="63" cy="49" rx="5.5" ry="3.6" fill={`url(#${k}-blush)`} />
      <Path d="M37 35 Q41.5 32.5 46 35" stroke={shade(a.hair, -0.2)} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Path d="M54 35 Q58.5 32.5 63 35" stroke={shade(a.hair, -0.2)} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Ellipse cx="41.5" cy="42" rx="3.4" ry="4.3" fill="#2A1E1A" />
      <Ellipse cx="58.5" cy="42" rx="3.4" ry="4.3" fill="#2A1E1A" />
      <Circle cx="42.8" cy="40.4" r="1.4" fill="#FFFFFF" />
      <Circle cx="59.8" cy="40.4" r="1.4" fill="#FFFFFF" />
      <Circle cx="40.6" cy="43.9" r="0.6" fill="#FFFFFF" opacity={0.8} />
      <Circle cx="57.6" cy="43.9" r="0.6" fill="#FFFFFF" opacity={0.8} />
      <Path d="M49 46 Q50 47.5 51 46" stroke={shade(a.skin, -0.35)} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Path d="M44.5 50.5 Q50 56 55.5 50.5 Q50 53.5 44.5 50.5Z" fill="#B23A48" stroke="#7A1F2B" strokeWidth="0.8" strokeLinejoin="round" />
      <Path d="M47.5 53 Q50 54.6 52.5 53" stroke="#FF8FA3" strokeWidth="1.2" fill="none" />
    </G>
  );
}

/** A full-body traveller. */
export function Traveller({ a, size = 100, wave = false, flip = false }: { a: AvatarDef; size?: number; wave?: boolean; flip?: boolean }) {
  return (
    <Svg width={size} height={size * 1.4} viewBox="0 0 100 140">
      <AvatarDefs a={a} />
      <TravellerG a={a} flip={flip} wave={wave} />
    </Svg>
  );
}

/** Party illustration for the onboarding selection and gameplay scenes. */
export function PartyArt({ party, lead, size = 150 }: { party: PartyType; lead: AvatarDef; size?: number }) {
  const others = AVATARS.filter((x) => x.id !== lead.id);
  const used = new Set<AvatarDef>([lead]);
  const fig = (a: AvatarDef, x: number, s: number, key: string, flip = false) => {
    used.add(a);
    return (
      <G key={key} transform={`translate(${x},${140 - s * 1.4}) scale(${s / 100})`}>
        <TravellerG a={a} flip={flip} />
      </G>
    );
  };
  let body: ReactNode[] = [];
  if (party === 'solo') body = [fig(lead, 50, 100, 'l')];
  if (party === 'couple')
    body = [
      fig(lead, 22, 92, 'l'),
      fig(others[0], 96, 92, 'o', true),
      <G key="h">
        <Path d="M100 30 c-6 -10 -20 -4 -12 8 l12 12 l12 -12 c8 -12 -6 -18 -12 -8z" fill="#E5484D" />
        <Path d="M92 24 q-4 2 -3 7" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity={0.6} />
      </G>,
    ];
  if (party === 'friends') body = [fig(others[1], 0, 80, 'a'), fig(others[2], 120, 80, 'b', true), fig(lead, 54, 92, 'l')];
  if (party === 'group')
    body = [
      <Path key="pole" d="M18 20 L18 120" stroke="#5A6283" strokeWidth="3" />,
      <Path key="flag" d="M18 20 L50 28 L18 38 Z" fill="#FFC93C" />,
      fig(others[0], -4, 70, 'a'),
      fig(others[1], 40, 70, 'b'),
      fig(others[2], 84, 70, 'c'),
      fig(others[3], 128, 70, 'd', true),
      fig(lead, 62, 86, 'l'),
    ];
  return (
    <Svg width={size} height={size * 0.7} viewBox="0 0 200 140">
      {[...used].map((a) => (
        <AvatarDefs key={a.id} a={a} />
      ))}
      {body}
    </Svg>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Kachi – the magpie guide (까치, Korea's good-news bird). Original mascot.
 * ────────────────────────────────────────────────────────────── */
export function Kachi({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="kachi-body" cx="0.4" cy="0.3" r="0.8">
          <Stop offset="0" stopColor="#3B4470" />
          <Stop offset="1" stopColor="#111633" />
        </RadialGradient>
        <LinearGradient id="kachi-wing" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#60A5FA" />
          <Stop offset="1" stopColor="#1D4ED8" />
        </LinearGradient>
        <RadialGradient id="kachi-belly" cx="0.4" cy="0.3" r="0.8">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#DCE3EE" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50" cy="94" rx="22" ry="3.5" fill="#000" opacity={0.15} />
      <Path d="M18 66 L2 86 L10 88 L26 72 Z" fill="url(#kachi-body)" />
      <Path d="M14 74 L6 84" stroke="#3B82F6" strokeWidth="3" />
      <Ellipse cx="50" cy="62" rx="30" ry="24" fill="url(#kachi-body)" />
      <Ellipse cx="56" cy="68" rx="20" ry="15" fill="url(#kachi-belly)" />
      <Path d="M28 54 Q40 40 56 56 Q44 64 28 62 Z" fill="url(#kachi-wing)" />
      <Path d="M30 58 Q42 50 52 58" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <Circle cx="64" cy="36" r="20" fill="url(#kachi-body)" />
      <Circle cx="70" cy="33" r="6.5" fill="#FFFFFF" />
      <Circle cx="71.5" cy="33.5" r="3.4" fill="#111633" />
      <Circle cx="72.8" cy="32" r="1.3" fill="#FFFFFF" />
      <Path d="M82 38 L98 42 L82 46 Z" fill="#FFC93C" />
      <Path d="M82 42 L98 42" stroke="#D97706" strokeWidth="0.8" />
      <Circle cx="64" cy="45" r="4" fill="#FF8FA3" opacity={0.6} />
      <Path d="M56 22 Q62 18 70 20" stroke="#FFFFFF" strokeWidth="2" opacity={0.25} fill="none" />
      <Path d="M44 84 L42 94 M56 84 L56 94" stroke="#F08A24" strokeWidth="3" strokeLinecap="round" />
      <Path d="M48 52 Q64 60 80 50 L82 56 Q64 66 48 58Z" fill="#E5484D" />
      <Path d="M52 55 Q64 60 76 54" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} fill="none" />
    </Svg>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Speaker portraits for dialogs (bust, 100×100).
 * ────────────────────────────────────────────────────────────── */
const SPEAKER_STYLE: Record<Exclude<Speaker, 'guide' | 'player'>, { skin: string; hair: string; top: string; hat?: 'police' | 'cap' | 'hood' | 'none' | 'perm' | 'bald'; coat?: boolean; label: string; bg: string }> = {
  local: { skin: '#EFC4A0', hair: '#3B2416', top: '#D9480F', hat: 'perm', label: 'Local', bg: '#FFE8D6' },
  staff: { skin: '#F6D2B4', hair: '#1B1B1B', top: '#2F855A', label: 'Staff', bg: '#DCFCE7' },
  driver: { skin: '#EFC4A0', hair: '#2B2B2B', top: '#64748B', hat: 'cap', label: 'Driver', bg: '#E2E8F0' },
  police: { skin: '#F2C9A0', hair: '#1B1B1B', top: '#1E3A8A', hat: 'police', label: 'Tourist Police', bg: '#DBEAFE' },
  doctor: { skin: '#F6D2B4', hair: '#1B1B1B', top: '#FFFFFF', coat: true, label: 'Doctor', bg: '#E0F2FE' },
  pharmacist: { skin: '#EFC4A0', hair: '#4A2C1A', top: '#FFFFFF', coat: true, label: 'Pharmacist', bg: '#DCFCE7' },
  elder: { skin: '#EFC4A0', hair: '#D1D5DB', top: '#8B5CF6', label: 'Elder', bg: '#EDE9FE' },
  monk: { skin: '#EFC4A0', hair: '#EFC4A0', top: '#8D8D8D', hat: 'bald', label: 'Monk', bg: '#F5F5F4' },
  haenyeo: { skin: '#C68642', hair: '#111', top: '#111827', hat: 'hood', label: 'Haenyeo', bg: '#CFFAFE' },
};

export function SpeakerPortrait({ speaker, avatar, size = 64 }: { speaker: Speaker; avatar?: AvatarDef; size?: number }) {
  if (speaker === 'guide') return <Kachi size={size} />;
  if (speaker === 'player' && avatar)
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <AvatarDefs a={avatar} />
        <Circle cx="50" cy="50" r="48" fill="#E8F1FF" />
        <G transform="translate(0,6)">
          <TravellerG a={avatar} />
        </G>
      </Svg>
    );
  const s = SPEAKER_STYLE[speaker as keyof typeof SPEAKER_STYLE] ?? SPEAKER_STYLE.local;
  const k = `sp-${speaker}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${k}-bg`} cx="0.5" cy="0.35" r="0.7">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor={s.bg} />
        </RadialGradient>
        <RadialGradient id={`${k}-skin`} cx="0.38" cy="0.32" r="0.75">
          <Stop offset="0" stopColor={shade(s.skin, 0.25)} />
          <Stop offset="0.7" stopColor={s.skin} />
          <Stop offset="1" stopColor={shade(s.skin, -0.18)} />
        </RadialGradient>
        <LinearGradient id={`${k}-top`} x1="0" y1="0" x2="1" y2="0.3">
          <Stop offset="0" stopColor={shade(s.top, s.coat ? 0 : 0.2)} />
          <Stop offset="1" stopColor={shade(s.top, -0.25)} />
        </LinearGradient>
        <RadialGradient id={`${k}-blush`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FF7A93" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#FF7A93" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="50" r="48" fill={`url(#${k}-bg)`} />
      <Path d="M16 100 Q16 66 50 66 Q84 66 84 100 Z" fill={`url(#${k}-top)`} stroke={s.coat ? '#CBD5E1' : 'none'} strokeWidth="2" />
      {s.coat && <Path d="M50 68 L42 100 M50 68 L58 100" stroke="#CBD5E1" strokeWidth="2" />}
      {s.coat && <Path d="M38 74 Q34 88 44 90" stroke="#334155" strokeWidth="2.5" fill="none" />}
      {s.coat && speaker === 'pharmacist' && <Rect x="58" y="78" width="10" height="10" rx="2" fill="#22A06B" />}
      <Rect x="45" y="58" width="10" height="10" rx="3" fill={shade(s.skin, -0.15)} />
      <Circle cx="50" cy="44" r="22" fill={`url(#${k}-skin)`} />
      {s.hat === 'perm' && (
        <G fill={s.hair}>
          {[30, 38, 46, 54, 62, 70].map((x) => (
            <Circle key={x} cx={x} cy={26 + (x % 3)} r="8.5" />
          ))}
        </G>
      )}
      {(!s.hat || s.hat === 'cap') && <Path d="M28 44 Q26 20 50 20 Q74 20 72 44 Q66 30 50 30 Q34 30 28 44Z" fill={s.hair} />}
      {s.hat === 'cap' && <Path d="M28 34 Q30 18 50 18 Q70 18 72 34 Z M68 32 L86 34 L70 36Z" fill="#334155" />}
      {s.hat === 'police' && (
        <G>
          <Path d="M26 34 Q28 14 50 14 Q72 14 74 34 Z" fill="#1E3A8A" />
          <Rect x="24" y="32" width="52" height="6" rx="2" fill="#0F172A" />
          <Circle cx="50" cy="24" r="4" fill="#FFC93C" />
        </G>
      )}
      {s.hat === 'hood' && (
        <G>
          <Path d="M24 50 Q22 18 50 18 Q78 18 76 50 L70 50 Q70 30 50 30 Q30 30 30 50 Z" fill="#111827" />
          <Rect x="32" y="34" width="36" height="12" rx="6" fill="#93C5FD" stroke="#111827" strokeWidth="3" />
          <Path d="M36 37 L44 37" stroke="#FFFFFF" strokeWidth="2" opacity={0.6} />
        </G>
      )}
      <Ellipse cx="37" cy="53" rx="5" ry="3.3" fill={`url(#${k}-blush)`} />
      <Ellipse cx="63" cy="53" rx="5" ry="3.3" fill={`url(#${k}-blush)`} />
      {s.hat !== 'hood' && (
        <G>
          <Ellipse cx="42" cy="46" rx="2.8" ry="3.5" fill="#2A1E1A" />
          <Ellipse cx="58" cy="46" rx="2.8" ry="3.5" fill="#2A1E1A" />
          <Circle cx="43" cy="44.8" r="1.1" fill="#FFFFFF" />
          <Circle cx="59" cy="44.8" r="1.1" fill="#FFFFFF" />
        </G>
      )}
      {speaker === 'elder' && <Path d="M36 40 L46 40 M54 40 L64 40" stroke="#9CA3AF" strokeWidth="2" />}
      <Path d="M44 55 Q50 60 56 55" stroke="#7A1F2B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {speaker === 'police' && (
        <SvgText x="50" y="92" fontSize="8" fill="#FFF" textAnchor="middle" fontWeight="700">
          POLICE
        </SvgText>
      )}
    </Svg>
  );
}

export const speakerLabel = (sp: Speaker, playerName: string) =>
  sp === 'guide' ? 'Kachi' : sp === 'player' ? playerName : SPEAKER_STYLE[sp as keyof typeof SPEAKER_STYLE]?.label ?? sp;
