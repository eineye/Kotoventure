import { useEffect, useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { AREAS, TREK_POINT_ICON, fmtTrekTime, tr, type Trek, type TrekPhoto } from '@kotoventure/shared';
import { Text } from '../ui/Text';
import { useStore } from '../data/store';
import { getJSON, setJSON } from '../data/storage';
import { KoreaPin, TrekRoute } from '../ui/TrekMap';
import { Btn, H, P, Panel } from '../ui/kit';
import { C, R, shadow } from '../ui/theme';

/** photos bundled with the app; admin-uploaded photos are data: or https: URLs */
const BUNDLED: Record<string, ImageSourcePropType> = {
  'solhyang-1': require('../../assets/trek/solhyang-1.webp'),
  'solhyang-2': require('../../assets/trek/solhyang-2.webp'),
  'solhyang-3': require('../../assets/trek/solhyang-3.webp'),
  'solhyang-4': require('../../assets/trek/solhyang-4.webp'),
};
export const photoSource = (p: TrekPhoto): ImageSourcePropType | null =>
  p.src.startsWith('asset:') ? BUNDLED[p.src.slice(6)] ?? null : { uri: p.src };

const DIFF = { 1: ['쉬움', 'Easy'], 2: ['보통', 'Moderate'], 3: ['어려움', 'Hard'] } as const;
const openMap = (which: 'naver' | 'kakao', q: string) =>
  Linking.openURL(which === 'naver' ? `https://map.naver.com/p/search/${encodeURIComponent(q)}` : `https://map.kakao.com/link/search/${encodeURIComponent(q)}`).catch(() => {});

/** List of hidden-gem treks. */
export function TrekList({ onBack, onOpen }: { onBack: () => void; onOpen: (id: string) => void }) {
  const { content, profile } = useStore();
  const lang = profile?.lang ?? 'en';
  const ko = lang === 'ko';
  const treks = (content.treks ?? []).filter((t) => t.status === 'published').sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}>
        <Pressable onPress={onBack} style={{ alignSelf: 'flex-start', paddingVertical: 6 }} accessibilityRole="button">
          <Text style={{ fontWeight: '900', color: C.ink }}>← {ko ? '뒤로' : 'Back'}</Text>
        </Pressable>
        <H size={24}>🥾 {ko ? '숨은 명소 트레킹' : 'Hidden-gem treks'}</H>
        <P dim>{ko ? '잘 알려지지 않은 곳을 오직 걸어서만 둘러보는 코스예요.' : 'Lesser-known places, explored on foot only.'}</P>
        {treks.map((t) => {
          const cover = t.photos[0] ? photoSource(t.photos[0]) : null;
          return (
            <Pressable key={t.id} testID={`trek-${t.id}`} onPress={() => onOpen(t.id)} accessibilityRole="button" style={{ backgroundColor: '#FFF', borderRadius: R.l, overflow: 'hidden', ...shadow }}>
              {cover && <Image source={cover} style={{ width: '100%', height: 150 }} resizeMode="cover" />}
              <View style={{ padding: 12, gap: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: C.inkSoft }}>
                  {AREAS.find((a) => a.id === t.area)?.icon} {tr(AREAS.find((a) => a.id === t.area)?.name, lang)}
                </Text>
                <Text style={{ fontSize: 17, fontWeight: '900', color: C.ink }}>{tr(t.title, lang)}</Text>
                <Text style={{ fontSize: 13, color: C.inkSoft }}>
                  🥾 {t.distanceKm} km · ⏱ {fmtTrekTime(t.durationMin, lang)} · {ko ? DIFF[t.difficulty][0] : DIFF[t.difficulty][1]}
                </Text>
              </View>
            </Pressable>
          );
        })}
        {treks.length === 0 && <P dim>{ko ? '아직 등록된 코스가 없어요.' : 'No treks yet.'}</P>}
      </ScrollView>
    </View>
  );
}

