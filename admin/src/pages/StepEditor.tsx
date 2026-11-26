import { BUS_COLORS, SYMPTOMS, PLACES, PROP_IDS, RESTAURANTS, TICKET_SITES, TRASH, STATIONS, SUBWAY_STATIONS, TOPICS, tr, type ChoiceOption, type SimConfig, type Effects, type KnowledgeCard, type PartyType, type Speaker, type Step } from '@kotoventure/shared';
import { Check, Field, JsonEdit, LText, Num, Select } from '../ui';

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
  ['dayplan', '🗓️ 하루 일정 짜기 (장소·순서·이동수단, 휴무일·날씨·점심·막차)'],
  ['transfer', '🚇 지하철 환승 퍼즐 (제한시간 안에 최단 경로)'],
  ['kiosk', '🖥️ 키오스크 주문 (한국어 전용·옵션·대기열 압박)'],
  ['phrase', '🗣️ 한국어 문장 만들기 (단어 조각·발음 듣기)'],
  ['bus', '🚌 시내버스 (노선 찾기·앞문 승차 태그·하차벨·하차 태그)'],
  ['ticket', '🎫 관광지 매표소 (요금표·일행별 표·한복 무료·입장 게이트)'],
  ['menu', '📜 식당 메뉴 주문 (한글 메뉴판·2인분 이상·호출벨·반찬 리필·카운터 계산)'],
  ['recycle', '♻️ 분리배출 (일반·음식물·플라스틱·캔·유리·종이·비닐)'],
  ['pharmacy', '💊 약국 (약 간판·증상 말하기·약 고르기·복용법)'],
  ['taxi', '🚕 택시 호출 앱 (한글 주소 확인·택시 종류·번호판·안전띠)'],
  ['checkin', '🔑 숙소 셀프 체크인 (호스트 메시지·도어락·방 찾기·규칙)'],
  ['locker', '🧳 물품보관함 (크기·결제·비밀번호·찾기)'],
  ['crosswalk', '🚦 횡단보도 (신호·남은 시간·우회전 차·골목길)'],
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
      <div className="row wrap parties">
        <span className="dim small">조건:</span>
        <label className="small">
          플래그 있을 때만{' '}
          <input
            style={{ width: 150 }}
            placeholder="insured, visit:bukchon"
            value={(step.ifFlags ?? []).join(', ')}
            onChange={(e) => onChange({ ...step, ifFlags: splitFlags(e.target.value) })}
          />
        </label>
        <label className="small">
          플래그 없을 때만{' '}
          <input style={{ width: 130 }} placeholder="umbrella" value={(step.unlessFlags ?? []).join(', ')} onChange={(e) => onChange({ ...step, unlessFlags: splitFlags(e.target.value) })} />
        </label>
        <label className="small">
          랜덤 확률{' '}
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            style={{ width: 70 }}
            value={step.chance ?? ''}
            placeholder="1"
            onChange={(e) => onChange({ ...step, chance: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </label>
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
                  <label className="small">
                    선택 시 플래그 설정 (나중 장면/이벤트 조건){' '}
                    <input style={{ width: 200 }} placeholder="insured" value={(o.setFlags ?? []).join(', ')} onChange={(e) => setO({ setFlags: splitFlags(e.target.value) })} />
                  </label>
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

const splitFlags = (v: string) => {
  const a = v.split(',').map((x) => x.trim()).filter(Boolean);
  return a.length ? a : undefined;
};

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
      {sim === 'dayplan' && (
        <>
          <Field label="숙소 (지역 결정: 서울·부산·경주·제주)">
            <Select value={value.hotel ?? 'hotel-myeongdong'} onChange={(hotel) => set({ hotel, places: [] })} options={PLACES.filter((p) => p.visitMin === 0).map((p) => [p.id, `${p.ko} (${p.region ?? 'seoul'})`] as [string, string])} />
          </Field>
          <Field label="출발 장소 · 시각 (비우면 숙소 09:00)">
            <div className="row">
              <Select value={value.startAt ?? ''} onChange={(startAt) => set({ startAt: startAt || undefined })} options={[['', '숙소'], ...PLACES.filter((p) => (p.region ?? 'seoul') === (PLACES.find((h) => h.id === (value.hotel ?? 'hotel-myeongdong'))?.region ?? 'seoul')).map((p) => [p.id, p.ko] as [string, string])]} />
              <input style={{ width: 70 }} placeholder="09:00" value={value.start ?? ''} onChange={(e) => set({ start: e.target.value || undefined })} />
            </div>
          </Field>
          <Field label="요일 (휴무일 판정)">
            <Select value={value.weekday ?? 'Tue'} onChange={(weekday) => set({ weekday: weekday as SimConfig['weekday'] })} options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} />
          </Field>
          <Field label="날씨 이벤트">
            <div className="row wrap">
              <Select value={value.weather?.kind ?? ''} onChange={(kind) => set({ weather: kind ? { kind: kind as 'heat' | 'rain' | 'storm', from: value.weather?.from ?? '13:00', to: value.weather?.to ?? '16:00', text: value.weather?.text ?? '' } : undefined })} options={[['', '없음'], ['heat', '폭염'], ['rain', '비'], ['storm', '태풍 (야외 장소 폐쇄)']]} />
              {value.weather && (
                <>
                  <input style={{ width: 70 }} value={value.weather.from} onChange={(e) => set({ weather: { ...value.weather!, from: e.target.value } })} />
                  ~
                  <input style={{ width: 70 }} value={value.weather.to} onChange={(e) => set({ weather: { ...value.weather!, to: e.target.value } })} />
                  <input placeholder="예보 문구" value={value.weather.text} onChange={(e) => set({ weather: { ...value.weather!, text: e.target.value } })} />
                </>
              )}
            </div>
          </Field>
          <Field label="선택 가능한 장소 (방문 시 visit:장소ID 플래그 → 해당 장면 열림)" wide>
            <div className="row wrap">
              {PLACES.filter((p) => p.visitMin > 0 && (p.region ?? 'seoul') === (PLACES.find((h) => h.id === (value.hotel ?? 'hotel-myeongdong'))?.region ?? 'seoul')).map((p) => (
                <Check
                  key={p.id}
                  checked={(value.places ?? []).includes(p.id)}
                  onChange={(b) => set({ places: b ? [...(value.places ?? []), p.id] : (value.places ?? []).filter((x) => x !== p.id) })}
                  label={`${p.ko} (${p.open}–${p.close}${p.closedOn?.length ? ', 휴무 ' + p.closedOn.join(',') : ''})`}
                />
              ))}
            </div>
            <span className="hint">장소의 영업시간·휴무일·요금은 shared/src/places.ts 에서 관리합니다.</span>
          </Field>
        </>
      )}
      {sim === 'transfer' && (
        <>
          <Field label="출발역 → 도착역">
            <div className="row">
              <Select value={value.fromStation ?? 'myeongdong'} onChange={(fromStation) => set({ fromStation })} options={SUBWAY_STATIONS.map((x) => [x.id, `${x.ko}${x.net === 'busan' ? ' (부산)' : x.net === 'incheon' ? ' (인천)' : ''}`] as [string, string])} />
              →
              <Select value={value.toStation ?? 'seongsu'} onChange={(toStation) => set({ toStation })} options={SUBWAY_STATIONS.filter((x) => (x.net ?? 'seoul') === (SUBWAY_STATIONS.find((f) => f.id === (value.fromStation ?? 'myeongdong'))?.net ?? 'seoul')).map((x) => [x.id, x.ko] as [string, string])} />
            </div>
          </Field>
          <Field label="제한 시간(초)">
            <Num value={value.timeLimit ?? 60} min={20} onChange={(timeLimit) => set({ timeLimit })} />
          </Field>
        </>
      )}
      {sim === 'kiosk' && (
        <>
          <Field label="메뉴">
            <Select value={value.menu ?? 'cafe'} onChange={(menu) => set({ menu: menu as SimConfig['menu'] })} options={[['cafe', '카페'], ['snack', '분식'], ['gukbap', '국밥집 (부산)'], ['pcbang', 'PC방']]} />
          </Field>
          <Field label="옵션">
            <div className="row wrap">
              <Check checked={value.dineIn ?? true} onChange={(dineIn) => set({ dineIn })} label="매장 식사 (해제 시 포장)" />
              <Check checked={!!value.english} onChange={(english) => set({ english })} label="영어 버튼 있음" />
            </div>
          </Field>
          <Field label="주문할 것 (JSON: id, qty, temp ice|hot, size R|L)" wide>
            <JsonEdit value={value.order ?? []} onChange={(order) => set({ order })} rows={5} />
            <span className="hint">카페 id: americano, latte, vanilla, lemonade, greentea, croffle, cheesecake · 분식 id: gimbap, tuna, tteokbokki, ramyeon, sundae, cola</span>
          </Field>
        </>
      )}
      {sim === 'bus' && (
        <>
          <Field label="버스 번호 · 색(노선 종류)">
            <div className="row">
              <input style={{ width: 90 }} value={value.busNo ?? ''} onChange={(e) => set({ busNo: e.target.value })} />
              <Select value={value.busColor ?? 'blue'} onChange={(busColor) => set({ busColor: busColor as SimConfig['busColor'] })} options={Object.entries(BUS_COLORS).map(([k, v]) => [k, `${v.ko} (${k})`] as [string, string])} />
            </div>
          </Field>
          <Field label="정류장 순서 (쉼표로 구분, 첫 번째 = 타는 곳)" wide>
            <input value={(value.stops ?? []).join(', ')} onChange={(e) => set({ stops: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
          </Field>
          <Field label="내릴 정류장">
            <Select value={value.getOff ?? ''} onChange={(getOff) => set({ getOff })} options={[['', '선택'], ...(value.stops ?? []).slice(1).map((x) => [x, x] as [string, string])]} />
          </Field>
        </>
      )}
      {sim === 'ticket' && (
        <>
          <Field label="관광지 (요금표는 shared/src/practice.ts)">
            <Select value={value.site ?? 'palace'} onChange={(site) => set({ site })} options={Object.values(TICKET_SITES).map((x) => [x.id, x.ko] as [string, string])} />
          </Field>
          <Check checked={!!value.hanbok} onChange={(hanbok) => set({ hanbok })} label="일행이 한복을 입고 있음 (한복 무료 장소면 무료 입장이 정답)" />
        </>
      )}
      {sim === 'menu' && (
        <Field label="식당 (메뉴·가격은 shared/src/practice.ts)">
          <Select value={value.restaurant ?? 'bbq'} onChange={(restaurant) => set({ restaurant })} options={Object.values(RESTAURANTS).map((x) => [x.id, x.ko] as [string, string])} />
        </Field>
      )}
      {sim === 'recycle' && (
        <Field label="버릴 물건 (비우면 기본 8개)" wide>
          <div className="row wrap">
            {TRASH.map((t) => (
              <Check key={t.id} checked={(value.trash ?? []).includes(t.id)} onChange={(b) => set({ trash: b ? [...(value.trash ?? []), t.id] : (value.trash ?? []).filter((x) => x !== t.id) })} label={`${t.icon} ${t.ko}`} />
            ))}
          </div>
        </Field>
      )}
      {sim === 'pharmacy' && (
        <Field label="증상">
          <Select value={value.symptom ?? 'cold'} onChange={(symptom) => set({ symptom })} options={Object.values(SYMPTOMS).map((x) => [x.id, x.phrases[0].ko] as [string, string])} />
        </Field>
      )}
      {sim === 'taxi' && (
        <>
          <Field label="목적지 이름 · 한글 주소">
            <div className="row">
              <input value={value.dest ?? ''} onChange={(e) => set({ dest: e.target.value })} />
              <input value={value.addr ?? ''} onChange={(e) => set({ addr: e.target.value })} />
            </div>
          </Field>
          <Field label="예상 요금(₩) · 심야">
            <div className="row">
              <Num value={value.fare ?? 10000} min={4800} onChange={(fare) => set({ fare })} />
              <Check checked={!!value.night} onChange={(night) => set({ night })} label="심야 할증 (22–04시)" />
            </div>
          </Field>
        </>
      )}
      {sim === 'checkin' && (
        <Field label="도어락 비밀번호 · 방 번호(3자리) · 체크아웃">
          <div className="row">
            <input style={{ width: 80 }} value={value.code ?? ''} onChange={(e) => set({ code: e.target.value.replace(/\D/g, '') })} />
            <input style={{ width: 60 }} value={value.room ?? ''} onChange={(e) => set({ room: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
            <input style={{ width: 70 }} value={value.checkout ?? '11:00'} onChange={(e) => set({ checkout: e.target.value })} />
          </div>
        </Field>
      )}
      {sim === 'locker' && (
        <Field label="맡길 짐">
          <Select value={value.bag ?? 'carryon'} onChange={(bag) => set({ bag: bag as SimConfig['bag'] })} options={[['backpack', '배낭 (소형)'], ['carryon', '기내용 캐리어 (중형)'], ['large', '큰 캐리어 (대형)']]} />
        </Field>
      )}
      {sim === 'phrase' && (
        <Field label="문장 (JSON: ko, roman, en, extra=헷갈리게 할 단어)" wide>
          <JsonEdit value={value.phrases ?? []} onChange={(phrases) => set({ phrases })} rows={8} />
        </Field>
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
