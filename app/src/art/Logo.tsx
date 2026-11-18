import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, TSpan, Text as SvgText } from 'react-native-svg';

/**
 * Kotoventure logo: a taegeuk-inspired compass (red/blue swirl) with a paper-plane needle,
 * next to the wordmark. Original artwork.
 */
export function LogoMark({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFD166" />
          <Stop offset="1" stopColor="#F08A24" />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="47" fill="url(#ring)" />
      <Circle cx="50" cy="50" r="39" fill="#FFF9F0" />
      {/* taegeuk swirl */}
      <Path d="M18 50 A32 32 0 0 0 82 50 A16 16 0 0 1 50 50 A16 16 0 0 0 18 50Z" fill="#1D4ED8" />
      <Path d="M18 50 A32 32 0 0 1 82 50 A16 16 0 0 1 50 50 A16 16 0 0 0 18 50Z" fill="#E5383B" />
      {/* compass ticks */}
      <G fill="#1B2140">
        <Path d="M50 4 l3 8 h-6z" />
        <Path d="M50 96 l3 -8 h-6z" />
        <Path d="M4 50 l8 3 v-6z" />
        <Path d="M96 50 l-8 3 v-6z" />
      </G>
      {/* paper plane */}
      <G transform="rotate(-30 50 50)">
        <Path d="M30 52 L74 40 L56 64 Z" fill="#FFFFFF" stroke="#1B2140" strokeWidth="2.5" strokeLinejoin="round" />
        <Path d="M74 40 L48 56 L50 68 Z" fill="#DCE6FF" stroke="#1B2140" strokeWidth="2.5" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Logo({ width = 300, sub = true }: { width?: number; sub?: boolean }) {
  const h = sub ? 120 : 96;
  const vw = 380;
  return (
    <Svg width={width} height={(width / vw) * h} viewBox={`0 0 ${vw} ${h}`}>
      <G transform="translate(0,0) scale(0.96)">
        <Circle cx="50" cy="50" r="47" fill="#F5A623" />
        <Circle cx="50" cy="50" r="39" fill="#FFF9F0" />
        <Path d="M18 50 A32 32 0 0 0 82 50 A16 16 0 0 1 50 50 A16 16 0 0 0 18 50Z" fill="#1D4ED8" />
        <Path d="M18 50 A32 32 0 0 1 82 50 A16 16 0 0 1 50 50 A16 16 0 0 0 18 50Z" fill="#E5383B" />
        <G transform="rotate(-30 50 50)">
          <Path d="M30 52 L74 40 L56 64 Z" fill="#FFFFFF" stroke="#1B2140" strokeWidth="2.5" strokeLinejoin="round" />
          <Path d="M74 40 L48 56 L50 68 Z" fill="#DCE6FF" stroke="#1B2140" strokeWidth="2.5" strokeLinejoin="round" />
        </G>
      </G>
      <SvgText x="104" y="52" fontSize="38" fontWeight="900" letterSpacing="-1">
        <TSpan fill="#1B2140">Koto</TSpan>
        <TSpan fill="#E5383B">venture</TSpan>
      </SvgText>
      <SvgText x="106" y="78" fontSize="12.5" fontWeight="800" fill="#5A6283" letterSpacing="1.6">
        KOREA TOURING GAME ADVENTURE
      </SvgText>
      {sub && (
        <SvgText x="106" y="104" fontSize="14" fontWeight="700" fill="#1D4ED8">
          코토벤처 · 한국 여행 서바이벌
        </SvgText>
      )}
    </Svg>
  );
}
