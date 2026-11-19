import { PROP_IDS, STATIONS, TOPICS, tr, type ChoiceOption, type SimConfig, type Effects, type KnowledgeCard, type PartyType, type Speaker, type Step } from '@kotoventure/shared';
import { Check, Field, LText, Num, Select } from '../ui';

const SPEAKERS: Speaker[] = ['guide', 'player', 'local', 'staff', 'driver', 'police', 'doctor', 'pharmacist', 'elder', 'monk', 'haenyeo'];
const PARTIES: [PartyType, string][] = [
  ['solo', '개인'],
  ['couple', '커플'],
  ['friends', '2인 이상'],
  ['group', '단체·가족'],
];
export const STEP_TYPES: [Step['type'], string][] = [
  ['narration', '📜 내레이션'],
  ['dialog', '💬 대화'],
  ['choice', '❓ 선택(터치 결정)'],
  ['card', '📖 지식카드'],
  ['event', '⚡ 이벤트'],
  ['sim', '🎮 시뮬레이션'],
];

const SIMS: [string, string][] = [
  ['exchange', '💱 환전 (환율판·금액결정·지폐/동전 확인)'],
  ['atm', '🏧 ATM (카드·PIN·금액·DCC·통장정리)'],
  ['tmoney', '🟧 T머니 (구입·충전기·개찰구)'],
  ['train', '🚄 KTX (노선도·승차권 발매기·승강장)'],
  ['cashpay', '💵 현금 결제 (보유 현금에서 지폐·동전 골라 내기·거스름돈)'],
];

export const blankStep = (type: Step['type']): Step => {
  switch (type) {
    case 'narration':
      return { type, text: { en: '' } };
    case 'dialog':
      return { type, speaker: 'guide', text: { en: '' } };
    case 'choice':
      return {
        type,
        topic: 'transport',
        prompt: { en: '' },
        options: [
          { text: { en: '' }, correct: true, feedback: { en: '' } },
          { text: { en: '' }, correct: false, feedback: { en: '' } },
        ],
      };
    case 'card':
      return { type, cardId: '' };
    case 'event':
      return { type, kind: 'surprise', title: { en: '' }, text: { en: '' } };
    case 'sim':
      return { type, sim: 'exchange', topic: 'money', title: { en: 'Exchange counter' }, intro: { en: '' }, config: { venue: 'airport', targetKRW: 100000 } };
  }
};

const propOptions: [string, string][] = [['', '(없음)'], ...PROP_IDS.map((p) => [p, p] as [string, string])];

function EffectsEdit({ value, onChange }: { value?: Effects; onChange: (e: Effects | undefined) => void }) {
  const v = value ?? {};
  const set = (k: keyof Effects, n: number) => {
    const next = { ...v, [k]: n || undefined };
    onChange(Object.values(next).some((x) => x) ? next : undefined);
  };
  return (
    <div className="row effects">
      <label>⚡체력 <Num value={v.energy ?? 0} onChange={(n) => set('energy', n)} /></label>
      <label>🙇매너 <Num value={v.manner ?? 0} onChange={(n) => set('manner', n)} /></label>
      <label>👛돈(₩) <Num value={v.money ?? 0} step={1000} onChange={(n) => set('money', n)} /></label>
    </div>
  );
}

