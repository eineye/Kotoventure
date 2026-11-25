import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import {
  applyEffects,
  scenePhotoQuery,
  TIME_CAT,
  dur,
  itemCost,
  sceneItems,
  type Course,
  type PartyType,
  type TrailEntry,
  applySim,
  roll,
  tally,
  nextScene,
  cashTotal,
  DEFAULT_CASH,
  initialStats,
  score,
  tr,
  visibleSteps,
  SEASON_DEFAULT_MONTH,
  type ChoiceStep,
  type CourseProgress,
  type Effects,
  type Phrase,
  type RunStats,
  type SimStep,
  type Step,
} from '@kotoventure/shared';
import { Background } from '../art/backgrounds';
import { PartyArt, SpeakerPortrait, avatarById, speakerLabel } from '../art/Characters';
import { Prop, hasProp } from '../art/props';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Btn, CardView, H, P, PhotoLink, PhraseBox, TopicChip, won } from '../ui/kit';
import { C, R, shadow } from '../ui/theme';
import { SIM_ICON, SimRunner } from '../sim/SimRunner';
import { PARTY_SIZE, type SimCtx, type SimResult } from '../sim/kit';
import { canSkip, skipOutcome } from '../sim/skip';

type Phase = 'intro' | 'step' | 'feedback' | 'card' | 'sim' | 'summary';
interface DayLogItem {
  prompt: string;
  chosen: string;
  correct: boolean;
  feedback: string;
}

const phraseKey = (p: Phrase) => `${p.hangul}|${p.roman}|${p.meaning}`;
const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m || 0);
};

/**
 * Enter a scene on the trip clock: a new day starts at the scene's start time (default 09:00),
 * the scene's estimated items are laid out from the current time, and scene-level costs are paid.
 * Recap scenes (already covered by the day planner) add no time.
 */
function enterScene(st: RunStats, course: Course, idx: number, party: PartyType, seed: string, month?: number): RunStats {
  const scene = course.scenes[idx];
  if (!scene || scene.est?.recap) return st;
  const sims = visibleSteps(scene, party, st.flags ?? [], seed, month).filter((x): x is SimStep => x.type === 'sim');
  const items = sceneItems(scene, sims, party);
  const clock = st.clock ?? { day: scene.day, min: toMin(scene.est?.start ?? '09:00') };
  let start = clock.min;
  if (scene.day > clock.day) start = toMin(scene.est?.start ?? '09:00');
  else if (scene.est?.start) start = Math.max(start, toMin(scene.est.start));
  const end = start + items.reduce((a, it) => a + (it.cat === 'stay' ? 0 : it.min), 0);
  // scene-level costs (simulations charge their own costs when played or skipped)
  const sceneCost = (scene.est?.items ?? []).reduce((a, it) => a + itemCost(it, party), 0);
  const entry: TrailEntry = { day: scene.day, sceneId: scene.id, title: scene.title, start, end, items: items.map((it) => ({ cat: it.cat, min: it.min, label: it.label, cost: itemCost(it, party) || undefined })) };
  return { ...st, money: st.money - sceneCost, clock: { day: scene.day, min: end }, trail: [...(st.trail ?? []).filter((x) => x.sceneId !== scene.id), entry] };
}

