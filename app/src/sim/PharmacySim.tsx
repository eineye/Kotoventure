import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MEDICINES, SYMPTOMS, tr } from '@kotoventure/shared';
import { H, P, won } from '../ui/kit';
import { C, R } from '../ui/theme';
import { Box, DoneCard, OptBtn, SimShell, useScore, type SimProps } from './kit';

type Stage = 'find' | 'say' | 'pick' | 'label' | 'done';
const SIGNS = [
  { id: 'yak', big: '약', sub: '藥 · PHARMACY', color: '#16A34A', right: true },
  { id: 'byeongwon', big: '병원', sub: 'clinic / hospital', color: '#2563EB' },
  { id: 'angyeong', big: '안경', sub: 'optician', color: '#7C3AED' },
  { id: 'hwajangpum', big: '화장품', sub: 'cosmetics', color: '#DB2777' },
];

/** Pharmacy: find the 약 sign, describe symptoms in Korean, choose the right medicine, read the dosage label. */
export function PharmacySim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const sym = SYMPTOMS[step.config?.symptom ?? 'cold'];
  const med = MEDICINES.find((m) => m.id === sym.med)!;
  const sc = useScore(10);
  const [stage, setStage] = useState<Stage>('find');
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, s]);
  // stable shuffles
  const phrases = [sym.phrases[1], sym.phrases[0], sym.phrases[2]];
  const how = [sym.howTo[1], sym.howTo[2], sym.howTo[0]];
  const shelf = MEDICINES.filter((m) => m.id !== 'eye' || sym.med === 'eye');

  const pickSign = (id: string) => {
    const s = SIGNS.find((x) => x.id === id)!;
    if (!s.right) return sc.miss(L(`"${s.big}"는 ${s.sub}이에요. 약국은 초록 십자와 큰 "약" 글자!`, `"${s.big}" means ${s.sub}. Look for the big "약" (yak) and a green cross!`));
    sc.ok(L('약국 발견! 약사에게 증상을 말해 보세요.', 'Pharmacy found! Tell the pharmacist your symptoms.'));
    add('Found the pharmacy by its 약 sign');
    setStage('say');
  };
  const say = (i: number) => {
    if (phrases[i] !== sym.phrases[0]) return sc.miss(L('증상과 다른 말이에요. 다시 골라 보세요.', 'That describes a different problem – try again.'));
    sc.ok(L(`약사: "아, ${med.ko} 드릴게요. 어떤 걸로 드릴까요?"`, `Pharmacist: "I see. Let me show you some options."`));
    add(`Said: ${sym.phrases[0].ko}`);
    setStage('pick');
  };
  const pick = (id: string) => {
    if (id !== med.id) {
      const m = MEDICINES.find((x) => x.id === id)!;
      return sc.miss(L(`${m.ko}은(는) 이 증상에 맞지 않아요.`, `${m.en} isn't for this problem.`));
    }
    sc.ok(L(`${med.ko} ${won(med.price)}. 봉투에 복용법이 적혀 있어요.`, `${med.en}, ${won(med.price)}. The bag has the instructions in Korean.`));
    add(`Bought ${med.en}`);
    setStage('label');
  };
  const read = (i: number) => {
    if (how[i] !== sym.howTo[0]) return sc.miss(L('라벨을 다시 읽어 보세요. 복용법을 꼭 지키세요!', 'Read the label again – always follow the dosage!'));
    sc.ok(L('정확해요! 증상이 3일 넘게 계속되면 병원(의원)에 가세요.', 'Correct! If it lasts more than 3 days, see a clinic.'));
    add('Read the dosage label correctly');
    setStage('done');
  };

  const stageIdx = ['find', 'say', 'pick', 'label', 'done'].indexOf(stage);
  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stageIdx} stages={[L('약국 찾기', 'Find'), L('증상 말하기', 'Explain'), L('약 고르기', 'Choose'), L('복용법', 'Label'), L('결과', 'Result')]} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      {stage === 'find' && (
        <>
          <H size={15}>{L('거리의 간판들 – 약국은 어디?', 'Street signs – which one is the pharmacy?')}</H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SIGNS.map((s) => (
              <Pressable key={s.id} testID={`sign-${s.id}`} onPress={() => pickSign(s.id)} style={{ width: '47%', backgroundColor: s.color, borderRadius: R.m, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 34, fontWeight: '900' }}>
                  {s.id === 'yak' ? '✚ ' : ''}
                  {s.big}
                </Text>
              </Pressable>
            ))}
          </View>
          <P dim style={{ fontSize: 12 }}>
            💡 {L('밤·휴일에는 "휴일지킴이약국"이나 편의점 상비약을 이용해요.', 'At night or on holidays look for a "휴일지킴이약국" (holiday pharmacy) or convenience-store medicine.')}
          </P>
        </>
      )}
      {stage === 'say' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>{L('약사: "어디가 불편하세요?"', 'Pharmacist: "Eodiga bulpyeonhaseyo?" (What\'s wrong?)')}</H>
          {phrases.map((ph, i) => (
            <OptBtn key={ph.ko} testID={`say-${i}`} label={ph.ko} sub={ph.en} onPress={() => say(i)} />
          ))}
        </Box>
      )}
      {stage === 'pick' && (
        <>
          <H size={15}>{L('약사가 보여준 약', 'On the counter')}</H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {shelf.map((m) => (
              <Pressable key={m.id} testID={`med-${m.id}`} onPress={() => pick(m.id)} style={{ width: '47%', backgroundColor: '#FFF', borderRadius: R.m, padding: 10, borderWidth: 2, borderColor: C.line }}>
                <Text style={{ fontSize: 26 }}>{m.icon}</Text>
                <Text style={{ fontWeight: '900', color: C.ink }}>{m.ko}</Text>
                <Text style={{ fontSize: 11, color: C.inkSoft }}>{m.en}</Text>
                <Text style={{ fontWeight: '800', color: C.green, marginTop: 2 }}>{won(m.price)}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {stage === 'label' && (
        <Box style={{ gap: 8 }}>
          <View style={{ backgroundColor: '#ECFDF5', borderRadius: R.m, padding: 12, borderWidth: 2, borderColor: '#16A34A' }}>
            <Text style={{ fontWeight: '900', color: '#166534' }}>
              {med.icon} {med.ko} · 복용법
            </Text>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginTop: 4 }}>{sym.dose.ko}</Text>
            <Text style={{ color: C.inkSoft, fontSize: 12, marginTop: 2 }}>📷 {L('번역 앱', 'Translation app')}: {sym.dose.en}</Text>
          </View>
          <H size={15}>{L('어떻게 먹어야(사용해야) 할까요?', 'How should you take / use it?')}</H>
          {how.map((h, i) => (
            <OptBtn key={h} testID={`how-${i}`} label={h} onPress={() => read(i)} />
          ))}
        </Box>
      )}
      {stage === 'done' && (
        <DoneCard title={L('약국 미션 완료', 'Pharmacy done')} score={sc.final()} lang={ctx.lang} log={log} onContinue={() => onDone({ score: sc.final(), effects: { money: -med.price, energy: 8 }, log })} />
      )}
    </SimShell>
  );
}
