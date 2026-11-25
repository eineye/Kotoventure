import { Linking, Pressable, View } from 'react-native';
import { SPOT_FEATURES, SPOT_KINDS, tr, type Spot } from '@kotoventure/shared';
import { useStore } from '../data/store';
import { Text } from './Text';
import { C, R } from './theme';

const openMap = (which: 'naver' | 'kakao', q: string) =>
  Linking.openURL(which === 'naver' ? `https://map.naver.com/p/search/${encodeURIComponent(q)}` : `https://map.kakao.com/link/search/${encodeURIComponent(q)}`).catch(() => {});

/**
 * A recommended place. Editorial picks show "Kachi's pick"; paid partner listings
 * are always labelled "Partner" so travellers can tell them apart.
 */
export function SpotCard({ spot, lang, compact }: { spot: Spot; lang: string; compact?: boolean }) {
  const { savedSpots, toggleSpot } = useStore();
  const ko = lang === 'ko';
  const kind = SPOT_KINDS.find((k) => k.id === spot.kind);
  const saved = savedSpots.includes(spot.id);
  return (
    <View testID={`spot-${spot.id}`} style={{ backgroundColor: '#FFF', borderRadius: R.m, borderWidth: 1.5, borderColor: spot.sponsored ? '#E9B949' : C.line, padding: 12, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <View style={{ backgroundColor: spot.sponsored ? '#FFF4D6' : '#EEF4FF', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontSize: 11, fontWeight: '900', color: spot.sponsored ? '#9A6B00' : C.blue }}>{spot.sponsored ? (ko ? '제휴' : 'Partner') : ko ? '🐦 카치 추천' : "🐦 Kachi's pick"}</Text>
        </View>
        <Text style={{ fontSize: 11, color: C.inkSoft, fontWeight: '800' }}>
          {kind?.icon} {tr(kind?.name, lang)}
          {spot.priceRange ? ` · ${'₩'.repeat(spot.priceRange)}` : ''}
        </Text>
        <View style={{ flex: 1 }} />
        <Pressable testID={`spot-save-${spot.id}`} onPress={() => toggleSpot(spot.id)} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: saved }} accessibilityLabel={ko ? '가 보고 싶은 곳에 저장' : 'Save'}>
          <Text style={{ fontSize: 18, color: saved ? C.red : C.inkSoft }}>{saved ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
      <Text style={{ fontWeight: '900', fontSize: 16, color: C.ink }}>{tr(spot.name, lang)}</Text>
      <Text style={{ fontSize: 13, color: C.ink }} numberOfLines={compact ? 2 : undefined}>
        {tr(spot.intro, lang)}
      </Text>
      {!compact && spot.tip && <Text style={{ fontSize: 12, color: C.inkSoft }}>💡 {tr(spot.tip, lang)}</Text>}
      {(spot.hours || spot.closed) && (
        <Text style={{ fontSize: 12, color: C.inkSoft }}>
          🕘 {spot.hours ?? ''}
          {spot.closed ? ` · ${ko ? '휴무' : 'Closed'} ${spot.closed}` : ''}
        </Text>
      )}
      {spot.features.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {spot.features.map((f) => {
            const d = SPOT_FEATURES.find((x) => x.id === f);
            return d ? (
              <View key={f} style={{ backgroundColor: '#F4F1EA', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 11, color: C.ink }}>
                  {d.icon} {tr(d.name, lang)}
                </Text>
              </View>
            ) : null;
          })}
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
        <Pressable testID={`spot-naver-${spot.id}`} onPress={() => openMap('naver', spot.addressKo)} accessibilityRole="link" style={{ backgroundColor: '#03C75A', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>N {ko ? '지도' : 'Map'}</Text>
        </Pressable>
        <Pressable testID={`spot-kakao-${spot.id}`} onPress={() => openMap('kakao', spot.addressKo)} accessibilityRole="link" style={{ backgroundColor: '#FEE500', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ color: '#3A1D1D', fontWeight: '900', fontSize: 12 }}>K {ko ? '지도' : 'Map'}</Text>
        </Pressable>
        {spot.verifiedAt && (
          <Text style={{ fontSize: 10, color: C.inkSoft, alignSelf: 'center', marginLeft: 'auto' }}>
            {ko ? `확인 ${spot.verifiedAt}` : `Checked ${spot.verifiedAt}`}
          </Text>
        )}
      </View>
    </View>
  );
}
