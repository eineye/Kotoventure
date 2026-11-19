import { useEffect, useState } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { TOPICS, grade, score, tr } from '@kotoventure/shared';
import { PartyArt, avatarById } from '../art/Characters';
import { Prop } from '../art/props';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Btn, H, P, Panel, TopicChip, won } from '../ui/kit';
import { C, R } from '../ui/theme';

/** Shown when a course is finished: score, grade, what was learned per topic, phrases, checklist. */
export function Result({ id, onHome, onReplay }: { id: string; onHome: () => void; onReplay: () => void }) {
  const { content, profile, progress } = useStore();
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
        <View style={{ marginTop: 10, gap: 8 }}>
          {cards.map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FAFAF7', borderRadius: R.s, padding: 6 }}>
              <Prop id={c.prop} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: C.ink }}>{tr(c.title, lang)}</Text>
                <Text numberOfLines={2} style={{ fontSize: 12, color: C.inkSoft }}>
                  {tr(c.body, lang)}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
