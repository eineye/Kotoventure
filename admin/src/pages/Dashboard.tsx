import { useEffect, useState } from 'react';
import { TOPICS, tr, validateBundle, PROP_IDS, BACKGROUND_IDS, courseTopics } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo, type CourseStats, type Member } from '../repo';

export function Dashboard() {
  const { content } = useContent();
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<CourseStats>({});
  useEffect(() => {
    repo.listMembers().then(setMembers).catch(() => {});
    repo.courseStats().then(setStats).catch(() => {});
  }, []);
  const issues = validateBundle(content, { props: new Set(PROP_IDS), bgs: new Set(BACKGROUND_IDS) });
  const errors = issues.filter((i) => i.level === 'error');
  const weekAgo = Date.now() - 7 * 86400000;

  const kpis = [
    ['총 회원', members.length],
    ['최근 7일 접속', members.filter((m) => m.last_seen_at && new Date(m.last_seen_at).getTime() > weekAgo).length],
    ['공개 코스', content.courses.filter((c) => c.isPublished).length + ' / ' + content.courses.length],
    ['장면(Scene)', content.courses.reduce((n, c) => n + c.scenes.length, 0)],
    ['지식카드', content.cards.length],
    ['콘텐츠 오류', errors.length],
  ] as const;

  return (
    <div>
      <h2>대시보드</h2>
      <div className="kpis">
        {kpis.map(([k, v]) => (
          <div key={k} className={'kpi' + (k === '콘텐츠 오류' && errors.length ? ' bad' : '')}>
            <div className="kpi-v">{v}</div>
            <div className="kpi-k">{k}</div>
          </div>
        ))}
      </div>

      <h3>코스별 현황</h3>
      <table>
        <thead>
          <tr>
            <th>코스</th>
            <th>분류</th>
            <th>출발</th>
            <th>장면</th>
            <th>8대 주제</th>
            <th>플레이어</th>
            <th>완료</th>
            <th>평균 최고점</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {content.courses.map((c) => {
            const s = stats[c.id];
            const tp = courseTopics(c, content.cards);
            return (
              <tr key={c.id}>
                <td>
                  <b>{tr(c.title, 'ko')}</b>
                  <div className="dim small">{c.id}</div>
                </td>
                <td>{tr(content.categories.find((x) => x.id === c.categoryId)?.name, 'ko')}</td>
                <td>
                  {c.entry.kind === 'airport' ? '✈' : '⚓'} {c.entry.code}
                </td>
                <td>{c.scenes.length}</td>
                <td title={TOPICS.filter((t) => !tp.has(t.id)).map((t) => t.name.ko).join(', ')} className={tp.size < 8 ? 'bad' : ''}>
                  {tp.size}/8
                </td>
                <td>{s?.players ?? 0}</td>
                <td>{s?.completions ?? 0}</td>
                <td>{s?.avg ?? '–'}</td>
                <td>{c.isPublished ? <span className="tag ok">공개</span> : <span className="tag">비공개</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {issues.length > 0 && (
        <>
          <h3>콘텐츠 검증</h3>
          <ul className="issues">
            {issues.map((i, k) => (
              <li key={k} className={i.level}>
                {i.level === 'error' ? '✖' : '⚠'} <code>{i.where}</code> {i.msg}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
