import { G, Rect } from 'react-native-svg';

/**
 * Tiny pixel-art engine: characters are built on a 34×46 grid from simple shapes,
 * then automatically outlined (dark brown, like classic 16-bit sprites) and shaded
 * (light top-left edge, dark bottom-right edge, optional plaid/stripe texture).
 * Rendered as merged <Rect> runs with crisp edges.
 */

export const GW = 34;
export const GH = 46;
export const OUTLINE = '#2A1614';

export type Grid = string[][];
export interface Region {
  color: string;
  /** texture applied to the region */
  pattern?: 'plaid' | 'stripe' | 'dots' | 'straw';
  /** no automatic shading (eyes, blush, details) */
  flat?: boolean;
}
export type Palette = Record<string, Region>;

export const newGrid = (w = GW, h = GH): Grid => Array.from({ length: h }, () => Array<string>(w).fill(''));

export function px(g: Grid, x: number, y: number, c: string) {
  if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = c;
}
export function rect(g: Grid, x0: number, y0: number, x1: number, y1: number, c: string) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px(g, x, y, c);
}
/** rectangle with cut corners of radius r (pixel-style rounding) */
export function rrect(g: Grid, x0: number, y0: number, x1: number, y1: number, r: number, c: string) {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const dx = Math.max(x0 + r - x, x - (x1 - r), 0);
      const dy = Math.max(y0 + r - y, y - (y1 - r), 0);
      if (dx * dx + dy * dy <= r * r + 0.5) px(g, x, y, c);
    }
}
export function ellipse(g: Grid, cx: number, cy: number, rx: number, ry: number, c: string) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const v = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (v <= 1.05) px(g, x, y, c);
    }
}
export const clear = (g: Grid, x0: number, y0: number, x1: number, y1: number) => rect(g, x0, y0, x1, y1, '');

/* colour helper */
const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const gg = (n >> 8) & 255;
  const b = n & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return `#${[r, gg, b].map((c) => clamp(c + (t - c) * p).toString(16).padStart(2, '0')).join('')}`;
}

export interface Run {
  x: number;
  y: number;
  w: number;
  c: string;
}

/** Outline + shading + texture → list of horizontal colour runs. */
export function bake(g: Grid, pal: Palette): Run[] {
  const h = g.length;
  const w = g[0].length;
  const at = (x: number, y: number) => (y >= 0 && y < h && x >= 0 && x < w ? g[y][x] : '');
  const colors: string[][] = Array.from({ length: h }, () => Array<string>(w).fill(''));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const k = g[y][x];
      if (!k) {
        // outline: empty cell touching a filled one (4-neighbourhood)
        if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) colors[y][x] = OUTLINE;
        continue;
      }
      const reg = pal[k];
      if (!reg) continue;
      let c = reg.color;
      if (!reg.flat) {
        const sameR = at(x + 1, y) === k;
        const sameB = at(x, y + 1) === k;
        const sameL = at(x - 1, y) === k;
        const sameT = at(x, y - 1) === k;
        if (!sameR || !sameB) c = shade(reg.color, -0.28);
        else if (!sameL || !sameT) c = shade(reg.color, 0.2);
        // shadow on the far right third of a region row
        else if (at(x + 2, y) !== k) c = shade(reg.color, -0.12);
        if (reg.pattern === 'plaid') {
          if (x % 4 === 0 && y % 4 === 0) c = shade(c, -0.35);
          else if (x % 4 === 0 || y % 4 === 0) c = shade(c, -0.18);
          else if ((x + y) % 4 === 2) c = shade(c, 0.08);
        } else if (reg.pattern === 'stripe') {
          if (y % 3 === 0) c = shade(c, 0.35);
        } else if (reg.pattern === 'dots') {
          if (x % 3 === 1 && y % 3 === 1) c = shade(c, 0.4);
        } else if (reg.pattern === 'straw') {
          if ((x * 7 + y * 3) % 5 === 0) c = shade(c, -0.2);
          else if ((x * 3 + y * 5) % 7 === 0) c = shade(c, 0.15);
        }
        // inner boundary between different regions → darker line (sprite definition)
        const diff = (a: string) => a && a !== k && !pal[a]?.flat;
        if (diff(at(x, y + 1)) && pal[k] && k !== 'S') c = shade(c, -0.15);
      }
      colors[y][x] = c;
    }
  const runs: Run[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = colors[y][x];
      if (!c) {
        x++;
        continue;
      }
      let e = x + 1;
      while (e < w && colors[y][e] === c) e++;
      runs.push({ x, y, w: e - x, c });
      x = e;
    }
  }
  return runs;
}

export function PixelRuns({ runs }: { runs: Run[] }) {
  return (
    <G>
      {runs.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w + 0.08} height={1.08} fill={r.c} />
      ))}
    </G>
  );
}
