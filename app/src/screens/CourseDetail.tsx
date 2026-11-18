import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { PARTY_TYPES, TOPICS, courseTopics, tr } from '@kotoventure/shared';
import { Background } from '../art/backgrounds';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Btn, H, P, Panel, Stars, TopicChip, won } from '../ui/kit';
import { C, R } from '../ui/theme';

export function CourseDetail({ id, onBack, onPlay }: { id: string; onBack: () => void; onPlay: (restart: boolean) => void }) {
  const { content, profile, progress, isUnlocked, productFor, purchase } = useStore();
  const { width } = useWindowDimensions();
  const lang = profile?.lang ?? 'en';
  const L = t(lang);
  const c = content.courses.find((x) => x.id === id);
  if (!c) return null;
  const party = profile?.party ?? 'solo';
  const topics = courseTopics(c, content.cards);
  const p = progress[c.id];
  const inProgress = p && !p.completedAt && (p.sceneIndex > 0 || p.stepIndex > 0);
  const unlocked = isUnlocked(c);
  const product = productFor(c);
  const days = Array.from(new Set(c.scenes.map((s) => s.day)));
  const tip = c.partyTips[party];

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ height: 210 }}>
          <Background id={c.coverBg} width={width} height={210} />
          <Pressable onPress={onBack} style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFFFFE6', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }} accessibilityRole="button">
            <Text style={{ fontWeight: '900', color: C.ink }}>← {L.back}</Text>
          </Pressable>
        </View>
        <View style={{ padding: 16, marginTop: -30 }}>
          <Panel>
            <H size={24}>{tr(c.title, lang)}</H>
            <P dim>{tr(c.subtitle, lang)}</P>
            <P style={{ marginTop: 10 }}>{tr(c.description, lang)}</P>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
              <Info k={L.startsAt} v={`${c.entry.kind === 'airport' ? '✈' : '⚓'} ${tr(c.entry.name, lang)}`} />
              <Info k={L.endsAt} v={`${c.exit.kind === 'airport' ? '✈' : '⚓'} ${tr(c.exit.name, lang)}`} />
              <Info k={L.difficulty} v={'●'.repeat(c.difficulty) + '○'.repeat(3 - c.difficulty)} />
              <Info k={L.wallet} v={won(c.startBudget)} />
            </View>
          </Panel>

          <Panel style={{ marginTop: 14 }}>
            <H size={17}>👥 {L.partyTip}</H>
            {PARTY_TYPES.map((pt) => (
              <View key={pt.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, opacity: pt.id === party ? 1 : 0.55 }}>
                <Text style={{ fontWeight: pt.id === party ? '900' : '700', color: C.ink }}>
                  {pt.id === party ? '▶ ' : ''}
                  {tr(pt.name, lang)}
                </Text>
                <Stars n={c.partyFit[pt.id]} />
              </View>
            ))}
            {tip && <P style={{ marginTop: 10, backgroundColor: '#FFF4D6', padding: 10, borderRadius: R.s }}>💡 {tr(tip, lang)}</P>}
          </Panel>

          <Panel style={{ marginTop: 14 }}>
            <H size={17}>🧭 {L.topics}</H>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {TOPICS.map((tp) => (
                <TopicChip key={tp.id} topic={tp.id} lang={lang} active={topics.has(tp.id)} />
              ))}
            </View>
          </Panel>

          <Panel style={{ marginTop: 14 }}>
            <H size={17}>🗺️ {L.route}</H>
            {days.map((d) => (
              <View key={d} style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: '900', color: C.red }}>
                  {L.day} {d}
                </Text>
                {c.scenes
                  .map((s, i) => ({ s, i }))
                  .filter(({ s }) => s.day === d)
                  .map(({ s, i }) => {
                    const done = p && (p.completedAt || i < p.sceneIndex);
                    return (
                      <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: done ? C.green : C.line, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: done ? '#FFF' : C.inkSoft, fontWeight: '900', fontSize: 12 }}>{done ? '✓' : i + 1}</Text>
                        </View>
                        <View style={{ marginLeft: 10, flex: 1 }}>
                          <Text style={{ fontWeight: '800', color: C.ink }}>{tr(s.title, lang)}</Text>
                          <Text style={{ fontSize: 12, color: C.inkSoft }}>📍 {tr(s.location, lang)}</Text>
                        </View>
                      </View>
                    );
                  })}
              </View>
            ))}
          </Panel>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: C.paper + 'F2', flexDirection: 'row', gap: 10 }}>
        {!unlocked && product ? (
          <Btn
            style={{ flex: 1 }}
            label={`🔒 ${L.buy} · $${product.priceUsd.toFixed(2)}`}
            onPress={() => purchase(product)}
          />
        ) : !unlocked ? (
          <Btn style={{ flex: 1 }} label={`🔒 ${L.locked}`} disabled />
        ) : inProgress ? (
          <>
            <Btn style={{ flex: 1 }} kind="ghost" label={L.replay} onPress={() => onPlay(true)} />
            <Btn style={{ flex: 2 }} label={`▶ ${L.continue}`} onPress={() => onPlay(false)} />
          </>
        ) : (
          <Btn style={{ flex: 1 }} label={p?.completedAt ? `↻ ${L.replay}` : `✈ ${L.start}`} onPress={() => onPlay(true)} />
        )}
      </View>
    </View>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ minWidth: '44%', flexGrow: 1 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: C.inkSoft, textTransform: 'uppercase' }}>{k}</Text>
      <Text style={{ fontSize: 14, fontWeight: '800', color: C.ink }}>{v}</Text>
    </View>
  );
}
