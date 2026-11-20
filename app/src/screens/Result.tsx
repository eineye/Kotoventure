import { useEffect, useState } from 'react';
import { Animated, Easing, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { TOPICS, courseTopics, grade, readiness, score, tr, type ChoiceStep, type SimStep } from '@kotoventure/shared';
import { PartyArt, avatarById } from '../art/Characters';
import { Prop } from '../art/props';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Btn, CardView, H, P, Panel, TopicChip, won } from '../ui/kit';
import { CardPopup } from '../ui/CardPopup';
import { C, R } from '../ui/theme';

/** Shown when a course is finished: score, grade, what was learned per topic, phrases, checklist. */
export function Result({ id, onHome, onReplay }: { id: string; onHome: () => void; onReplay: () => void }) {
  const { content, profile, progress } = useStore();
  const [openMiss, setOpenMiss] = useState<string | null>(null);
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

  const pts = score(p.stats, course);
  const g = grade(pts);
  const acc = p.stats.answered ? Math.round((p.stats.correct / p.stats.answered) * 100) : 0;
  const cards = content.cards.filter((c) => p.cards.includes(c.id));
  const phrases = p.phrases.map((s) => s.split('|'));
  const ko = lang === 'ko';
  const ready = readiness(p.stats);
  const covered = courseTopics(course, content.cards);
  const readyLabel =
    ready >= 85
      ? { e: '🧳', t: ko ? '한국 여행 준비 완료!' : 'Ready for Korea!', c: C.green }
      : ready >= 65
        ? { e: '🙂', t: ko ? '거의 다 준비됐어요' : 'Almost ready', c: C.blue }
        : { e: '🌱', t: ko ? '좋은 출발! 아래를 복습해 보세요' : 'Great start – review the tips below', c: C.orange };
  // review list: missed choices & low-scoring simulations of this run
  const misses = (p.stats.missed ?? [])
    .map((key) => {
      const [sid, si, oi] = key.split(':');
      const sc = course.scenes.find((x) => x.id === sid);
      const st = sc?.steps[Number(si)];
      if (!st) return null;
      if (st.type === 'choice') {
        const cs = st as ChoiceStep;
        return { key, topic: cs.topic, q: tr(cs.prompt, lang), mine: tr(cs.options[Number(oi)]?.text, lang), right: cs.options.filter((o) => o.correct).map((o) => tr(o.text, lang)), why: tr(cs.options.find((o) => o.correct)?.feedback, lang), cardId: cs.cardId };
      }
      if (st.type === 'sim') {
        const ss = st as SimStep;
        return { key, topic: ss.topic, q: `🎮 ${tr(ss.title, lang)}`, mine: ko ? '시뮬레이션 점수가 낮았어요' : 'Low simulation score', right: [ko ? '다시 하기에서 한 번 더 연습해 보세요' : 'Practise it again with Replay'], why: tr(ss.intro, lang), cardId: ss.cardId };
      }
      return null;
    })
    .filter(Boolean) as { key: string; topic: string; q: string; mine: string; right: string[]; why: string; cardId?: string }[];
  const nextCourse = [...content.courses]
    .filter((c) => c.isPublished && c.id !== course.id && !progress[c.id]?.completedAt)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color: C.red }}>🏁 {L.missionComplete}</Text>
        <H size={24} style={{ textAlign: 'center' }}>
          {tr(course.title, lang)}
        </H>
        <P dim>
          {course.entry.kind === 'airport' ? '✈' : '⚓'} {course.entry.code} → ✈ {course.exit.code}
        </P>
        <Animated.View
          style={{
            marginTop: 12,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: g.letter === 'S' ? C.yellow : g.letter === 'A' ? C.green : g.letter === 'B' ? C.blue : C.orange,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pop }, { rotate: pop.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] }) }],
          }}
        >
          <Text style={{ fontSize: 60, fontWeight: '900', color: '#FFF' }}>{g.letter}</Text>
        </Animated.View>
        <H size={20} style={{ marginTop: 8 }}>
          {tr(g.label, lang)}
        </H>
        <Text style={{ fontWeight: '900', color: C.inkSoft }}>
          {L.score} {pts}
          {p.bestScore && p.bestScore > pts ? ` · ${L.best} ${p.bestScore}` : ''}
        </Text>
        <PartyArt party={profile?.party ?? 'solo'} lead={avatarById(profile?.avatar)} size={170} />
      </View>

      {/* Korea travel readiness */}
      <Panel style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 34 }}>{readyLabel.e}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '900', color: C.inkSoft, fontSize: 12 }}>{ko ? '한국 여행 준비도' : 'Korea travel readiness'}</Text>
            <H size={20} style={{ color: readyLabel.c }}>
              {ready}% · {readyLabel.t}
            </H>
          </View>
        </View>
        {TOPICS.filter((tp) => covered.has(tp.id)).map((tp) => {
          const t0 = p.stats.topics?.[tp.id];
          const pct = t0 && t0.n ? Math.round((t0.c / t0.n) * 100) : null;
          const verdict = pct === null ? (ko ? '카드로 학습' : 'learned from cards') : pct >= 80 ? (ko ? '잘 알고 있어요 ✅' : 'You know this ✅') : pct >= 50 ? (ko ? '괜찮아요 🙂' : 'Good 🙂') : ko ? '한 번 더 보세요 📖' : 'Review this 📖';
          return (
            <View key={tp.id} testID={`ready-${tp.id}`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', color: C.ink }}>
                  {tp.icon} {tr(tp.name, lang)}
                </Text>
                <Text style={{ fontWeight: '800', color: pct !== null && pct < 50 ? C.orange : C.inkSoft, fontSize: 12 }}>{verdict}</Text>
              </View>
              <View style={{ height: 8, backgroundColor: C.line, borderRadius: 4, marginTop: 3, overflow: 'hidden' }}>
                <View style={{ height: 8, width: `${pct ?? 100}%`, backgroundColor: pct === null ? '#D4D4D8' : tp.color }} />
              </View>
            </View>
          );
        })}
      </Panel>

      {misses.length > 0 && (
        <Panel style={{ gap: 8 }}>
          <H size={17}>🔁 {ko ? '복습하기' : 'Review what you missed'} ({misses.length})</H>
          <P dim style={{ fontSize: 13 }}>
            {ko ? '실제 여행에서 헷갈리기 쉬운 상황이에요. 눌러서 정답과 설명을 확인하세요.' : 'These are the situations that trip up many visitors. Tap to see the right move.'}
          </P>
          {misses.map((m) => {
            const open = openMiss === m.key;
            const card = m.cardId ? content.cards.find((c) => c.id === m.cardId) : undefined;
            return (
              <Pressable key={m.key} testID={`miss-${m.key}`} onPress={() => setOpenMiss(open ? null : m.key)} style={{ backgroundColor: '#FAFAF7', borderRadius: R.m, padding: 10, gap: 4 }}>
                <Text style={{ fontWeight: '800', color: C.ink }}>
                  {open ? '▾' : '▸'} {m.q}
                </Text>
                {open && (
                  <>
                    <Text style={{ color: C.inkSoft }}>✗ {m.mine}</Text>
                    {m.right.map((r) => (
                      <Text key={r} style={{ color: C.green, fontWeight: '800' }}>
                        ✓ {r}
                      </Text>
                    ))}
                    {!!m.why && <P style={{ fontSize: 14 }}>💡 {m.why}</P>}
                    {card && <CardView card={card} lang={lang} compact />}
                  </>
                )}
              </Pressable>
            );
          })}
        </Panel>
      )}

      <Panel style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Stat k={L.accuracy} v={`${acc}%`} />
        <Stat k={L.energy} v={`${p.stats.energy}`} />
        <Stat k={L.manner} v={`${p.stats.manner}`} />
        <Stat k={L.wallet} v={won(p.stats.money)} color={p.stats.money < 0 ? C.red : C.green} />
      </Panel>

      {(p.stats.sims ?? 0) > 0 && (
        <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 30 }}>🎮</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '900', color: C.ink }}>{lang === 'ko' ? '실전 시뮬레이션' : 'Hands-on simulations'}</Text>
            <Text style={{ color: C.inkSoft, fontWeight: '700' }}>
              {p.stats.sims} × · {lang === 'ko' ? '평균' : 'avg'} {Math.round((p.stats.simPoints ?? 0) / (p.stats.sims ?? 1))} / 100
            </Text>
          </View>
        </Panel>
      )}

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
