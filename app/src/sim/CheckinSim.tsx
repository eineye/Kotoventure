import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { tr } from '@kotoventure/shared';
import { H, P } from '../ui/kit';
import { C } from '../ui/theme';
import { Box, DoneCard, OptBtn, SimShell, useScore, type SimProps } from './kit';

type Stage = 'msg' | 'door' | 'room' | 'rules' | 'done';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

/** Self check-in: read the host's message, open the digital door lock, find the room, remember the house rules. */
export function CheckinSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const cfg = step.config ?? {};
  const code = cfg.code ?? '2580';
  const room = cfg.room ?? '302';
  const checkout = cfg.checkout ?? '11:00';
  const floor = room[0];
  const sc = useScore(10);
  const [stage, setStage] = useState<Stage>('msg');
  const [awake, setAwake] = useState(false);
  const [typed, setTyped] = useState('');
  const [fl, setFl] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, s]);

  const press = (k: string) => {
    if (!awake) {
      // the first touch anywhere on the pad wakes it up (like a real digital door lock)
      setAwake(true);
      sc.clear();
      return;
    }
    if (k === '*') {
      if (typed === code) {
        sc.ok(L('"띠리릭" 문이 열렸어요!', '"Ding-ding-ding" – the door opens!'));
        add('Opened the digital door lock (code + *)');
        setStage('room');
      } else {
        sc.miss(L('"삐삐삐" 비밀번호가 틀렸어요. 메시지를 다시 보세요. (5번 틀리면 잠겨요!)', '"Beep-beep" – wrong code. Check the message. (5 wrong tries lock it!)'));
        setTyped('');
      }
      return;
    }
    if (k === '#') return sc.info(L('이 도어락은 비밀번호 뒤에 * 를 눌러요 (메시지 참고).', 'This lock wants * after the code (see the message).'));
    setTyped((t) => (t + k).slice(0, 8));
  };

  const pickRoom = (r: string) => {
    if (r !== room) return sc.miss(L(`${r}호가 아니에요. 다른 손님 방이에요!`, `Not room ${r} – that's another guest's room!`));
    sc.ok(L(`${room}호 도착. 짐을 풀어요.`, `Room ${room} – you're home.`));
    add(`Found room ${room}`);
    setStage('rules');
  };

  const rule = (ok: boolean, text: string) => {
    if (!ok) return sc.miss(text);
    sc.ok(L('규칙 확인 완료! 편히 쉬세요.', 'House rules understood – sleep well!'));
    add(`Checked the rules: check-out ${checkout}, quiet after 22:00`);
    setStage('done');
  };

  const stageIdx = ['msg', 'door', 'room', 'rules', 'done'].indexOf(stage);
  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stageIdx} stages={[L('메시지', 'Message'), L('도어락', 'Door lock'), L('방 찾기', 'Room'), L('규칙', 'Rules'), L('결과', 'Result')]} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      {stage !== 'done' && (
        <Box style={{ backgroundColor: '#FEF9C3', gap: 4 }}>
          <Text style={{ fontWeight: '900', color: '#713F12' }}>💬 {L('호스트 메시지', 'Message from your host')}</Text>
          <Text style={{ color: C.ink }}>
            안녕하세요! 공동현관·방 비밀번호는 <Text style={{ fontWeight: '900' }}>{code}</Text> 누르고 <Text style={{ fontWeight: '900' }}>*</Text> 버튼이에요. 방은{' '}
            <Text style={{ fontWeight: '900' }}>{room}호</Text>. 체크아웃 <Text style={{ fontWeight: '900' }}>{checkout}</Text>, 밤 10시 이후 조용히 부탁드려요 🙏
          </Text>
          <Text style={{ color: C.inkSoft, fontSize: 12 }}>
            Hi! Door code {code} then *. Room {room}. Check-out {checkout}; please keep quiet after 10 pm.
          </Text>
        </Box>
      )}
      {stage === 'msg' && <OptBtn testID="ci-go" label={L('메시지 확인 – 현관으로', 'Got it – to the door')} selected onPress={() => setStage('door')} />}
      {stage === 'door' && (
        <View style={{ alignItems: 'center' }}>
          <Pressable
            testID="ci-wake"
            onPress={() => {
              setAwake(true);
              sc.clear();
            }}
            style={{ width: 210, backgroundColor: '#111827', borderRadius: 18, padding: 12, gap: 8 }}
          >
            <Text style={{ color: awake ? '#60A5FA' : '#475569', textAlign: 'center', fontWeight: '900' }}>{awake ? '●'.repeat(typed.length) || L('비밀번호 입력', 'Enter code') : L('✋ 터치하세요', '✋ Touch to wake')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {KEYS.map((k) => (
                <Pressable key={k} testID={`dl-${k === '*' ? 'star' : k === '#' ? 'hash' : k}`} onPress={() => press(k)} style={{ width: 54, height: 44, borderRadius: 10, backgroundColor: awake ? '#1E3A8A' : '#1F2937', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: awake ? '#BFDBFE' : '#334155', fontWeight: '900', fontSize: 18 }}>{k}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </View>
      )}
      {stage === 'room' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>{L('엘리베이터 – 몇 층?', 'Elevator – which floor?')}</H>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['2', '3', '4'].map((f) => (
              <OptBtn key={f} testID={`floor-${f}`} label={`${f}F`} selected={fl === f} onPress={() => (f === floor ? (setFl(f), sc.clear()) : sc.miss(L(`${room}호는 ${floor}층이에요 (앞자리 = 층).`, `Room ${room} is on floor ${floor} – the first digit is the floor.`)))} style={{ flex: 1 }} />
            ))}
          </View>
          {fl && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[`${fl}01`, `${fl}02`, `${fl}03`].map((r) => (
                <OptBtn key={r} testID={`room-${r}`} label={`🚪 ${r}`} onPress={() => pickRoom(r)} style={{ flex: 1 }} />
              ))}
            </View>
          )}
        </Box>
      )}
      {stage === 'rules' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>{L('내일 아침, 언제까지 나가야 할까요?', 'Tomorrow morning – when must you leave?')}</H>
          <OptBtn testID="rule-ok" label={L(`${checkout}까지 체크아웃, 밤 10시 이후 조용히`, `Check out by ${checkout}; quiet after 10 pm`)} onPress={() => rule(true, '')} />
          <OptBtn testID="rule-late" label={L('오후 2시쯤 나가도 돼요', 'Around 2 pm is fine')} onPress={() => rule(false, L(`체크아웃은 ${checkout}이에요. 늦으면 추가 요금이 붙을 수 있어요.`, `Check-out is ${checkout} – late check-out can cost extra.`))} />
          <OptBtn testID="rule-party" label={L('밤에 친구들과 파티해도 돼요', 'A late-night party is OK')} onPress={() => rule(false, L('주택가 숙소는 밤 10시 이후 조용히가 기본이에요.', 'In residential buildings, quiet after 10 pm is the rule.'))} />
        </Box>
      )}
      {stage === 'done' && <DoneCard title={L('체크인 완료', 'Checked in')} score={sc.final()} lang={ctx.lang} log={log} onContinue={() => onDone({ score: sc.final(), effects: { energy: 10 }, log })} />}
    </SimShell>
  );
}
