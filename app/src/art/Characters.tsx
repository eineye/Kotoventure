import type { ReactNode } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path } from 'react-native-svg';
import { SvgT as SvgText } from '../ui/SvgText';
import type { PartyType, Speaker } from '@kotoventure/shared';
import { GH, GW, PixelRuns, bake, clear, ellipse, newGrid, px, rect, rrect, type Palette, type Run } from './Pixel';

/* ──────────────────────────────────────────────────────────────
 * Pixel-art travellers (original characters, 16-bit style):
 * big round head, dot eyes, dark brown outline, two-tone shading,
 * textured shirts. Built procedurally on a 34×46 grid.
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
  pattern?: 'plaid' | 'stripe' | 'dots';
}

export const AVATARS: AvatarDef[] = [
  { id: 'alex', name: 'Alex', skin: '#F1B179', hair: '#7A4A2A', hairStyle: 'cap', top: '#3F8F46', bottom: '#8A5A34', pack: '#E07A2E', pattern: 'plaid' },
  { id: 'mina', name: 'Mina', skin: '#EFB487', hair: '#2B1E1C', hairStyle: 'long', top: '#D9484F', bottom: '#3D4A6B', pack: '#F2C14E', pattern: 'stripe' },
  { id: 'kofi', name: 'Kofi', skin: '#9A5B33', hair: '#1E1514', hairStyle: 'curly', top: '#E3A93A', bottom: '#2F3A52', pack: '#C2413A', pattern: 'plaid' },
  { id: 'lena', name: 'Lena', skin: '#F6CBA4', hair: '#E2B04C', hairStyle: 'ponytail', top: '#7B5CC9', bottom: '#2E4A7E', pack: '#3F8F46', pattern: 'dots' },
  { id: 'raj', name: 'Raj', skin: '#C78452', hair: '#1E1514', hairStyle: 'short', top: '#2F6FB8', bottom: '#5A4632', pack: '#E3A93A', pattern: 'plaid' },
  { id: 'yui', name: 'Yui', skin: '#F6CBA4', hair: '#4A2C1C', hairStyle: 'bun', top: '#E58BB4', bottom: '#3B3F55', pack: '#6CB6D9', pattern: 'stripe' },
];

export const avatarById = (id?: string) => AVATARS.find((a) => a.id === id) ?? AVATARS[0];

/* ── sprite builder ─────────────────────────────────────────── */
type HairStyle = AvatarDef['hairStyle'] | 'bald' | 'perm' | 'police' | 'hood' | 'drivercap' | 'gray';
interface PersonSpec {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  top: string;
  bottom: string;
  pack?: string;
  pattern?: 'plaid' | 'stripe' | 'dots';
  outfit?: 'casual' | 'coat' | 'robe' | 'wetsuit' | 'uniform';
  hat?: string;
  wave?: boolean;
  badge?: string;
}

const cache = new Map<string, Run[]>();

