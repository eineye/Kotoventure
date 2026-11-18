import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ContentBundle } from '@kotoventure/shared';
import { demoRepo, repo } from './repo';
import { useToast } from './ui';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Categories } from './pages/Categories';
import { Courses } from './pages/Courses';
import { Cards } from './pages/Cards';
import { Products } from './pages/Products';
import { Settings } from './pages/Settings';

interface Ctx {
  content: ContentBundle;
  reload: () => Promise<void>;
  /** run a repo call with toast + reload */
  act: (label: string, fn: () => Promise<unknown>) => Promise<boolean>;
}
const ContentCtx = createContext<Ctx | null>(null);
export const useContent = () => useContext(ContentCtx)!;

const PAGES = [
  ['dashboard', '📊 대시보드'],
  ['members', '👥 회원관리'],
  ['courses', '🗺️ 미션·코스'],
  ['cards', '📖 지식카드'],
  ['categories', '🏷️ 미션 분류'],
  ['products', '💳 상품·인앱'],
  ['settings', '⚙️ 앱 설정'],
] as const;
type Page = (typeof PAGES)[number][0];

const pageFromHash = (): Page => {
  const h = window.location.hash.replace('#/', '') as Page;
  return PAGES.some(([p]) => p === h) ? h : 'dashboard';
};

export function App() {
  const toast = useToast();
  const [user, setUser] = useState<{ email: string } | null | undefined>(undefined);
  const [content, setContent] = useState<ContentBundle | null>(null);
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    repo.session().then(setUser);
    const h = () => setPage(pageFromHash());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const reload = useCallback(async () => {
    try {
      setContent(await repo.loadContent());
    } catch (e: any) {
      toast('콘텐츠 로드 실패: ' + e.message, 'err');
    }
  }, [toast]);

  useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  const act = useCallback(
    async (label: string, fn: () => Promise<unknown>) => {
      try {
        await fn();
        toast(`✔ ${label}`);
        await reload();
        return true;
      } catch (e: any) {
        toast(`✖ ${label}: ${e.message}`, 'err');
        return false;
      }
    },
    [toast, reload],
  );

  if (user === undefined) return null;
  if (!user) return <Login onLogin={setUser} />;
  if (!content) return <div className="loading">불러오는 중…</div>;

  return (
    <ContentCtx.Provider value={{ content, reload, act }}>
      <div className="layout">
        <aside className="side">
          <div className="brand">
            <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" width={32} height={32} />
            <div>
              <b>Kotoventure</b>
              <small>Admin</small>
            </div>
          </div>
          <nav>
            {PAGES.map(([id, label]) => (
              <a key={id} href={`#/${id}`} className={page === id ? 'active' : ''}>
                {label}
              </a>
            ))}
          </nav>
          <div className="side-foot">
            <div className={'mode ' + repo.mode}>{repo.mode === 'demo' ? '● 데모 모드 (localStorage)' : '● Supabase 연결됨'}</div>
            <div className="who">{user.email}</div>
            {demoRepo && (
              <button
                className="ghost small"
                onClick={() => {
                  if (confirm('데모 데이터를 초기 시드로 되돌릴까요?')) {
                    demoRepo?.resetDemo();
                    reload();
                  }
                }}
              >
                데모 데이터 초기화
              </button>
            )}
            <button
              className="ghost small"
              onClick={async () => {
                await repo.signOut();
                setUser(null);
              }}
            >
              로그아웃
            </button>
          </div>
        </aside>
        <main className="main">
          {page === 'dashboard' && <Dashboard />}
          {page === 'members' && <Members />}
          {page === 'courses' && <Courses />}
          {page === 'cards' && <Cards />}
          {page === 'categories' && <Categories />}
          {page === 'products' && <Products />}
          {page === 'settings' && <Settings />}
        </main>
      </div>
    </ContentCtx.Provider>
  );
}
