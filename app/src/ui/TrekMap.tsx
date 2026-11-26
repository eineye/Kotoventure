import Svg, { Circle, Ellipse, G, Path, Polygon, Rect, Text as T } from 'react-native-svg';
import { JEJU, KOREA_CITIES, translateText, KOREA_ISLANDS, KOREA_MOUNTAINS, KOREA_OUTLINE, KOREA_RIVERS, TREK_POINT_ICON, projectKorea, tr, type Trek } from '@kotoventure/shared';

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** South Korea map (coast, islands, DMZ, rivers, mountains, main cities) with a pin where the trek is. */
export function KoreaPin({ trek, size = 120, lang = 'en' }: { trek: Trek; size?: number; lang?: string }) {
  const W = 100;
  const H = 150;
  const pr = (lng: number, lat: number) => projectKorea(lng, lat, W, H);
  const ell = (lng: number, lat: number, rx: number, ry: number) => {
    const c = pr(lng, lat);
    const e = pr(lng + rx, lat - ry);
    return { cx: c.x, cy: c.y, rx: Math.abs(e.x - c.x), ry: Math.abs(e.y - c.y) };
  };
  const pts = KOREA_OUTLINE.map(([lng, lat]) => pr(lng, lat));
  const dmz = pts.slice(0, 7);
  const j = ell(JEJU.lng, JEJU.lat, JEJU.rx, JEJU.ry);
  const p = pr(trek.lng, trek.lat);
  const ko = lang === 'ko';
  const L = (en: string, k: string) => (ko ? k : translateText(en, lang));
  return (
    <Svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Rect x="0" y="0" width={W} height={H} rx="8" fill="#CFE3DF" />
      {[18, 46, 74, 102, 128].map((y, i) => (
        <Path key={i} d={`M${6 + (i % 2) * 6} ${y} q3 -1.5 6 0 t6 0`} stroke="#B3D2CD" strokeWidth="0.7" fill="none" />
      ))}
      {/* land: soft shadow, fill, inner highlight */}
      <Polygon points={pts.map((q) => `${q.x + 0.8},${q.y + 0.8}`).join(' ')} fill="#B8CFC9" />
      <Polygon points={pts.map((q) => `${q.x},${q.y}`).join(' ')} fill="#F1E6CD" stroke="#C9B48B" strokeWidth="0.6" strokeLinejoin="round" />
      {KOREA_ISLANDS.map(([lng, lat, rx, ry], i) => <Ellipse key={i} {...ell(lng, lat, rx, ry)} fill="#F1E6CD" stroke="#C9B48B" strokeWidth="0.5" />)}
      <Ellipse {...j} fill="#F1E6CD" stroke="#C9B48B" strokeWidth="0.6" />
      {/* mountains */}
      {KOREA_MOUNTAINS.map(([lng, lat], i) => {
        const m = pr(lng, lat);
        return (
          <G key={i}>
            <Path d={`M${m.x - 3} ${m.y + 2} L${m.x} ${m.y - 2.5} L${m.x + 3} ${m.y + 2}Z`} fill="#B9A98A" />
            <Path d={`M${m.x} ${m.y - 2.5} L${m.x + 3} ${m.y + 2} L${m.x + 1} ${m.y + 2}Z`} fill="#A39376" />
          </G>
        );
      })}
      {/* rivers */}
      {KOREA_RIVERS.map((r, i) => (
        <Path key={i} d={r.map(([lng, lat], k) => `${k ? 'L' : 'M'}${pr(lng, lat).x} ${pr(lng, lat).y}`).join(' ')} stroke="#8FBFC2" strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* DMZ */}
      <Path d={dmz.map((q, k) => `${k ? 'L' : 'M'}${q.x} ${q.y}`).join(' ')} stroke="#9A8A6A" strokeWidth="0.8" strokeDasharray="1.6 1.2" fill="none" />
      {/* cities */}
      {KOREA_CITIES.map((c) => {
        const q = pr(c.lng, c.lat);
        return (
          <G key={c.en}>
            <Circle cx={q.x} cy={q.y} r={c.big ? 1.5 : 1.1} fill="#5A4636" />
            <T x={q.x + 2.2} y={q.y + 1.3} fontSize={c.big ? 4.4 : 3.6} fontWeight="800" fill="#5A4636">
              {L(c.en, c.ko)}
            </T>
          </G>
        );
      })}
      {/* sea names */}
      <T x="5" y="80" fontSize="3.8" fontWeight="700" fill="#6E9C98">{L('Yellow Sea', '서해')}</T>
      <T x="96" y="66" fontSize="3.8" fontWeight="700" fill="#6E9C98" textAnchor="end">{L('East Sea', '동해')}</T>
      {/* the trek */}
      <Circle cx={p.x} cy={p.y} r="7" fill="#E5383B" opacity={0.22} />
      <Path d={`M${p.x} ${p.y} l-3.6 -7 a4 4 0 1 1 7.2 0 Z`} fill="#E5383B" stroke="#FFF" strokeWidth="0.7" />
      <Circle cx={p.x} cy={p.y - 8.4} r="1.4" fill="#FFF" />
      <T x="50" y={H - 4} fontSize="5" fontWeight="800" fill="#6B6250" textAnchor="middle">
        {L('SOUTH KOREA', '대한민국')}
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
