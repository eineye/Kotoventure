import { useEffect, useMemo, useState } from 'react';
import { tr } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo, type Member } from '../repo';
import { Check, Field, Modal, Select, fmtDate, useToast } from '../ui';

export function Members() {
  const { content } = useContent();
  const toast = useToast();
  const [list, setList] = useState<Member[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'banned' | 'paid'>('all');
  const [edit, setEdit] = useState<Member | null>(null);

  const load = () => repo.listMembers().then(setList).catch((e) => toast('회원 목록 실패: ' + e.message, 'err'));
  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(
    () =>
      list.filter((m) => {
        if (q && !`${m.nickname} ${m.country} ${m.id}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (filter === 'admin') return m.role === 'admin';
        if (filter === 'banned') return m.is_banned;
        if (filter === 'paid') return m.entitlements.some((e) => e.product_id !== 'app_base');
        return true;
      }),
    [list, q, filter],
  );

  const exportCsv = () => {
    const rows = [['id', 'nickname', 'country', 'party', 'role', 'banned', 'created_at', 'last_seen_at', 'entitlements', 'completed']];
    for (const m of shown)
      rows.push([m.id, m.nickname, m.country ?? '', m.party_type ?? '', m.role, String(m.is_banned), m.created_at, m.last_seen_at ?? '', m.entitlements.map((e) => e.product_id).join('|'), m.progress.filter((p) => p.completed_at).map((p) => p.course_id).join('|')]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    a.download = `kotoventure-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="page-head">
        <h2>회원관리</h2>
        <div className="row">
          <input placeholder="닉네임·국가·ID 검색" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={filter} onChange={setFilter} options={[['all', '전체'], ['admin', '관리자'], ['banned', '정지'], ['paid', '추가 구매자']]} />
          <button className="ghost" onClick={exportCsv}>
            CSV 내보내기
          </button>
        </div>
      </div>
      <p className="dim">
        앱 회원가입은 닉네임+국가만 받는 익명 계정입니다. 총 {list.length}명 · 표시 {shown.length}명
      </p>
      <table>
        <thead>
          <tr>
            <th>닉네임</th>
            <th>국가</th>
            <th>여행타입</th>
            <th>권한</th>
            <th>구매/권한</th>
            <th>진행</th>
            <th>가입</th>
            <th>최근 접속</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {shown.map((m) => (
            <tr key={m.id} className={m.is_banned ? 'banned' : ''}>
              <td>
                <b>{m.nickname}</b>
                {m.is_banned && <span className="tag bad">정지</span>}
                <div className="dim small mono">{m.id.slice(0, 8)}…</div>
              </td>
              <td>{m.country ?? '–'}</td>
              <td>{m.party_type ?? '–'}</td>
              <td>{m.role === 'admin' ? <span className="tag ok">admin</span> : 'user'}</td>
              <td>
                {m.entitlements.map((e) => (
                  <span key={e.product_id} className="tag" title={e.source}>
                    {e.product_id}
                  </span>
                ))}
              </td>
              <td>
                {m.progress.filter((p) => p.completed_at).length} 완료 / {m.progress.length} 시작
              </td>
              <td className="small">{fmtDate(m.created_at)}</td>
              <td className="small">{fmtDate(m.last_seen_at)}</td>
              <td>
                <button className="small" onClick={() => setEdit(m)}>
                  관리
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {edit && (
        <MemberModal
          m={edit}
          products={content.products.map((p) => [p.id, `${p.id} – ${tr(p.title, 'ko')}`] as [string, string])}
          courses={Object.fromEntries(content.courses.map((c) => [c.id, tr(c.title, 'ko')]))}
          onClose={() => setEdit(null)}
          onChanged={async () => {
            const fresh = await repo.listMembers();
            setList(fresh);
            setEdit(fresh.find((x) => x.id === edit.id) ?? null);
          }}
        />
      )}
    </div>
  );
}

function MemberModal({ m, products, courses, onClose, onChanged }: { m: Member; products: [string, string][]; courses: Record<string, string>; onClose: () => void; onChanged: () => Promise<void> }) {
  const toast = useToast();
  const [role, setRole] = useState(m.role);
  const [banned, setBanned] = useState(m.is_banned);
  const [memo, setMemo] = useState(m.memo ?? '');
  const [grantId, setGrantId] = useState(products[0]?.[0] ?? '');

  const run = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
      toast('✔ ' + label);
      await onChanged();
    } catch (e: any) {
      toast('✖ ' + label + ': ' + e.message, 'err');
    }
  };

  return (
    <Modal title={`회원: ${m.nickname}`} onClose={onClose} wide>
      <div className="grid2">
        <Field label="권한">
          <Select value={role} onChange={setRole} options={[['user', '일반 사용자'], ['admin', '관리자']]} />
        </Field>
        <Field label="상태">
          <Check checked={banned} onChange={setBanned} label="이용 정지" />
        </Field>
        <Field label="관리자 메모" wide>
          <textarea rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} />
        </Field>
      </div>
      <button onClick={() => run('회원 정보 저장', () => repo.updateMember(m.id, { role, is_banned: banned, memo: memo || null }))}>저장</button>

      <h4>구매·이용 권한 (Entitlements)</h4>
      <div className="row wrap">
        {m.entitlements.map((e) => (
          <span key={e.product_id} className="tag">
            {e.product_id} <small>({e.source})</small>{' '}
            <button className="link" onClick={() => run('권한 회수', () => repo.revoke(m.id, e.product_id))}>
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="row">
        <Select value={grantId} onChange={setGrantId} options={products} />
        <button className="ghost" onClick={() => run('권한 부여', () => repo.grant(m.id, grantId))}>
          + 수동 부여 (CS·이벤트·테스트)
        </button>
      </div>

      <h4>미션 진행 기록</h4>
      {m.progress.length === 0 && <p className="dim">기록 없음</p>}
      <table>
        <tbody>
          {m.progress.map((p) => (
            <tr key={p.course_id}>
              <td>{courses[p.course_id] ?? p.course_id}</td>
              <td>{p.completed_at ? `✅ 완료 ${fmtDate(p.completed_at)}` : `진행 중 (장면 ${p.scene_index + 1})`}</td>
              <td>최고점 {p.best_score ?? '–'}</td>
              <td>{p.plays}회</td>
              <td>
                <button className="link" onClick={() => confirm('이 코스 진행 기록을 초기화할까요?') && run('진행 초기화', () => repo.resetProgress(m.id, p.course_id))}>
                  초기화
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="red">위험 구역</h4>
      <button
        className="danger"
        onClick={() =>
          confirm(`'${m.nickname}' 회원 프로필과 진행·구매 기록을 삭제합니다. 계속할까요?`) &&
          run('회원 삭제', async () => {
            await repo.deleteMember(m.id);
            onClose();
          })
        }
      >
        회원 삭제
      </button>
      {repo.mode === 'supabase' && <p className="hint">로그인 계정(auth.users) 자체 삭제는 Supabase 대시보드 → Authentication 에서 진행하세요.</p>}
    </Modal>
  );
}
