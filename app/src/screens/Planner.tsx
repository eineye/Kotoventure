import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../ui/Text';
import {
  AREAS,
  AREA_HUBS,
  KIND_ICON,
  MAX_DAYS,
  MONTH_NAMES,
  PLANNER_MEALS,
  PLANNER_PLACES,
  STAY_KINDS,
  buildTrip,
  courseEstimate,
  dur,
  hubInfo,
  newTripSpec,
  tr,
  type Area,
  type TripSpec,
} from '@kotoventure/shared';
import { useStore } from '../data/store';
import { Btn, Chip, H, P, Panel, won } from '../ui/kit';
import { C, R } from '../ui/theme';

/** A day longer than this (active minutes) gets a warning. */
const LONG_DAY = 13 * 60;

/**
 * Plan my own trip: area → gateway → days → places per day → restaurants → stay.
 * The plan is built with the same generator as the recommended missions and plays the same way.
 */
export function Planner({ tripId, onBack, onSaved, onDeleted }: { tripId?: string; onBack: () => void; onSaved: (id: string) => void; onDeleted: () => void }) {
  const { profile, trips, saveTrip, deleteTrip } = useStore();
  const lang = profile?.lang ?? 'en';
  const ko = lang === 'ko';
  const Lx = (k: string, e: string) => (ko ? k : e);
  const party = profile?.party ?? 'solo';
  const [spec, setSpec] = useState<TripSpec>(() => trips.find((t) => t.id === tripId) ?? newTripSpec('seoul', party));
  const [day, setDay] = useState(1);
  const month = profile?.month ?? new Date().getMonth() + 1;
  const set = (patch: Partial<TripSpec>) => setSpec((s) => ({ ...s, ...patch }));

  const places = PLANNER_PLACES.filter((p) => p.area === spec.area);
  const meals = PLANNER_MEALS.filter((m) => m.area === spec.area);
  const chosen = (d: number) => spec.places.filter((p) => p.day === d);
  const nameOf = (id: string) => {
    const p = places.find((x) => x.id === id);
    return p ? `${KIND_ICON[p.kind]} ${ko ? p.ko : p.en}` : id;
  };

  const course = useMemo(() => buildTrip({ ...spec, month }), [spec, month]);
  const perDay = useMemo(
    () => Array.from({ length: spec.days }, (_, i) => (course ? courseEstimate(course.scenes.filter((s) => s.day === i + 1), party) : null)),
    [course, spec.days, party],
  );
  const total = course ? courseEstimate(course.scenes, party) : null;

  const pickArea = (area: Area) => setSpec((s) => ({ ...s, area, hub: AREA_HUBS[area][0], places: [], meals: [] }));
  const setDays = (n: number) => {
    const d = Math.max(1, Math.min(MAX_DAYS, n));
    setSpec((s) => ({ ...s, days: d, places: s.places.filter((p) => p.day <= d) }));
    if (day > d) setDay(d);
  };
  const addPlace = (id: string) => setSpec((s) => ({ ...s, places: [...s.places.filter((p) => p.id !== id), { id, day }] }));
  const removePlace = (id: string) => setSpec((s) => ({ ...s, places: s.places.filter((p) => p.id !== id) }));
  const move = (id: string, dir: -1 | 1) =>
    setSpec((s) => {
      const list = [...s.places];
      const i = list.findIndex((p) => p.id === id);
      // swap with the neighbour of the same day
      let j = i + dir;
      while (j >= 0 && j < list.length && list[j].day !== list[i].day) j += dir;
      if (j < 0 || j >= list.length) return s;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...s, places: list };
    });
  const toggleMeal = (id: string) =>
    setSpec((s) => ({ ...s, meals: s.meals.includes(id) ? s.meals.filter((m) => m !== id) : s.meals.length >= 3 ? s.meals : [...s.meals, id] }));

  const save = () => {
    const t = { ...spec, month };
    saveTrip(t);
    onSaved(t.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: C.navy }}>
        <Pressable onPress={onBack} accessibilityRole="button" style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 18 }}>←</Text>
        </Pressable>
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 18, flex: 1 }}>🧭 {Lx('나만의 여행 만들기', 'Plan my own trip')}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 140 }}>
        <P dim style={{ fontSize: 13 }}>
          {Lx(
            '지역과 장소를 고르면 추천 코스와 똑같이 이동·식사·숙박 시간과 비용을 계산해 시뮬레이션해요.',
            'Pick an area and places – your trip is simulated like the recommended missions, with travel, meal and stay times and costs.',
          )}
        </P>

        <Panel>
          <H size={16}>1. {Lx('지역', 'Area')}</H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {AREAS.map((a) => (
              <Chip key={a.id} testID={`pl-area-${a.id}`} label={`${a.icon} ${tr(a.name, lang)}`} active={spec.area === a.id} onPress={() => pickArea(a.id)} color={C.navy} />
            ))}
          </View>
          <H size={16} style={{ marginTop: 14 }}>
            2. {Lx('도착하는 공항·항구', 'Arrival airport / port')}
          </H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {AREA_HUBS[spec.area].map((h) => {
              const info = hubInfo(h);
              return <Chip key={h} testID={`pl-hub-${h}`} label={`${info.kind === 'airport' ? '✈' : '⚓'} ${ko ? info.ko : info.en}`} active={spec.hub === h} onPress={() => set({ hub: h })} color={C.blue} />;
            })}
          </View>
          <H size={16} style={{ marginTop: 14 }}>
            3. {Lx('여행 기간', 'Trip length')}
          </H>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <Btn testID="pl-days-minus" small kind="ghost" label="−" disabled={spec.days <= 1} onPress={() => setDays(spec.days - 1)} style={{ width: 52 }} />
            <Text testID="pl-days" style={{ fontWeight: '900', fontSize: 18, color: C.ink }}>
              {ko ? `${spec.days - 1}박 ${spec.days}일` : `${spec.days - 1} night${spec.days === 2 ? '' : 's'} / ${spec.days} day${spec.days > 1 ? 's' : ''}`}
            </Text>
            <Btn testID="pl-days-plus" small kind="ghost" label="+" disabled={spec.days >= MAX_DAYS} onPress={() => setDays(spec.days + 1)} style={{ width: 52 }} />
          </View>
          <P dim style={{ fontSize: 12, marginTop: 6 }}>
            📅 {Lx('여행하는 달', 'Travel month')}: {MONTH_NAMES[month - 1].icon} {ko ? MONTH_NAMES[month - 1].ko : MONTH_NAMES[month - 1].en} · {Lx('‘내 정보’에서 바꿀 수 있어요', 'change it in the ‘Me’ tab')}
          </P>
        </Panel>

        <Panel>
          <H size={16}>4. {Lx('날짜별 장소', 'Places per day')}</H>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {Array.from({ length: spec.days }, (_, i) => (
              <Chip key={i} testID={`pl-day-${i + 1}`} label={`${ko ? `${i + 1}일차` : `Day ${i + 1}`} (${chosen(i + 1).length})`} active={day === i + 1} onPress={() => setDay(i + 1)} color={C.red} />
            ))}
          </View>
          <View style={{ gap: 6, marginTop: 10 }}>
            {chosen(day).length === 0 && <P dim>{Lx('아래 목록에서 이 날 갈 곳을 추가하세요.', 'Add places for this day from the list below.')}</P>}
            {chosen(day).map((p, i) => (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF4D6', borderRadius: R.m, padding: 8 }}>
                <Text style={{ fontWeight: '900', color: C.red, width: 20 }}>{i + 1}</Text>
                <Text style={{ flex: 1, fontWeight: '800', color: C.ink }}>{nameOf(p.id)}</Text>
                <Small label="↑" onPress={() => move(p.id, -1)} />
                <Small label="↓" onPress={() => move(p.id, 1)} />
                <Small label="✕" testID={`pl-remove-${p.id}`} onPress={() => removePlace(p.id)} />
              </View>
            ))}
          </View>
          {perDay[day - 1] && chosen(day).length > 0 && (
            <Text style={{ marginTop: 8, fontWeight: '800', color: (perDay[day - 1]?.active ?? 0) > LONG_DAY ? C.red : C.inkSoft }}>
              ⏱ {Lx('이 날 예상 활동', 'This day')}: {dur(perDay[day - 1]!.active, lang)}
              {(perDay[day - 1]?.active ?? 0) > LONG_DAY ? Lx(' – 너무 빡빡해요! 장소를 다른 날로 옮겨 보세요.', ' – too packed! Move a place to another day.') : ''}
            </Text>
          )}
          <Text style={{ marginTop: 12, fontWeight: '900', color: C.ink }}>{ko ? `${tr(AREAS.find((a) => a.id === spec.area)?.name, lang)}의 장소 (눌러서 ${day}일차에 추가)` : `Places (tap to add to day ${day})`}</Text>
          <View style={{ gap: 6, marginTop: 6 }}>
            {places.map((p) => {
              const at = spec.places.find((x) => x.id === p.id);
              return (
                <Pressable
                  key={p.id}
                  testID={`pl-place-${p.id}`}
                  onPress={() => (at ? removePlace(p.id) : addPlace(p.id))}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: at ? '#E8F5E9' : '#FFF', borderRadius: R.m, padding: 9, borderWidth: 1, borderColor: C.line }}
                >
                  <Text style={{ fontSize: 20 }}>{KIND_ICON[p.kind]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: C.ink }}>{ko ? p.ko : p.en}</Text>
                    <Text style={{ fontSize: 12, color: C.inkSoft }}>
                      {Lx('관람', 'Visit')} {dur(p.min, lang)}
                      {p.stop.ticket ? ` · 🎫 ${won(p.stop.ticket.adult)}` : ''}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: '900', color: at ? C.green : C.blue }}>{at ? (ko ? `✓ ${at.day}일차` : `✓ Day ${at.day}`) : ko ? `+ ${day}일차` : `+ Day ${day}`}</Text>
                </Pressable>
              );
            })}
          </View>
        </Panel>

        <Panel>
          <H size={16}>5. {Lx('식당 (최대 3곳)', 'Restaurants (up to 3)')}</H>
          <View style={{ gap: 6, marginTop: 8 }}>
            {meals.map((m) => {
              const on = spec.meals.includes(m.id);
              return (
                <Pressable key={m.id} testID={`pl-meal-${m.id}`} onPress={() => toggleMeal(m.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: on ? '#E8F5E9' : '#FFF', borderRadius: R.m, padding: 9, borderWidth: 1, borderColor: C.line }}>
                  <Text style={{ fontSize: 20 }}>🍽️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: C.ink }}>{ko ? m.ko : m.en}</Text>
                    <Text style={{ fontSize: 12, color: C.inkSoft }}>{m.dishes}</Text>
                  </View>
                  <Text style={{ fontWeight: '900', color: on ? C.green : C.blue }}>{on ? '✓' : '+'}</Text>
                </Pressable>
              );
            })}
          </View>
        </Panel>

        {spec.days > 1 && (
          <Panel>
            <H size={16}>6. {Lx('숙소', 'Where to stay')}</H>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {STAY_KINDS.map((k) => (
                <Chip key={k.id} testID={`pl-stay-${k.id}`} label={`${k.icon} ${ko ? k.ko : k.en}`} active={spec.stay === k.id} onPress={() => set({ stay: k.id })} color={C.green} />
              ))}
            </View>
          </Panel>
        )}

        {total && (
          <Panel style={{ backgroundColor: '#EEF4FF' }}>
            <H size={16}>🧮 {Lx('예상 일정', 'Estimate')}</H>
            {perDay.map((e, i) =>
              e ? (
                <Text key={i} style={{ marginTop: 4, color: e.active > LONG_DAY ? C.red : C.ink, fontWeight: '700' }}>
                  {ko ? `${i + 1}일차` : `Day ${i + 1}`}: ⏱ {dur(e.active, lang)} · 💰 {won(e.cost)}
                </Text>
              ) : null,
            )}
            <Text testID="pl-total" style={{ marginTop: 6, fontWeight: '900', color: C.ink }}>
              {Lx('합계', 'Total')}: ⏱ {dur(total.active, lang)} · 💰 {won(total.cost)} ({Lx('일행 전체', 'whole party')})
            </Text>
          </Panel>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: '#FFFFFFF2', borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', gap: 8 }}>
        {tripId && (
          <Btn
            testID="pl-delete"
            kind="ghost"
            label={Lx('🗑 삭제', '🗑 Delete')}
            style={{ flex: 1 }}
            onPress={() => {
              deleteTrip(tripId);
              onDeleted();
            }}
          />
        )}
        <Btn testID="pl-save" label={spec.places.length ? Lx('저장하고 시뮬레이션 보기', 'Save & see the simulation') : Lx('장소를 1곳 이상 고르세요', 'Pick at least one place')} disabled={!spec.places.length} style={{ flex: 2 }} onPress={save} />
      </View>
    </View>
  );
}

function Small({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  return (
    <Pressable testID={testID} onPress={onPress} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line }}>
      <Text style={{ fontWeight: '900', color: C.ink }}>{label}</Text>
    </Pressable>
  );
}
