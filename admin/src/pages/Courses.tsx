import { useMemo, useState } from 'react';
import {
  AREAS,
  BACKGROUND_IDS,
  PROP_IDS,
  PARTY_TYPES,
  TOPICS,
  courseTopics,
  tr,
  validateBundle,
  type Course,
  type Gateway,
  type PartyType,
  type Scene,
  type Step,
} from '@kotoventure/shared';
import { useContent } from '../App';
import { repo } from '../repo';
import { Check, Field, JsonEdit, LText, Num, Select, slug } from '../ui';
import { STEP_TYPES, StepEditor, blankStep, stepSummary } from './StepEditor';

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const bgOptions = BACKGROUND_IDS.map((b) => [b, b] as [string, string]);

const newCourse = (categoryId: string, n: number): Course => ({
  id: `new-course-${n}`,
  categoryId,
  title: { en: 'New mission', ko: '새 미션' },
  subtitle: { en: '3 nights / 4 days', ko: '3박4일' },
  description: { en: '' },
  region: { en: 'Seoul', ko: '서울' },
  entry: { kind: 'airport', code: 'ICN', name: { en: 'Incheon International Airport', ko: '인천국제공항' } },
  exit: { kind: 'airport', code: 'ICN', name: { en: 'Incheon International Airport', ko: '인천국제공항' } },
  nights: 3,
  days: 4,
  difficulty: 1,
  partyFit: { solo: 3, couple: 3, friends: 3, group: 3 },
  partyTips: {},
  startBudget: 500000,
  coverBg: 'airport',
  access: 'iap',
  isPublished: false,
  version: 1,
  sortOrder: 99,
  scenes: [
    {
      id: 'sc-1',
      day: 1,
      title: { en: 'Arrival', ko: '도착' },
      location: { en: 'Airport', ko: '공항' },
      bg: 'airport',
      steps: [{ type: 'narration', text: { en: 'You land in Korea…' } }],
    },
  ],
});

