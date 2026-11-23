import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../ui/Text';
import { BINS, TRASH, trashById, tr, type BinId } from '@kotoventure/shared';
import { H, P } from '../ui/kit';
import { C, R } from '../ui/theme';
import { Box, DoneCard, SimShell, useScore, type SimProps } from './kit';

const BIN_ORDER: BinId[] = ['general', 'food', 'plastic', 'can', 'glass', 'paper', 'vinyl'];

/** Trash sorting (분리배출): tap an item, then the right bin. Includes the famous trick items. */
export function RecycleSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const items = (step.config?.trash?.length ? step.config.trash.map(trashById) : TRASH.slice(0, 8)).filter(Boolean) as typeof TRASH;
  const sc = useScore(8);
  const [left, setLeft] = useState(items.map((i) => i.id));
  const [held, setHeld] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [wrongOnce, setWrongOnce] = useState<string[]>([]);
  const done = left.length === 0;

  const drop = (bin: BinId) => {
    if (!held) return sc.info(L('먼저 버릴 물건을 고르세요.', 'Pick an item first.'));
    const it = trashById(held)!;
    if (it.bin !== bin) {
      if (!wrongOnce.includes(it.id)) setWrongOnce((w) => [...w, it.id]);
      return sc.miss(L(`${it.ko}은(는) ${BINS[bin].ko}이(가) 아니에요. 힌트: ${it.why}`, `${it.en} doesn't go in ${BINS[bin].en}. Hint: ${it.why}`));
    }
    sc.ok(`${it.icon} → ${ko ? BINS[bin].ko : BINS[bin].en}. ${it.why}`);
    setLog((l) => [...l, `${it.en} → ${BINS[bin].en}`]);
    setLeft((l) => l.filter((x) => x !== it.id));
    setHeld(null);
  };

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={done ? 1 : 0} stages={[L('분리배출', 'Sort'), L('결과', 'Result')]} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      {!done && (
        <>
          <H size={15}>
            {L('버릴 것', 'To throw away')} ({left.length})
          </H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {left.map((id) => {
              const it = trashById(id)!;
              return (
                <Pressable
                  key={id}
                  testID={`trash-${id}`}
                  onPress={() => {
                    setHeld(id);
                    sc.clear();
                  }}
                  style={{ backgroundColor: held === id ? C.yellow : '#FFF', borderRadius: R.m, padding: 8, borderWidth: 2, borderColor: held === id ? '#B45309' : C.line, width: '47%' }}
                >
                  <Text style={{ fontSize: 26 }}>{it.icon}</Text>
                  <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13 }}>{ko ? it.ko : it.en}</Text>
                </Pressable>
              );
            })}
          </View>
          <H size={15}>{L('분리수거함', 'Recycling station')}</H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {BIN_ORDER.map((b) => (
              <Pressable key={b} testID={`bin-${b}`} onPress={() => drop(b)} style={{ width: '23%', minWidth: 76, alignItems: 'center', backgroundColor: BINS[b].color, borderRadius: 10, paddingVertical: 10, opacity: held ? 1 : 0.75 }}>
                <Text style={{ fontSize: 22 }}>{BINS[b].icon}</Text>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>{BINS[b].ko}</Text>
                <Text style={{ color: '#FFFD', fontSize: 9, fontWeight: '700' }}>{BINS[b].en}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {done && (
        <Box style={{ gap: 4 }}>
          <Text style={{ fontWeight: '900', color: C.ink }}>{L('🧠 헷갈리기 쉬운 것', '🧠 The tricky ones')}</Text>
          {(wrongOnce.length ? wrongOnce : ['bones', 'eggshell']).map((id) => {
            const it = trashById(id);
            return it ? (
              <P key={id} style={{ fontSize: 13 }}>
                {it.icon} {ko ? it.ko : it.en} → {ko ? BINS[it.bin].ko : BINS[it.bin].en}
              </P>
            ) : null;
          })}
        </Box>
      )}
      {done && (
        <DoneCard title={L('분리배출 완료!', 'All sorted!')} score={sc.final()} lang={ctx.lang} log={log} onContinue={() => onDone({ score: sc.final(), effects: { manner: Math.max(0, 8 - wrongOnce.length * 2) }, log })} />
      )}
    </SimShell>
  );
}
