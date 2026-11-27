import Svg, { ClipPath, Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { SvgT as T } from '../ui/SvgText';
import { KRW_COINS, KRW_NOTES } from '@kotoventure/shared';

/**
 * Semi-realistic Korean banknotes & coins (current series) at TRUE relative size.
 * Security-printing look: guilloche rosettes, fine wave lines, engraved monochrome portraits,
 * foil holograms, windowed security thread, red governor's seal, serial numbers, tactile marks.
 * Every note carries a SAMPLE/견본 stamp so it can never be mistaken for real money.
 */

export const mmScale = (largestNoteWidthPx: number) => largestNoteWidthPx / 154;

/* ───────────────────────── helpers ───────────────────────── */
const f1 = (n: number) => Math.round(n * 10) / 10;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const cache = new Map<string, string>();

/** Hypotrochoid "spirograph" curve – the classic guilloche pattern on banknotes. */
function rosette(cx: number, cy: number, size: number, R: number, r: number, d: number, sx = 1, sy = 1, steps = 70): string {
  const key = [cx, cy, size, R, r, d, sx, sy, steps].join(',');
  const hit = cache.get(key);
  if (hit) return hit;
  const turns = r / gcd(R, r);
  const n = steps * turns;
  const max = R - r + d;
  const k = size / max;
  let p = '';
  for (let i = 0; i <= n; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    p += `${i ? 'L' : 'M'}${f1(cx + x * k * sx)} ${f1(cy + y * k * sy)}`;
  }
  cache.set(key, p);
  return p;
}

/** A band of fine wavy lines (background security print). */
function waves(w: number, h: number, count: number, amp: number, phase = 0): string {
  const key = `w${w},${h},${count},${amp},${phase}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let p = '';
  for (let i = 0; i < count; i++) {
    const y0 = (h / count) * (i + 0.5);
    for (let x = 0; x <= w; x += 3) {
      const y = y0 + amp * Math.sin((x / w) * Math.PI * 4 + i * 0.35 + phase);
      p += `${x ? 'L' : 'M'}${f1(x)} ${f1(y)}`;
    }
  }
  cache.set(key, p);
  return p;
}

/** Parallel hatch lines over a box (clip them to a shape for engraving shading). */
function hatch(x: number, y: number, w: number, h: number, gap: number, slope = 0.6): string {
  let p = '';
  for (let i = -h; i < w + h; i += gap) p += `M${f1(x + i)} ${f1(y)}L${f1(x + i - h * slope)} ${f1(y + h)}`;
  return p;
}

/** Text with a paper-coloured halo so it stays readable over artwork. */
function Label({ x, y, size, fill, halo, anchor = 'middle', children }: { x: number; y: number; size: number; fill: string; halo: string; anchor?: 'start' | 'middle' | 'end'; children: string }) {
  return (
    <G>
      <T x={x} y={y} fontSize={size} fontWeight="900" fill={halo} stroke={halo} strokeWidth={size * 0.22} strokeLinejoin="round" textAnchor={anchor} letterSpacing="0.3">
        {children}
      </T>
      <T x={x} y={y} fontSize={size} fontWeight="900" fill={fill} textAnchor={anchor} letterSpacing="0.3">
        {children}
      </T>
    </G>
  );
}

/* ───────────────────────── engraved portraits ───────────────────────── */
function Portrait({ value, ink, paper, id }: { value: number; ink: string; paper: string; id: string }) {
  const face = 'M-7 -6 C-7.2 -13 7.2 -13 7 -6 L6.6 1 C6.2 6.4 3.2 9.4 0 9.4 C-3.2 9.4 -6.2 6.4 -6.6 1 Z';
  const robe = 'M-19 26 C-18 12 -9 8 0 8 C9 8 18 12 19 26 Z';
  return (
    <G>
      <Defs>
        <ClipPath id={`${id}-face`}>
          <Path d={face} />
        </ClipPath>
        <ClipPath id={`${id}-robe`}>
          <Path d={robe} />
        </ClipPath>
        <LinearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={paper} />
          <Stop offset="1" stopColor={ink} stopOpacity="0.45" />
        </LinearGradient>
        <LinearGradient id={`${id}-robeg`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={ink} stopOpacity="0.75" />
          <Stop offset="1" stopColor={ink} />
        </LinearGradient>
      </Defs>
      {/* back hair / bun / crown wings drawn behind the head */}
      {value === 50000 && <Ellipse cx="-6" cy="5" rx="5.5" ry="4.5" fill={ink} />}
      {value === 10000 && (
        <G fill={ink}>
          <Path d="M-6.5 -13 C-8.5 -19.5 -4.5 -21 -3 -15.5 Z" />
          <Path d="M6.5 -13 C8.5 -19.5 4.5 -21 3 -15.5 Z" />
        </G>
      )}
      {/* robe */}
      <Path d={robe} fill={`url(#${id}-robeg)`} />
      <G clipPath={`url(#${id}-robe)`}>
        <Path d={hatch(-20, 8, 40, 20, 0.9, -0.4)} stroke={paper} strokeWidth="0.18" opacity={0.35} />
      </G>
      {value === 50000 ? (
        <G>
          <Path d="M-8 9 L0 19 L8 9" stroke={paper} strokeWidth="2.4" fill="none" />
          <Path d="M-1 15 C2 20 6 22 9 24" stroke={paper} strokeWidth="0.8" fill="none" opacity={0.8} />
        </G>
      ) : (
        <G>
          <Path d="M-7 8.6 L0 18 L7 8.6" stroke={paper} strokeWidth="1.6" fill="none" />
          <Path d="M-4 8.6 L0 14 L4 8.6" stroke={ink} strokeWidth="0.6" fill="none" />
        </G>
      )}
      {value === 10000 && <Circle cx="0" cy="21" r="3.2" fill="none" stroke={paper} strokeWidth="0.7" />}
      {/* neck + face */}
      <Path d="M-3.2 6 L-3 9.5 L3 9.5 L3.2 6 Z" fill={`url(#${id}-skin)`} />
      <Ellipse cx="-7.2" cy="-1.5" rx="1.3" ry="2.2" fill={`url(#${id}-skin)`} stroke={ink} strokeWidth="0.3" />
      <Ellipse cx="7.2" cy="-1.5" rx="1.3" ry="2.2" fill={ink} opacity={0.55} />
      <Path d={face} fill={`url(#${id}-skin)`} stroke={ink} strokeWidth="0.35" />
      <G clipPath={`url(#${id}-face)`}>
        <Path d={hatch(1, -14, 9, 26, 0.75)} stroke={ink} strokeWidth="0.16" opacity={0.55} />
        <Path d={hatch(-8, 2, 16, 9, 1.1, -0.3)} stroke={ink} strokeWidth="0.12" opacity={0.3} />
      </G>
      {/* features */}
      <Path d="M-4.6 -3.6 Q-3 -4.6 -1.4 -3.8 M1.4 -3.8 Q3 -4.6 4.6 -3.6" stroke={ink} strokeWidth="0.55" fill="none" />
      <Path d="M-4.2 -2 Q-3 -2.7 -1.8 -2 M1.8 -2 Q3 -2.7 4.2 -2" stroke={ink} strokeWidth="0.45" fill="none" />
      <Circle cx="-3" cy="-1.9" r="0.45" fill={ink} />
      <Circle cx="3" cy="-1.9" r="0.45" fill={ink} />
      <Path d="M0.4 -1.5 L1.3 2.4 L-0.3 2.8" stroke={ink} strokeWidth="0.4" fill="none" />
      {value === 50000 ? (
        <G>
          <Path d="M-1.8 5 Q0 5.9 1.8 5" stroke={ink} strokeWidth="0.45" fill="none" />
          {/* centre-parted hair */}
          <Path d="M0 -12.5 C-6 -12.5 -8.6 -8 -7.8 -1 C-7 -6 -4 -9 0 -9.6 C4 -9 7 -6 7.8 -1 C8.6 -8 6 -12.5 0 -12.5Z" fill={ink} />
          <Path d={hatch(-8, -13, 16, 5, 0.6, 0.1)} stroke={paper} strokeWidth="0.1" opacity={0.4} />
        </G>
      ) : (
        <G>
          {/* moustache + beard */}
          <Path d="M-3.4 4.4 Q0 3.2 3.4 4.4 Q1.5 5.2 0 4.8 Q-1.5 5.2 -3.4 4.4Z" fill={ink} />
          {value === 1000 && <Path d="M-3.4 6 C-4.4 13 -1.6 19 0 21 C1.6 19 4.4 13 3.4 6 C1.8 8.4 -1.8 8.4 -3.4 6Z" fill={ink} />}
          {value === 5000 && <Path d="M-2.8 6.2 C-3.2 10.5 -1 13.5 0 14.5 C1 13.5 3.2 10.5 2.8 6.2 C1.4 8 -1.4 8 -2.8 6.2Z" fill={ink} />}
          {value === 10000 && <Path d="M-3 6.2 C-3.6 11.5 -1.2 15.5 0 16.5 C1.2 15.5 3.6 11.5 3 6.2 C1.5 8.2 -1.5 8.2 -3 6.2Z" fill={ink} />}
          {/* headwear */}
          {value === 10000 ? (
            <G>
              <Path d="M-8 -7 C-8.4 -17 8.4 -17 8 -7 C4 -9 -4 -9 -8 -7Z" fill={ink} />
              <Path d="M-6.5 -10 Q0 -12.5 6.5 -10" stroke={paper} strokeWidth="0.35" fill="none" opacity={0.6} />
            </G>
          ) : (
            <G>
              <Path d="M-8 -7 L-7.2 -15 L-4 -17.5 L4 -17.5 L7.2 -15 L8 -7 C4 -9 -4 -9 -8 -7Z" fill={ink} />
              {value === 1000 && <Path d="M-4 -17.5 L-3 -22 L3 -22 L4 -17.5Z" fill={ink} />}
              <Path d="M-7 -11.5 L7 -11.5 M-6.6 -14.4 L6.6 -14.4" stroke={paper} strokeWidth="0.3" opacity={0.45} />
            </G>
          )}
        </G>
      )}
    </G>
  );
}

/* ───────────────────────── front / back artwork ───────────────────────── */
function FrontArt({ value, ink }: { value: number; ink: string }) {
  switch (value) {
    case 1000: // Myeongnyundang hall + plum branch
      return (
        <G>
          <Path d="M54 44 Q66 37 78 44 L76 46 L56 46 Z" fill={ink} opacity={0.75} />
          <Path d="M58 46 L58 54 M64 46 L64 54 M70 46 L70 54 M76 46 L76 54" stroke={ink} strokeWidth="0.7" opacity={0.6} />
          <Rect x="56" y="53.5" width="22" height="1.5" fill={ink} opacity={0.6} />
          <Path d="M30 60 C36 50 44 46 52 40 M40 50 C42 46 46 44 48 41" stroke={ink} strokeWidth="1" fill="none" />
          {[[38, 52], [44, 46], [50, 42], [42, 49]].map(([x, y], i) => (
            <G key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <Ellipse key={a} cx={x} cy={y - 1.3} rx="0.9" ry="1.4" fill="#FFFFFF" stroke={ink} strokeWidth="0.25" transform={`rotate(${a} ${x} ${y})`} />
              ))}
            </G>
          ))}
        </G>
      );
    case 5000: // Ojukheon & black bamboo
      return (
        <G>
          {[46, 51, 56].map((x, i) => (
            <G key={x}>
              <Line x1={x} y1="60" x2={x + 2} y2={26 + i * 3} stroke={ink} strokeWidth="1.4" />
              {[34, 42, 50].map((y) => (
                <Line key={y} x1={x - 0.6 + (60 - y) * 0.03} y1={y} x2={x + 1.1 + (60 - y) * 0.03} y2={y} stroke="#FFFFFF" strokeWidth="0.4" />
              ))}
            </G>
          ))}
          <Path d="M52 32 l7 -3 M47 38 l-6 -2 M57 44 l7 -1 M50 28 l-5 -4" stroke={ink} strokeWidth="1.1" strokeLinecap="round" />
          <Path d="M62 50 Q72 44 84 50 L82 52 L64 52 Z" fill={ink} opacity={0.75} />
          <Rect x="65" y="52" width="16" height="6" fill="none" stroke={ink} strokeWidth="0.6" />
        </G>
      );
    case 10000: // Irworobongdo (sun, moon, five peaks) + Yongbieocheonga text
      return (
        <G>
          <Path d="M36 60 L42 44 L47 52 L54 36 L61 52 L66 44 L72 60 Z" fill={ink} opacity={0.35} stroke={ink} strokeWidth="0.6" />
          <Path d="M36 60 Q54 56 72 60" stroke={ink} strokeWidth="0.5" fill="none" />
          <Circle cx="42" cy="32" r="3.2" fill="#E5383B" opacity={0.65} />
          <Circle cx="66" cy="32" r="3.2" fill="#FFFFFF" stroke={ink} strokeWidth="0.5" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Line key={i} x1={78 + (i % 2) * 3} y1={22 + i * 5} x2={78 + (i % 2) * 3} y2={25 + i * 5} stroke={ink} strokeWidth="0.6" />
          ))}
        </G>
      );
    default: // 50000: ink grapes (Mukpodo) + eggplant embroidery
      return (
        <G>
          <Path d="M28 26 C40 28 50 34 58 46 M44 31 C46 27 50 25 54 26" stroke={ink} strokeWidth="1" fill="none" />
          <Path d="M50 24 c4 -2 7 1 5 4 c3 1 2 5 -1 5 c-1 3 -5 2 -5 -1 c-3 0 -3 -4 0 -5 z" fill={ink} opacity={0.35} />
          {[[44, 36], [47, 39], [43, 40], [46, 43], [50, 42], [48, 46], [44, 44], [51, 38]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r="1.9" fill={ink} opacity={0.65} stroke="#FFFFFF" strokeWidth="0.25" />
          ))}
          <Path d="M58 52 C60 44 68 44 70 50 C71 56 64 60 58 52Z" fill="#7C3AED" opacity={0.45} />
          <Path d="M64 45 l1 -3 l2 1" stroke={ink} strokeWidth="0.6" fill="none" />
        </G>
      );
  }
}

