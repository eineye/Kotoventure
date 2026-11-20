import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import {
  applyEffects,
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
import { Bar, Btn, CardView, H, P, PhraseBox, TopicChip, won } from '../ui/kit';
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

export function Play({ id, restart, onQuit, onFinish }: { id: string; restart: boolean; onQuit: () => void; onFinish: () => void }) {
  const { content, profile, progress, saveProgress } = useStore();
  const { width, height } = useWindowDimensions();
  const lang = profile?.lang ?? 'en';
  const L = t(lang);
  const course = content.courses.find((c) => c.id === id)!;
  const party = profile?.party ?? 'solo';
  const avatar = avatarById(profile?.avatar);
  const prev = progress[id];

  // resume or start fresh
  const resume = !restart && prev && !prev.completedAt && prev.courseVersion === course.version;
  const [sceneIdx, setSceneIdx] = useState(resume ? prev!.sceneIndex : 0);
  const [stepIdx, setStepIdx] = useState(resume ? prev!.stepIndex : 0);
  const [stats, setStats] = useState<RunStats>(resume ? prev!.stats : initialStats(course));
  const [cards, setCards] = useState<string[]>(resume ? prev!.cards : prev?.cards ?? []);
  const [phrases, setPhrases] = useState<string[]>(resume ? prev!.phrases : prev?.phrases ?? []);
  const [phase, setPhase] = useState<Phase>(resume && prev!.stepIndex > 0 ? 'step' : 'intro');
  const [picked, setPicked] = useState<number | null>(null);
  const [delta, setDelta] = useState<Effects | null>(null);
  const [pendingCard, setPendingCard] = useState<string | null>(null);
  const plays = (prev?.plays ?? 0) + (resume ? 0 : 1);
  const real = profile?.mode === 'real';
  const [dayLog, setDayLog] = useState<DayLogItem[]>([]);
  const [summary, setSummary] = useState<{ day: number; next: number; collapsed: boolean; resumeStep?: number } | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const flags = stats.flags ?? [];

  const scene = course.scenes[Math.min(sceneIdx, course.scenes.length - 1)];
  const steps = visibleSteps(scene, party, flags, String(plays));
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
    let st = applyEffects(stats, e);
    let d: Effects | null = e ?? null;
    if (st.energy <= 0) {
      // exhausted → a short rest break (snack, water, nap), then the trip continues – no content is skipped
      st = { ...st, energy: 50, money: st.money - 10000 };
      d = { ...(e ?? {}), energy: (e?.energy ?? 0) + 50, money: (e?.money ?? 0) - 10000 };
      setExhausted(true);
    }
    setStats(st);
    return { st, d };
  };

  const goScene = (idx: number, st: RunStats, cs: string[], ps: string[]) => {
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
    const fresh = visibleSteps(scene, party, fl, String(plays));
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
    const st = {
      ...tally(applySim(base, r.score), sim.topic, r.score / 100, `${scene.id}:${scene.steps.indexOf(sim)}:-1`),
      ...(r.cash ? { cash: r.cash } : {}),
      flags: r.flags?.length ? Array.from(new Set([...(base.flags ?? []), ...r.flags])) : base.flags,
    };
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
            🌙 {L.day} {summary.day} {lang === 'ko' ? '정산' : 'review'}
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

  const sceneH = Math.min(height * 0.36, 300);
  const speaker = step?.type === 'dialog' ? step.speaker : null;
  const overlayProp = step?.type === 'event' ? step.prop : phase === 'card' ? undefined : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      {/* HUD */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, backgroundColor: C.navy }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={onQuit} accessibilityRole="button" accessibilityLabel={L.quit} style={{ padding: 6 }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '900' }}>✕</Text>
          </Pressable>
          <Text style={{ color: '#FFF', fontWeight: '900' }}>
            {L.day} {scene.day} · {Math.min(sceneIdx + 1, course.scenes.length)}/{course.scenes.length}
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: stats.money < 0 ? '#FCA5A5' : C.yellow, fontWeight: '900' }}>👛 {won(stats.money)}</Text>
            <Text style={{ color: '#CBD5E1', fontWeight: '800', fontSize: 10 }}>💵 {lang === 'ko' ? '현금' : 'cash'} {won(cashTotal(stats.cash ?? DEFAULT_CASH))}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
          <Bar label={`⚡ ${L.energy}`} value={stats.energy} color={stats.energy < 30 ? '#F87171' : '#4ADE80'} />
          <Bar label={`🙇 ${L.manner}`} value={stats.manner} color="#60A5FA" />
        </View>
      </View>

      {/* Scene */}
      <View style={{ height: sceneH, overflow: 'hidden' }}>
        <Background id={scene.bg} width={width} height={sceneH} />
        <View style={{ position: 'absolute', left: 4, bottom: -4 }}>
          <PartyArt party={party} lead={avatar} size={Math.min(170, width * 0.42)} />
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
      <Animated.View style={{ flex: 1, backgroundColor: C.paper, borderTopLeftRadius: R.l, borderTopRightRadius: R.l, marginTop: -16, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        {phase === 'intro' && (
          <Pressable style={{ flex: 1, padding: 20, justifyContent: 'center' }} testID="continue" onPress={() => setPhase('step')} accessibilityRole="button">
            <Text style={{ color: C.red, fontWeight: '900', fontSize: 16 }}>
              {L.day} {scene.day}
            </Text>
            <H size={26}>{tr(scene.title, lang)}</H>
            <P dim style={{ marginTop: 4 }}>📍 {tr(scene.location, lang)}</P>
            <RouteDots total={course.scenes.length} at={sceneIdx} />
            {sceneIdx === 0 && (
              <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 22 }}>{course.entry.kind === 'airport' ? '✈️' : '⛴️'}</Text>
                <P style={{ fontWeight: '800' }}>{tr(course.entry.name, lang)}</P>
              </View>
            )}
            <Text style={{ marginTop: 24, color: C.inkSoft, fontWeight: '800' }}>▸ {L.tapContinue}</Text>
          </Pressable>
        )}

        {phase !== 'intro' && !step && (
          <View style={{ padding: 20 }}>
            <Btn testID="next" label={L.next} onPress={() => advance()} />
          </View>
        )}

        {phase !== 'intro' && step && (
          <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 30, flexGrow: 1 }}>
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
                  <Text style={{ fontWeight: '900', color: C.orange, fontSize: 12 }}>🎮 HANDS-ON SIMULATION · up to 100 pts</Text>
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
                    {lang === 'ko' ? '건너뛰면 비용·현금은 그대로 처리되고 점수는 기록되지 않아요.' : 'Skipping still handles costs and cash – it just records no score.'}
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
  if (e.energy) items.push([`⚡ ${e.energy > 0 ? '+' : ''}${e.energy}`, e.energy > 0 ? C.green : C.red]);
  if (e.manner) items.push([`🙇 ${e.manner > 0 ? '+' : ''}${e.manner}`, e.manner > 0 ? C.green : C.red]);
  if (e.money) items.push([`👛 ${e.money > 0 ? '+' : '−'}${won(Math.abs(e.money))}`, e.money > 0 ? C.green : C.red]);
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
          const state = picked === null ? 'idle' : real ? (picked === i ? 'picked' : 'dim') : o.correct ? 'right' : picked === i ? 'wrong' : 'dim';
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
                {state === 'right' ? '✅ ' : state === 'wrong' ? '❌ ' : ''}
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
        <View style={{ marginTop: 14, backgroundColor: chosen.correct ? '#E8F8F0' : '#FDECEC', borderRadius: R.m, padding: 14 }}>
          <H size={18} style={{ color: chosen.correct ? C.green : C.red }}>
            {chosen.correct ? `🎉 ${L.correct}` : `🤔 ${L.wrong}`}
          </H>
          <P style={{ marginTop: 4 }}>{tr(chosen.feedback, lang)}</P>
          {!chosen.correct && (
            <P dim style={{ marginTop: 6 }}>
              ✅ {step.options.filter((o) => o.correct).map((o) => tr(o.text, lang)).join(' / ')}
            </P>
          )}
          <Deltas e={delta} />
          <Btn testID="next" label={L.next} style={{ marginTop: 12 }} onPress={onNext} />
        </View>
      )}
    </View>
  );
}