export function Play({ id, restart, onQuit, onFinish }: { id: string; restart: boolean; onQuit: () => void; onFinish: () => void }) {
  const { content, profile, progress, saveProgress } = useStore();
  const { width, height } = useWindowDimensions();
  const lang = profile?.lang ?? 'en';
  const L = t(lang);
  const course = content.courses.find((c) => c.id === id)!;
  const party = profile?.party ?? 'solo';
  // travel month decides the seasonal blocks; courses written for one season fall back to it
  const month = profile?.month ?? SEASON_DEFAULT_MONTH[course.season ?? 'spring'];
  const avatar = avatarById(profile?.avatar);
  const prev = progress[id];

  // resume or start fresh
  const resume = !restart && prev && !prev.completedAt && prev.courseVersion === course.version;
  const [sceneIdx, setSceneIdx] = useState(resume ? prev!.sceneIndex : 0);
  const [stepIdx, setStepIdx] = useState(resume ? prev!.stepIndex : 0);
  const [stats, setStats] = useState<RunStats>(() => (resume ? prev!.stats : enterScene(initialStats(course), course, 0, profile?.party ?? 'solo', String((prev?.plays ?? 0) + 1), month)));
  const [cards, setCards] = useState<string[]>(resume ? prev!.cards : prev?.cards ?? []);
  const [phrases, setPhrases] = useState<string[]>(resume ? prev!.phrases : prev?.phrases ?? []);
  const [phase, setPhase] = useState<Phase>(resume && prev!.stepIndex > 0 ? 'step' : 'intro');
  const [picked, setPicked] = useState<number | null>(null);
  const [delta, setDelta] = useState<Effects | null>(null);
  const [pendingCard, setPendingCard] = useState<string | null>(null);
  // fixed for the whole run (progress is saved mid-run, which would otherwise change prev/resume and re-roll chance steps)
  const [plays] = useState(() => (prev?.plays ?? 0) + (resume ? 0 : 1));
  const real = false; // the trip simulation has no hidden-answer mode
  const [dayLog, setDayLog] = useState<DayLogItem[]>([]);
  const [summary, setSummary] = useState<{ day: number; next: number; collapsed: boolean; resumeStep?: number } | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const flags = stats.flags ?? [];

  const scene = course.scenes[Math.min(sceneIdx, course.scenes.length - 1)];
  const steps = visibleSteps(scene, party, flags, String(plays), month);
  const step: Step | undefined = steps[stepIdx];

  // panel fade-in on every change
  const fade = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [sceneIdx, stepIdx, phase, fade]);

  const persist = (sIdx: number, stIdx: number, st: RunStats, cs: string[], ps: string[], done = false) => {
    const pts = score(st, course);
    const p: CourseProgress = {
      courseId: course.id,
      courseVersion: course.version,
      sceneIndex: sIdx,
      stepIndex: stIdx,
      stats: st,
      cards: cs,
      phrases: ps,
      plays,
      completedAt: done ? new Date().toISOString() : prev?.completedAt,
      bestScore: done ? Math.max(pts, prev?.bestScore ?? 0) : prev?.bestScore,
    };
    saveProgress(p);
  };

  const collect = (cardId?: string, phrase?: Phrase) => {
    let cs = cards;
    let ps = phrases;
    if (cardId && !cs.includes(cardId)) cs = [...cs, cardId];
    const card = cardId ? content.cards.find((c) => c.id === cardId) : undefined;
    for (const ph of [phrase, card?.phrase]) if (ph && !ps.includes(phraseKey(ph))) ps = [...ps, phraseKey(ph)];
    setCards(cs);
    setPhrases(ps);
    return { cs, ps };
  };

  const effects = (e?: Effects) => {
    // trip simulation: only money matters (no energy/manner game stats)
    const st = applyEffects(stats, e ? { money: e.money } : undefined);
    const d: Effects | null = e?.money ? { money: e.money } : null;
    setStats(st);
    return { st, d };
  };

  const goScene = (idx: number, st0: RunStats, cs: string[], ps: string[]) => {
    const st = enterScene(st0, course, idx, party, String(plays), month);
    setStats(st);
    setSceneIdx(idx);
    setStepIdx(0);
    setPhase('intro');
    persist(idx, 0, st, cs, ps);
  };

  const advance = (st = stats, cs = cards, ps = phrases, collapsed = exhausted) => {
    setPicked(null);
    setDelta(null);
    const fl = st.flags ?? [];
    // flags may have changed → recompute this scene's visible steps and continue after the current one
    const fresh = visibleSteps(scene, party, fl, String(plays), month);
    const pos = step ? fresh.indexOf(step) : -1;
    const nextStep = pos >= 0 ? pos + 1 : stepIdx + 1;
    if (nextStep < fresh.length) {
      if (collapsed) {
        setExhausted(false);
        setSummary({ day: scene.day, next: sceneIdx, collapsed, resumeStep: nextStep });
        setPhase('summary');
        persist(sceneIdx, nextStep, st, cs, ps);
        return;
      }
      setStepIdx(nextStep);
      setPhase('step');
      persist(sceneIdx, nextStep, st, cs, ps);
      return;
    }
    const nxt = nextScene(course, sceneIdx, fl);
    const nextDay = nxt < course.scenes.length ? course.scenes[nxt].day : Infinity;
    const dayReview = real && nextDay > scene.day && dayLog.length > 0;
    if (collapsed || dayReview) {
      setExhausted(false);
      setSummary({ day: scene.day, next: nxt, collapsed });
      setPhase('summary');
      persist(nxt, 0, st, cs, ps);
      return;
    }
    if (nxt < course.scenes.length) goScene(nxt, st, cs, ps);
    else {
      persist(course.scenes.length, 0, st, cs, ps, true);
      onFinish();
    }
  };

  /* step handlers */
  const onTapContinue = () => {
    if (!step) return advance();
    if (step.type === 'dialog') {
      const { cs, ps } = collect(undefined, step.phrase);
      return advance(stats, cs, ps);
    }
    if (step.type === 'card') {
      const { cs, ps } = collect(step.cardId);
      return advance(stats, cs, ps);
    }
    if (step.type === 'event') {
      const { st } = effects(step.effects);
      return advance(st);
    }
    advance();
  };

  const onPick = (i: number) => {
    if (!step || step.type !== 'choice' || picked !== null) return;
    const opt = step.options[i];
    setPicked(i);
    const { st, d } = effects(opt.effects);
    const nf = opt.setFlags?.length ? Array.from(new Set([...(st.flags ?? []), ...opt.setFlags])) : st.flags;
    const key = `${scene.id}:${scene.steps.indexOf(step)}:${i}`;
    setStats(tally({ ...st, flags: nf, answered: st.answered + 1, correct: st.correct + (opt.correct ? 1 : 0) }, step.topic, opt.correct ? 1 : 0, key));
    if (real) setDayLog((l) => [...l, { prompt: tr(step.prompt, lang), chosen: tr(opt.text, lang), correct: opt.correct, feedback: tr(opt.feedback, lang) }]);
    setDelta(d);
    setPhase('feedback');
  };

  const afterFeedback = () => {
    const s = step as ChoiceStep;
    if (s.cardId && !cards.includes(s.cardId)) {
      setPendingCard(s.cardId);
      setPhase('card');
    } else advance();
  };

  const afterCard = () => {
    const { cs, ps } = collect(pendingCard ?? undefined);
    setPendingCard(null);
    advance(stats, cs, ps);
  };

  const onSimDone = (r: SimResult) => {
    const sim = step as SimStep;
    const base = effects(r.effects).st;
    let st: RunStats = {
      ...tally(applySim(base, r.score), sim.topic, r.score / 100, `${scene.id}:${scene.steps.indexOf(sim)}:-1`),
      ...(r.cash ? { cash: r.cash } : {}),
      flags: r.flags?.length ? Array.from(new Set([...(base.flags ?? []), ...r.flags])) : base.flags,
    };
    if (r.endMin !== undefined) {
      // the planned day replaces the scene's estimate on the clock
      const start = r.startMin ?? st.clock?.min ?? 540;
      const trail = (st.trail ?? []).map((x) =>
        x.sceneId === scene.id ? { ...x, start, end: r.endMin!, items: [...x.items, { cat: 'visit' as const, min: r.endMin! - start, label: { en: 'Your planned day (places, travel, meals)', ko: '내가 짠 하루 일정 (장소·이동·식사)' }, cost: -(r.effects?.money ?? 0) || undefined }] } : x,
      );
      st = { ...st, clock: { day: scene.day, min: r.endMin }, trail };
    }
    setStats(st);
    const { cs, ps } = collect(sim.cardId);
    advance(st, cs, ps);
  };

  const simCtx: SimCtx = { lang, party, partySize: PARTY_SIZE[party], country: profile?.country ?? 'US', fxRates: content.config.fxRates, cash: stats.cash ?? { ...DEFAULT_CASH }, energy: stats.energy, flags };

  /** "I already know this": do the routine in the background (money/cash), no score recorded. */
  const onSimSkip = () => {
    const sim = step as SimStep;
    const r = skipOutcome(sim, simCtx);
    const base = effects(r.effects).st;
    const st = { ...base, ...(r.cash ? { cash: r.cash } : {}) };
    setStats(st);
    const { cs, ps } = collect(sim.cardId);
    advance(st, cs, ps);
  };

  if (phase === 'sim' && step?.type === 'sim') return <SimRunner step={step} ctx={simCtx} onDone={onSimDone} />;

  if (phase === 'summary' && summary) {
    const restOnly = summary.resumeStep !== undefined;
    const right = dayLog.filter((d) => d.correct).length;
    const restCard = content.cards.find((c) => c.id === 'me-conv');
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 18, gap: 12 }}>
        {!restOnly && (
          <Text style={{ fontSize: 13, fontWeight: '900', color: C.red }}>
            🌙 {lang === 'ko' ? `${summary.day}일차 정산` : `Day ${summary.day} review`}
          </Text>
        )}
        {summary.collapsed && (
          <View style={{ backgroundColor: '#FFF4D6', borderRadius: R.m, padding: 14 }}>
            <H size={18} style={{ color: C.ink }}>
              😮‍💨 {lang === 'ko' ? '잠깐 쉬어 가요' : 'Time for a break'}
            </H>
            <P style={{ marginTop: 4 }}>
              {lang === 'ko'
                ? '체력이 바닥났어요. 편의점에서 물과 간식을 사서 벤치에서 쉬었어요 (−₩10,000, 체력 +50). 여행은 계속됩니다! 한국에는 어디에나 편의점이 있어서 쉬어 가기 좋아요.'
                : 'You ran out of energy, so you grabbed water and a snack at a convenience store and rested on a bench (−₩10,000, energy +50). The trip goes on! Convenience stores are on every corner in Korea – perfect for a break.'}
            </P>
          </View>
        )}
        {summary.collapsed && restCard && <CardView card={restCard} lang={lang} compact />}
        {!restOnly && dayLog.length > 0 && (
          <View style={{ gap: 8 }}>
            <H size={18}>
              {lang === 'ko' ? '오늘의 선택 결과' : 'How your choices turned out'} · {right}/{dayLog.length}
            </H>
            {dayLog.map((d, i) => (
              <View key={i} style={{ backgroundColor: d.correct ? '#E8F8F0' : '#FDECEC', borderRadius: R.m, padding: 12 }}>
                <Text style={{ fontWeight: '800', color: C.inkSoft, fontSize: 12 }}>{d.prompt}</Text>
                <Text style={{ fontWeight: '900', color: d.correct ? C.green : C.red, marginTop: 4 }}>
                  {d.correct ? '✅' : '❌'} {d.chosen}
                </Text>
                <P style={{ marginTop: 4, fontSize: 14 }}>{d.feedback}</P>
              </View>
            ))}
          </View>
        )}
        <Btn
          testID="summary-next"
          label={restOnly || (summary.collapsed && !dayLog.length) ? (lang === 'ko' ? '다시 출발 ›' : 'Carry on ›') : lang === 'ko' ? '다음 날로 ›' : 'Next day ›'}
          onPress={() => {
            if (restOnly) {
              const rs = summary.resumeStep!;
              setSummary(null);
              setStepIdx(rs);
              setPhase('step');
              const { cs, ps } = collect('me-conv');
              persist(sceneIdx, rs, stats, cs, ps);
              return;
            }
            setDayLog([]);
            const nx = summary.next;
            const got = summary.collapsed ? collect('me-conv') : { cs: cards, ps: phrases };
            setSummary(null);
            if (nx < course.scenes.length) goScene(nx, stats, got.cs, got.ps);
            else {
              persist(course.scenes.length, 0, stats, cards, phrases, true);
              onFinish();
            }
          }}
        />
      </ScrollView>
    );
  }

  // picture is kept compact so the mission panel gets most of the screen
  const sceneH = Math.max(140, Math.min(height * 0.26, 220));
  const speaker = step?.type === 'dialog' ? step.speaker : null;
  const overlayProp = step?.type === 'event' ? step.prop : phase === 'card' ? undefined : undefined;
  const here = (stats.trail ?? []).find((x) => x.sceneId === scene.id);
  const todayMin = (stats.trail ?? []).filter((x) => x.day === scene.day).reduce((a, x) => a + x.items.reduce((b, it) => b + (it.cat === 'stay' ? 0 : it.min), 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      {/* HUD */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, backgroundColor: C.navy }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={onQuit} accessibilityRole="button" accessibilityLabel={L.quit} style={{ padding: 6 }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '900' }}>✕</Text>
          </Pressable>
          <Text style={{ color: '#FFF', fontWeight: '900' }}>
            {lang === 'ko' ? `${scene.day}일차` : `Day ${scene.day}`} · {Math.min(sceneIdx + 1, course.scenes.length)}/{course.scenes.length}
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: C.yellow, fontWeight: '900' }}>💰 {won(Math.max(0, course.startBudget - stats.money))}</Text>
            <Text style={{ color: '#CBD5E1', fontWeight: '800', fontSize: 10 }}>💵 {lang === 'ko' ? '현금' : 'cash'} {won(cashTotal(stats.cash ?? DEFAULT_CASH))}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 6 }}>
          {here && here.end > here.start ? (
            <Text testID="hud-clock" style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>
              ⏱ {dur(here.end - here.start, lang)}
            </Text>
          ) : null}
          <Text style={{ color: '#CBD5E1', fontWeight: '800', fontSize: 13 }}>
            {lang === 'ko' ? '오늘 활동' : 'Today'} {dur(todayMin, lang)}
          </Text>
        </View>
      </View>

      {/* Scene */}
      <View style={{ height: sceneH, overflow: 'hidden' }}>
        <Background id={scene.bg} width={width} height={sceneH} />
        <View style={{ position: 'absolute', left: 4, bottom: -4 }}>
          <PartyArt party={party} lead={avatar} align="left" size={Math.min(190, width * 0.48, sceneH * 1.1)} />
        </View>
        {speaker && (
          <View style={{ position: 'absolute', right: 12, bottom: 12, backgroundColor: '#FFFFFFE6', borderRadius: 999, padding: 4, ...shadow }}>
            <SpeakerPortrait speaker={speaker} avatar={avatar} size={Math.min(96, sceneH * 0.42)} />
          </View>
        )}
        {overlayProp && hasProp(overlayProp) && (
          <View style={{ position: 'absolute', right: 12, top: 12, backgroundColor: '#FFFFFFEE', borderRadius: R.m, padding: 4, ...shadow }}>
            <Prop id={overlayProp} size={Math.min(96, sceneH * 0.45)} />
          </View>
        )}
        <View style={{ position: 'absolute', left: 10, top: 10, backgroundColor: '#1B2140CC', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>📍 {tr(scene.location, lang)}</Text>
        </View>
      </View>

      {/* Panel */}
      <Animated.View style={{ flex: 1, backgroundColor: C.paper, borderTopLeftRadius: R.l, borderTopRightRadius: R.l, marginTop: -16, overflow: 'hidden', opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        {phase === 'intro' && (
          <ScrollView key={`intro-${sceneIdx}`} contentContainerStyle={{ flexGrow: 1 }}>
          <Pressable style={{ flexGrow: 1, padding: 20, paddingTop: 24, paddingBottom: 30 }} testID="continue" onPress={() => setPhase('step')} accessibilityRole="button">
            <Text style={{ color: C.red, fontWeight: '900', fontSize: 16 }}>
              {lang === 'ko' ? `${scene.day}일차` : `Day ${scene.day}`}
            </Text>
            <H size={26}>{tr(scene.title, lang)}</H>
            <P dim style={{ marginTop: 4 }}>📍 {tr(scene.location, lang)}</P>
            <PhotoLink q={scenePhotoQuery(scene)} lang={lang} testID="scene-photo" />
            <RouteDots total={course.scenes.length} at={sceneIdx} />
            {scene.est?.recap ? (
              <P dim style={{ marginTop: 12 }}>📸 {lang === 'ko' ? '오늘 짠 일정 중 한 장면이에요 (시간은 일정에 포함).' : 'A highlight of the day you planned (time already in your plan).'}</P>
            ) : here && here.items.length > 0 ? (
              <View testID="scene-schedule" style={{ marginTop: 12, backgroundColor: '#FFF', borderRadius: R.m, padding: 10, gap: 4, ...shadow }}>
                {(() => {
                  return here.items.map((it, k) => {
                    return (
                      <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ flex: 1, color: C.ink, fontSize: 13 }}>
                          {TIME_CAT[it.cat].icon} {tr(it.label, lang)}
                        </Text>
                        <Text style={{ color: TIME_CAT[it.cat].color, fontWeight: '900', fontSize: 12 }}>{it.cat === 'stay' ? (lang === 'ko' ? '1박' : '1 night') : `~${dur(it.min, lang)}`}</Text>
                        {it.cost ? <Text style={{ color: C.inkSoft, fontSize: 11, width: 64, textAlign: 'right' }}>{won(it.cost)}</Text> : <View style={{ width: 64 }} />}
                      </View>
                    );
                  });
                })()}
                <Text style={{ color: C.inkSoft, fontSize: 11, marginTop: 2 }}>{lang === 'ko' ? '* 예상 시간·비용 (일행 기준, 실제와 다를 수 있어요)' : '* Estimated time & cost for your party – real trips vary'}</Text>
              </View>
            ) : null}
            {sceneIdx === 0 && (
              <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 22 }}>{course.entry.kind === 'airport' ? '✈️' : '⛴️'}</Text>
                <P style={{ fontWeight: '800' }}>{tr(course.entry.name, lang)}</P>
              </View>
            )}
            <Text style={{ marginTop: 24, color: C.inkSoft, fontWeight: '800' }}>▸ {L.tapContinue}</Text>
          </Pressable>
          </ScrollView>
        )}

        {phase !== 'intro' && !step && (
          <View style={{ padding: 20 }}>
            <Btn testID="next" label={L.next} onPress={() => advance()} />
          </View>
        )}

        {phase !== 'intro' && step && (
          <ScrollView key={`step-${sceneIdx}-${stepIdx}-${phase}`} contentContainerStyle={{ padding: 18, paddingTop: 22, paddingBottom: 30, flexGrow: 1 }}>
            {step.type === 'narration' && (
              <Pressable testID="continue" onPress={onTapContinue} style={{ flexGrow: 1 }} accessibilityRole="button">
                <P style={{ fontSize: 17, lineHeight: 26 }}>{tr(step.text, lang)}</P>
                <Text style={{ marginTop: 18, color: C.inkSoft, fontWeight: '800' }}>▸ {L.tapContinue}</Text>
              </Pressable>
            )}

            {step.type === 'dialog' && (
              <Pressable testID="continue" onPress={onTapContinue} style={{ flexGrow: 1 }} accessibilityRole="button">
                <Text style={{ fontWeight: '900', color: C.blue, fontSize: 14 }}>{speakerLabel(step.speaker, profile?.nickname ?? 'You')}</Text>
                <View style={{ backgroundColor: '#FFF', borderRadius: R.m, padding: 14, marginTop: 6, ...shadow }}>
                  <P style={{ fontSize: 17, lineHeight: 25 }}>{tr(step.text, lang)}</P>
                </View>
                {step.phrase && (
                  <View>
                    <Text style={{ marginTop: 12, fontWeight: '900', color: C.inkSoft, fontSize: 12 }}>🗣️ {L.sayIt}</Text>
                    <PhraseBox phrase={step.phrase} />
                  </View>
                )}
                <Text style={{ marginTop: 18, color: C.inkSoft, fontWeight: '800' }}>▸ {L.tapContinue}</Text>
              </Pressable>
            )}

            {step.type === 'event' && (
              <Pressable testID="continue" onPress={onTapContinue} style={{ flexGrow: 1 }} accessibilityRole="button">
                <View style={{ backgroundColor: EVENT_COLOR[step.kind] + '18', borderLeftWidth: 5, borderLeftColor: EVENT_COLOR[step.kind], borderRadius: R.m, padding: 14 }}>
                  <H size={19} style={{ color: EVENT_COLOR[step.kind] }}>
                    {EVENT_ICON[step.kind]} {tr(step.title, lang)}
                  </H>
                  <P style={{ marginTop: 6, fontSize: 16 }}>{tr(step.text, lang)}</P>
                  <Deltas e={step.effects} />
                </View>
                <Text style={{ marginTop: 18, color: C.inkSoft, fontWeight: '800' }}>▸ {L.tapContinue}</Text>
              </Pressable>
            )}

            {step.type === 'card' && (
              <Pressable testID="continue" onPress={onTapContinue} style={{ flexGrow: 1 }} accessibilityRole="button">
                <Text style={{ fontWeight: '900', color: C.green, marginBottom: 8 }}>📖 {cards.includes(step.cardId) ? L.guidebook : L.newCard}</Text>
                {(() => {
                  const card = content.cards.find((c) => c.id === step.cardId);
                  return card ? <CardView card={card} lang={lang} /> : null;
                })()}
                <Text style={{ marginTop: 14, color: C.inkSoft, fontWeight: '800' }}>▸ {L.tapContinue}</Text>
              </Pressable>
            )}

            {step.type === 'sim' && (
              <View>
                <TopicChip topic={step.topic} lang={lang} />
                <View style={{ backgroundColor: '#FFF', borderRadius: R.l, padding: 16, marginTop: 10, borderLeftWidth: 6, borderLeftColor: C.yellow, ...shadow }}>
                  <Text style={{ fontWeight: '900', color: C.orange, fontSize: 12 }}>
                    🎮 {lang === 'ko' ? '따라 해 보기' : 'TRY IT YOURSELF'}
                    {(() => {
                      const it = here?.items.find((x) => tr(x.label, 'en') === tr(step.title, 'en'));
                      return it ? ` · ${lang === 'ko' ? '실제 약' : 'real life ~'} ${dur(it.min, lang)}${it.cost ? ` · ${won(it.cost)}` : ''}` : '';
                    })()}
                  </Text>
                  <H size={20} style={{ marginTop: 4 }}>
                    {SIM_ICON[step.sim]} {tr(step.title, lang)}
                  </H>
                  <P style={{ marginTop: 6 }}>{tr(step.intro, lang)}</P>
                </View>
                <Btn testID="sim-start" label={lang === 'ko' ? '시뮬레이션 시작' : 'Start simulation'} style={{ marginTop: 14 }} onPress={() => setPhase('sim')} />
                {canSkip(step) && (
                  <Btn
                    testID="sim-skip"
                    kind="ghost"
                    small
                    label={lang === 'ko' ? '⏭ 이미 잘 알아요 – 건너뛰기' : '⏭ I already know how – skip'}
                    style={{ marginTop: 8 }}
                    onPress={onSimSkip}
                  />
                )}
                {canSkip(step) && (
                  <Text style={{ color: C.inkSoft, fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                    {lang === 'ko' ? '건너뛰어도 시간·비용·현금은 그대로 반영돼요.' : 'Skipping still counts the time, cost and cash.'}
                  </Text>
                )}
              </View>
            )}

            {step.type === 'choice' && phase !== 'card' && (
              <ChoiceView step={step} lang={lang} picked={picked} onPick={onPick} delta={delta} onNext={afterFeedback} real={real} seed={`${plays}|${scene.id}|${stepIdx}`} />
            )}

            {phase === 'card' && pendingCard && (
              <View>
                <Text style={{ fontWeight: '900', color: C.green, marginBottom: 8, fontSize: 16 }}>🎉 {L.newCard}</Text>
                {(() => {
                  const card = content.cards.find((c) => c.id === pendingCard);
                  return card ? <CardView card={card} lang={lang} /> : null;
                })()}
                <Btn testID="next" label={L.next} style={{ marginTop: 14 }} onPress={afterCard} />
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const EVENT_COLOR = { weather: '#1FA2C7', health: '#D63A3A', money: '#1E9E6A', surprise: '#7A4FD6', law: '#4A5568' } as const;
const EVENT_ICON = { weather: '⛈️', health: '🤒', money: '💸', surprise: '🎉', law: '⚖️' } as const;

function RouteDots({ total, at }: { total: number; at: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', rowGap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: i === at ? 16 : 10, height: i === at ? 16 : 10, borderRadius: 8, backgroundColor: i < at ? C.green : i === at ? C.red : C.line }} />
          {i < total - 1 && <View style={{ width: 12, height: 3, backgroundColor: i < at ? C.green : C.line }} />}
        </View>
      ))}
    </View>
  );
}

function Deltas({ e }: { e?: Effects | null }) {
  if (!e) return null;
  const items: [string, string][] = [];
  if (e.money) items.push([`💰 ${e.money > 0 ? '+' : '−'}${won(Math.abs(e.money))}`, C.inkSoft]);
  if (!items.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
      {items.map(([label, color]) => (
        <View key={label} style={{ backgroundColor: color + '18', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color, fontWeight: '900' }}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function ChoiceView({
  step,
  lang,
  picked,
  onPick,
  delta,
  onNext,
  real,
  seed,
}: {
  step: ChoiceStep;
  lang: string;
  picked: number | null;
  onPick: (i: number) => void;
  delta: Effects | null;
  onNext: () => void;
  real?: boolean;
  seed: string;
}) {
  const L = t(lang as any);
  const visual = step.options.every((o) => o.prop && hasProp(o.prop)) && step.options.length <= 4;
  const chosen = picked !== null ? step.options[picked] : null;

  return (
    <View>
      <TopicChip topic={step.topic} lang={lang} />
      <H size={19} style={{ marginTop: 8 }}>
        {tr(step.prompt, lang)}
      </H>
      <View style={visual ? { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 } : { gap: 10, marginTop: 12 }}>
        {step.options
          .map((o, i) => ({ o, i, r: roll(`${seed}|${i}`) }))
          .sort((a, b) => a.r - b.r)
          .map(({ o, i }, di) => {
          const state = picked === null ? 'idle' : picked === i ? 'picked' : 'dim';
          const border = { idle: C.line, right: C.green, wrong: C.red, dim: C.line, picked: C.blue }[state];
          const bg = { idle: '#FFF', right: '#E8F8F0', wrong: '#FDECEC', dim: '#FAFAFA', picked: '#EEF4FF' }[state];
          return (
            <Pressable
              key={i}
              testID={`opt-${di}`}
              onPress={() => onPick(i)}
              disabled={picked !== null}
              accessibilityRole="button"
              style={({ pressed }) => [
                {
                  borderWidth: 2.5,
                  borderColor: border,
                  backgroundColor: bg,
                  borderRadius: R.m,
                  padding: 12,
                  opacity: state === 'dim' ? 0.6 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                visual ? { width: '47%', flexGrow: 1, alignItems: 'center' } : { flexDirection: 'row', alignItems: 'center', gap: 10 },
              ]}
            >
              {o.prop && hasProp(o.prop) && <Prop id={o.prop} size={visual ? 96 : 48} />}
              <Text style={{ flex: visual ? undefined : 1, fontSize: 15, fontWeight: '700', color: C.ink, textAlign: visual ? 'center' : 'left', marginTop: visual ? 6 : 0 }}>
                {tr(o.text, lang)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {chosen && real && (
        <View style={{ marginTop: 14, backgroundColor: '#EEF4FF', borderRadius: R.m, padding: 14 }}>
          <H size={16} style={{ color: C.blue }}>
            📝 {lang === 'ko' ? '선택 완료 – 결과는 오늘 밤 정산에서!' : 'Choice made – you’ll see how it turned out tonight.'}
          </H>
          <Btn testID="next" label={L.next} style={{ marginTop: 12 }} onPress={onNext} />
        </View>
      )}
      {chosen && !real && (
        <View testID="choice-outcome" style={{ marginTop: 14, backgroundColor: '#EEF4FF', borderRadius: R.m, padding: 14 }}>
          <H size={16} style={{ color: C.blue }}>📍 {lang === 'ko' ? '실제로는…' : 'What happens'}</H>
          <P style={{ marginTop: 4 }}>{tr(chosen.feedback, lang)}</P>
          {!chosen.correct && (
            <P dim style={{ marginTop: 6 }}>
              💡 {lang === 'ko' ? '현지에서 권하는 방법' : 'What locals recommend'}: {step.options.filter((o) => o.correct).map((o) => tr(o.text, lang)).join(' / ')}
            </P>
          )}
          <Deltas e={delta} />
          <Btn testID="next" label={L.next} style={{ marginTop: 12 }} onPress={onNext} />
        </View>
      )}
    </View>
  );
}
