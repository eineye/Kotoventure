import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../ui/Text';
import * as Speech from 'expo-speech';
import { roll, tr } from '@kotoventure/shared';
import { Btn, H, P } from '../ui/kit';
import { C, R } from '../ui/theme';
import { Box, DoneCard, SimShell, useScore, type SimProps } from './kit';

const speak = (ko: string) => {
  try {
    Speech.stop();
    Speech.speak(ko, { language: 'ko-KR', rate: 0.85 });
  } catch {
    /* no TTS on this device */
  }
};

/** Build Korean sentences from word tiles, then hear them spoken. */
export function PhraseSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const phrases = step.config?.phrases ?? [];
  const sc = useScore(10);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState<null | boolean>(null);
  const [log, setLog] = useState<string[]>([]);
  const ph = phrases[idx];

  const tiles = useMemo(() => {
    if (!ph) return [];
    const words = [...ph.ko.split(' '), ...(ph.extra ?? [])];
    return words.map((w, i) => ({ w, i, r: roll(`${ph.ko}|${i}`) })).sort((a, b) => a.r - b.r);
  }, [ph]);

  if (!ph || idx >= phrases.length) {
    return (
      <SimShell title={tr(step.title, ctx.lang)} stage={1} stages={[ko ? '문장 만들기' : 'Build', ko ? '완료' : 'Done']} fb={sc.fb}>
        <DoneCard title={ko ? '한국어 표현 완료' : 'Korean phrases done'} score={sc.final()} lang={ctx.lang} log={log} onContinue={() => onDone({ score: sc.final(), log })} />
      </SimShell>
    );
  }

  const built = answer.map((i) => tiles.find((t) => t.i === i)!.w).join(' ');
  const check = () => {
    if (built === ph.ko) {
      sc.ok(ko ? `정답! "${ph.ko}"` : `Correct! "${ph.ko}"`);
      setSolved(true);
      setLog((l) => [...l, `✔ ${ph.ko} – ${ph.en}`]);
      speak(ph.ko);
    } else if (tries >= 1) {
      sc.miss(ko ? `정답은 "${ph.ko}"` : `The answer is "${ph.ko}" (${ph.roman}).`);
      setSolved(false);
      setLog((l) => [...l, `✖ ${ph.ko} – ${ph.en}`]);
      speak(ph.ko);
    } else {
      sc.miss(ko ? '어순이 달라요. 한국어는 보통 [무엇을] + [얼마나] + [동사] 순서예요.' : 'Word order is off. Korean usually goes [object] + [amount] + [verb] at the end.');
      setTries(1);
    }
  };
  const next = () => {
    setIdx((i) => i + 1);
    setAnswer([]);
    setTries(0);
    setSolved(null);
  };

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={0} stages={[ko ? '문장 만들기' : 'Build', ko ? '완료' : 'Done']} fb={sc.fb}>
      {idx === 0 && <P>{tr(step.intro, ctx.lang)}</P>}
      <Box style={{ gap: 4, borderLeftWidth: 5, borderLeftColor: C.blue }}>
        <Text style={{ color: C.inkSoft, fontWeight: '800', fontSize: 12 }}>
          {idx + 1} / {phrases.length} · {ko ? '이렇게 말하고 싶어요' : 'You want to say'}
        </Text>
        <H size={18}>“{ph.en}”</H>
      </Box>
      {/* answer row */}
      <View style={{ minHeight: 56, backgroundColor: '#FFF', borderRadius: R.m, borderWidth: 2, borderColor: solved ? C.green : solved === false ? C.red : C.line, padding: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {answer.map((i, k) => (
          <Pressable key={k} testID={`ans-${k}`} disabled={solved !== null} onPress={() => setAnswer((a) => a.filter((_, j) => j !== k))} style={tileStyle(true)}>
            <Text style={tileText}>{tiles.find((t) => t.i === i)!.w}</Text>
          </Pressable>
        ))}
        {!answer.length && <Text style={{ color: C.inkSoft }}>{ko ? '아래 단어를 순서대로 누르세요' : 'Tap the words below in order'}</Text>}
      </View>
      {/* tiles */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tiles.map((t) => {
          const used = answer.includes(t.i);
          return (
            <Pressable key={t.i} testID={`tile-${t.w}`} disabled={used || solved !== null} onPress={() => setAnswer((a) => [...a, t.i])} style={[tileStyle(false), { opacity: used ? 0.25 : 1 }]}>
              <Text style={tileText}>{t.w}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Btn testID="ph-speak" kind="ghost" label="🔊" small onPress={() => speak(solved !== null ? ph.ko : built || ph.ko.split(' ')[0])} />
        {solved === null ? (
          <Btn testID="ph-check" label={ko ? '확인' : 'Check'} disabled={!answer.length} onPress={check} style={{ flex: 1 }} />
        ) : (
          <Btn testID="ph-next" label={ko ? '다음' : 'Next'} onPress={next} style={{ flex: 1 }} />
        )}
      </View>
      {solved !== null && (
        <Box style={{ gap: 2 }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: C.blue }}>{ph.ko}</Text>
          <Text style={{ color: C.inkSoft, fontWeight: '700' }}>{ph.roman}</Text>
          <Text style={{ color: C.ink }}>“{ph.en}”</Text>
          <Text style={{ fontSize: 11, color: C.inkSoft }}>🔊 {ko ? '버튼을 눌러 발음을 들어 보세요' : 'Tap 🔊 to hear it'}</Text>
        </Box>
      )}
    </SimShell>
  );
}

const tileStyle = (inAnswer: boolean) => ({
  backgroundColor: inAnswer ? '#EEF4FF' : '#FFF7E6',
  borderWidth: 2,
  borderColor: inAnswer ? '#1D4ED8' : '#F08A24',
  borderBottomWidth: 4,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 7,
});
const tileText = { fontSize: 17, fontWeight: '900' as const, color: '#1B2140' };