function buildPerson(p: PersonSpec): Run[] {
  const key = JSON.stringify(p);
  const hit = cache.get(key);
  if (hit) return hit;
  const g = newGrid();
  const long = p.hairStyle === 'long';

  // back layers
  if (long) {
    rrect(g, 7, 10, 10, 27, 1, 'H');
    rrect(g, 23, 10, 26, 27, 1, 'H');
  }
  if (p.hairStyle === 'ponytail') {
    rrect(g, 24, 9, 28, 21, 2, 'H');
  }
  if (p.hairStyle === 'hood') rrect(g, 7, 5, 26, 25, 4, 'A');
  if (p.pack) rrect(g, 5, 25, 9, 33, 1, 'B');

  // head, ears, neck
  rrect(g, 9, 7, 24, 22, 4, 'S');
  if (!long && p.hairStyle !== 'hood') {
    rect(g, 8, 14, 8, 16, 'S');
    rect(g, 25, 14, 25, 16, 'S');
  }
  rect(g, 15, 23, 18, 23, 'S');

  // body
  const top = p.outfit === 'coat' ? 'W' : 'T';
  rrect(g, 10, 24, 23, 34, 1, top);
  rect(g, 8, 25, 9, 32, top);
  rect(g, 8, 33, 9, 34, 'S');
  if (p.wave) {
    rect(g, 24, 19, 25, 25, top);
    rect(g, 24, 17, 25, 18, 'S');
    rect(g, 26, 22, 26, 25, top);
  } else {
    rect(g, 24, 25, 25, 32, top);
    rect(g, 24, 33, 25, 34, 'S');
  }
  // collar
  px(g, 14, 24, 'L');
  px(g, 15, 25, 'L');
  px(g, 19, 24, 'L');
  px(g, 18, 25, 'L');

  // legs & shoes
  if (p.outfit === 'robe') {
    rrect(g, 9, 24, 24, 41, 1, 'T');
    rect(g, 16, 30, 17, 41, 'L');
  } else {
    rect(g, 11, 35, 22, 38, 'P');
    rect(g, 11, 39, 15, 41, 'P');
    rect(g, 18, 39, 22, 41, 'P');
    clear(g, 16, 37, 17, 41);
  }
  rect(g, 10, 42, 15, 43, 'O');
  rect(g, 18, 42, 23, 43, 'O');
  if (p.outfit === 'coat') {
    rect(g, 10, 35, 23, 37, 'W');
    rect(g, 16, 26, 17, 37, 'w');
    rect(g, 19, 29, 21, 30, p.badge ? 'Y' : 'w');
  }
  if (p.pack && p.outfit !== 'coat') {
    rect(g, 12, 24, 12, 33, 'b');
    rect(g, 21, 24, 21, 33, 'b');
    px(g, 12, 30, 'Y');
    px(g, 21, 30, 'Y');
  }
  if (p.outfit === 'uniform') {
    rect(g, 19, 27, 20, 28, 'Y');
    rect(g, 10, 33, 23, 34, 'C');
  }

  // face
  rect(g, 12, 14, 13, 16, 'E');
  rect(g, 20, 14, 21, 16, 'E');
  px(g, 12, 14, 'e');
  px(g, 20, 14, 'e');
  rect(g, 10, 18, 11, 18, 'K');
  rect(g, 22, 18, 23, 18, 'K');
  rect(g, 16, 19, 17, 19, 'M');

  // hair / hats (front)
  switch (p.hairStyle) {
    case 'short':
    case 'gray':
    case 'long':
    case 'ponytail':
    case 'bun':
      rrect(g, 9, 5, 24, 11, 3, 'H');
      clear(g, 13, 11, 13, 11);
      clear(g, 19, 11, 20, 11);
      rect(g, 9, 11, 9, 13, 'H');
      rect(g, 24, 11, 24, 13, 'H');
      if (p.hairStyle === 'bun') rrect(g, 13, 1, 20, 5, 2, 'H');
      if (p.hairStyle === 'ponytail') rect(g, 24, 9, 24, 10, 'R');
      if (long) {
        rect(g, 9, 11, 10, 17, 'H');
        rect(g, 23, 11, 24, 17, 'H');
      }
      break;
    case 'curly':
    case 'perm':
      for (let x = 9; x <= 24; x += 3) rrect(g, x - 1, 3 + ((x / 3) % 2), x + 2, 8 + ((x / 3) % 2), 1, 'H');
      rrect(g, 8, 6, 25, 10, 2, 'H');
      rect(g, 8, 10, 9, 14, 'H');
      rect(g, 24, 10, 25, 14, 'H');
      break;
    case 'cap':
      rrect(g, 9, 6, 24, 11, 2, 'H');
      rrect(g, 9, 2, 24, 9, 3, 'A');
      rect(g, 19, 9, 29, 10, 'C');
      px(g, 16, 2, 'C');
      px(g, 17, 2, 'C');
      break;
    case 'drivercap':
      rrect(g, 9, 6, 24, 11, 2, 'H');
      rrect(g, 9, 3, 24, 9, 2, 'A');
      rect(g, 9, 9, 26, 10, 'C');
      break;
    case 'police':
      rrect(g, 9, 6, 24, 11, 2, 'H');
      rrect(g, 7, 2, 26, 8, 2, 'A');
      rect(g, 8, 9, 25, 10, 'C');
      rect(g, 16, 4, 17, 6, 'Y');
      break;
    case 'hood':
      rect(g, 10, 13, 23, 16, 'G');
      rect(g, 16, 13, 17, 16, 'A');
      break;
    case 'bald':
    default:
      break;
  }

  const pal: Palette = {
    S: { color: p.skin },
    H: { color: p.hair },
    T: { color: p.top, pattern: p.pattern },
    W: { color: '#F4F6F8' },
    w: { color: '#C9D2DC', flat: true },
    L: { color: p.outfit === 'coat' ? '#FFFFFF' : '#F4EBDD', flat: true },
    P: { color: p.bottom },
    O: { color: '#5A3A24' },
    B: { color: p.pack ?? '#E07A2E' },
    b: { color: p.pack ? shadeHex(p.pack, -0.35) : '#7A4A2A', flat: true },
    Y: { color: '#F2C14E', flat: true },
    E: { color: '#2A1614', flat: true },
    e: { color: '#6B4A3A', flat: true },
    K: { color: '#F08F7A', flat: true },
    M: { color: '#9B3A3A', flat: true },
    A: { color: p.hat ?? '#D9484F', pattern: p.hairStyle === 'cap' ? undefined : undefined },
    C: { color: shadeHex(p.hat ?? '#D9484F', -0.3) },
    G: { color: '#9ED3F5', flat: true },
    R: { color: '#D9484F', flat: true },
  };
  const runs = bake(g, pal);
  cache.set(key, runs);
  return runs;
}

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
function shadeHex(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => clamp(c + (t - c) * p).toString(16).padStart(2, '0')).join('')}`;
}

const specOf = (a: AvatarDef, wave = false): PersonSpec => ({
  skin: a.skin,
  hair: a.hair,
  hairStyle: a.hairStyle,
  top: a.top,
  bottom: a.bottom,
  pack: a.pack,
  pattern: a.pattern,
  hat: a.hairStyle === 'cap' ? '#D9484F' : undefined,
  wave,
});

/** Draws a sprite inside a 100×140 box (feet on the bottom edge). */
const K = 100 / GW;
function TravellerG({ a, flip, wave }: { a: AvatarDef; flip?: boolean; wave?: boolean }) {
  const runs = buildPerson(specOf(a, wave));
  return (
    <G transform={flip ? 'translate(100,0) scale(-1,1)' : undefined}>
      <Ellipse cx="50" cy="135.5" rx="30" ry="4" fill="#000" opacity={0.18} />
      <G transform={`translate(0,${140 - GH * K}) scale(${K})`}>
        <PixelRuns runs={runs} />
      </G>
    </G>
  );
}

/** A full-body traveller. */
export function Traveller({ a, size = 100, wave = false, flip = false }: { a: AvatarDef; size?: number; wave?: boolean; flip?: boolean }) {
  return (
    <Svg width={size} height={size * 1.4} viewBox="0 0 100 140">
      <TravellerG a={a} flip={flip} wave={wave} />
    </Svg>
  );
}

/**
 * Party illustration for the onboarding selection and gameplay scenes.
 * One figure per traveller for solo (1), couple (2) and friends (3), side by side.
 * Only a group overlaps: two rows squeezed into the footprint of three people,
 * so `size` (the width of three travellers) is the most room any party takes.
 */
const SLOT = 64; // horizontal room per traveller in the 100×140 sprite box
const MAX_W = SLOT * 2 + 100; // three side by side
export function PartyArt({ party, lead, size = 150, align = 'center' }: { party: PartyType; lead: AvatarDef; size?: number; align?: 'center' | 'left' }) {
  const others = AVATARS.filter((x) => x.id !== lead.id);
  const fig = (a: AvatarDef, x: number, s: number, key: string, flip = false, y = 0) => (
    <G key={key} transform={`translate(${x},${140 - s * 1.4 - y}) scale(${s / 100})`}>
      <TravellerG a={a} flip={flip} />
    </G>
  );
  const n = party === 'solo' ? 1 : party === 'couple' ? 2 : 3;
  const w = SLOT * (n - 1) + 100;
  let body: ReactNode[] = [];
  if (party === 'solo') body = [fig(lead, 0, 100, 'l')];
  if (party === 'couple') body = [fig(lead, 0, 100, 'l'), fig(others[0], SLOT, 100, 'o', true), <PixelHeart key="h" x={SLOT / 2 + 39} y={2} />];
  if (party === 'friends') body = [fig(others[1], 0, 100, 'a'), fig(lead, SLOT, 100, 'l'), fig(others[2], SLOT * 2, 100, 'b', true)];
  if (party === 'group') {
    // front row of three (a bit smaller) with a raised back row peeking out between them:
    // six people squeezed into the footprint of three
    const fs = 86;
    const bs = 74;
    const back = (a: AvatarDef, cx: number, key: string, flip = false) => fig(a, cx - bs / 2, bs, key, flip, 30);
    body = [
      <G key="flag">
        <Path d="M10 4 L10 92" stroke="#5A3A24" strokeWidth="3" />
        <Path d="M10 4 L38 11 L10 19 Z" fill="#F2C14E" stroke="#2A1614" strokeWidth="1.5" />
      </G>,
      back(others[3], fs / 2 + SLOT / 2, 'b1'),
      back(others[4], fs / 2 + SLOT * 1.5, 'b2', true),
      back(others[1], fs / 2 + SLOT * 2.3, 'b3', true),
      fig(others[0], 0, fs, 'f1'),
      fig(lead, SLOT, fs, 'l'),
      fig(others[2], SLOT * 2, fs, 'f3', true),
    ];
  }
  const h = (size * 140) / MAX_W;
  return (
    <Svg width={size} height={h} viewBox={`0 0 ${w} 140`} preserveAspectRatio={align === 'left' ? 'xMinYMax meet' : 'xMidYMax meet'}>
      {body}
    </Svg>
  );
}

/** 8-bit heart */
function PixelHeart({ x, y }: { x: number; y: number }) {
  const rows = ['.XX.XX.', 'XRRXRRX', 'XRWRRRX', 'XRRRRRX', '.XRRRX.', '..XRX..', '...X...'];
  const col: Record<string, string> = { X: '#2A1614', R: '#E5484D', W: '#FFB4B8' };
  return (
    <G transform={`translate(${x},${y}) scale(3.2)`}>
      {rows.flatMap((r, j) => [...r].map((ch, i) => (ch === '.' ? null : <Path key={`${i}-${j}`} d={`M${i} ${j}h1.02v1.02h-1.02z`} fill={col[ch]} />)))}
    </G>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Kachi – the magpie guide (까치), pixel version. Original mascot.
 * ────────────────────────────────────────────────────────────── */
let kachiRuns: Run[] | null = null;
function kachi(): Run[] {
  if (kachiRuns) return kachiRuns;
  const g = newGrid(30, 28);
  // tail
  for (let i = 0; i < 6; i++) rect(g, 1 + i, 24 - i, 3 + i, 25 - i, 'k');
  rect(g, 1, 24, 2, 25, 'u');
  // body & belly
  ellipse(g, 13, 17, 8, 6, 'k');
  ellipse(g, 15, 18.5, 5.5, 4, 'w');
  // wing
  rrect(g, 6, 13, 13, 18, 2, 'u');
  rect(g, 7, 16, 12, 16, 'v');
  // head
  ellipse(g, 19, 8, 6.5, 6, 'k');
  // eye
  rect(g, 20, 6, 22, 8, 'w');
  rect(g, 21, 7, 22, 8, 'E');
  px(g, 21, 6, 'W');
  // beak
  rect(g, 25, 8, 28, 9, 'y');
  px(g, 26, 10, 'y');
  // blush & scarf
  rect(g, 18, 11, 19, 11, 'K');
  rect(g, 13, 13, 22, 14, 'r');
  // legs
  rect(g, 11, 23, 11, 25, 'o');
  rect(g, 15, 23, 15, 25, 'o');
  rect(g, 10, 26, 12, 26, 'o');
  rect(g, 14, 26, 16, 26, 'o');
  kachiRuns = bake(g, {
    k: { color: '#2B3152' },
    w: { color: '#F4F6F8' },
    u: { color: '#3D7BD9' },
    v: { color: '#9EC5FF', flat: true },
    E: { color: '#2A1614', flat: true },
    W: { color: '#FFFFFF', flat: true },
    y: { color: '#F2C14E' },
    K: { color: '#F08F7A', flat: true },
    r: { color: '#D9484F' },
    o: { color: '#E07A2E', flat: true },
  });
  return kachiRuns;
}

export function Kachi({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="-1 -2 32 32">
      <Ellipse cx="14" cy="28.3" rx="9" ry="1.2" fill="#000" opacity={0.18} />
      <PixelRuns runs={kachi()} />
    </Svg>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Speaker portraits (bust crop of the same pixel sprites).
 * ────────────────────────────────────────────────────────────── */
const SPEAKERS: Record<Exclude<Speaker, 'guide' | 'player'>, { spec: PersonSpec; label: string; bg: string }> = {
  local: { spec: { skin: '#EFB487', hair: '#3B2416', hairStyle: 'perm', top: '#D9632E', bottom: '#5A4632', pattern: 'dots' }, label: 'Local', bg: '#FFE8D6' },
  staff: { spec: { skin: '#F1B179', hair: '#1E1514', hairStyle: 'short', top: '#3F8F46', bottom: '#2F3A52' }, label: 'Staff', bg: '#DCFCE7' },
  driver: { spec: { skin: '#EFB487', hair: '#2B2B2B', hairStyle: 'drivercap', top: '#64748B', bottom: '#2F3A52', hat: '#334155' }, label: 'Driver', bg: '#E2E8F0' },
  police: { spec: { skin: '#F1B179', hair: '#1E1514', hairStyle: 'police', top: '#1E3A8A', bottom: '#1E293B', hat: '#1E3A8A', outfit: 'uniform' }, label: 'Tourist Police', bg: '#DBEAFE' },
  doctor: { spec: { skin: '#F6CBA4', hair: '#1E1514', hairStyle: 'short', top: '#F4F6F8', bottom: '#3B3F55', outfit: 'coat' }, label: 'Doctor', bg: '#E0F2FE' },
  pharmacist: { spec: { skin: '#EFB487', hair: '#4A2C1C', hairStyle: 'bun', top: '#F4F6F8', bottom: '#3B3F55', outfit: 'coat', badge: 'green' }, label: 'Pharmacist', bg: '#DCFCE7' },
  elder: { spec: { skin: '#EFB487', hair: '#D7D7D7', hairStyle: 'gray', top: '#7B5CC9', bottom: '#4B4B5A' }, label: 'Elder', bg: '#EDE9FE' },
  monk: { spec: { skin: '#EFB487', hair: '#EFB487', hairStyle: 'bald', top: '#8D8D8D', bottom: '#8D8D8D', outfit: 'robe' }, label: 'Monk', bg: '#F5F5F4' },
  haenyeo: { spec: { skin: '#C78452', hair: '#111111', hairStyle: 'hood', top: '#1F2430', bottom: '#1F2430', hat: '#1F2430', outfit: 'wetsuit' }, label: 'Haenyeo', bg: '#CFFAFE' },
};

function Bust({ runs, bg, size, id, extra }: { runs: Run[]; bg: string; size: number; id: string; extra?: ReactNode }) {
  // crop the head & shoulders (grid x 3..31, y 0..30) into a round frame
  const k = 100 / 28;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={`bust-${id}`}>
          <Circle cx="50" cy="50" r="48" />
        </ClipPath>
      </Defs>
      <Circle cx="50" cy="50" r="48" fill={bg} />
      <G clipPath={`url(#bust-${id})`}>
        <G transform={`translate(${-3 * k},${6}) scale(${k})`}>
          <PixelRuns runs={runs} />
        </G>
      </G>
      <Circle cx="50" cy="50" r="48" fill="none" stroke="#2A1614" strokeWidth="3" />
      {extra}
    </Svg>
  );
}

export function SpeakerPortrait({ speaker, avatar, size = 64 }: { speaker: Speaker; avatar?: AvatarDef; size?: number }) {
  if (speaker === 'guide') return <Kachi size={size} />;
  if (speaker === 'player' && avatar) return <Bust runs={buildPerson(specOf(avatar))} bg="#E8F1FF" size={size} id={`p-${avatar.id}`} />;
  const s = SPEAKERS[speaker as keyof typeof SPEAKERS] ?? SPEAKERS.local;
  return (
    <Bust
      runs={buildPerson(s.spec)}
      bg={s.bg}
      size={size}
      id={speaker}
      extra={
        speaker === 'police' ? (
          <SvgText x="50" y="93" fontSize="9" fill="#FFF" textAnchor="middle" fontWeight="900">
            POLICE
          </SvgText>
        ) : undefined
      }
    />
  );
}

export const speakerLabel = (sp: Speaker, playerName: string) =>
  sp === 'guide' ? 'Kachi' : sp === 'player' ? playerName : SPEAKERS[sp as keyof typeof SPEAKERS]?.label ?? sp;