/** One trek: notice & tips, where it is, the route, distance/time, meals, photos and a checkpoint walk. */
export function TrekDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { content, profile } = useStore();
  const { width } = useWindowDimensions();
  const lang = profile?.lang ?? 'en';
  const ko = lang === 'ko';
  const t = (content.treks ?? []).find((x) => x.id === id);
  const [photo, setPhoto] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const KEY = `kv.trek.${id}`;
  useEffect(() => {
    getJSON<number[]>(KEY).then((d) => d && setDone(d));
  }, [KEY]);
  const toggle = (i: number) =>
    setDone((d) => {
      const next = d.includes(i) ? d.filter((x) => x !== i) : [...d, i];
      setJSON(KEY, next);
      return next;
    });
  if (!t) return null;
  const mapW = Math.min(width - 64, 520);
  const photoW = Math.floor((Math.min(width, 600) - 64 - 8) / 2);
  const finished = done.length === t.points.length;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View>
          {t.photos[0] && photoSource(t.photos[0]) && <Image source={photoSource(t.photos[0])!} style={{ width: '100%', height: 200 }} resizeMode="cover" />}
          <Pressable onPress={onBack} style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFFFFE6', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }} accessibilityRole="button">
            <Text style={{ fontWeight: '900', color: C.ink }}>← {ko ? '뒤로' : 'Back'}</Text>
          </Pressable>
        </View>
        <View style={{ padding: 16, gap: 14 }}>
          <Panel>
            <H size={22}>🥾 {tr(t.title, lang)}</H>
            <Text style={{ color: C.inkSoft, fontWeight: '800', marginTop: 4 }}>{tr(t.courseName, lang)}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
              <Info k={ko ? '거리' : 'Distance'} v={`${t.distanceKm} km`} />
              <Info k={ko ? '소요 시간' : 'Time'} v={`⏱ ${fmtTrekTime(t.durationMin, lang)}`} />
              <Info k={ko ? '난이도' : 'Difficulty'} v={ko ? DIFF[t.difficulty][0] : DIFF[t.difficulty][1]} />
            </View>
          </Panel>

          <Panel style={{ backgroundColor: '#FFF4D6' }}>
            <H size={17}>📢 {ko ? '안내' : 'Before you go'}</H>
            <P style={{ marginTop: 6 }}>{tr(t.notice, lang)}</P>
            {t.tips.map((x, i) => (
              <Text key={i} style={{ marginTop: 8, fontSize: 13, color: C.ink }}>
                🚗 {tr(x, lang)}
              </Text>
            ))}
          </Panel>

          <Panel>
            <H size={17}>📍 {ko ? '위치와 출발지' : 'Where'}</H>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, alignItems: 'center' }}>
              <KoreaPin trek={t} size={96} />
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontWeight: '900', color: C.ink }}>{t.addressKo}</Text>
                <Text style={{ fontSize: 12, color: C.inkSoft }}>
                  {ko ? '출발' : 'Start'}: {t.startSearch}
                  {t.endSearch ? ` · ${ko ? '도착' : 'Finish'}: ${t.endSearch}` : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <MapBtn testID="trek-naver" label={`N ${ko ? '지도' : 'Map'}`} bg="#03C75A" color="#FFF" onPress={() => openMap('naver', t.startSearch)} />
                  <MapBtn testID="trek-kakao" label={`K ${ko ? '지도' : 'Map'}`} bg="#FEE500" color="#3A1D1D" onPress={() => openMap('kakao', t.startSearch)} />
                </View>
              </View>
            </View>
          </Panel>

          <Panel>
            <H size={17}>🗺️ {ko ? '코스' : 'Route'}</H>
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <TrekRoute trek={t} lang={lang} width={mapW} done={done} />
            </View>
            <Text style={{ fontSize: 10, color: C.inkSoft, marginTop: 4 }}>{ko ? '* 간단한 코스 약도예요 (실제 거리·방향과 다를 수 있어요).' : '* Simplified sketch – not to scale.'}</Text>
          </Panel>

          <Panel>
            <H size={17}>🍙 {ko ? '식사' : 'Food'}</H>
            <P style={{ marginTop: 6 }}>{tr(t.meal, lang)}</P>
          </Panel>

          {t.photos.length > 0 && (
            <Panel>
              <H size={17}>📷 {ko ? '사진' : 'Photos'}</H>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {t.photos.map((p, i) => {
                  const src = photoSource(p);
                  return src ? (
                    <Pressable key={i} testID={`trek-photo-${i}`} onPress={() => setPhoto(i)} style={{ width: photoW }} accessibilityRole="imagebutton">
                      <Image source={src} style={{ width: photoW, height: photoW / 1.5, borderRadius: R.s }} resizeMode="cover" />
                      {p.caption && <Text style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>{tr(p.caption, lang)}</Text>}
                    </Pressable>
                  ) : null;
                })}
              </View>
            </Panel>
          )}

          <Panel style={{ gap: 6 }}>
            <H size={17}>✅ {ko ? '걸으면서 체크하기' : 'Walk it – check off each point'}</H>
            <P dim style={{ fontSize: 12 }}>{ko ? '지난 지점을 누르면 체크돼요. 기록은 이 휴대폰에 저장돼요.' : 'Tap each point as you pass it. Saved on this phone.'}</P>
            {t.points.map((pt, i) => {
              const isDone = done.includes(i);
              return (
                <Pressable key={i} testID={`trek-point-${i}`} onPress={() => toggle(i)} accessibilityRole="checkbox" accessibilityState={{ checked: isDone }} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.line }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isDone ? C.green : '#FFF', borderWidth: 2, borderColor: isDone ? C.green : C.line, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>{isDone ? '✓' : ''}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: isDone ? C.inkSoft : C.ink }}>
                      {i + 1}. {TREK_POINT_ICON[pt.kind]} {tr(pt.name, lang)}
                    </Text>
                    {pt.note && <Text style={{ fontSize: 12, color: C.inkSoft }}>{tr(pt.note, lang)}</Text>}
                  </View>
                </Pressable>
              );
            })}
            {finished && (
              <View style={{ backgroundColor: '#E8F8F0', borderRadius: R.m, padding: 12, marginTop: 6 }}>
                <Text style={{ fontWeight: '900', color: C.green }}>🎉 {ko ? `완주! ${t.distanceKm}km를 걸었어요.` : `Finished! You walked ${t.distanceKm} km.`}</Text>
              </View>
            )}
            {done.length > 0 && <Btn small kind="ghost" label={ko ? '체크 초기화' : 'Reset checks'} onPress={() => (setDone([]), setJSON(KEY, []))} />}
          </Panel>
        </View>
      </ScrollView>

      <Modal visible={photo !== null} transparent animationType="fade" onRequestClose={() => setPhoto(null)}>
        <Pressable testID="trek-photo-close" onPress={() => setPhoto(null)} style={{ flex: 1, backgroundColor: '#000000E6', justifyContent: 'center', padding: 12 }}>
          {photo !== null && photoSource(t.photos[photo]) && (
            <>
              <Image source={photoSource(t.photos[photo])!} style={{ width: '100%', height: '70%' }} resizeMode="contain" />
              {t.photos[photo].caption && <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 10 }}>{tr(t.photos[photo].caption, lang)}</Text>}
              <Text style={{ color: '#FFFFFFAA', textAlign: 'center', marginTop: 8, fontSize: 12 }}>{ko ? '아무 곳이나 누르면 닫혀요' : 'Tap anywhere to close'}</Text>
            </>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ minWidth: '28%', flexGrow: 1 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: C.inkSoft }}>{k}</Text>
      <Text style={{ fontSize: 15, fontWeight: '900', color: C.ink }}>{v}</Text>
    </View>
  );
}

function MapBtn({ label, bg, color, onPress, testID }: { label: string; bg: string; color: string; onPress: () => void; testID: string }) {
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole="link" style={{ backgroundColor: bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text style={{ color, fontWeight: '900', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

export type { Trek };