function BackArt({ value, ink }: { value: number; ink: string }) {
  switch (value) {
    case 1000: // Gyesang Jeonggeo-do – scholar's house among mountains (Jeong Seon)
      return (
        <G>
          <Path d="M8 62 L22 30 L32 44 L44 20 L58 40 L70 28 L86 50 L96 62 Z" fill={ink} opacity={0.3} />
          <Path d={hatch(8, 20, 88, 42, 1.2, 0.8)} stroke={ink} strokeWidth="0.15" opacity={0.35} />
          {[20, 30, 74, 84, 90].map((x) => (
            <Path key={x} d={`M${x} 62 l2.2 -10 l2.2 10 z`} fill={ink} opacity={0.75} />
          ))}
          <Path d="M48 54 L55 49 L62 54 Z" fill={ink} />
          <Rect x="50" y="54" width="10" height="6" fill="#FFFFFF" stroke={ink} strokeWidth="0.5" />
          <Path d="M8 63 Q50 58 96 63" stroke={ink} strokeWidth="0.6" fill="none" />
        </G>
      );
    case 5000: // Chochungdo – watermelon & cockscomb (Shin Saimdang)
      return (
        <G>
          <Ellipse cx="38" cy="52" rx="15" ry="9" fill="#2E6B33" opacity={0.65} />
          {[28, 34, 40, 46].map((x) => (
            <Path key={x} d={`M${x} 44 Q${x + 2.5} 52 ${x} 60`} stroke="#123D1A" strokeWidth="1.2" fill="none" />
          ))}
          <Path d="M50 46 C56 38 58 32 56 28" stroke="#2E6B33" strokeWidth="0.8" fill="none" />
          <Line x1="68" y1="62" x2="68" y2="30" stroke="#2F6B2F" strokeWidth="1.5" />
          <Path d="M60 30 C62 18 74 18 76 30 C72 34 64 34 60 30Z" fill="#C0392B" opacity={0.8} />
          <Path d="M62 40 l-6 -3 M70 46 l7 -3" stroke="#2F6B2F" strokeWidth="1.4" strokeLinecap="round" />
          <Path d="M82 46 l5 -3 l1 5 z M24 36 l-3 -3 l4 -1z" fill={ink} />
        </G>
      );
    case 10000: // Honcheonsigye & Bohyunsan optical telescope
      return (
        <G>
          <Circle cx="38" cy="40" r="15" fill="none" stroke={ink} strokeWidth="1.3" />
          <Ellipse cx="38" cy="40" rx="15" ry="5.5" fill="none" stroke={ink} strokeWidth="1" transform="rotate(-25 38 40)" />
          <Ellipse cx="38" cy="40" rx="5.5" ry="15" fill="none" stroke={ink} strokeWidth="1" />
          <Circle cx="38" cy="40" r="4" fill={ink} />
          <Path d="M32 58 L38 55 L44 58 L44 62 L32 62Z" fill={ink} />
          <Path d="M66 62 L66 48 Q76 36 86 48 L86 62 Z" fill={ink} opacity={0.45} />
          <Line x1="76" y1="44" x2="84" y2="34" stroke={ink} strokeWidth="1.6" />
          {Array.from({ length: 14 }).map((_, i) => (
            <Circle key={i} cx={10 + i * 6.3} cy={16 + ((i * 7) % 5) * 2} r="0.7" fill={ink} />
          ))}
        </G>
      );
    default: // Wolmaedo (plum & moon) + Pungjukdo (bamboo in wind)
      return (
        <G>
          <Circle cx="34" cy="28" r="9" fill="#FFFFFF" opacity={0.85} />
          <Path d="M16 64 C26 48 36 40 44 34 C50 30 54 24 58 18 M30 50 C34 46 36 42 36 36" stroke={ink} strokeWidth="1.5" fill="none" />
          {[[28, 52], [36, 44], [44, 36], [52, 26], [34, 38]].map(([x, y], i) => (
            <G key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <Ellipse key={a} cx={x} cy={y - 1.3} rx="0.9" ry="1.4" fill="#FFFFFF" stroke={ink} strokeWidth="0.25" transform={`rotate(${a} ${x} ${y})`} />
              ))}
            </G>
          ))}
          {[70, 77].map((x) => (
            <Line key={x} x1={x} y1="64" x2={x + 4} y2="22" stroke={ink} strokeWidth="1.3" />
          ))}
          <Path d="M73 30 c5 -2 10 -1 13 2 M74 40 c5 0 10 2 12 6 M77 26 c3 -4 7 -6 11 -6 M75 50 c5 1 9 4 11 8" stroke={ink} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </G>
      );
  }
}

