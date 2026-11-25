import { useState } from 'react';
import { SEED_BUNDLE } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo } from '../repo';

/**
 * Upload the content bundled with the app (missions, cards, categories, products, settings, picks)
 * to the Supabase server. "Missing only" never overwrites what editors changed on the server.
 */
export function SeedUpload() {
  const { content, reload } = useContent();
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  if (repo.mode !== 'supabase') return null;

  const has = {
    categories: new Set(content.categories.map((x) => x.id)),
    cards: new Set(content.cards.map((x) => x.id)),
    products: new Set(content.products.map((x) => x.id)),
    courses: new Set(content.courses.map((x) => x.id)),
    spots: new Set((content.spots ?? []).map((x) => x.id)),
  };
  const b = SEED_BUNDLE;
  const missing = {
    categories: b.categories.filter((x) => !has.categories.has(x.id)),
    cards: b.cards.filter((x) => !has.cards.has(x.id)),
    products: b.products.filter((x) => !has.products.has(x.id)),
    courses: b.courses.filter((x) => !has.courses.has(x.id)),
    spots: (b.spots ?? []).filter((x) => !has.spots.has(x.id)),
  };
  const total = Object.values(missing).reduce((a, l) => a + l.length, 0);

  const run = async (all: boolean) => {
    if (all && !confirm('서버의 미션·카드·분류·상품·추천 장소를 앱 기본값으로 덮어씁니다. 관리자에서 고친 내용이 사라질 수 있어요. 계속할까요?')) return;
    setBusy(true);
    const out: string[] = [];
    const say = (s: string) => {
      out.push(s);
      setLog([...out]);
    };
    try {
      const pick = <T,>(list: T[], miss: T[]) => (all ? list : miss);
      const cats = pick(b.categories, missing.categories);
      for (const x of cats) await repo.saveCategory(x);
      say(`🏷️ 분류 ${cats.length}개`);
      const prods = pick(b.products, missing.products);
      for (const x of prods) await repo.saveProduct(x);
      say(`💳 상품 ${prods.length}개`);
      const cards = pick(b.cards, missing.cards);
      for (const x of cards) await repo.saveCard(x);
      say(`📖 지식카드 ${cards.length}개`);
      const courses = pick(b.courses, missing.courses);
      for (let i = 0; i < courses.length; i++) {
        await repo.saveCourse(courses[i]);
        if (i % 10 === 9 || i === courses.length - 1) say(`🗺️ 미션 ${i + 1}/${courses.length}`);
      }
      if (!courses.length) say('🗺️ 미션 0개');
      const spots = pick(b.spots ?? [], missing.spots);
      for (const x of spots) await repo.saveSpot(x);
      say(`🐦 추천 장소 ${spots.length}개`);
      if (all || content.courses.length === 0) {
        await repo.saveConfig(b.config);
        say('⚙️ 앱 설정');
      }
      say('✅ 완료! 앱을 다시 켜면 서버 내용을 받아요.');
      await reload();
    } catch (e: any) {
      say(`❌ 오류: ${e.message} – 관리자 계정(profiles.role = admin)으로 로그인했는지 확인하세요.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="seed-box">
      <h3>☁️ 기본 콘텐츠를 서버에 올리기</h3>
      <p className="dim">
        앱에 들어 있는 미션·지식카드·분류·상품·추천 장소를 Supabase 서버로 올립니다. 새 서버를 만든 뒤 처음 한 번 실행하세요.
        <br />
        서버에 없는 항목: 분류 {missing.categories.length} · 카드 {missing.cards.length} · 상품 {missing.products.length} · 미션 {missing.courses.length} · 추천 장소 {missing.spots.length}
      </p>
      <div className="row">
        <button disabled={busy || total === 0} onClick={() => run(false)}>
          {busy ? '올리는 중…' : total ? `없는 것만 올리기 (${total}개)` : '모두 올라가 있어요'}
        </button>
        <button className="ghost" disabled={busy} onClick={() => run(true)}>
          전체 덮어쓰기
        </button>
      </div>
      {log.length > 0 && (
        <pre className="seed-log">{log.join('\n')}</pre>
      )}
    </div>
  );
}
