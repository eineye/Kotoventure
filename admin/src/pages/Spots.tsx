import { useMemo, useState } from 'react';
import { AREAS, SPOT_CHECKS, SPOT_FEATURES, SPOT_KINDS, SPOT_RECHECK_DAYS, spotNeedsRecheck, tr, type Area, type Spot, type SpotStatus } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo } from '../repo';
import { Check, Field, LText, Modal, Num, Select, slug } from '../ui';

const STATUS: [SpotStatus, string][] = [
  ['draft', '📝 검토 중'],
  ['published', '✅ 게시'],
  ['paused', '⏸ 일시중지'],
];

const today = () => new Date().toISOString().slice(0, 10);

const blank = (n: number): Spot => ({
  id: '', name: { en: '', ko: '' }, kind: 'food', area: 'seoul', addressKo: '', intro: { en: '', ko: '' }, features: [], courseIds: [], sceneIds: [],
  status: 'draft', sponsored: false, checks: [], sortOrder: n + 1,
});

/** Places: hidden restaurants, cafés, shops and spots shown as "Kachi's pick" in the app. */
export function Spots() {
  const { content, act } = useContent();
  const [edit, setEdit] = useState<{ s: Spot; isNew: boolean } | null>(null);
  const [fStatus, setFStatus] = useState<'' | SpotStatus>('');
  const [fArea, setFArea] = useState<'' | Area>('');
  const spots = content.spots ?? [];
  const list = spots.filter((s) => (!fStatus || s.status === fStatus) && (!fArea || s.area === fArea)).sort((a, b) => a.sortOrder - b.sortOrder);
  const recheck = spots.filter((s) => s.status === 'published' && spotNeedsRecheck(s)).length;

  return (
    <div>
      <div className="page-head">
        <h2>추천 장소</h2>
        <button onClick={() => setEdit({ isNew: true, s: blank(spots.length) })}>+ 새 장소</button>
      </div>
      <p className="dim">
        숨은 맛집·카페·쇼핑·명소를 등록하면 앱의 코스 화면, 미션 장면, 여행 키트에 <b>🐦 Kachi 추천</b>으로 나옵니다. 연결 미션을 비워 두면 같은 지역의 모든 미션에 나옵니다.
        유료 제휴 장소는 <b>제휴</b>에 체크하세요 – 앱에 항상 “제휴” 표시가 붙습니다.
      </p>
      {recheck > 0 && <p className="tag warn">⚠️ 게시 중 {recheck}곳이 {SPOT_RECHECK_DAYS}일 넘게 재확인되지 않았어요</p>}
      <div style={{ display: 'flex', gap: 10, margin: '10px 0' }}>
        <Select value={fStatus} onChange={setFStatus} options={[['', '모든 상태'], ...STATUS]} />
        <Select value={fArea} onChange={setFArea} options={[['', '모든 지역'], ...AREAS.map((a) => [a.id, `${a.icon} ${a.name.ko}`] as [Area, string])]} />
        <span className="dim" style={{ alignSelf: 'center' }}>
          {list.length} / {spots.length}곳
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>순서</th>
            <th>종류</th>
            <th>이름</th>
            <th>지역</th>
            <th>연결</th>
            <th>상태</th>
            <th>확인일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => {
            const k = SPOT_KINDS.find((x) => x.id === s.kind);
            return (
              <tr key={s.id}>
                <td>{s.sortOrder}</td>
                <td>
                  {k?.icon} {k?.name.ko}
                </td>
                <td>
                  {tr(s.name, 'ko')} <span className="dim">/ {s.name.en}</span>
                  {s.sponsored && <span className="tag warn">제휴</span>}
                </td>
                <td>{AREAS.find((a) => a.id === s.area)?.name.ko}</td>
                <td className="dim">{s.courseIds.length ? `미션 ${s.courseIds.length}개` : '지역 전체'}{s.sceneIds.length ? ` · 장면 ${s.sceneIds.length}` : ''}</td>
                <td>{STATUS.find(([v]) => v === s.status)?.[1]}</td>
                <td>
                  {s.verifiedAt ?? '–'}
                  {s.status === 'published' && spotNeedsRecheck(s) && <span className="tag bad">재확인</span>}
                </td>
                <td className="nowrap">
                  <button className="small" onClick={() => setEdit({ s: structuredClone(s), isNew: false })}>
                    편집
                  </button>{' '}
                  <button className="small danger" onClick={() => confirm('삭제할까요? (잠시 내리려면 “일시중지”를 쓰세요)') && act('장소 삭제', () => repo.deleteSpot(s.id))}>
                    삭제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {edit && <SpotModal init={edit.s} isNew={edit.isNew} onClose={() => setEdit(null)} />}
    </div>
  );
}

function SpotModal({ init, isNew, onClose }: { init: Spot; isNew: boolean; onClose: () => void }) {
  const { content, act } = useContent();
  const [s, setS] = useState(init);
  const set = (p: Partial<Spot>) => setS((x) => ({ ...x, ...p }));
  const toggle = <T extends string>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const courses = useMemo(() => content.courses.filter((c) => !c.id.startsWith('my-') && (!c.area || c.area === s.area)), [content.courses, s.area]);
  const missingChecks = SPOT_CHECKS.filter((c) => !s.checks.includes(c.id));
  const save = async () => {
    if (!s.id || !s.name.en || !s.addressKo) return alert('ID, 영어 이름, 지도 검색어(한글)는 필수입니다.');
    if (s.status === 'published' && missingChecks.length && !confirm(`검증 항목 ${missingChecks.length}개가 체크되지 않았어요. 그래도 게시할까요?`)) return;
    if ((await act('장소 저장', () => repo.saveSpot(s)))) onClose();
  };
  return (
    <Modal title={isNew ? '새 추천 장소' : '추천 장소 편집'} onClose={onClose} wide>
      <div className="grid2">
        <Field label="ID (영문)">
          <input value={s.id} disabled={!isNew} onChange={(e) => set({ id: slug(e.target.value) })} placeholder="mangwon-tteok-cafe" />
        </Field>
        <Field label="종류">
          <Select value={s.kind} onChange={(kind) => set({ kind })} options={SPOT_KINDS.map((k) => [k.id, `${k.icon} ${k.name.ko}`] as [Spot['kind'], string])} />
        </Field>
      </div>
      <Field label="이름">
        <LText value={s.name} onChange={(name) => set({ name })} />
      </Field>
      <div className="grid2">
        <Field label="지역">
          <Select value={s.area} onChange={(area) => set({ area, courseIds: [] })} options={AREAS.map((a) => [a.id, `${a.icon} ${a.name.ko}`] as [Area, string])} />
        </Field>
        <Field label="지도 검색어 (한글)" hint="네이버·카카오 지도에서 이 단어로 검색합니다 (가게 이름 + 지역 추천)">
          <input value={s.addressKo} onChange={(e) => set({ addressKo: e.target.value })} placeholder="망원동 ○○카페" />
        </Field>
      </div>
      <Field label="소개 (1–2문장)">
        <LText value={s.intro} onChange={(intro) => set({ intro })} multiline />
      </Field>
      <Field label="현지인 팁 (선택)">
        <LText value={s.tip} onChange={(tip) => set({ tip })} multiline />
      </Field>
      <div className="grid2">
        <Field label="가격대">
          <Select value={String(s.priceRange ?? '') as '' | '1' | '2' | '3'} onChange={(v) => set({ priceRange: v ? (Number(v) as 1 | 2 | 3) : undefined })} options={[['', '표시 안 함'], ['1', '₩ 저렴'], ['2', '₩₩ 보통'], ['3', '₩₩₩ 비쌈']]} />
        </Field>
        <Field label="정렬 순서">
          <Num value={s.sortOrder} onChange={(sortOrder) => set({ sortOrder })} />
        </Field>
        <Field label="영업시간 (선택)">
          <input value={s.hours ?? ''} onChange={(e) => set({ hours: e.target.value || undefined })} placeholder="11:00–21:00" />
        </Field>
        <Field label="휴무 (선택)">
          <input value={s.closed ?? ''} onChange={(e) => set({ closed: e.target.value || undefined })} placeholder="월요일" />
        </Field>
      </div>
      <Field label="특징">
        <div>
          {SPOT_FEATURES.map((f) => (
            <Check key={f.id} checked={s.features.includes(f.id)} onChange={() => set({ features: toggle(s.features, f.id) })} label={`${f.icon} ${f.name.ko}`} />
          ))}
        </div>
      </Field>
      <Field label="연결 미션" hint="비워 두면 이 지역의 모든 미션 코스 화면에 나옵니다">
        <div style={{ maxHeight: 150, overflow: 'auto', border: '1px solid var(--line)', borderRadius: 8, padding: 6 }}>
          {courses.map((c) => (
            <Check key={c.id} checked={s.courseIds.includes(c.id)} onChange={() => set({ courseIds: toggle(s.courseIds, c.id) })} label={`${tr(c.title, 'ko')} (${c.id})`} />
          ))}
        </div>
      </Field>
      <Field label="장면에서 ‘근처 추천’으로 띄우기 (선택)" hint="미션 장면 ID를 쉼표로 (예: ic-songdo-f1). 미션 편집 화면에서 장면 ID를 확인할 수 있어요.">
        <input value={s.sceneIds.join(', ')} onChange={(e) => set({ sceneIds: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
      </Field>
      <div className="grid2">
        <Field label="검증 체크리스트" hint="게시 전에 모두 확인하세요">
          <div>
            {SPOT_CHECKS.map((c) => (
              <Check key={c.id} checked={s.checks.includes(c.id)} onChange={() => set({ checks: toggle(s.checks, c.id) })} label={c.name} />
            ))}
          </div>
        </Field>
        <Field label="마지막 확인일" hint={`${SPOT_RECHECK_DAYS}일이 지나면 재확인 표시가 붙어요`}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="date" value={s.verifiedAt ?? ''} onChange={(e) => set({ verifiedAt: e.target.value || undefined })} />
            <button type="button" className="small" onClick={() => set({ verifiedAt: today() })}>
              오늘
            </button>
          </div>
        </Field>
        <Field label="상태">
          <Select value={s.status} onChange={(status) => set({ status })} options={STATUS} />
        </Field>
        <Field label="제휴 (유료)" hint="체크하면 앱에 항상 ‘제휴’ 표시가 붙어요 (표시·광고법)">
          <Check checked={s.sponsored} onChange={(sponsored) => set({ sponsored })} label="유료 제휴 장소" />
        </Field>
      </div>
      <Field label="내부 메모 (앱에 표시 안 됨)">
        <textarea rows={2} value={s.note ?? ''} onChange={(e) => set({ note: e.target.value || undefined })} placeholder="담당자, 연락처, 방문 메모…" />
      </Field>
      <button onClick={save}>저장</button>
    </Modal>
  );
}