/** A banknote drawn in its own mm coordinate system (true size ratio). */
export function Banknote({ value, side = 'front', width }: { value: number; side?: 'front' | 'back'; width: number }) {
  const n = KRW_NOTES.find((x) => x.value === value) ?? KRW_NOTES[0];
  const [w, h] = n.sizeMm;
  const ink = n.dark;
  const id = `n${value}${side}`;
  const s = w / 100;
  const num = String(value);
  const light = '#FBF8EE';
  const holoX = value === 50000 ? 24 : 6;
  return (
    <Svg width={width} height={(width * h) / w} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={light} />
          <Stop offset="0.35" stopColor={n.color} />
          <Stop offset="0.7" stopColor={n.color} />
          <Stop offset="1" stopColor={light} />
        </LinearGradient>
        <RadialGradient id={`${id}-vig`} cx="0.5" cy="0.45" r="0.55">
          <Stop offset="0" stopColor={light} stopOpacity="0.95" />
          <Stop offset="0.75" stopColor={light} stopOpacity="0.55" />
          <Stop offset="1" stopColor={n.color} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={`${id}-holo`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#BAE6FD" />
          <Stop offset="0.25" stopColor="#F5D0FE" />
          <Stop offset="0.5" stopColor="#FEF9C3" />
          <Stop offset="0.75" stopColor="#BBF7D0" />
          <Stop offset="1" stopColor="#C7D2FE" />
        </LinearGradient>
        <LinearGradient id={`${id}-num`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={ink} stopOpacity="0.8" />
          <Stop offset="1" stopColor={ink} />
        </LinearGradient>
      </Defs>

      {/* paper */}
      <Rect x="0" y="0" width={w} height={h} rx="1.6" fill={`url(#${id}-paper)`} />
      <Path d={waves(w, h, 34, 1.2, value / 1000)} stroke={ink} strokeWidth="0.12" opacity={0.18} fill="none" />
      {/* guilloche rosettes */}
      <Path d={rosette(side === 'front' ? w * 0.36 : w * 0.5, h * 0.5, 22, 17, 5, 9, 1.35, 1, 60)} stroke={ink} strokeWidth="0.14" opacity={0.28} fill="none" />
      <Path d={rosette(12, 14, 8, 13, 4, 6)} stroke={ink} strokeWidth="0.15" opacity={0.45} fill="none" />
      <Path d={rosette(w - 12, h - 13, 8, 11, 3, 5)} stroke={ink} strokeWidth="0.15" opacity={0.45} fill="none" />
      {/* frame */}
      <Rect x="2.2" y="2.2" width={w - 4.4} height={h - 4.4} rx="1.2" fill="none" stroke={ink} strokeWidth="0.45" opacity={0.7} />
      <Rect x="3.4" y="3.4" width={w - 6.8} height={h - 6.8} rx="1" fill="none" stroke={ink} strokeWidth="0.18" opacity={0.5} strokeDasharray="0.8 0.5" />

      {side === 'front' ? (
        <G>
          {/* watermark window with ghost portrait */}
          <Ellipse cx={value === 50000 ? 13 : 22} cy={h / 2} rx="10" ry="14" fill={light} opacity={0.85} />
          <G transform={`translate(${value === 50000 ? 13 : 22},${h / 2 - 1}) scale(0.55)`} opacity={0.13}>
            <Portrait value={value} ink={ink} paper={light} id={`${id}-wm`} />
          </G>
          {/* artwork */}
          <G transform={`scale(${s},1)`}>
            <FrontArt value={value} ink={ink} />
          </G>
          {/* portrait in an engraved vignette */}
          <Ellipse cx={w - 31} cy={h / 2 - 2} rx="19" ry="23" fill={`url(#${id}-vig)`} />
          <G transform={`translate(${w - 31},${h / 2 - 5}) scale(0.85)`}>
            <Portrait value={value} ink={ink} paper={light} id={id} />
          </G>
          {/* security thread (windowed) */}
          {value !== 1000 && <Line x1={w * 0.43} y1="3" x2={w * 0.43} y2={h - 3} stroke={ink} strokeWidth="0.9" strokeDasharray="3 2.2" opacity={0.65} />}
          {/* hologram foil */}
          {value === 5000 && <Circle cx={holoX + 6} cy={h - 15} r="6" fill={`url(#${id}-holo)`} stroke="#94A3B8" strokeWidth="0.3" />}
          {value === 10000 && <Rect x={holoX} y={h - 21} width="12" height="12" rx="1" fill={`url(#${id}-holo)`} stroke="#94A3B8" strokeWidth="0.3" />}
          {value === 50000 && (
            <G>
              <Rect x={holoX} y="0" width="6" height={h} fill={`url(#${id}-holo)`} opacity={0.95} />
              <Path d={hatch(holoX, 0, 6, h, 1.4, -0.3)} stroke="#FFFFFF" strokeWidth="0.25" opacity={0.6} />
            </G>
          )}
          {value !== 1000 && <Rect x={holoX + (value === 50000 ? 1 : 3)} y={value === 50000 ? 8 : h - 18} width="1.6" height={value === 50000 ? 40 : 6} fill="#FFFFFF" opacity={0.7} />}
          {/* numerals & texts */}
          <T x={value === 50000 ? 33 : 7} y="15" fontSize="11" fontWeight="900" fill={`url(#${id}-num)`}>
            {num}
          </T>
          <Label x={w - 6} y={h - 5.5} size={11} fill={`url(#${id}-num)`} halo={light} anchor="end">
            {num}
          </Label>
          <T x={value === 50000 ? w * 0.56 : w * 0.5} y="11.5" fontSize="5.6" fontWeight="900" fill={ink} textAnchor="middle" letterSpacing="0.6">
            한국은행
          </T>
          <Label x={w * 0.5} y={h - 7} size={7.5} fill={ink} halo={light}>
            {n.ko}
          </Label>
          {/* governor's seal */}
          <Rect x={w * 0.5 + 11} y={h - 14} width="6" height="6" rx="0.6" fill="#D32F2F" opacity={0.85} />
          <T x={w * 0.5 + 14} y={h - 10} fontSize="2.6" fontWeight="900" fill="#FFF" textAnchor="middle">
            총재
          </T>
          {/* serial numbers */}
          <T x={value === 50000 ? 33 : 7} y="21" fontSize="3.1" fontWeight="800" fill="#B91C1C" letterSpacing="0.3">
            AA 0123456 A
          </T>
          <T x={w - 6} y="9" fontSize="3.1" fontWeight="800" fill="#1F2937" textAnchor="end" letterSpacing="0.3">
            AA 0123456 A
          </T>
          {/* tactile marks for the visually impaired */}
          {Array.from({ length: value === 1000 ? 1 : value === 5000 ? 2 : value === 10000 ? 3 : 4 }).map((_, i) => (
            <Circle key={i} cx={w - 4.2} cy={22 + i * 3} r="0.7" fill={ink} opacity={0.55} />
          ))}
        </G>
      ) : (
        <G>
          <G transform={`scale(${s},1)`}>
            <BackArt value={value} ink={ink} />
          </G>
          <T x={w - 7} y="16" fontSize="14" fontWeight="900" fill={`url(#${id}-num)`} textAnchor="end">
            {num}
          </T>
          <T x="7" y="12" fontSize="6" fontWeight="900" fill={`url(#${id}-num)`}>
            {num}
          </T>
          <Label x={8} y={h - 6.5} size={4.2} fill={ink} halo={light} anchor="start">
            THE BANK OF KOREA
          </Label>
          <Label x={w - 7} y={h - 6.5} size={5} fill={ink} halo={light} anchor="end">
            {n.ko}
          </Label>
          {value !== 1000 && <Line x1={w * 0.57} y1="3" x2={w * 0.57} y2={h - 3} stroke={ink} strokeWidth="0.9" strokeDasharray="1.4 3.8" opacity={0.5} />}
        </G>
      )}

      {/* light paper sheen */}
      <Path d={`M0 ${h * 0.15} L${w * 0.35} 0 L${w * 0.5} 0 L0 ${h * 0.7}Z`} fill="#FFFFFF" opacity={0.12} />
      {/* SAMPLE stamp – never real money */}
      <G transform={`rotate(-14 ${w / 2} ${h / 2})`}>
        <Rect x={w / 2 - 27} y={h / 2 - 6} width="54" height="12" rx="2" fill="#FFFFFF" opacity={0.86} stroke="#E5383B" strokeWidth="0.6" />
        <T x={w / 2} y={h / 2 + 2.8} fontSize="7.6" fontWeight="900" fill="#E5383B" textAnchor="middle" letterSpacing="0.4">
          SAMPLE · 견본
        </T>
      </G>
    </Svg>
  );
}

/* ───────────────────────── coins ───────────────────────── */
const COIN_MOTIF: Record<number, string> = {
  // Dabotap pagoda
  10: 'M34 76 L66 76 L66 72 L34 72 Z M38 72 L38 62 L62 62 L62 72 M36 62 L64 62 L60 58 L40 58 Z M43 58 L43 50 L57 50 L57 58 M41 50 L59 50 L55 46 L45 46 Z M46 46 L47 38 L53 38 L54 46 M44 38 L56 38 L52 34 L48 34 Z M49.5 34 L49.5 22 L50.5 22 L50.5 34',
  // ear of rice
  50: 'M47 84 C50 66 54 46 62 22 L64 23 C57 46 53 66 50 84 Z M55 64 C49 62 46 58 46 54 C51 55 55 58 55 64Z M57 54 C63 53 66 50 67 46 C62 46 58 49 57 54Z M58 44 C52 42 50 38 50 34 C55 35 58 38 58 44Z M60 35 C66 34 68 30 68 26 C64 27 61 30 60 35Z',
  // Admiral Yi Sun-sin (helmet bust)
  100: 'M30 86 C31 70 40 64 50 64 C60 64 69 70 70 86 Z M38 44 C38 30 62 30 62 44 L61 52 C60 58 55 62 50 62 C45 62 40 58 39 52 Z M35 42 C36 26 64 26 65 42 L67 44 L33 44 Z M48 24 L50 16 L52 24 Z',
  // red-crowned crane in flight
  500: 'M12 40 C24 30 38 32 48 46 C50 34 60 22 74 18 C66 28 62 38 60 48 C66 44 74 42 82 44 C76 46 70 50 66 54 L88 66 L86 69 L62 58 C56 62 48 62 42 58 C34 60 26 56 22 50 C30 50 38 48 44 46 C34 42 22 40 12 40 Z M74 18 C78 14 84 14 88 16 L82 19 Z',
};

/** A coin at true size: pass the same px/mm scale used for notes. */
export function Coin({ value, side = 'front', pxPerMm }: { value: number; side?: 'front' | 'back'; pxPerMm: number }) {
  const c = KRW_COINS.find((x) => x.value === value) ?? KRW_COINS[0];
  const d = c.diameterMm * pxPerMm;
  const copper = value === 10;
  const id = `c${value}${side}`;
  const hi = copper ? '#F6D1B0' : '#FFFFFF';
  const mid = copper ? '#D08B57' : '#C9CED6';
  const lo = copper ? '#8A4B26' : '#7B8494';
  const ink = copper ? '#6B3A1C' : '#4B5563';
  return (
    <Svg width={d} height={d} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${id}-face`} cx="0.35" cy="0.3" r="0.8">
          <Stop offset="0" stopColor={hi} />
          <Stop offset="0.55" stopColor={mid} />
          <Stop offset="1" stopColor={lo} />
        </RadialGradient>
        <LinearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={hi} />
          <Stop offset="0.5" stopColor={lo} />
          <Stop offset="1" stopColor={mid} />
        </LinearGradient>
      </Defs>
      <Circle cx="51.5" cy="52.5" r="47" fill="#000" opacity={0.18} />
      <Circle cx="50" cy="50" r="48" fill={`url(#${id}-rim)`} />
      {!copper &&
        Array.from({ length: 90 }).map((_, i) => {
          const a = (i / 90) * Math.PI * 2;
          return <Line key={i} x1={50 + 45.5 * Math.cos(a)} y1={50 + 45.5 * Math.sin(a)} x2={50 + 48 * Math.cos(a)} y2={50 + 48 * Math.sin(a)} stroke={lo} strokeWidth="0.9" opacity={0.6} />;
        })}
      <Circle cx="50" cy="50" r="43" fill={`url(#${id}-face)`} />
      <Circle cx="50" cy="50" r="40" fill="none" stroke={lo} strokeWidth="0.8" opacity={0.5} />
      {side === 'back' ? (
        <G>
          {/* embossed numeral: shadow, highlight, face */}
          <T x="51.2" y="61.2" fontSize={value >= 100 ? 30 : 34} fontWeight="900" fill={lo} textAnchor="middle" opacity={0.6}>
            {value}
          </T>
          <T x="49.2" y="59.2" fontSize={value >= 100 ? 30 : 34} fontWeight="900" fill={hi} textAnchor="middle" opacity={0.9}>
            {value}
          </T>
          <T x="50" y="60" fontSize={value >= 100 ? 30 : 34} fontWeight="900" fill={mid} textAnchor="middle">
            {value}
          </T>
          <T x="50" y="24" fontSize="8" fontWeight="800" fill={ink} textAnchor="middle" opacity={0.75}>
            한국은행
          </T>
          <T x="50" y="82" fontSize="8" fontWeight="800" fill={ink} textAnchor="middle" opacity={0.75}>
            2024
          </T>
        </G>
      ) : (
        <G>
          <Path d={COIN_MOTIF[value]} fill={lo} opacity={0.55} transform="translate(1.3,1.3)" />
          <Path d={COIN_MOTIF[value]} fill={hi} opacity={0.9} transform="translate(-0.8,-0.8)" />
          <Path d={COIN_MOTIF[value]} fill={mid} />
          <T x="50" y="93" fontSize="6.5" fontWeight="800" fill={ink} textAnchor="middle" opacity={0.7}>
            한국은행 {value}
          </T>
        </G>
      )}
      {/* specular highlight */}
      <Ellipse cx="36" cy="30" rx="18" ry="9" fill="#FFFFFF" opacity={0.22} transform="rotate(-30 36 30)" />
    </Svg>
  );
}

export const noteInfo = (value: number) => KRW_NOTES.find((n) => n.value === value);
export const coinInfo = (value: number) => KRW_COINS.find((c) => c.value === value);

