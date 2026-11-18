import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { PartyType, Speaker } from '@kotoventure/shared';

/* ──────────────────────────────────────────────────────────────
 * Original chibi travellers. Every avatar is drawn in a 100×140 box.
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
  { id: 'alex', name: 'Alex', skin: '#F9D7B9', hair: '#6B3E26', hairStyle: 'cap', top: '#1D4ED8', bottom: '#2B2D42', pack: '#F08A24' },
  { id: 'mina', name: 'Mina', skin: '#EDB98A', hair: '#1B1B1B', hairStyle: 'long', top: '#E5383B', bottom: '#3D405B', pack: '#FFC93C' },
  { id: 'kofi', name: 'Kofi', skin: '#8D5524', hair: '#111111', hairStyle: 'curly', top: '#22A06B', bottom: '#2B2D42', pack: '#E5383B' },
  { id: 'lena', name: 'Lena', skin: '#F9D7B9', hair: '#E3B04B', hairStyle: 'ponytail', top: '#7C3AED', bottom: '#1E3A8A', pack: '#22A06B' },
  { id: 'raj', name: 'Raj', skin: '#C68642', hair: '#1B1B1B', hairStyle: 'short', top: '#F08A24', bottom: '#374151', pack: '#1D4ED8' },
  { id: 'yui', name: 'Yui', skin: '#F9D7B9', hair: '#3B2416', hairStyle: 'bun', top: '#F472B6', bottom: '#334155', pack: '#8FD3FF' },
];

export const avatarById = (id?: string) => AVATARS.find((a) => a.id === id) ?? AVATARS[0];

function Hair({ a, back }: { a: AvatarDef; back?: boolean }) {
  const h = a.hair;
  if (back) {
    if (a.hairStyle === 'long') return <Path d="M26 40 Q24 82 34 90 L66 90 Q76 82 74 40 Z" fill={h} />;
    if (a.hairStyle === 'ponytail') return <Path d="M70 40 Q88 50 80 78 Q74 66 70 58 Z" fill={h} />;
    return null;
  }
  switch (a.hairStyle) {
    case 'cap':
      return (
        <G>
          <Path d="M28 38 Q30 16 50 16 Q70 16 72 38 Z" fill="#E5383B" />
          <Path d="M66 34 Q84 34 86 40 L64 40 Z" fill="#B91C1C" />
          <Circle cx="50" cy="17" r="3" fill="#B91C1C" />
        </G>
      );
    case 'curly':
      return (
        <G fill={h}>
          {[30, 38, 46, 54, 62, 70].map((x, i) => <Circle key={i} cx={x} cy={26 + (i % 2) * 3} r="8" />)}
          <Circle cx="28" cy="36" r="6" />
          <Circle cx="72" cy="36" r="6" />
        </G>
      );
    case 'bun':
      return (
        <G fill={h}>
          <Circle cx="50" cy="13" r="9" />
          <Path d="M27 42 Q26 18 50 18 Q74 18 73 42 Q62 28 50 28 Q38 28 27 42Z" />
        </G>
      );
    case 'long':
    case 'ponytail':
      return <Path d="M27 44 Q24 16 50 16 Q76 16 73 44 Q66 26 46 28 Q36 30 27 44Z" fill={h} />;
    default:
      return <Path d="M28 40 Q26 16 50 16 Q74 16 72 40 Q68 26 50 26 Q34 26 28 40Z" fill={h} />;
  }
}

/** A full-body traveller. */
export function Traveller({ a, size = 100, wave = false, flip = false }: { a: AvatarDef; size?: number; wave?: boolean; flip?: boolean }) {
  return (
    <Svg width={size} height={size * 1.4} viewBox="0 0 100 140">
      <G transform={flip ? 'translate(100,0) scale(-1,1)' : undefined}>
        <Ellipse cx="50" cy="134" rx="26" ry="5" fill="#000" opacity={0.12} />
        <Hair a={a} back />
        {/* backpack */}
        <Rect x="22" y="66" width="18" height="34" rx="6" fill={a.pack} />
        {/* legs */}
        <Rect x="38" y="104" width="10" height="26" rx="4" fill={a.bottom} />
        <Rect x="53" y="104" width="10" height="26" rx="4" fill={a.bottom} />
        <Ellipse cx="42" cy="131" rx="8" ry="4" fill="#1B2140" />
        <Ellipse cx="59" cy="131" rx="8" ry="4" fill="#1B2140" />
        {/* body */}
        <Rect x="32" y="62" width="36" height="46" rx="14" fill={a.top} />
        {/* arms */}
        <Rect x="26" y="66" width="9" height="30" rx="4.5" fill={a.top} />
        {wave ? (
          <G transform="rotate(-140 70 68)">
            <Rect x="66" y="66" width="9" height="30" rx="4.5" fill={a.top} />
            <Circle cx="70.5" cy="98" r="5" fill={a.skin} />
          </G>
        ) : (
          <G>
            <Rect x="66" y="66" width="9" height="30" rx="4.5" fill={a.top} />
            <Circle cx="70.5" cy="98" r="5" fill={a.skin} />
          </G>
        )}
        <Circle cx="30.5" cy="98" r="5" fill={a.skin} />
        {/* straps */}
        <Path d="M38 64 L36 92" stroke="#00000033" strokeWidth="3" />
        {/* head */}
        <Rect x="45" y="54" width="10" height="10" fill={a.skin} />
        <Circle cx="50" cy="40" r="22" fill={a.skin} />
        <Hair a={a} />
        {/* face */}
        <Ellipse cx="42" cy="42" rx="2.6" ry="3.2" fill="#1B2140" />
        <Ellipse cx="58" cy="42" rx="2.6" ry="3.2" fill="#1B2140" />
        <Circle cx="38" cy="49" r="3.2" fill="#FF8FA3" opacity={0.55} />
        <Circle cx="62" cy="49" r="3.2" fill="#FF8FA3" opacity={0.55} />
        <Path d="M45 50 Q50 55 55 50" stroke="#1B2140" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

/** Party illustration for the onboarding selection. */
export function PartyArt({ party, lead, size = 150 }: { party: PartyType; lead: AvatarDef; size?: number }) {
  const others = AVATARS.filter((x) => x.id !== lead.id);
  const fig = (a: AvatarDef, x: number, s: number, key: string, flip = false) => (
    <G key={key} transform={`translate(${x},${140 - s * 1.4}) scale(${s / 100})`}>
      <TravellerG a={a} flip={flip} />
    </G>
  );
  let body: any[] = [];
  if (party === 'solo') body = [fig(lead, 50, 100, 'l')];
  if (party === 'couple')
    body = [
      fig(lead, 22, 92, 'l'),
      fig(others[0], 96, 92, 'o', true),
      <Path key="h" d="M100 30 c-6 -10 -20 -4 -12 8 l12 12 l12 -12 c8 -12 -6 -18 -12 -8z" fill="#E5383B" />,
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
      {body}
    </Svg>
  );
}

/** Same drawing as Traveller but as a <G> so it can be composed. */
function TravellerG({ a, flip }: { a: AvatarDef; flip?: boolean }) {
  return (
    <G transform={flip ? 'translate(100,0) scale(-1,1)' : undefined}>
      <Hair a={a} back />
      <Rect x="22" y="66" width="18" height="34" rx="6" fill={a.pack} />
      <Rect x="38" y="104" width="10" height="26" rx="4" fill={a.bottom} />
      <Rect x="53" y="104" width="10" height="26" rx="4" fill={a.bottom} />
      <Rect x="32" y="62" width="36" height="46" rx="14" fill={a.top} />
      <Rect x="26" y="66" width="9" height="30" rx="4.5" fill={a.top} />
      <Rect x="66" y="66" width="9" height="30" rx="4.5" fill={a.top} />
      <Rect x="45" y="54" width="10" height="10" fill={a.skin} />
      <Circle cx="50" cy="40" r="22" fill={a.skin} />
      <Hair a={a} />
      <Ellipse cx="42" cy="42" rx="2.6" ry="3.2" fill="#1B2140" />
      <Ellipse cx="58" cy="42" rx="2.6" ry="3.2" fill="#1B2140" />
      <Path d="M45 50 Q50 55 55 50" stroke="#1B2140" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </G>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Kachi – the magpie guide (까치, Korea's good-news bird). Original mascot.
 * ────────────────────────────────────────────────────────────── */
export function Kachi({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M18 66 L2 86 L10 88 L26 72 Z" fill="#1B2140" />
      <Path d="M14 74 L6 84" stroke="#2D6CDF" strokeWidth="3" />
      <Ellipse cx="50" cy="62" rx="30" ry="24" fill="#1B2140" />
      <Ellipse cx="56" cy="68" rx="20" ry="15" fill="#FFFFFF" />
      <Path d="M28 54 Q40 40 56 56 Q44 64 28 62 Z" fill="#2D6CDF" />
      <Path d="M30 58 Q42 50 52 58" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <Circle cx="64" cy="36" r="20" fill="#1B2140" />
      <Circle cx="70" cy="33" r="6" fill="#FFFFFF" />
      <Circle cx="71.5" cy="33" r="3" fill="#1B2140" />
      <Path d="M82 38 L98 42 L82 46 Z" fill="#FFC93C" />
      <Circle cx="64" cy="44" r="3.5" fill="#FF8FA3" opacity={0.7} />
      <Path d="M44 84 L42 94 M56 84 L56 94" stroke="#F08A24" strokeWidth="3" strokeLinecap="round" />
      {/* tiny red scarf – a nod to taegeuk red */}
      <Path d="M48 52 Q64 60 80 50 L82 56 Q64 66 48 58Z" fill="#E5383B" />
    </Svg>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Speaker portraits for dialogs (bust, 100×100).
 * ────────────────────────────────────────────────────────────── */
const SPEAKER_STYLE: Record<Exclude<Speaker, 'guide' | 'player'>, { skin: string; hair: string; top: string; hat?: 'police' | 'cap' | 'hood' | 'none' | 'perm' | 'bald'; coat?: boolean; label: string }> = {
  local: { skin: '#EDB98A', hair: '#3B2416', top: '#D9480F', hat: 'perm', label: 'Local' },
  staff: { skin: '#F9D7B9', hair: '#1B1B1B', top: '#2F855A', label: 'Staff' },
  driver: { skin: '#EDB98A', hair: '#2B2B2B', top: '#64748B', hat: 'cap', label: 'Driver' },
  police: { skin: '#F2C9A0', hair: '#1B1B1B', top: '#1E3A8A', hat: 'police', label: 'Tourist Police' },
  doctor: { skin: '#F9D7B9', hair: '#1B1B1B', top: '#FFFFFF', coat: true, label: 'Doctor' },
  pharmacist: { skin: '#EDB98A', hair: '#4A2C1A', top: '#FFFFFF', coat: true, label: 'Pharmacist' },
  elder: { skin: '#EDB98A', hair: '#D1D5DB', top: '#8B5CF6', label: 'Elder' },
  monk: { skin: '#EDB98A', hair: '#EDB98A', top: '#8D8D8D', hat: 'bald', label: 'Monk' },
  haenyeo: { skin: '#C68642', hair: '#111', top: '#111827', hat: 'hood', label: 'Haenyeo' },
};

export function SpeakerPortrait({ speaker, avatar, size = 64 }: { speaker: Speaker; avatar?: AvatarDef; size?: number }) {
  if (speaker === 'guide') return <Kachi size={size} />;
  if (speaker === 'player' && avatar)
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="48" fill="#E8F1FF" />
        <G transform="translate(0,6)">
          <TravellerG a={avatar} />
        </G>
      </Svg>
    );
  const s = SPEAKER_STYLE[speaker as keyof typeof SPEAKER_STYLE] ?? SPEAKER_STYLE.local;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill="#FFF1D6" />
      <Path d="M18 100 Q18 66 50 66 Q82 66 82 100 Z" fill={s.top} stroke={s.coat ? '#CBD5E1' : 'none'} strokeWidth="2" />
      {s.coat && <Path d="M50 68 L42 100 M50 68 L58 100" stroke="#CBD5E1" strokeWidth="2" />}
      {s.coat && <Path d="M38 74 Q34 88 44 90" stroke="#334155" strokeWidth="2.5" fill="none" />}
      {s.coat && speaker === 'pharmacist' && <Rect x="58" y="78" width="10" height="10" rx="2" fill="#22A06B" />}
      <Circle cx="50" cy="44" r="22" fill={s.skin} />
      {s.hat === 'perm' && <G fill={s.hair}>{[30, 40, 50, 60, 70].map((x) => <Circle key={x} cx={x} cy={26} r="9" />)}</G>}
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
        </G>
      )}
      <Ellipse cx="42" cy="46" rx="2.4" ry="3" fill="#1B2140" />
      <Ellipse cx="58" cy="46" rx="2.4" ry="3" fill="#1B2140" />
      {speaker === 'elder' && <Path d="M36 40 L46 40 M54 40 L64 40" stroke="#9CA3AF" strokeWidth="2" />}
      <Path d="M44 54 Q50 59 56 54" stroke="#1B2140" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {speaker === 'police' && (
        <SvgText x="50" y="92" fontSize="8" fill="#FFF" textAnchor="middle" fontWeight="700">POLICE</SvgText>
      )}
    </Svg>
  );
}

export const speakerLabel = (sp: Speaker, playerName: string) =>
  sp === 'guide' ? 'Kachi' : sp === 'player' ? playerName : SPEAKER_STYLE[sp as keyof typeof SPEAKER_STYLE]?.label ?? sp;
