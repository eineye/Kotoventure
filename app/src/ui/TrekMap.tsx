import Svg, { Circle, Ellipse, G, Path, Polygon, Rect, Text as T } from 'react-native-svg';
import { JEJU, KOREA_OUTLINE, TREK_POINT_ICON, projectKorea, tr, type Trek } from '@kotoventure/shared';

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Small South Korea map with a pin where the trek is. */
export function KoreaPin({ trek, size = 120 }: { trek: Trek; size?: number }) {
  const W = 100;
  const H = 150;
  const pts = KOREA_OUTLINE.map(([lng, lat]) => projectKorea(lng, lat, W, H));
  const j = projectKorea(JEJU.lng, JEJU.lat, W, H);
  const jr = projectKorea(JEJU.lng + JEJU.rx, JEJU.lat - JEJU.ry, W, H);
  const p = projectKorea(trek.lng, trek.lat, W, H);
  return (
    <Svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Rect x="0" y="0" width={W} height={H} rx="8" fill="#CFE3DF" />
      <Polygon points={pts.map((q) => `${q.x},${q.y}`).join(' ')} fill="#F1E6CD" stroke="#C9B48B" strokeWidth="0.8" strokeLinejoin="round" />
      <Ellipse cx={j.x} cy={j.y} rx={Math.abs(jr.x - j.x)} ry={Math.abs(jr.y - j.y)} fill="#F1E6CD" stroke="#C9B48B" strokeWidth="0.8" />
      <Circle cx={p.x} cy={p.y} r="8" fill="#E5383B" opacity={0.25} />
      <Path d={`M${p.x} ${p.y} l-4 -8 a4.5 4.5 0 1 1 8 0 Z`} fill="#E5383B" stroke="#FFF" strokeWidth="0.8" />
      <Circle cx={p.x} cy={p.y - 9.5} r="1.6" fill="#FFF" />
      <T x="50" y={H - 6} fontSize="7" fontWeight="800" fill="#6B6250" textAnchor="middle">
        SOUTH KOREA
      </T>
    </Svg>
  );
}

/** Route sketch: checkpoints in order along a trail (not to scale). */
export function TrekRoute({ trek, lang, width, done = [] }: { trek: Trek; lang: string; width: number; done?: number[] }) {
  const n = trek.points.length;
  const cols = 3;
  const W = 300;
  const cellW = (W - 24) / cols;
  const cellH = 64;
  const rows = Math.ceil(n / cols);
  const H = rows * cellH + 16;
  const pts = trek.points.map((_, i) => {
    const r = Math.floor(i / cols);
    const c = r % 2 === 0 ? i % cols : cols - 1 - (i % cols);
    return { x: 12 + c * cellW + cellW / 2, y: 8 + r * cellH + 22 };
  });
  let d = pts.length ? `M${pts[0].x} ${pts[0].y}` : '';
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (a.y === b.y) d += ` Q${(a.x + b.x) / 2} ${a.y + (i % 2 ? 7 : -7)} ${b.x} ${b.y}`;
    else {
      const out = a.x > W / 2 ? 34 : -34;
      d += ` C${a.x + out} ${a.y} ${b.x + out} ${b.y} ${b.x} ${b.y}`;
    }
  }
  return (
    <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Rect x="0" y="0" width={W} height={H} rx="10" fill="#EEF2E2" />
      {/* sea along one side, pines along the other: a coastal-trail feel */}
      <Path d={`M${W} 0 L${W - 26} 0 C${W - 14} ${H * 0.3} ${W - 30} ${H * 0.6} ${W - 18} ${H} L${W} ${H}Z`} fill="#CFE3DF" />
      {Array.from({ length: rows * 2 }).map((_, i) => (
        <G key={i} transform={`translate(${6 + (i % 2) * 4},${14 + i * (cellH / 2)})`}>
          <Path d="M0 -7 C3 -4 3 -1 0 1 C-3 -1 -3 -4 0 -7Z" fill="#7FA486" />
        </G>
      ))}
      <Path d={d} stroke="#FBF6EA" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={d} stroke="#B5651D" strokeWidth="3" strokeDasharray="6 4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {trek.points.map((pt, i) => {
        const q = pts[i];
        const isDone = done.includes(i);
        const edge = pt.kind === 'start' || pt.kind === 'end';
        return (
          <G key={i}>
            <Circle cx={q.x} cy={q.y} r={edge ? 10 : 8.5} fill={isDone ? '#2F855A' : edge ? '#E5383B' : '#FFFDF7'} stroke={isDone ? '#2F855A' : '#5A4636'} strokeWidth="1.6" />
            <T x={q.x} y={q.y + 3.5} fontSize="9" fontWeight="900" fill={isDone || edge ? '#FFF' : '#5A4636'} textAnchor="middle">
              {isDone ? '✓' : String(i + 1)}
            </T>
            <T x={q.x} y={q.y + 22} fontSize="8.5" fontWeight="700" fill="#33302B" textAnchor="middle">
              {`${TREK_POINT_ICON[pt.kind]} ${cut(tr(pt.name, lang).replace(/ \(.*\)$/, ''), 12)}`}
            </T>
          </G>
        );
      })}
    </Svg>
  );
}
