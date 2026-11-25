import { Alert, Linking, Platform, Pressable, View } from 'react-native';
import { SPOT_FEATURES, SPOT_KINDS, tr, type Course, type Spot } from '@kotoventure/shared';
import { useStore } from '../data/store';
import { Text } from './Text';
import { C, R } from './theme';

const openMap = (which: 'naver' | 'kakao', q: string) =>
  Linking.openURL(which === 'naver' ? `https://map.naver.com/p/search/${encodeURIComponent(q)}` : `https://map.kakao.com/link/search/${encodeURIComponent(q)}`).catch(() => {});

/**
 * A recommended place. Editorial picks show "Kachi's pick"; paid partner listings
 * are always labelled "Partner" so travellers can tell them apart.
 */
export function SpotCard({ spot, lang, compact, course }: { spot: Spot; lang: string; compact?: boolean; course?: Course }) {
  const { savedSpots, toggleSpot, routeSpots, setRouteSpot, progress } = useStore();
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
      {course && <AddToRoute spot={spot} course={course} lang={lang} routeDay={routeSpots[course.id]?.find((r) => r.spotId === spot.id)?.day} inProgress={!!progress[course.id] && !progress[course.id].completedAt && progress[course.id].sceneIndex > 0} onSet={(d) => setRouteSpot(course.id, spot.id, d)} />}
    </View>
  );
}

/** "Add to my route": choose the day; the pick becomes a scene of the mission (time & cost included). */
function AddToRoute({ spot, course, lang, routeDay, inProgress, onSet }: { spot: Spot; course: Course; lang: string; routeDay?: number; inProgress: boolean; onSet: (day: number) => void }) {
  const ko = lang === 'ko';
  const days = Array.from({ length: course.days }, (_, i) => i + 1);
  const set = (d: number) => {
    const go = () => onSet(d);
    if (!inProgress) return go();
    const msg = ko ? '진행 중인 미션은 일정이 바뀌면 처음부터 다시 시작해요. 계속할까요?' : 'Changing the route restarts the mission in progress. Continue?';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(msg)) go();
      return;
    }
    Alert.alert(ko ? '일정 변경' : 'Change route', msg, [
      { text: ko ? '아니오' : 'No', style: 'cancel' },
      { text: ko ? '예' : 'Yes', onPress: go },
    ]);
  };
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, gap: 6 }}>
      {routeDay ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ flex: 1, color: C.green, fontWeight: '900', fontSize: 13 }}>✓ {ko ? `${routeDay}일차 일정에 넣었어요` : `Added to day ${routeDay}`}</Text>
          <Pressable testID={`spot-remove-${spot.id}`} onPress={() => set(0)} accessibilityRole="button" style={{ borderWidth: 1.5, borderColor: C.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: C.inkSoft }}>{ko ? '빼기' : 'Remove'}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, fontWeight: '900', color: C.ink }}>➕ {ko ? '내 일정에 넣기' : 'Add to my route'}</Text>
          {days.map((d) => (
            <Pressable key={d} testID={`spot-add-${spot.id}-${d}`} onPress={() => set(d)} accessibilityRole="button" style={{ backgroundColor: C.blue, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>{ko ? `${d}일차` : `Day ${d}`}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <Text style={{ fontSize: 10, color: C.inkSoft }}>{ko ? '넣으면 그날 일정에 방문 장면이 추가되고 이동·방문 시간과 비용이 계산돼요.' : 'Adds a visit to that day – travel time, visit time and cost are included.'}</Text>
    </View>
  );
}
