import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop, Text as T } from 'react-native-svg';
import type { BackgroundId } from '@kotoventure/shared';

/**
 * Scene backgrounds, 400×240. Landmarks are drawn to be recognisable
 * (Geunjeongjeon two-tier roof, N Seoul Tower, Cheomseongdae, Bulguksa terraces, Seongsan Ilchulbong…).
 */
const W = 400;
const H = 240;
const t = (x: number, y: number, s: string, size = 12, fill = '#1B2140', w: any = '900', a: any = 'middle') => (
  <T x={x} y={y} fontSize={size} fill={fill} fontWeight={w} textAnchor={a}>{s}</T>
);

let gid = 0;
const Sky = ({ top, bottom }: { top: string; bottom: string }) => {
  const id = `sky${gid++}`;
  return (
    <G>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={W} height={H} fill={`url(#${id})`} />
    </G>
  );
};
const day = <Sky top="#7EC8F8" bottom="#DDF2FF" />;
const sunset = <Sky top="#FF9A62" bottom="#FFD9A0" />;
const night = <Sky top="#0B1437" bottom="#2C3E75" />;
const cloud = (x: number, y: number, s = 1) => (
  <G transform={`translate(${x},${y}) scale(${s})`} opacity={0.9}>
    <Ellipse cx="0" cy="0" rx="22" ry="10" fill="#FFFFFF" />
    <Ellipse cx="18" cy="-6" rx="16" ry="11" fill="#FFFFFF" />
    <Ellipse cx="34" cy="0" rx="18" ry="9" fill="#FFFFFF" />
  </G>
);
const ground = (c: string, y = 190) => <Rect x="0" y={y} width={W} height={H - y} fill={c} />;
const hills = (c: string, y = 150) => <Path d={`M0 ${y} Q60 ${y - 50} 130 ${y - 10} Q200 ${y - 60} 270 ${y - 15} Q340 ${y - 55} 400 ${y - 5} L400 ${H} L0 ${H}Z`} fill={c} />;
const skyline = (c: string, y = 190, seed = 1) => (
  <G fill={c}>
    {Array.from({ length: 14 }).map((_, i) => {
      const h = 30 + ((i * 37 * seed) % 70);
      return <Rect key={i} x={i * 30} y={y - h} width="26" height={h} />;
    })}
  </G>
);
const windows = (x: number, y: number, cols: number, rows: number, c = '#FFE9A8') => (
  <G fill={c}>{Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((__, k) => <Rect key={`${r}-${k}`} x={x + k * 10} y={y + r * 12} width="6" height="7" />))}</G>
);
const tiledRoof = (x: number, y: number, w: number, c = '#3F4A5A') => (
  <G>
    <Path d={`M${x - 14} ${y + 4} Q${x} ${y - 4} ${x + w / 2} ${y - 16} Q${x + w} ${y - 4} ${x + w + 14} ${y + 4} Q${x + w} ${y + 8} ${x + w - 6} ${y + 10} L${x + 6} ${y + 10} Q${x} ${y + 8} ${x - 14} ${y + 4}Z`} fill={c} />
    <Path d={`M${x - 16} ${y + 2} q4 0 6 -6 M${x + w + 16} ${y + 2} q-4 0 -6 -6`} stroke={c} strokeWidth="3" fill="none" />
  </G>
);
const dancheong = (x: number, y: number, w: number) => (
  <G>
    <Rect x={x} y={y} width={w} height="5" fill="#2F855A" />
    <Rect x={x} y={y + 5} width={w} height="3" fill="#2D6CDF" />
    {Array.from({ length: Math.floor(w / 12) }).map((_, i) => <Circle key={i} cx={x + 6 + i * 12} cy={y + 3} r="1.6" fill="#E5383B" />)}
  </G>
);
const interior = (wall: string, floor: string) => (
  <G>
    <Rect x="0" y="0" width={W} height={H} fill={wall} />
    <Rect x="0" y="176" width={W} height={H - 176} fill={floor} />
    <Rect x="0" y="172" width={W} height="6" fill="#00000022" />
  </G>
);
const sea = (y: number, c = '#3B82F6') => (
  <G>
    <Rect x="0" y={y} width={W} height={H - y} fill={c} />
    {[0, 1, 2].map((i) => <Path key={i} d={`M0 ${y + 14 + i * 16} q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth="2" fill="none" />)}
  </G>
);
const tree = (x: number, y: number, c = '#2F855A', s = 1) => (
  <G transform={`translate(${x},${y}) scale(${s})`}>
    <Rect x="-3" y="0" width="6" height="18" fill="#7C4A21" />
    <Circle cx="0" cy="-6" r="14" fill={c} />
  </G>
);
const palm = (x: number, y: number, lean = 0) => (
  <G transform={`translate(${x},${y}) rotate(${lean})`}>
    <Path d="M0 0 Q4 -30 2 -60" stroke="#8B5A2B" strokeWidth="6" fill="none" />
    {[-60, -20, 20, 60, 100, 140].map((a) => <Path key={a} d="M2 -60 q20 -6 34 8" stroke="#2F855A" strokeWidth="6" fill="none" strokeLinecap="round" transform={`rotate(${a} 2 -60)`} />)}
  </G>
);
const nSeoulTower = (x: number, y: number, s = 1, lit = false) => (
  <G transform={`translate(${x},${y}) scale(${s})`}>
    <Path d="M-60 0 Q0 -50 60 0Z" fill={lit ? '#1E293B' : '#3F7D4E'} />
    <Rect x="-4" y="-120" width="8" height="90" fill="#F1F5F9" />
    <Rect x="-14" y="-118" width="28" height="16" rx="6" fill={lit ? '#F472B6' : '#E2E8F0'} />
    <Rect x="-10" y="-102" width="20" height="5" fill="#CBD5E1" />
    <Rect x="-1.5" y="-160" width="3" height="42" fill="#E5383B" />
    <Rect x="-12" y="-34" width="24" height="10" fill="#E2E8F0" />
  </G>
);

const BG: Record<BackgroundId, React.ReactNode> = {
  airport: (
    <G>
      {day}
      {cloud(60, 40)}
      {cloud(280, 30, 0.8)}
      <G transform="translate(300,60) rotate(-12)">
        <Path d="M-40 0 L40 0 Q50 0 50 6 Q50 10 40 10 L-36 10Z" fill="#FFFFFF" stroke="#94A3B8" />
        <Path d="M-4 4 L-24 -22 L-14 -22 L14 4Z M-4 8 L-20 30 L-10 30 L12 8Z" fill="#CBD5E1" />
        <Path d="M-40 2 L-48 -14 L-38 -14 L-30 2Z" fill="#2D6CDF" />
      </G>
      <Path d="M20 190 L20 110 Q200 70 380 110 L380 190Z" fill="#E2E8F0" />
      <Path d="M20 110 Q200 70 380 110" stroke="#64748B" strokeWidth="6" fill="none" />
      {Array.from({ length: 18 }).map((_, i) => <Rect key={i} x={30 + i * 19} y="118" width="15" height="62" fill="#9BD3F7" opacity={0.85} />)}
      <Rect x="120" y="128" width="160" height="22" rx="4" fill="#1B2140" />
      {t(200, 144, '도착 ARRIVALS ✈ 到达 到着', 12, '#FFC93C')}
      {ground('#94A3B8')}
      <Rect x="0" y="200" width={W} height="4" fill="#FFFFFF" opacity={0.6} />
    </G>
  ),
  port: (
    <G>
      {day}
      {cloud(80, 36)}
      <Path d="M0 120 L60 80 L120 110 L180 70 L260 110 L330 76 L400 104 L400 150 L0 150Z" fill="#6B8F71" />
      {skyline('#94A3B8', 150, 2)}
      <G stroke="#E5383B" strokeWidth="5" fill="none">
        <Path d="M300 150 L300 70 L370 70 M300 90 L340 70 M352 70 L352 110" />
      </G>
      {sea(150, '#2563EB')}
      <G transform="translate(70,150)">
        <Path d="M0 0 L140 0 L128 26 L12 26Z" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2" />
        <Rect x="24" y="-26" width="90" height="26" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2" />
        <Rect x="50" y="-44" width="40" height="18" fill="#E5383B" />
        {[34, 54, 74, 94].map((x) => <Circle key={x} cx={x} cy="-13" r="5" fill="#93C5FD" />)}
      </G>
      <Rect x="230" y="110" width="150" height="40" fill="#E2E8F0" />
      <Rect x="230" y="104" width="150" height="10" fill="#1E3A8A" />
      {t(305, 134, '국제여객터미널 FERRY TERMINAL', 9)}
    </G>
  ),
  subway: (
    <G>
      {interior('#E2E8F0', '#9CA3AF')}
      <Rect x="0" y="40" width={W} height="136" fill="#CBD5E1" />
      {[0, 1, 2, 3].map((i) => (
        <G key={i}>
          <Rect x={10 + i * 100} y="50" width="80" height="122" fill="#BFE3FF" stroke="#475569" strokeWidth="4" />
          <Line x1={50 + i * 100} y1="50" x2={50 + i * 100} y2="172" stroke="#475569" strokeWidth="3" />
        </G>
      ))}
      <Rect x="0" y="34" width={W} height="10" fill="#00A2D1" />
      <Rect x="130" y="6" width="140" height="26" rx="4" fill="#1F2937" />
      <Circle cx="148" cy="19" r="9" fill="#00A2D1" />
      {t(148, 23, '4', 11, '#FFFFFF')}
      {t(210, 24, '명동 Myeongdong 424', 11, '#FFFFFF')}
      <Rect x="0" y="176" width={W} height="8" fill="#FACC15" />
    </G>
  ),
  street: (
    <G>
      {day}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = i * 82;
        const h = 120 + (i % 2) * 30;
        const colors = ['#F8B4B4', '#BFDBFE', '#FDE68A', '#C4B5FD', '#A7F3D0'];
        const signs = ['화장품 COSMETICS', '환전 EXCHANGE', '맛집 FOOD', '카페 CAFE', '약국'];
        return (
          <G key={i}>
            <Rect x={x} y={190 - h} width="78" height={h} fill={colors[i]} />
            {windows(x + 8, 200 - h, 7, Math.floor(h / 14) - 3, '#FFFFFF')}
            <Rect x={x + 4} y={150 - (i % 2) * 6} width="70" height="16" rx="3" fill={['#E5383B', '#16A34A', '#F08A24', '#7C3AED', '#16A34A'][i]} />
            {t(x + 39, 162 - (i % 2) * 6, signs[i], 8, '#FFFFFF')}
          </G>
        );
      })}
      {ground('#D6D3D1')}
      {[40, 170, 300].map((x) => (
        <G key={x}>
          <Rect x={x} y="176" width="60" height="30" fill="#FFFFFF" stroke="#94A3B8" />
          <Path d={`M${x - 6} 176 L${x + 66} 176 L${x + 60} 162 L${x} 162Z`} fill="#E5383B" />
          {t(x + 30, 196, '떡볶이', 9, '#E5383B')}
        </G>
      ))}
    </G>
  ),
  restaurant: (
    <G>
      {interior('#F5E6C8', '#B08968')}
      <Rect x="20" y="20" width="160" height="70" rx="4" fill="#FFFFFF" stroke="#8B5A2B" strokeWidth="3" />
      {t(100, 40, '메뉴 MENU', 12)}
      {t(100, 58, '삼겹살 ₩16,000 · 갈비 ₩22,000', 9, '#5A6283', '700')}
      {t(100, 74, '김치찌개 ₩9,000 · 공기밥 ₩1,000', 9, '#5A6283', '700')}
      <Rect x="240" y="30" width="130" height="40" rx="4" fill="#E5383B" />
      {t(305, 56, '1인분 가능 ✓', 13, '#FFFFFF')}
      {[90, 290].map((x) => (
        <G key={x}>
          <Rect x={x - 6} y="80" width="12" height="70" fill="#94A3B8" />
          <Path d={`M${x - 30} 150 L${x + 30} 150 L${x + 20} 128 L${x - 20} 128Z`} fill="#CBD5E1" />
          <Rect x={x - 70} y="170" width="140" height="14" rx="3" fill="#8B5A2B" />
          <Circle cx={x} cy="170" r="20" fill="#374151" />
          <Circle cx={x + 50} cy="168" r="6" fill="#E5383B" />
        </G>
      ))}
    </G>
  ),
  noraebang: (
    <G>
      {interior('#2E1065', '#1E1B4B')}
      <Rect x="90" y="24" width="220" height="120" rx="6" fill="#111827" stroke="#A78BFA" strokeWidth="4" />
      <Rect x="98" y="32" width="204" height="104" fill="#1E3A8A" />
      {t(200, 74, '♪ Sing your heart out ♪', 14, '#F472B6')}
      {t(200, 100, '노래방 · 00:42 남음', 12, '#FDE68A')}
      <Circle cx="50" cy="30" r="18" fill="#E5E7EB" />
      {[0, 1, 2, 3].map((i) => <Line key={i} x1="50" y1="30" x2={10 + i * 30} y2="110" stroke={['#F472B6', '#60A5FA', '#FDE68A', '#34D399'][i]} strokeWidth="3" opacity={0.5} />)}
      <Rect x="20" y="170" width="360" height="40" rx="10" fill="#BE185D" />
      <Ellipse cx="340" cy="160" rx="16" ry="6" fill="#FFC93C" />
    </G>
  ),
  pharmacy: (
    <G>
      {interior('#ECFDF5', '#D1D5DB')}
      {[0, 1, 2].map((r) => (
        <G key={r}>
          <Rect x="20" y={40 + r * 40} width="360" height="6" fill="#9CA3AF" />
          {Array.from({ length: 18 }).map((_, i) => <Rect key={i} x={24 + i * 20} y={18 + r * 40} width="14" height="22" rx="2" fill={['#F08A24', '#60A5FA', '#E5383B', '#22A06B', '#F472B6'][(i + r) % 5]} />)}
        </G>
      ))}
      <Rect x="40" y="150" width="320" height="40" fill="#FFFFFF" stroke="#16A34A" strokeWidth="3" />
      <Circle cx="200" cy="146" r="22" fill="#16A34A" />
      {t(200, 155, '약', 24, '#FFFFFF')}
    </G>
  ),
  hospital: (
    <G>
      {interior('#F1F5F9', '#CBD5E1')}
      <Rect x="230" y="40" width="150" height="100" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      {t(305, 70, '접수 RECEPTION', 12, '#1D4ED8')}
      {t(305, 92, '내과 · 정형외과 · 이비인후과', 9, '#5A6283', '700')}
      {t(305, 114, 'Bring your passport', 9, '#5A6283', '700')}
      <Rect x="30" y="30" width="60" height="60" rx="8" fill="#1D4ED8" />
      <Rect x="54" y="42" width="12" height="36" fill="#FFFFFF" />
      <Rect x="42" y="54" width="36" height="12" fill="#FFFFFF" />
      {[30, 80, 130].map((x) => <Rect key={x} x={x} y="148" width="40" height="24" rx="6" fill="#60A5FA" />)}
    </G>
  ),
  palace: (
    <G>
      {day}
      {cloud(320, 36, 0.9)}
      {/* Bugaksan behind the palace */}
      <Path d="M80 120 Q160 30 240 90 Q290 60 360 120Z" fill="#5E8C61" />
      {/* stone platform (woldae) */}
      <Rect x="70" y="160" width="260" height="14" fill="#D6D3D1" />
      <Rect x="90" y="148" width="220" height="14" fill="#E7E5E4" />
      {/* Geunjeongjeon – two-tier roof */}
      <Rect x="120" y="112" width="160" height="36" fill="#B91C1C" />
      {[124, 150, 176, 202, 228, 254, 272].map((x) => <Rect key={x} x={x} y="112" width="5" height="36" fill="#7F1D1D" />)}
      {dancheong(118, 104, 164)}
      {tiledRoof(118, 96, 164)}
      <Rect x="150" y="76" width="100" height="14" fill="#B91C1C" />
      {dancheong(148, 70, 104)}
      {tiledRoof(146, 62, 108)}
      {/* courtyard & rank stones */}
      {ground('#E7E5E4', 174)}
      {[100, 140, 180, 220, 260, 300].map((x) => <Rect key={x} x={x} y="192" width="6" height="12" fill="#A8A29E" />)}
      {t(200, 228, '경복궁 근정전 Gyeongbokgung · Geunjeongjeon', 10, '#57534E', '800')}
    </G>
  ),
  hanok: (
    <G>
      {day}
      {skyline('#CBD5E1', 130, 3)}
      {nSeoulTower(340, 130, 0.55)}
      <Path d="M0 240 L0 150 Q200 120 400 150 L400 240Z" fill="#A8A29E" />
      {[0, 1].map((r) =>
        [0, 1, 2, 3].map((i) => {
          const x = i * 104 - r * 52 + 18;
          const y = 150 + r * 42;
          return (
            <G key={`${r}${i}`}>
              <Rect x={x} y={y} width="74" height="30" fill="#F5E6C8" />
              <Rect x={x + 8} y={y + 8} width="14" height="16" fill="#FFF8E7" stroke="#8B5A2B" />
              <Rect x={x + 52} y={y + 8} width="14" height="16" fill="#FFF8E7" stroke="#8B5A2B" />
              <Rect x={x + 30} y={y + 6} width="14" height="24" fill="#8B5A2B" />
              {tiledRoof(x, y, 74, '#4B5563')}
              <Rect x={x - 6} y={y + 30} width="86" height="8" fill="#9CA3AF" />
            </G>
          );
        }),
      )}
      {t(200, 234, '북촌 한옥마을 Bukchon · residents live here – shh!', 9, '#1F2937')}
    </G>
  ),
  cafe: (
    <G>
      {day}
      {[0, 1, 2].map((i) => (
        <G key={i}>
          <Rect x={i * 135} y="60" width="130" height="130" fill="#B4553B" />
          {Array.from({ length: 10 }).map((_, r) => <Line key={r} x1={i * 135} y1={66 + r * 12} x2={i * 135 + 130} y2={66 + r * 12} stroke="#8A3B26" strokeWidth="1" />)}
          <Rect x={i * 135 + 20} y="100" width="90" height="70" fill="#FDE68A" opacity={0.85} />
          <Rect x={i * 135 + 30} y="74" width="70" height="18" rx="4" fill="#1B2140" />
          {t(i * 135 + 65, 87, ['CAFE 성수', 'POP-UP', 'GALLERY'][i], 10, '#FFFFFF')}
          <Rect x={i * 135 + 100} y="20" width="12" height="40" fill="#6B7280" />
        </G>
      ))}
      {ground('#A8A29E')}
      {[60, 200, 330].map((x) => tree(x, 176, '#4D7C0F', 0.8))}
    </G>
  ),
  tower: (
    <G>
      {sunset}
      <Circle cx="80" cy="70" r="26" fill="#FFE29A" />
      {skyline('#7C5E86', 200, 4)}
      {nSeoulTower(250, 190, 1.2)}
      {ground('#4C3F57', 200)}
      {t(250, 228, 'N서울타워 N Seoul Tower · Namsan', 10, '#FFFFFF')}
    </G>
  ),
  river: (
    <G>
      {sunset}
      {skyline('#8B6F8F', 120, 5)}
      <Rect x="0" y="120" width={W} height="60" fill="#5B8DEF" />
      <Path d="M0 130 L400 130" stroke="#475569" strokeWidth="6" />
      {Array.from({ length: 9 }).map((_, i) => <Path key={i} d={`M${i * 50} 130 Q${i * 50 + 25} 110 ${i * 50 + 50} 130`} stroke="#475569" strokeWidth="3" fill="none" />)}
      {Array.from({ length: 9 }).map((_, i) => <Rect key={i} x={i * 50 - 2} y="130" width="4" height="30" fill="#475569" />)}
      <Rect x="0" y="180" width={W} height="20" fill="#9CA3AF" />
      <Line x1="0" y1="190" x2={W} y2="190" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="10 8" />
      {ground('#6BAF5B', 200)}
      <Rect x="250" y="206" width="70" height="22" fill="#60A5FA" opacity={0.8} />
      {t(200, 236, '한강공원 Hangang Park', 9, '#FFFFFF')}
    </G>
  ),
  market: (
    <G>
      {day}
      <Rect x="0" y="40" width={W} height="20" fill="#1E3A8A" />
      {t(200, 55, '시장 MARKET · 회 · 어묵 · 호떡', 13, '#FFFFFF')}
      {[0, 1, 2, 3].map((i) => (
        <G key={i}>
          <Path d={`M${i * 100} 80 L${i * 100 + 96} 80 L${i * 100 + 90} 64 L${i * 100 + 6} 64Z`} fill={['#E5383B', '#F08A24', '#2D6CDF', '#22A06B'][i]} />
          <Rect x={i * 100 + 6} y="80" width="84" height="110" fill="#F8FAFC" />
          <Rect x={i * 100 + 12} y="120" width="72" height="44" fill="#7DD3FC" stroke="#0369A1" strokeWidth="2" />
          <Path d={`M${i * 100 + 24} 140 q10 -8 20 0 q-10 8 -20 0 l-6 -5 l0 10z`} fill="#F97316" />
          <Path d={`M${i * 100 + 54} 150 q8 -6 16 0 q-8 6 -16 0`} fill="#64748B" />
        </G>
      ))}
      {ground('#9CA3AF')}
    </G>
  ),
  village: (
    <G>
      {day}
      <Path d="M0 240 L0 120 Q200 40 400 110 L400 240Z" fill="#9CA3AF" />
      {Array.from({ length: 30 }).map((_, i) => {
        const col = i % 10;
        const row = Math.floor(i / 10);
        const x = col * 40 + (row % 2) * 20;
        const y = 120 + row * 38 - Math.sin((col / 10) * Math.PI) * 30;
        return (
          <G key={i}>
            <Rect x={x} y={y} width="34" height="30" fill={['#F9A8D4', '#93C5FD', '#FDE68A', '#86EFAC', '#C4B5FD', '#FDBA74'][i % 6]} />
            <Rect x={x + 4} y={y + 8} width="8" height="8" fill="#FFFFFF" />
            <Rect x={x} y={y - 4} width="34" height="5" fill="#64748B" />
          </G>
        );
      })}
    </G>
  ),
  beach: (
    <G>
      {day}
      {skyline('#94A3B8', 110, 6)}
      {sea(110, '#38BDF8')}
      <Path d="M0 170 Q200 150 400 170 L400 240 L0 240Z" fill="#FDE68A" />
      {[60, 160, 270, 350].map((x, i) => (
        <G key={x}>
          <Line x1={x} y1="210" x2={x} y2="170" stroke="#475569" strokeWidth="3" />
          <Path d={`M${x - 26} 172 Q${x} 150 ${x + 26} 172Z`} fill={['#E5383B', '#2D6CDF', '#F08A24', '#22A06B'][i]} />
        </G>
      ))}
      <Rect x="180" y="120" width="40" height="34" fill="#FFFFFF" />
      <Rect x="186" y="110" width="28" height="12" fill="#E5383B" />
      {t(200, 145, '안전', 9, '#E5383B')}
    </G>
  ),
  'night-beach': (
    <G>
      {night}
      {Array.from({ length: 30 }).map((_, i) => <Circle key={i} cx={(i * 53) % 400} cy={(i * 31) % 90 + 6} r="1.4" fill="#FFFFFF" opacity={0.8} />)}
      {/* drone light show */}
      {Array.from({ length: 24 }).map((_, i) => <Circle key={i} cx={200 + 46 * Math.cos((i / 24) * Math.PI * 2)} cy={60 + 30 * Math.sin((i / 24) * Math.PI * 2)} r="2.6" fill="#F472B6" />)}
      {t(200, 66, 'BUSAN', 14, '#FDE68A')}
      {sea(130, '#1E3A8A')}
      {/* Gwangan Bridge */}
      <Path d="M0 130 L400 130" stroke="#60A5FA" strokeWidth="5" />
      {[110, 290].map((x) => <Rect key={x} x={x - 4} y="80" width="8" height="50" fill="#93C5FD" />)}
      <Path d="M0 120 Q55 128 110 80 Q200 128 290 80 Q345 128 400 120" stroke="#A78BFA" strokeWidth="3" fill="none" />
      {Array.from({ length: 40 }).map((_, i) => <Circle key={i} cx={i * 10} cy="131" r="1.8" fill={['#F472B6', '#60A5FA', '#FDE68A'][i % 3]} />)}
      <Path d="M0 180 Q200 168 400 180 L400 240 L0 240Z" fill="#78716C" />
    </G>
  ),
  jjimjilbang: (
    <G>
      {interior('#FDE7C7', '#E9C99B')}
      {[60, 200, 340].map((x, i) => (
        <G key={x}>
          <Path d={`M${x - 50} 176 Q${x - 50} 70 ${x} 70 Q${x + 50} 70 ${x + 50} 176Z`} fill={['#C2410C', '#92400E', '#B45309'][i]} />
          <Rect x={x - 16} y="130" width="32" height="46" rx="16" fill="#1F2937" />
          {t(x, 100, ['불가마 90°C', '황토방 60°C', '얼음방 ICE'][i], 10, '#FFFFFF')}
        </G>
      ))}
      <Ellipse cx="300" cy="206" rx="40" ry="10" fill="#F08A24" opacity={0.6} />
      {t(200, 228, '찜질방 · Jjimjilbang', 11, '#7C2D12')}
    </G>
  ),
  tombs: (
    <G>
      {day}
      {cloud(80, 40)}
      <Ellipse cx="90" cy="190" rx="110" ry="70" fill="#4D7C0F" />
      <Ellipse cx="300" cy="196" rx="130" ry="80" fill="#65A30D" />
      <Ellipse cx="200" cy="210" rx="80" ry="40" fill="#3F6212" />
      {/* Cheomseongdae – bottle-shaped stone observatory */}
      <G transform="translate(200,190)">
        <Path d="M-22 0 Q-14 -40 -10 -70 L10 -70 Q14 -40 22 0Z" fill="#D6C7A1" stroke="#A8936A" strokeWidth="1.5" />
        {Array.from({ length: 9 }).map((_, i) => <Line key={i} x1={-22 + i * 1.3} y1={-i * 8} x2={22 - i * 1.3} y2={-i * 8} stroke="#A8936A" strokeWidth="1" />)}
        <Rect x="-5" y="-42" width="10" height="10" fill="#57534E" />
        <Rect x="-14" y="-78" width="28" height="8" fill="#C4B48A" stroke="#A8936A" />
        <Rect x="-26" y="0" width="52" height="8" fill="#C4B48A" />
      </G>
      {ground('#84CC16', 214)}
      {t(200, 232, '대릉원 · 첨성대 Cheomseongdae', 10, '#1A2E05')}
    </G>
  ),
  temple: (
    <G>
      {day}
      <Path d="M0 110 Q100 40 200 80 Q300 30 400 100 L400 240 L0 240Z" fill="#6B8F5E" />
      {/* Bulguksa stone terraces & stair-bridges */}
      <Rect x="40" y="150" width="320" height="44" fill="#CFC6B0" />
      {Array.from({ length: 16 }).map((_, i) => <Line key={i} x1={40 + i * 20} y1="150" x2={40 + i * 20} y2="194" stroke="#A89F88" />)}
      <Path d="M150 194 L170 150 L200 150 L180 194Z" fill="#E7E0CF" />
      <Path d="M230 194 L250 150 L270 150 L250 194Z" fill="#E7E0CF" />
      <Rect x="90" y="116" width="220" height="34" fill="#B91C1C" />
      {dancheong(88, 108, 224)}
      {tiledRoof(88, 100, 224, '#2F3B2F')}
      {/* Dabotap (ornate) & Seokgatap (simple) */}
      <G transform="translate(60,150)">
        {[0, 1, 2, 3].map((i) => <Rect key={i} x={-14 + i * 2} y={-12 - i * 12} width={28 - i * 4} height="10" fill="#B8AE96" />)}
        <Rect x="-2" y="-64" width="4" height="14" fill="#8A826F" />
      </G>
      <G transform="translate(340,150)">
        {[0, 1, 2].map((i) => <G key={i}><Rect x={-16 + i * 3} y={-14 - i * 16} width={32 - i * 6} height="5" fill="#A8A08A" /><Rect x={-10 + i * 3} y={-9 - i * 16} width={20 - i * 6} height="9" fill="#C8BFA8" /></G>)}
      </G>
      {Array.from({ length: 12 }).map((_, i) => <Ellipse key={i} cx={40 + i * 30} cy="96" rx="6" ry="8" fill={['#F472B6', '#FDE68A', '#60A5FA'][i % 3]} />)}
      {ground('#D6CFC0', 194)}
      {t(200, 226, '불국사 Bulguksa · UNESCO', 10, '#44403C')}
    </G>
  ),
  mountain: (
    <G>
      <Sky top="#A5C8E4" bottom="#E7F1F8" />
      {cloud(60, 60)}
      {/* Hallasan – broad shield volcano with crater */}
      <Path d="M-20 210 Q120 80 180 70 L220 70 Q280 80 420 210Z" fill="#577B5A" />
      <Path d="M176 72 Q200 84 224 72" stroke="#2F4F33" strokeWidth="4" fill="none" />
      <Path d="M150 96 Q200 60 250 96 Q220 90 200 92 Q180 90 150 96Z" fill="#F8FAFC" opacity={0.9} />
      {hills('#3F6B45', 200)}
      <Path d="M120 240 Q160 200 190 180 Q210 160 200 120" stroke="#D6C7A1" strokeWidth="4" fill="none" strokeDasharray="6 4" />
      {[30, 70, 330, 370].map((x) => tree(x, 206, '#2F5D35', 0.9))}
      {t(200, 232, '한라산 Hallasan 1,947 m', 10, '#FFFFFF')}
    </G>
  ),
  volcano: (
    <G>
      <Sky top="#FDBA74" bottom="#FEF3C7" />
      <Circle cx="320" cy="78" r="26" fill="#FDE047" />
      {/* Seongsan Ilchulbong tuff cone */}
      <Path d="M60 170 Q90 70 150 60 L250 60 Q300 70 330 170Z" fill="#7C9A6B" />
      <Path d="M150 60 Q200 80 250 60" stroke="#4D6B42" strokeWidth="5" fill="none" />
      {Array.from({ length: 10 }).map((_, i) => <Line key={i} x1={96 + i * 22} y1="100" x2={90 + i * 24} y2="170" stroke="#6A855C" strokeWidth="2" />)}
      {sea(170, '#2563EB')}
      {[80, 120, 300, 340].map((x) => <G key={x}><Circle cx={x} cy="200" r="7" fill="#F97316" /><Line x1={x} y1="207" x2={x} y2="220" stroke="#1F2937" strokeWidth="2" /></G>)}
      {t(200, 232, '성산일출봉 Seongsan Ilchulbong · haenyeo buoys', 9, '#FFFFFF')}
    </G>
  ),
  coast: (
    <G>
      {day}
      {sea(110, '#0EA5E9')}
      <Path d="M0 160 Q100 130 200 150 Q300 170 400 140 L400 240 L0 240Z" fill="#374151" />
      {Array.from({ length: 16 }).map((_, i) => <Ellipse key={i} cx={(i * 27) % 400} cy={170 + (i % 3) * 18} rx="14" ry="8" fill="#1F2937" />)}
      <Path d="M0 200 Q200 180 400 205" stroke="#D6C7A1" strokeWidth="10" fill="none" />
      {/* dol hareubang */}
      <G transform="translate(330,190)">
        <Rect x="-14" y="-50" width="28" height="50" rx="10" fill="#57534E" />
        <Ellipse cx="0" cy="-56" rx="15" ry="9" fill="#44403C" />
        <Ellipse cx="-5" cy="-38" rx="3" ry="4" fill="#292524" />
        <Ellipse cx="5" cy="-38" rx="3" ry="4" fill="#292524" />
        <Ellipse cx="0" cy="-30" rx="5" ry="4" fill="#44403C" />
      </G>
      <Path d="M60 150 L60 120 M60 122 l10 4 l-10 4 M58 122 l-10 4 l10 4" stroke="#1D4ED8" strokeWidth="2" fill="#F97316" />
      {palm(120, 150, -6)}
    </G>
  ),
  storm: (
    <G>
      <Sky top="#1F2937" bottom="#4B5563" />
      {cloud(40, 40, 1.4)}
      {cloud(220, 30, 1.6)}
      <Path d="M260 60 L240 110 L258 110 L236 160" stroke="#FDE047" strokeWidth="5" fill="none" />
      {Array.from({ length: 50 }).map((_, i) => <Line key={i} x1={(i * 41) % 400} y1={(i * 29) % 200} x2={(i * 41) % 400 - 10} y2={(i * 29) % 200 + 18} stroke="#93C5FD" strokeWidth="1.6" opacity={0.7} />)}
      {sea(170, '#334155')}
      {palm(80, 200, 22)}
      {palm(320, 200, 26)}
      <Rect x="140" y="120" width="120" height="70" fill="#64748B" />
      {windows(150, 130, 10, 4, '#FDE68A')}
    </G>
  ),
  pension: (
    <G>
      <Sky top="#93C5FD" bottom="#E0F2FE" />
      {sea(150, '#0EA5E9')}
      {hills('#65A30D', 190)}
      <Path d="M100 110 L200 60 L300 110Z" fill="#92400E" />
      <Rect x="115" y="110" width="170" height="80" fill="#FBBF77" />
      <Rect x="130" y="124" width="50" height="34" fill="#BFE3FF" />
      <Rect x="220" y="134" width="34" height="56" fill="#78350F" />
      <Rect x="300" y="170" width="40" height="8" fill="#1F2937" />
      <Path d="M306 178 l-6 14 M334 178 l6 14" stroke="#1F2937" strokeWidth="3" />
      <Path d="M312 166 q4 -8 0 -16 M326 166 q4 -8 0 -16" stroke="#9CA3AF" strokeWidth="2" fill="none" />
      {palm(60, 200)}
    </G>
  ),
  stage: (
    <G>
      {interior('#111827', '#3F3F46')}
      <Rect x="20" y="20" width="360" height="150" fill="#1F2937" stroke="#6B7280" strokeWidth="4" />
      <Rect x="28" y="28" width="344" height="134" fill="#374151" />
      {[0, 1, 2, 3, 4].map((i) => <Path key={i} d={`M${40 + i * 80} 0 L${10 + i * 80} 176 L${70 + i * 80} 176Z`} fill={['#F472B6', '#60A5FA', '#FDE68A', '#A78BFA', '#34D399'][i]} opacity={0.18} />)}
      {t(200, 90, 'K-POP DANCE CLASS', 20, '#F472B6')}
      {t(200, 116, '5 · 6 · 7 · 8 !', 14, '#FDE68A')}
      <Rect x="0" y="176" width={W} height="6" fill="#A78BFA" />
    </G>
  ),
  kitchen: (
    <G>
      {interior('#FEF3C7', '#D6D3D1')}
      {Array.from({ length: 12 }).map((_, i) => <Rect key={i} x={i * 34} y="40" width="32" height="32" fill="#FFFFFF" stroke="#E7E5E4" />)}
      <Rect x="20" y="130" width="360" height="46" fill="#E7E5E4" stroke="#A8A29E" strokeWidth="2" />
      <Ellipse cx="120" cy="128" rx="50" ry="14" fill="#E5E7EB" stroke="#9CA3AF" />
      <Ellipse cx="120" cy="126" rx="40" ry="9" fill="#DC2626" />
      <Ellipse cx="280" cy="128" rx="34" ry="12" fill="#1F2937" />
      <Ellipse cx="280" cy="126" rx="28" ry="8" fill="#7C2D12" />
      {t(200, 30, '김치 · 비빔밥 COOKING CLASS', 14, '#B45309')}
    </G>
  ),
  shop: (
    <G>
      {interior('#FFF1F2', '#FBCFE8')}
      {[0, 1, 2, 3].map((r) => (
        <G key={r}>
          <Rect x="10" y={30 + r * 36} width="380" height="5" fill="#F9A8D4" />
          {Array.from({ length: 24 }).map((_, i) => <Rect key={i} x={14 + i * 16} y={14 + r * 36} width="10" height={14 + (i % 3) * 3} rx="3" fill={['#FDA4AF', '#A5B4FC', '#FDE68A', '#86EFAC', '#FFFFFF'][(i + r) % 5]} />)}
        </G>
      ))}
      <Rect x="120" y="160" width="160" height="30" rx="6" fill="#E5383B" />
      {t(200, 181, 'TAX FREE · 즉시환급', 12, '#FFFFFF')}
    </G>
  ),
  dmz: (
    <G>
      <Sky top="#CBD5E1" bottom="#F1F5F9" />
      {hills('#6B7F5B', 150)}
      {hills('#4B5D3F', 190)}
      {Array.from({ length: 11 }).map((_, i) => <Rect key={i} x={i * 40} y="150" width="4" height="60" fill="#57534E" />)}
      {[160, 172, 184, 196].map((y) => <Line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#78716C" strokeWidth="1.5" strokeDasharray="4 3" />)}
      {Array.from({ length: 30 }).map((_, i) => <Rect key={i} x={6 + i * 13} y={164 + (i % 3) * 10} width="5" height="12" fill={['#E5383B', '#FDE68A', '#60A5FA', '#FFFFFF'][i % 4]} />)}
      <Rect x="300" y="80" width="40" height="40" fill="#78716C" />
      <Rect x="294" y="74" width="52" height="8" fill="#57534E" />
      {ground('#A8A29E', 210)}
      {t(200, 230, 'DMZ · 비무장지대 – photos only at marked spots', 9, '#1C1917')}
    </G>
  ),
};

export function Background({ id, width, height }: { id: string; width: number; height: number }) {
  const art = (BG as Record<string, React.ReactNode>)[id] ?? BG.street;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      {art}
    </Svg>
  );
}
