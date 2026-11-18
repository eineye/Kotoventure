import { useState } from 'react';
import { PROP_IDS, TOPICS, tr, type KnowledgeCard, type TopicId } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo } from '../repo';
import { Field, LText, Modal, Select } from '../ui';

const blank = (): KnowledgeCard => ({ id: '', topic: 'transport', title: { en: '' }, body: { en: '' }, tips: [] });

export function Cards() {
  const { content, act } = useContent();
  const [topic, setTopic] = useState<TopicId | ''>('');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<{ card: KnowledgeCard; isNew: boolean } | null>(null);

  const usedIn = (id: string) =>
    content.courses.filter((c) => c.scenes.some((s) => s.steps.some((st) => (st.type === 'card' && st.cardId === id) || (st.type === 'choice' && st.cardId === id)))).map((c) => c.id);

  const list = content.cards.filter((c) => (!topic || c.topic === topic) && (!q || JSON.stringify(c).toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <div className="page-head">
        <h2>지식카드</h2>
        <div className="row">
          <input placeholder="검색" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={topic} onChange={setTopic} options={[['', '전체 주제'], ...TOPICS.map((t) => [t.id, `${t.icon} ${t.name.ko}`] as [TopicId, string])]} />
          <button onClick={() => setEdit({ card: blank(), isNew: true })}>+ 새 카드</button>
        </div>
      </div>
      <p className="dim">여행자가 꼭 알아야 할 실제 정보입니다. 요금·규정이 바뀌면 여기서 수정하세요 (앱은 다음 실행 시 자동 갱신).</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>주제</th>
            <th>제목</th>
            <th>그림</th>
            <th>표현</th>
            <th>사용 코스</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => {
            const used = usedIn(c.id);
            const t = TOPICS.find((x) => x.id === c.topic)!;
            return (
              <tr key={c.id}>
                <td className="mono small">{c.id}</td>
                <td>
                  <span className="tag" style={{ borderColor: t.color, color: t.color }}>
                    {t.icon} {t.name.ko}
                  </span>
                </td>
                <td>
                  <b>{tr(c.title, 'ko')}</b>
                  <div className="dim small clamp">{c.body.en}</div>
                </td>
                <td className="small">{c.prop ?? '–'}</td>
                <td className="small">{c.phrase?.hangul ?? '–'}</td>
                <td className="small">{used.length ? used.join(', ') : <span className="warn-text">미사용</span>}</td>
                <td className="nowrap">
                  <button className="small" onClick={() => setEdit({ card: JSON.parse(JSON.stringify(c)), isNew: false })}>
                    편집
                  </button>{' '}
                  <button
                    className="small danger"
                    onClick={() => {
                      if (used.length) return alert(`사용 중인 코스가 있어 삭제할 수 없습니다: ${used.join(', ')}`);
                      if (confirm('삭제할까요?')) act('카드 삭제', () => repo.deleteCard(c.id));
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {edit && <CardModal init={edit.card} isNew={edit.isNew} onClose={() => setEdit(null)} />}
    </div>
  );
}

function CardModal({ init, isNew, onClose }: { init: KnowledgeCard; isNew: boolean; onClose: () => void }) {
  const { content, act } = useContent();
  const [c, setC] = useState(init);
  const set = (p: Partial<KnowledgeCard>) => setC((x) => ({ ...x, ...p }));
  const save = async () => {
    if (!c.id || !c.title.en) return alert('ID와 영어 제목은 필수입니다.');
    if (isNew && content.cards.some((x) => x.id === c.id)) return alert('이미 존재하는 ID입니다.');
    if (await act('카드 저장', () => repo.saveCard(c))) onClose();
  };
  return (
    <Modal title={isNew ? '새 지식카드' : `카드 편집: ${c.id}`} onClose={onClose} wide>
      <div className="grid2">
        <Field label="ID" hint="예: tr-subway, fo-naengmyeon">
          <input value={c.id} disabled={!isNew} onChange={(e) => set({ id: e.target.value.trim() })} />
        </Field>
        <Field label="주제">
          <Select value={c.topic} onChange={(topic) => set({ topic })} options={TOPICS.map((t) => [t.id, `${t.icon} ${t.name.ko}`] as [TopicId, string])} />
        </Field>
        <Field label="제목" wide>
          <LText value={c.title} onChange={(title) => set({ title })} />
        </Field>
        <Field label="본문" wide>
          <LText multiline value={c.body} onChange={(body) => set({ body })} />
        </Field>
        <Field label="그림(prop)">
          <Select value={c.prop ?? ''} onChange={(prop) => set({ prop: prop || undefined })} options={[['', '(없음)'], ...PROP_IDS.map((p) => [p, p] as [string, string])]} />
        </Field>
        <Field label="한국어 표현 (한글 / 로마자 / 뜻)">
          <div className="row">
            {(['hangul', 'roman', 'meaning'] as const).map((k) => (
              <input
                key={k}
                placeholder={k}
                value={c.phrase?.[k] ?? ''}
                onChange={(e) => {
                  const ph = { hangul: '', roman: '', meaning: '', ...c.phrase, [k]: e.target.value };
                  set({ phrase: ph.hangul || ph.roman || ph.meaning ? ph : undefined });
                }}
              />
            ))}
          </div>
        </Field>
        <Field label="팁" wide>
          {(c.tips ?? []).map((tip, i) => (
            <div key={i} className="row">
              <div style={{ flex: 1 }}>
                <LText value={tip} onChange={(v) => set({ tips: (c.tips ?? []).map((x, k) => (k === i ? v : x)) })} />
              </div>
              <button className="link red" onClick={() => set({ tips: (c.tips ?? []).filter((_, k) => k !== i) })}>
                삭제
              </button>
            </div>
          ))}
          <button className="ghost small" onClick={() => set({ tips: [...(c.tips ?? []), { en: '' }] })}>
            + 팁 추가
          </button>
        </Field>
      </div>
      <button onClick={save}>저장</button>
    </Modal>
  );
}