export function Courses() {
  const { content, act } = useContent();
  const [editing, setEditing] = useState<{ course: Course; originalId?: string } | null>(null);
  const [areaFilter, setAreaFilter] = useState('');

  if (editing)
    return (
      <CourseEditor
        initial={editing.course}
        originalId={editing.originalId}
        onClose={() => setEditing(null)}
        onSaved={(c) => setEditing({ course: c, originalId: c.id })}
      />
    );

  return (
    <div>
      <div className="page-head">
        <h2>미션·코스</h2>
        <button onClick={() => setEditing({ course: newCourse(content.categories[0]?.id ?? 'sightseeing', content.courses.length + 1) })}>+ 새 코스</button>
      </div>
      <div className="row wrap" style={{ margin: '8px 0' }}>
        {[['', '전체'], ...AREAS.map((a) => [a.id, `${a.icon} ${a.name.ko}`])].map(([id, label]) => (
          <button key={id} className={areaFilter === id ? '' : 'ghost'} onClick={() => setAreaFilter(id)}>
            {label} ({content.courses.filter((c) => !id || c.area === id).length})
          </button>
        ))}
      </div>
      <p className="dim">모든 코스는 공항/항구에서 출발해야 하며, 교통·숙박·음식·돈·생활예절·법규·날씨·의료 8개 주제를 모두 포함해야 공개 검증을 통과합니다.</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>코스</th>
            <th>지역</th>
            <th>분류</th>
            <th>출발 → 도착</th>
            <th>일정</th>
            <th>장면</th>
            <th>주제</th>
            <th>판매</th>
            <th>버전</th>
            <th>공개</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[...content.courses]
            .filter((c) => !areaFilter || c.area === areaFilter)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c) => (
              <tr key={c.id}>
                <td>{c.sortOrder}</td>
                <td>
                  <b>{tr(c.title, 'ko')}</b>
                  <div className="dim small">{c.id}</div>
                </td>
                <td>{AREAS.find((a) => a.id === c.area)?.name.ko ?? '–'}</td>
                <td>{tr(content.categories.find((x) => x.id === c.categoryId)?.name, 'ko')}</td>
                <td>
                  {c.entry.kind === 'airport' ? '✈' : '⚓'}
                  {c.entry.code} → {c.exit.code}
                </td>
                <td>
                  {c.nights}박{c.days}일
                </td>
                <td>{c.scenes.length}</td>
                <td>{courseTopics(c, content.cards).size}/8</td>
                <td>{c.access === 'base' ? '기본($0.99)' : `인앱 ${c.productId ?? '(미지정)'}`}</td>
                <td>v{c.version}</td>
                <td>
                  <Check checked={c.isPublished} onChange={(b) => act(b ? '공개' : '비공개', () => repo.saveCourse({ ...c, isPublished: b }))} label="" />
                </td>
                <td className="nowrap">
                  <button className="small" onClick={() => setEditing({ course: clone(c), originalId: c.id })}>
                    편집
                  </button>{' '}
                  <button
                    className="small ghost"
                    onClick={() => act('복제', () => repo.saveCourse({ ...clone(c), id: c.id + '-copy', isPublished: false, title: { ...c.title, en: c.title.en + ' (copy)' } }))}
                  >
                    복제
                  </button>{' '}
                  <button className="small danger" onClick={() => confirm(`'${tr(c.title, 'ko')}' 코스를 삭제할까요? 플레이어 진행 기록도 삭제됩니다.`) && act('삭제', () => repo.deleteCourse(c.id))}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function GatewayEdit({ value, onChange }: { value: Gateway; onChange: (g: Gateway) => void }) {
  return (
    <div className="gateway">
      <div className="row">
        <Select value={value.kind} onChange={(kind) => onChange({ ...value, kind })} options={[['airport', '✈ 공항'], ['port', '⚓ 항구']]} />
        <input placeholder="코드 (ICN, PUS, BUSAN-PORT…)" value={value.code} onChange={(e) => onChange({ ...value, code: e.target.value.toUpperCase() })} />
      </div>
      <LText value={value.name} onChange={(name) => onChange({ ...value, name })} placeholder="Incheon International Airport" />
    </div>
  );
}

function CourseEditor({ initial, originalId, onClose, onSaved }: { initial: Course; originalId?: string; onClose: () => void; onSaved: (c: Course) => void }) {
  const { content, act } = useContent();
  const [c, setC] = useState<Course>(() => clone(initial));
  const [tab, setTab] = useState<'meta' | 'scenes' | 'json'>('meta');
  const [sel, setSel] = useState(0);
  const [bump, setBump] = useState(false);
  const dirty = JSON.stringify(c) !== JSON.stringify(initial);
  const set = (patch: Partial<Course>) => setC((x) => ({ ...x, ...patch }));

  const issues = useMemo(
    () => validateBundle({ ...content, courses: [c] }, { props: new Set(PROP_IDS), bgs: new Set(BACKGROUND_IDS) }).filter((i) => i.where.startsWith(c.id)),
    [c, content],
  );
  const topics = courseTopics(c, content.cards);

  const save = async () => {
    const errors = issues.filter((i) => i.level === 'error');
    if (c.isPublished && errors.length && !confirm(`검증 오류 ${errors.length}건이 있습니다. 그래도 공개 상태로 저장할까요?`)) return;
    const next = bump ? { ...c, version: c.version + 1 } : c;
    if (await act('코스 저장', () => repo.saveCourse(next, originalId))) {
      setBump(false);
      setC(next);
      onSaved(next);
    }
  };

  const scene = c.scenes[sel];
  const setScene = (patch: Partial<Scene>) => set({ scenes: c.scenes.map((s, i) => (i === sel ? { ...s, ...patch } : s)) });
  const moveScene = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= c.scenes.length) return;
    const arr = [...c.scenes];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set({ scenes: arr });
    setSel(j);
  };
  const setSteps = (steps: Step[]) => setScene({ steps });

  return (
    <div className="editor">
      <div className="page-head sticky">
        <div>
          <button className="ghost small" onClick={() => (!dirty || confirm('저장하지 않은 변경 사항이 있습니다. 나갈까요?')) && onClose()}>
            ← 목록
          </button>
          <h2 style={{ display: 'inline', marginLeft: 12 }}>{tr(c.title, 'ko')}</h2>
          {dirty && <span className="tag warn">수정됨</span>}
        </div>
        <div className="row">
          <Check checked={bump} onChange={setBump} label={`저장 시 버전 올리기 (v${c.version}→v${c.version + 1}, 진행 중 플레이어 처음부터)`} />
          <button onClick={save} disabled={!dirty && !bump}>
            저장
          </button>
        </div>
      </div>

      <div className="tabs">
        {(
          [
            ['meta', '기본 정보'],
            ['scenes', `장면·스텝 (${c.scenes.length})`],
            ['json', 'JSON'],
          ] as const
        ).map(([id, l]) => (
          <button key={id} className={tab === id ? 'tab active' : 'tab'} onClick={() => setTab(id)}>
            {l}
          </button>
        ))}
        <span className="topics">
          {TOPICS.map((t) => (
            <span key={t.id} className={'tag ' + (topics.has(t.id) ? 'ok' : 'bad')} title={t.name.en}>
              {t.icon} {t.name.ko}
            </span>
          ))}
        </span>
      </div>

      {issues.length > 0 && (
        <ul className="issues">
          {issues.map((i, k) => (
            <li key={k} className={i.level}>
              {i.level === 'error' ? '✖' : '⚠'} <code>{i.where}</code> {i.msg}
            </li>
          ))}
        </ul>
      )}

      {tab === 'meta' && (
        <div className="grid2">
          <Field label="코스 ID (영문 slug)" hint="앱 진행 기록의 키입니다. 공개 후에는 바꾸지 마세요.">
            <input value={c.id} onChange={(e) => set({ id: slug(e.target.value) || e.target.value })} />
          </Field>
          <Field label="미션 분류">
            <Select value={c.categoryId} onChange={(categoryId) => set({ categoryId })} options={content.categories.map((x) => [x.id, `${x.icon} ${tr(x.name, 'ko')}`] as [string, string])} />
          </Field>
          <Field label="제목" wide>
            <LText value={c.title} onChange={(title) => set({ title })} />
          </Field>
          <Field label="부제" wide>
            <LText value={c.subtitle} onChange={(subtitle) => set({ subtitle })} />
          </Field>
          <Field label="설명" wide>
            <LText multiline value={c.description} onChange={(description) => set({ description })} />
          </Field>
          <Field label="지역">
            <LText value={c.region} onChange={(region) => set({ region })} />
          </Field>
          <Field label="커버 배경">
            <Select value={c.coverBg} onChange={(coverBg) => set({ coverBg })} options={bgOptions} />
          </Field>
          <Field label="출발 (공항/항구 필수)">
            <GatewayEdit value={c.entry} onChange={(entry) => set({ entry })} />
          </Field>
          <Field label="도착">
            <GatewayEdit value={c.exit} onChange={(exit) => set({ exit })} />
          </Field>
          <Field label="지역 (미션 목록 필터)">
            <Select value={c.area ?? ''} onChange={(area) => set({ area: (area || undefined) as Course['area'] })} options={[['', '미지정'], ...AREAS.map((a) => [a.id, `${a.icon} ${a.name.ko}`] as [string, string])]} />
          </Field>
          <Field label="일정">
            <div className="row">
              <Num value={c.nights} min={0} onChange={(nights) => set({ nights })} /> 박 <Num value={c.days} min={1} onChange={(days) => set({ days })} /> 일
            </div>
          </Field>
          <Field label="난이도 (1~3) / 시작 예산(₩)">
            <div className="row">
              <Num value={c.difficulty} min={1} max={3} onChange={(difficulty) => set({ difficulty })} />
              <Num value={c.startBudget} step={10000} onChange={(startBudget) => set({ startBudget })} />
            </div>
          </Field>
          <Field label="여행 타입별 적합도 (1~5, 추천 정렬에 사용)" wide>
            <div className="row">
              {PARTY_TYPES.map((p) => (
                <label key={p.id}>
                  {p.name.ko}{' '}
                  <Num value={c.partyFit[p.id]} min={1} max={5} onChange={(n) => set({ partyFit: { ...c.partyFit, [p.id]: n } })} />
                </label>
              ))}
            </div>
          </Field>
          {PARTY_TYPES.map((p) => (
            <Field key={p.id} label={`팁: ${p.name.ko}`} wide>
              <LText
                value={c.partyTips[p.id as PartyType]}
                onChange={(v) => set({ partyTips: { ...c.partyTips, [p.id]: v } })}
              />
            </Field>
          ))}
          <Field label="판매 방식">
            <Select value={c.access} onChange={(access) => set({ access })} options={[['base', '기본 포함 (앱 구매 $0.99)'], ['iap', '인앱 결제 (추가 미션)']]} />
          </Field>
          <Field label="인앱 상품">
            <Select value={c.productId ?? ''} onChange={(productId) => set({ productId: productId || undefined })} options={[['', '(없음)'], ...content.products.map((p) => [p.id, `${p.id} ($${p.priceUsd})`] as [string, string])]} />
          </Field>
          <Field label="정렬 순서">
            <Num value={c.sortOrder} onChange={(sortOrder) => set({ sortOrder })} />
          </Field>
          <Field label="공개">
            <Check checked={c.isPublished} onChange={(isPublished) => set({ isPublished })} label="앱에 공개" />
          </Field>
        </div>
      )}

      {tab === 'scenes' && (
        <div className="scenes">
          <div className="scene-list">
            {c.scenes.map((s, i) => (
              <div key={s.id + i} className={'scene-item' + (i === sel ? ' active' : '')} onClick={() => setSel(i)}>
                <span className="dim small">
                  Day {s.day} · {i + 1}
                </span>
                <b>{tr(s.title, 'ko')}</b>
                <span className="dim small">
                  {s.bg} · {s.steps.length} steps
                </span>
                <span className="scene-ctl">
                  <button className="link" onClick={(e) => (e.stopPropagation(), moveScene(i, -1))}>
                    ↑
                  </button>
                  <button className="link" onClick={(e) => (e.stopPropagation(), moveScene(i, 1))}>
                    ↓
                  </button>
                </span>
              </div>
            ))}
            <button
              className="ghost small"
              onClick={() => {
                const n = c.scenes.length + 1;
                const last = c.scenes[c.scenes.length - 1];
                set({ scenes: [...c.scenes, { id: `sc-${Date.now().toString(36)}`, day: last?.day ?? 1, title: { en: `Scene ${n}`, ko: `장면 ${n}` }, location: { en: '' }, bg: 'street', steps: [] }] });
                setSel(c.scenes.length);
              }}
            >
              + 장면 추가
            </button>
          </div>

          {scene && (
            <div className="scene-edit">
              <div className="grid2">
                <Field label="장면 ID">
                  <input value={scene.id} onChange={(e) => setScene({ id: e.target.value })} />
                </Field>
                <Field label="Day / 배경">
                  <div className="row">
                    <Num value={scene.day} min={1} onChange={(day) => setScene({ day })} />
                    <Select value={scene.bg} onChange={(bg) => setScene({ bg })} options={bgOptions} />
                  </div>
                </Field>
                <Field label="장면 제목" wide>
                  <LText value={scene.title} onChange={(title) => setScene({ title })} />
                </Field>
                <Field label="장소" wide>
                  <LText value={scene.location} onChange={(location) => setScene({ location })} />
                </Field>
                <Field label="장면 등장 조건 (플래그, 쉼표 구분)" hint="예: visit:bukchon – 일정 짜기에서 해당 장소를 방문했을 때만 등장" wide>
                  <input
                    value={(scene.requires ?? []).join(', ')}
                    onChange={(e) => {
                      const a = e.target.value.split(',').map((x) => x.trim()).filter(Boolean);
                      setScene({ requires: a.length ? a : undefined });
                    }}
                  />
                </Field>
              </div>

              <h4>스텝 ({scene.steps.length}) – 위에서부터 순서대로 진행</h4>
              {scene.steps.map((st, i) => (
                <details key={i} className={'step ' + st.type} open={scene.steps.length < 4}>
                  <summary>
                    <span className="step-type">{STEP_TYPES.find((x) => x[0] === st.type)?.[1]}</span>
                    {st.parties && <span className="tag">{st.parties.join(', ')}</span>}
                    <span className="step-sum">{stepSummary(st)}</span>
                    <span className="step-ctl" onClick={(e) => e.preventDefault()}>
                      <button className="link" disabled={i === 0} onClick={() => setSteps(swap(scene.steps, i, i - 1))}>
                        ↑
                      </button>
                      <button className="link" disabled={i === scene.steps.length - 1} onClick={() => setSteps(swap(scene.steps, i, i + 1))}>
                        ↓
                      </button>
                      <button className="link" onClick={() => setSteps([...scene.steps.slice(0, i + 1), clone(st), ...scene.steps.slice(i + 1)])}>
                        복제
                      </button>
                      <button className="link red" onClick={() => setSteps(scene.steps.filter((_, k) => k !== i))}>
                        삭제
                      </button>
                    </span>
                  </summary>
                  <StepEditor step={st} cards={content.cards} onChange={(ns) => setSteps(scene.steps.map((x, k) => (k === i ? ns : x)))} />
                </details>
              ))}
              <div className="row wrap">
                {STEP_TYPES.map(([type, label]) => (
                  <button key={type} className="ghost small" onClick={() => setSteps([...scene.steps, blankStep(type)])}>
                    + {label}
                  </button>
                ))}
              </div>
              <hr />
              <button
                className="danger small"
                onClick={() => {
                  if (!confirm('이 장면을 삭제할까요?')) return;
                  set({ scenes: c.scenes.filter((_, i) => i !== sel) });
                  setSel(Math.max(0, sel - 1));
                }}
              >
                장면 삭제
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'json' && (
        <div>
          <p className="dim">고급: 코스 전체를 JSON으로 편집/붙여넣기 할 수 있습니다. (유효한 JSON만 반영)</p>
          <JsonEdit value={c} onChange={setC} rows={30} />
        </div>
      )}
    </div>
  );
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  const a = [...arr];
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}
