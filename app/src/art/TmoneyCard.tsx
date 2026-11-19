import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Text as T } from 'react-native-svg';

const won = (n: number) => '₩' + Math.round(n).toLocaleString('en-US');

/** Detailed T-money card (ISO card size 85.6 × 54 mm) with glossy plastic look. */
export function TmoneyCard({ width, side = 'front', balance }: { width: number; side?: 'front' | 'back'; balance?: number }) {
  return (
    <Svg width={width} height={(width * 57) / 88} viewBox="-1 -1 88 57">
      <Defs>
        <LinearGradient id={`tm-body-${side}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#E9EDF2" />
        </LinearGradient>
        <LinearGradient id="tm-wave" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FF9F43" />
          <Stop offset="0.6" stopColor="#F08A24" />
          <Stop offset="1" stopColor="#E0650F" />
        </LinearGradient>
        <LinearGradient id="tm-logo" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FF5A5F" />
          <Stop offset="1" stopColor="#C81E23" />
        </LinearGradient>
      </Defs>
      <Rect x="1.2" y="1.6" width="85" height="53.4" rx="3.4" fill="#000" opacity={0.18} />
      <Rect x="0.3" y="0.3" width="85" height="53.4" rx="3.2" fill={`url(#tm-body-${side})`} stroke="#CBD5E1" strokeWidth="0.5" />
      {side === 'front' ? (
        <G>
          {Array.from({ length: 60 }).map((_, i) => (
            <Circle key={i} cx={4 + (i % 12) * 7} cy={4 + Math.floor(i / 12) * 6} r="0.35" fill="#F08A24" opacity={0.18} />
          ))}
          <Path d="M0.3 34 Q30 20 85.3 32 L85.3 50.5 Q85.3 53.7 82 53.7 L3.5 53.7 Q0.3 53.7 0.3 50.5Z" fill="url(#tm-wave)" />
          <Path d="M0.3 41 Q36 28 85.3 40" stroke="#FFD166" strokeWidth="1.8" fill="none" />
          <Path d="M0.3 46 Q40 36 85.3 46" stroke="#FFFFFF" strokeWidth="0.6" fill="none" opacity={0.6} />
          <Circle cx="12" cy="12" r="6.5" fill="url(#tm-logo)" />
          <Circle cx="10" cy="9.6" r="3" fill="#FFFFFF" opacity={0.25} />
          <T x="12" y="15" fontSize="8.5" fontWeight="900" fill="#FFF" textAnchor="middle">T</T>
          <T x="21" y="14.5" fontSize="9" fontWeight="900" fill="#1B2140">money</T>
          <T x="6" y="25" fontSize="4.2" fontWeight="800" fill="#5A6283">티머니 · 대중교통 선불카드</T>
          <T x="6" y="30" fontSize="3.4" fontWeight="700" fill="#5A6283">Prepaid transit card · Subway · Bus · Taxi · Store</T>
          <G stroke="#1B2140" strokeWidth="0.9" fill="none" strokeLinecap="round">
            <Path d="M72 9 q2 3 0 6" />
            <Path d="M75 7.5 q3.5 4.5 0 9" />
            <Path d="M78 6 q5 6 0 12" />
          </G>
          <T x="80" y="49" fontSize="4" fontWeight="900" fill="#FFF" textAnchor="end">TAP ▶ 삑!</T>
        </G>
      ) : (
        <G>
          <Rect x="0.3" y="5" width="85" height="7" fill="#1B2140" />
          <Rect x="0.3" y="5" width="85" height="1.2" fill="#FFFFFF" opacity={0.15} />
          <T x="5" y="19" fontSize="3.8" fontWeight="900" fill="#1B2140">T-money</T>
          <T x="5" y="24.5" fontSize="3.6" fontWeight="700" fill="#1B2140" letterSpacing="0.4">1010-0123-4567-8901</T>
          <T x="5" y="31" fontSize="3.1" fontWeight="700" fill="#5A6283">• 충전 Top up: convenience stores, subway machines</T>
          <T x="5" y="35.5" fontSize="3.1" fontWeight="700" fill="#5A6283">• 잔액 환불 Refund: stores / service centres (fee)</T>
          <T x="5" y="40" fontSize="3.1" fontWeight="700" fill="#5A6283">• Tap ON and OFF (bus) for free transfers</T>
          {balance !== undefined && (
            <G>
              <Rect x="52" y="44" width="30" height="7" rx="1.5" fill="#FEF3C7" />
              <T x="67" y="49" fontSize="3.6" fontWeight="900" fill="#92400E" textAnchor="middle">잔액 {won(balance)}</T>
            </G>
          )}
        </G>
      )}
      {/* glossy plastic reflection */}
      <Path d="M0.3 18 L30 0.3 L46 0.3 L0.3 30 Z" fill="#FFFFFF" opacity={0.28} />
    </Svg>
  );
}