export function StepEditor({ step, onChange, cards }: { step: Step; onChange: (s: Step) => void; cards: KnowledgeCard[] }) {
  const cardOptions: [string, string][] = [['', '(없음)'], ...cards.map((c) => [c.id, `${c.id} – ${tr(c.title, 'ko')}`] as [string, string])];
  const parties = step.parties ?? [];
  const togglePartiy = (p: PartyType, on: boolean) => {
    const next = on ? [...parties, p] : parties.filter((x) => x !== p);
    onChange({ ...step, parties: next.length ? next : undefined });
  };

  return (
    <div className="step-edit">
      <div className="row wrap parties">
        <span className="dim small">표시 대상:</span>
        {PARTIES.map(([p, l]) => (
          <Check key={p} checked={parties.includes(p)} onChange={(b) => togglePartiy(p, b)} label={l} />
        ))}
        <span className="dim small">(선택 안 하면 모두에게 표시)</span>
      </div>

      {step.type === 'narration' && (
        <Field label="내용" wide>
          <LText multiline value={step.text} onChange={(text) => onChange({ ...step, text })} />
        </Field>
      )}

      {step.type === 'dialog' && (
        <>
          <Field label="화자">
            <Select value={step.speaker} onChange={(speaker) => onChange({ ...step, speaker })} options={SPEAKERS} />
          </Field>
          <Field label="대사" wide>
            <LText multiline value={step.text} onChange={(text) => onChange({ ...step, text })} />
          </Field>
          <Field label="한국어 표현 (선택)" wide>
            <div className="row">
              {(['hangul', 'roman', 'meaning'] as const).map((k) => (
                <input
                  key={k}
                  placeholder={{ hangul: '한글', roman: 'romanization', meaning: 'meaning (en)' }[k]}
                  value={step.phrase?.[k] ?? ''}
                  onChange={(e) => {
                    const ph = { hangul: '', roman: '', meaning: '', ...step.phrase, [k]: e.target.value };
                    onChange({ ...step, phrase: ph.hangul || ph.roman || ph.meaning ? ph : undefined });
                  }}
                />
              ))}
            </div>
          </Field>
        </>
      )}

      {step.type === 'card' && (
        <Field label="지식카드">
          <Select value={step.cardId} onChange={(cardId) => onChange({ ...step, cardId })} options={cardOptions} />
        </Field>
      )}

      {step.type === 'event' && (
        <>
          <div className="grid2">
            <Field label="이벤트 종류">
              <Select
                value={step.kind}
                onChange={(kind) => onChange({ ...step, kind })}
                options={[
                  ['weather', '날씨'],
                  ['health', '건강'],
                  ['money', '돈'],
                  ['law', '법규'],
                  ['surprise', '서프라이즈'],
                ]}
              />
            </Field>
            <Field label="그림(prop)">
              <Select value={step.prop ?? ''} onChange={(prop) => onChange({ ...step, prop: prop || undefined })} options={propOptions} />
            </Field>
          </div>
          <Field label="제목" wide>
            <LText value={step.title} onChange={(title) => onChange({ ...step, title })} />
          </Field>
          <Field label="내용" wide>
            <LText multiline value={step.text} onChange={(text) => onChange({ ...step, text })} />
          </Field>
          <Field label="효과" wide>
            <EffectsEdit value={step.effects} onChange={(effects) => onChange({ ...step, effects })} />
          </Field>
        </>
      )}

      {step.type === 'sim' && (
        <>
          <div className="grid2">
            <Field label="시뮬레이션 종류">
              <Select value={step.sim} onChange={(sim) => onChange({ ...step, sim: sim as typeof step.sim })} options={SIMS} />
            </Field>
            <Field label="주제 (8대 필수 주제)">
              <Select value={step.topic} onChange={(topic) => onChange({ ...step, topic })} options={TOPICS.map((t) => [t.id, `${t.icon} ${t.name.ko}`] as [typeof t.id, string])} />
            </Field>
            <Field label="완료 후 지급 카드">
              <Select value={step.cardId ?? ''} onChange={(cardId) => onChange({ ...step, cardId: cardId || undefined })} options={cardOptions} />
            </Field>
          </div>
          <Field label="제목" wide>
            <LText value={step.title} onChange={(title) => onChange({ ...step, title })} />
          </Field>
          <Field label="미션 안내 (시작 전 설명)" wide>
            <LText multiline value={step.intro} onChange={(intro) => onChange({ ...step, intro })} />
          </Field>
          <SimConfigEdit sim={step.sim} value={step.config ?? {}} onChange={(config) => onChange({ ...step, config })} />
          <p className="hint">점수: 0~100점 (실수할 때마다 감점). 완료 시 정답률·점수에 반영되고, 환전 손실·수수료·요금이 지갑에서 차감됩니다.</p>
        </>
      )}

      {step.type === 'choice' && (
        <>
          <div className="grid2">
            <Field label="주제 (8대 필수 주제)">
              <Select value={step.topic} onChange={(topic) => onChange({ ...step, topic })} options={TOPICS.map((t) => [t.id, `${t.icon} ${t.name.ko}`] as [typeof t.id, string])} />
            </Field>
            <Field label="답변 후 지급 카드">
              <Select value={step.cardId ?? ''} onChange={(cardId) => onChange({ ...step, cardId: cardId || undefined })} options={cardOptions} />
            </Field>
          </div>
          <Field label="질문" wide>
            <LText multiline value={step.prompt} onChange={(prompt) => onChange({ ...step, prompt })} />
          </Field>
          <div className="options">
            {step.options.map((o, i) => {
              const setO = (patch: Partial<ChoiceOption>) => onChange({ ...step, options: step.options.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
              return (
                <div key={i} className={'option ' + (o.correct ? 'right' : 'wrong')}>
                  <div className="row">
                    <b>선택지 {i + 1}</b>
                    <Check checked={o.correct} onChange={(correct) => setO({ correct })} label="정답" />
                    <Select value={o.prop ?? ''} onChange={(prop) => setO({ prop: prop || undefined })} options={propOptions} />
                    <button className="link" disabled={step.options.length <= 2} onClick={() => onChange({ ...step, options: step.options.filter((_, k) => k !== i) })}>
                      삭제
                    </button>
                  </div>
                  <Field label="보기 문구" wide>
                    <LText value={o.text} onChange={(text) => setO({ text })} />
                  </Field>
                  <Field label="피드백 (선택 후 설명)" wide>
                    <LText multiline value={o.feedback} onChange={(feedback) => setO({ feedback })} />
                  </Field>
                  <EffectsEdit value={o.effects} onChange={(effects) => setO({ effects })} />
                </div>
              );
            })}
            <button className="ghost small" onClick={() => onChange({ ...step, options: [...step.options, { text: { en: '' }, correct: false, feedback: { en: '' } }] })}>
              + 선택지 추가
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export const stepSummary = (s: Step) => {
  switch (s.type) {
    case 'narration':
      return s.text.en;
    case 'dialog':
      return `${s.speaker}: ${s.text.en}`;
    case 'choice':
      return `[${s.topic}] ${s.prompt.en}`;
    case 'card':
      return `카드 ${s.cardId}`;
    case 'event':
      return `[${s.kind}] ${s.title.en}`;
    case 'sim':
      return `🎮 ${s.sim}: ${s.title.en}`;
  }
};

function SimConfigEdit({ sim, value, onChange }: { sim: string; value: SimConfig; onChange: (c: SimConfig) => void }) {
  const set = (p: Partial<SimConfig>) => onChange({ ...value, ...p });
  const stations: [string, string][] = STATIONS.filter((s) => s.fare).map((s) => [s.id, `${s.ko} ${s.en}`]);
  return (
    <div className="grid2">
      {sim === 'exchange' && (
        <>
          <Field label="환전 장소">
            <Select value={value.venue ?? 'airport'} onChange={(venue) => set({ venue })} options={[['airport', '공항 (환율 불리, 6%)'], ['downtown', '시내 환전소 (1.5%)']]} />
          </Field>
          <Field label="권장 환전액 (₩)">
            <Num value={value.targetKRW ?? 100000} step={10000} onChange={(targetKRW) => set({ targetKRW })} />
          </Field>
        </>
      )}
      {sim === 'atm' && (
        <>
          <Field label="권장 인출액 (₩)">
            <Num value={value.targetKRW ?? 100000} step={10000} onChange={(targetKRW) => set({ targetKRW })} />
          </Field>
          <Field label="통장정리 연습">
            <Check checked={!!value.passbookPractice} onChange={(passbookPractice) => set({ passbookPractice })} label="출금 후 통장 투입 연습 포함" />
          </Field>
        </>
      )}
      {sim === 'tmoney' && (
        <Field label="카드 구입부터">
          <Check checked={value.buyCard ?? true} onChange={(buyCard) => set({ buyCard })} label="편의점에서 카드 구입(현금 결제) 단계 포함" />
        </Field>
      )}
      {sim === 'cashpay' && (
        <>
          <Field label="가게 이름">
            <input value={value.shop ?? ''} placeholder="명동 노점 Myeongdong street stall" onChange={(e) => set({ shop: e.target.value })} />
          </Field>
          <Field label="결제 수단">
            <Check checked={value.cashOnly ?? true} onChange={(cashOnly) => set({ cashOnly })} label="현금만 가능 (현금 부족 시 카드 대체 불가)" />
          </Field>
          <Field label="구매 품목 (이름 / 가격 ₩)" wide>
            {(value.items ?? []).map((it, i) => (
              <div key={i} className="row">
                <input style={{ flex: 1 }} value={it.name} onChange={(e) => set({ items: (value.items ?? []).map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} />
                <Num value={it.price} step={100} onChange={(price) => set({ items: (value.items ?? []).map((x, k) => (k === i ? { ...x, price } : x)) })} />
                <button className="link red" onClick={() => set({ items: (value.items ?? []).filter((_, k) => k !== i) })}>
                  삭제
                </button>
              </div>
            ))}
            <button className="ghost small" onClick={() => set({ items: [...(value.items ?? []), { name: '', price: 1000 }] })}>
              + 품목 추가
            </button>
            <span className="hint">합계: ₩{(value.items ?? []).reduce((a, b) => a + (b.price || 0), 0).toLocaleString('en-US')} · 플레이어는 게임 속 지갑(환전·ATM으로 받은 실제 지폐·동전)에서 골라 냅니다.</span>
          </Field>
        </>
      )}
      {sim === 'train' && (
        <>
          <Field label="도착역 (서울역 출발)">
            <Select value={value.to ?? 'singyeongju'} onChange={(to) => set({ to, from: 'seoul' })} options={stations} />
          </Field>
          <Field label="도착 기한 (HH:MM)">
            <input value={value.arriveBy ?? '13:00'} onChange={(e) => set({ arriveBy: e.target.value })} />
          </Field>
        </>
      )}
    </div>
  );
}
