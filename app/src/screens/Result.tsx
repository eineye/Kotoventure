import { useEffect, useState } from 'react';
import { Animated, Easing, Linking, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../ui/Text';
import { TIME_CAT, TOPICS, dur, tr, type TimeCat } from '@kotoventure/shared';
import { PartyArt, avatarById } from '../art/Characters';
import { Prop } from '../art/props';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Btn, H, P, Panel, TopicChip, won } from '../ui/kit';
import { CardPopup } from '../ui/CardPopup';
import { C, R } from '../ui/theme';

/** Shown when a course is finished: score, grade, what was learned per topic, phrases, checklist. */
export function Result({ id, onHome, onReplay }: { id: string; onHome: () => void; onReplay: () => void }) {
  const { content, profile, progress } = useStore();
  const [openCard, setOpenCard] = useState<number | null>(null);
  const lang = profile?.lang ?? 'en';
  const L = t(lang);
  const course = content.courses.find((c) => c.id === id)!;
  const p = progress[id];
  const pop = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(pop, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(2)), useNativeDriver: true }).start();
  }, [pop]);
  if (!p) return null;

  const cards = content.cards.filter((c) => p.cards.includes(c.id));
  const phrases = p.phrases.map((s) => s.split('|'));
  const ko = lang === 'ko';
  const party = profile?.party ?? 'solo';
  const trail = (p.stats.trail ?? []).slice().sort((a, b) => a.day - b.day || a.start - b.start);
  const days = Array.from(new Set(trail.map((x) => x.day))).sort((a, b) => a - b);
  const byCat: Record<TimeCat, number> = { move: 0, walk: 0, meal: 0, visit: 0, task: 0, stay: 0 };
  let nights = 0;
  for (const e of trail)
    for (const it of e.items) {
      if (it.cat === 'stay') nights++;
      else byCat[it.cat] += it.min;
    }
  const active = Object.entries(byCat).reduce((a, [k, v]) => (k === 'stay' ? a : a + v), 0);
  const spent = Math.max(0, course.startBudget - p.stats.money);
  const nextCourse = [...content.courses]
    .filter((c) => c.isPublished && c.id !== course.id && !progress[c.id]?.completedAt)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
      <Animated.View style={{ alignItems: 'center', marginTop: 10, opacity: pop }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color: C.red }}>🏁 {ko ? '여행 시뮬레이션 완료' : 'Trip simulation complete'}</Text>
        <H size={24} style={{ textAlign: 'center' }}>
          {tr(course.title, lang)}
        </H>
        <P dim>
          {course.entry.kind === 'airport' ? '✈' : '⚓'} {course.entry.code} → {course.exit.kind === 'airport' ? '✈' : '⚓'} {course.exit.code} · {course.nights}
          {ko ? '박' : 'N'} {course.days}
          {ko ? '일' : 'D'}
        </P>
        <PartyArt party={party} lead={avatarById(profile?.avatar)} size={150} />
      </Animated.View>

      {/* totals */}
      <Panel style={{ gap: 10 }}>
        <H size={17}>⏱ {ko ? '예상 소요 시간' : 'Estimated time'}</H>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <Stat k={ko ? '활동 시간 합계' : 'Active time'} v={dur(active, lang)} />
          <Stat k={ko ? '숙박' : 'Nights'} v={`${nights}`} />
          <Stat k={ko ? '예상 비용' : 'Est. cost'} v={won(spent)} color={C.green} />
        </View>
        {(Object.keys(TIME_CAT) as TimeCat[])
          .filter((k) => k !== 'stay' && byCat[k] > 0)
          .map((k) => (
            <View key={k} testID={`time-${k}`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', color: C.ink }}>
                  {TIME_CAT[k].icon} {tr(TIME_CAT[k].name, lang)}
                </Text>
                <Text style={{ fontWeight: '800', color: C.inkSoft, fontSize: 12 }}>
                  {dur(byCat[k], lang)} · {Math.round((byCat[k] / Math.max(1, active)) * 100)}%
                </Text>
              </View>
              <View style={{ height: 8, backgroundColor: C.line, borderRadius: 4, marginTop: 3, overflow: 'hidden' }}>
                <View style={{ height: 8, width: `${(byCat[k] / Math.max(1, active)) * 100}%`, backgroundColor: TIME_CAT[k].color }} />
              </View>
            </View>
          ))}
        <P dim style={{ fontSize: 12 }}>
          {ko ? '* 일행 기준 예상치예요. 실제 시간·요금은 날씨, 요일, 혼잡도에 따라 달라져요.' : '* Estimates for your party. Real times and prices vary with weather, weekday and crowds.'}
        </P>
      </Panel>

      {/* day-by-day timeline */}
      <Panel style={{ gap: 8 }}>
        <H size={17}>🗓️ {ko ? '일자별 일정' : 'Day by day'}</H>
        {days.map((d) => (
          <View key={d} testID={`day-${d}`} style={{ gap: 4 }}>
            <Text style={{ fontWeight: '900', color: C.red, marginTop: 4 }}>
              {ko ? `${d}일차` : `Day ${d}`}
            </Text>
            {trail
              .filter((x) => x.day === d)
              .map((x) => (
                <View key={x.sceneId} style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={{ width: 64, color: C.inkSoft, fontWeight: '800', fontSize: 12 }}>
                    ⏱ {dur(Math.max(0, x.end - x.start), lang)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: C.ink }}>{tr(x.title, lang)}</Text>
                    <Text style={{ color: C.inkSoft, fontSize: 11 }}>
                      {x.items.map((it) => `${TIME_CAT[it.cat].icon} ${it.cat === 'stay' ? (ko ? '숙박' : 'overnight') : dur(it.min, lang)}`).join('  ')}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        ))}
      </Panel>

      <Panel>
        <H size={17}>📚 {L.learned}</H>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {TOPICS.map((tp) => (
            <TopicChip key={tp.id} topic={tp.id} lang={lang} count={cards.filter((c) => c.topic === tp.id).length} />
          ))}
        </View>
        <P dim style={{ fontSize: 12, marginTop: 8 }}>
          👆 {lang === 'ko' ? '항목을 누르면 그림과 함께 자세히 볼 수 있어요.' : 'Tap an item to see it explained with a picture.'}
        </P>
        <View style={{ marginTop: 6, gap: 8 }}>
          {cards.map((c, i) => (
            <Pressable key={c.id} testID={`learned-${c.id}`} onPress={() => setOpenCard(i)} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: pressed ? '#F1EFE6' : '#FAFAF7', borderRadius: R.s, padding: 6 })}>
              <Prop id={c.prop} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: C.ink }}>{tr(c.title, lang)}</Text>
                <Text numberOfLines={2} style={{ fontSize: 12, color: C.inkSoft }}>
                  {tr(c.body, lang)}
                </Text>
              </View>
              <Text style={{ color: C.inkSoft, fontSize: 18, fontWeight: '900' }}>›</Text>
            </Pressable>
          ))}
        </View>
        <CardPopup cards={cards} index={openCard} lang={lang} onClose={() => setOpenCard(null)} onIndex={setOpenCard} />
      </Panel>

      {phrases.length > 0 && (
        <Panel>
          <H size={17}>🗣️ {L.phrases}</H>
          {phrases.map(([h, r, m]) => (
            <View key={h} style={{ marginTop: 8, borderLeftWidth: 4, borderLeftColor: C.blue, paddingLeft: 10 }}>
              <Text style={{ fontWeight: '900', fontSize: 17, color: C.blue }}>{h}</Text>
              <Text style={{ color: C.inkSoft, fontSize: 12 }}>
                {r} – {m}
              </Text>
            </View>
          ))}
        </Panel>
      )}

      <Panel>
        <H size={17}>✅ {L.checklist}</H>
        {[
          'Passport + entry approval (K-ETA/visa if needed) + travel insurance',
          'T-money / visitor card · some cash in ₩10,000 notes',
          'Naver Map or KakaoMap + Kakao T / Uber installed',
          '220 V plug adapter (Type C/F)',
          'Save 112 · 119 · 1330 in your phone',
          'Check the season: heat, monsoon, typhoon, fine dust, cold wave',
        ].map((x) => (
          <P key={x} style={{ marginTop: 6 }}>
            ☐ {x}
          </P>
        ))}
      </Panel>

      <Panel style={{ gap: 8 }}>
        <H size={17}>🇰🇷 {ko ? '실제 여행에서 도움 받기' : 'Help on your real trip'}</H>
        <Pressable onPress={() => Linking.openURL('tel:1330')}>
          <P>
            📞 <Text style={{ fontWeight: '900', color: C.red }}>1330</Text> –{' '}
            {ko ? '관광통역안내 (24시간, 영·중·일 등 통역)' : 'Korea Travel Hotline: 24 h, free interpretation in English, Chinese, Japanese & more'}
          </P>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://english.visitkorea.or.kr')}>
          <P>🌐 {ko ? '한국관광공사 공식 여행 정보' : 'Official travel info'}: <Text style={{ color: C.blue, fontWeight: '800' }}>english.visitkorea.or.kr</Text></P>
        </Pressable>
        <P dim style={{ fontSize: 12 }}>
          {ko ? '게임 속 요금·시간·규정은 예시예요. 출발 전 최신 정보를 꼭 확인하세요.' : 'Prices, hours and rules in the game are examples – always check the latest info before you go.'}
        </P>
        {nextCourse && (
          <View style={{ backgroundColor: '#EEF4FF', borderRadius: R.m, padding: 10, marginTop: 4 }}>
            <Text style={{ fontWeight: '900', color: C.blue }}>
              ✈ {ko ? '다음 여행지 추천' : 'Next destination'}: {tr(nextCourse.title, lang)}
            </Text>
            <Text style={{ color: C.inkSoft, fontSize: 12 }}>{tr(nextCourse.subtitle, lang)}</Text>
          </View>
        )}
      </Panel>

      <Btn label={L.replay} kind="ghost" onPress={onReplay} />
      <Btn label={L.backHome} onPress={onHome} />
    </ScrollView>
  );
}

function Stat({ k, v, color = C.ink }: { k: string; v: string; color?: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: '900', color }}>{v}</Text>
      <Text style={{ fontSize: 11, fontWeight: '800', color: C.inkSoft }}>{k}</Text>
    </View>
  );
}
