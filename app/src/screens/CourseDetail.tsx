import { Alert, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import { PARTY_TYPES, TOPICS, courseEstimate, courseTopics, dur, spotsForCourse, tr, type Course } from '@kotoventure/shared';
import { SpotCard } from '../ui/SpotCard';
import { Background } from '../art/backgrounds';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Btn, H, P, Panel, Stars, TopicChip, won } from '../ui/kit';
import { C, R } from '../ui/theme';
import { RouteMap } from '../ui/RouteMap';

export function CourseDetail({ id, onBack, onPlay, onEdit, onResult }: { id: string; onBack: () => void; onPlay: (restart: boolean) => void; onEdit?: () => void; onResult?: () => void }) {
  const { content, profile, progress, isUnlocked, productFor, purchase, entryRoutes, setEntryRoute } = useStore();
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
            {c.id.startsWith('my-') && onEdit && (
              <Btn testID="trip-edit" small kind="ghost" label={lang === 'ko' ? '✏️ 일정 수정·삭제' : '✏️ Edit or delete this trip'} onPress={onEdit} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
              <Info k={L.startsAt} v={`${c.entry.kind === 'airport' ? '✈' : '⚓'} ${tr(c.entry.name, lang)}`} />
              <Info k={L.endsAt} v={`${c.exit.kind === 'airport' ? '✈' : '⚓'} ${tr(c.exit.name, lang)}`} />
              {(() => {
                const e = courseEstimate(c.scenes, profile?.party ?? 'solo');
                return (
                  <>
                    <Info k={lang === 'ko' ? '예상 활동 시간' : 'Est. active time'} v={`⏱ ${dur(e.active, lang)}`} />
                    <Info k={lang === 'ko' ? '예상 비용 (일행)' : 'Est. cost (party)'} v={`💰 ${won(e.cost)}`} />
                  </>
                );
              })()}
            </View>
            {(p?.last || p?.completedAt) && onResult ? (
              <Btn testID="course-result" small kind="ghost" label={lang === 'ko' ? '📊 지난 결과 다시 보기' : '📊 See my last result'} onPress={onResult} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
            ) : null}
          </Panel>

          {c.routes?.length ? <EntryRoutes c={c} lang={lang} picked={entryRoutes[c.id] ?? c.routes[0].id} inProgress={!!inProgress} onPick={(r) => setEntryRoute(c.id, r)} /> : null}

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

          {(() => {
            const picks = spotsForCourse(content.spots, c).slice(0, 3);
            return picks.length ? (
              <Panel style={{ marginTop: 14, gap: 8 }}>
                <H size={17}>🐦 {lang === 'ko' ? '카치가 추천하는 숨은 곳' : "Kachi's hidden picks"}</H>
                {picks.map((s) => (
                  <SpotCard key={s.id} spot={s} lang={lang} compact course={c} />
                ))}
              </Panel>
            ) : null;
          })()}

          <Panel style={{ marginTop: 14 }}>
            <H size={17}>🗺️ {L.route}</H>
            <RouteMap course={c} lang={lang} />
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
                          <Text style={{ fontWeight: '800', color: C.ink }}>
                            {tr(s.title, lang)}
                            {s.requires?.length ? <Text style={{ color: C.orange, fontSize: 12 }}> · {lang === 'ko' ? '일정에 넣으면' : 'if you plan it'}</Text> : null}
                          </Text>
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

/** How to get there: fly straight to the regional airport, or land in Incheon and go on by train, bus or domestic flight. */
function EntryRoutes({ c, lang, picked, inProgress, onPick }: { c: Course; lang: string; picked: string; inProgress: boolean; onPick: (id: string) => void }) {
  const ko = lang === 'ko';
  const routes = c.routes ?? [];
  const pick = (id: string) => {
    if (id === picked) return;
    if (!inProgress) return onPick(id);
    const msg = ko ? '진행 중인 미션은 입국 방법이 바뀌면 처음부터 다시 시작해요. 계속할까요?' : 'Changing how you arrive restarts the mission in progress. Continue?';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(msg)) onPick(id);
      return;
    }
    Alert.alert(ko ? '입국 방법 변경' : 'Change arrival', msg, [
      { text: ko ? '아니오' : 'No', style: 'cancel' },
      { text: ko ? '예' : 'Yes', onPress: () => onPick(id) },
    ]);
  };
  return (
    <Panel style={{ marginTop: 14, gap: 8 }}>
      <H size={17}>🛬 {ko ? '어떻게 들어갈까요?' : 'How will you get there?'}</H>
      <P dim style={{ fontSize: 12 }}>
        {routes.some((r) => r.id === 'direct')
          ? ko
            ? '지방공항 직항은 빠르지만 노선이 적어요. 대부분의 국제선은 인천에 도착해요. 고른 방법에 따라 첫날·마지막 날 이동 시간과 교통비가 바뀌어요.'
            : 'Direct flights to regional airports are quick but rare – most international flights land in Incheon. Your choice changes the travel time and fares on the first and last day.'
          : ko
            ? '이 지역 공항은 정기 국제선이 없어 인천으로 들어와 이동해요. 고른 방법에 따라 첫날·마지막 날 이동 시간과 교통비가 바뀌어요.'
            : "This region's airport has no regular international flights, so you land in Incheon and travel on. Your choice changes the travel time and fares on the first and last day."}
      </P>
      {routes.map((r) => {
        const on = r.id === picked;
        return (
          <Pressable
            key={r.id}
            testID={`route-${r.id}`}
            onPress={() => pick(r.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={{ borderWidth: 2, borderColor: on ? C.blue : C.line, backgroundColor: on ? '#EEF4FF' : '#FFF', borderRadius: R.m, padding: 10, gap: 3 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16 }}>{on ? '◉' : '○'}</Text>
              <Text style={{ flex: 1, fontWeight: '900', color: C.ink }}>
                {r.icon} {tr(r.label, lang)}
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '800', color: C.blue }}>
              ⏱ {dur(r.min, lang)} · 💰 {won(r.cost)} {ko ? '(1인)' : '(per person)'}
            </Text>
            <Text style={{ fontSize: 12, color: C.inkSoft }}>{tr(r.note, lang)}</Text>
          </Pressable>
        );
      })}
    </Panel>
  );
}
