import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import {
  applyEffects,
  initialStats,
  score,
  tr,
  visibleSteps,
  type ChoiceStep,
  type CourseProgress,
  type Effects,
  type Phrase,
  type RunStats,
  type Step,
} from '@kotoventure/shared';
import { Background } from '../art/backgrounds';
import { PartyArt, SpeakerPortrait, avatarById, speakerLabel } from '../art/Characters';
import { Prop, hasProp } from '../art/props';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Bar, Btn, CardView, H, P, PhraseBox, TopicChip, won } from '../ui/kit';
import { C, R, shadow } from '../ui/theme';

type Phase = 'intro' | 'step' | 'feedback' | 'card';

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

  const scene = course.scenes[Math.min(sceneIdx, course.scenes.length - 1)];
  const steps = visibleSteps(scene, party);
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
      // exhausted → forced rest
      st = { ...st, energy: 35, money: st.money - 20000 };
      d = { ...(e ?? {}), energy: (e?.energy ?? 0) + 35, money: (e?.money ?? 0) - 20000 };
    }
    setStats(st);
    return { st, d };
  };

  const advance = (st = stats, cs = cards, ps = phrases) => {
    setPicked(null);
    setDelta(null);
    if (stepIdx + 1 < steps.length) {
      setStepIdx(stepIdx + 1);
      setPhase('step');
      persist(sceneIdx, stepIdx + 1, st, cs, ps);
    } else if (sceneIdx + 1 < course.scenes.length) {
      setSceneIdx(sceneIdx + 1);
      setStepIdx(0);
      setPhase('intro');
      persist(sceneIdx + 1, 0, st, cs, ps);
    } else {
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
    setStats({ ...st, answered: st.answered + 1, correct: st.correct + (opt.correct ? 1 : 0) });
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
          <Text style={{ color: stats.money < 0 ? '#FCA5A5' : C.yellow, fontWeight: '900' }}>👛 {won(stats.money)}</Text>
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

            {step.type === 'choice' && phase !== 'card' && (
              <ChoiceView step={step} lang={lang} picked={picked} onPick={onPick} delta={delta} onNext={afterFeedback} />
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
}: {
  step: ChoiceStep;
  lang: string;
  picked: number | null;
  onPick: (i: number) => void;
  delta: Effects | null;
  onNext: () => void;
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
        {step.options.map((o, i) => {
          const state = picked === null ? 'idle' : o.correct ? 'right' : picked === i ? 'wrong' : 'dim';
          const border = { idle: C.line, right: C.green, wrong: C.red, dim: C.line }[state];
          const bg = { idle: '#FFF', right: '#E8F8F0', wrong: '#FDECEC', dim: '#FAFAFA' }[state];
          return (
            <Pressable
              key={i}
              testID={`opt-${i}`}
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
      {chosen && (
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
