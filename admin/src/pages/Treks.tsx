import { useState } from 'react';
import { AREAS, TREK_MAX_PHOTOS, TREK_POINT_ICON, fmtTrekTime, tr, type Area, type Trek, type TrekPoint, type TrekPointKind, type TrekStatus } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo } from '../repo';
import { Field, LText, Modal, Num, Select, slug } from '../ui';

const STATUS: [TrekStatus, string][] = [
  ['draft', '📝 검토 중'],
  ['published', '✅ 게시'],
  ['paused', '⏸ 일시중지'],
];
const KINDS: [TrekPointKind, string][] = [
  ['start', '🚩 출발'],
  ['view', '👀 전망대'],
  ['beach', '🏖️ 해변'],
  ['rock', '🪨 바위'],
  ['cave', '🕳️ 동굴'],
  ['shop', '🏪 매점'],
  ['rest', '🪑 쉼터'],
  ['spot', '📍 기타'],
  ['end', '🏁 도착'],
];

/** upload limits: original file and the stored (resized) photo */
const MAX_UPLOAD_MB = 15;
const MAX_STORED_KB = 250;
const MAX_SIDE = 1280;

/** Show a stored photo in the admin: bundled photos live in /trek/, uploads are data: URLs. */
const photoUrl = (src: string) => (src.startsWith('asset:') ? `${import.meta.env.BASE_URL}trek/${src.slice(6)}.webp` : src);
const kb = (dataUrl: string) => Math.round((dataUrl.length * 3) / 4 / 1024);

/** Resize in the browser and re-encode as JPEG until it fits MAX_STORED_KB. */
async function compress(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일만 올릴 수 있어요.');
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`파일이 너무 커요 (최대 ${MAX_UPLOAD_MB}MB).`);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('이미지를 읽을 수 없어요.'));
    i.src = URL.createObjectURL(file);
  });
  let side = MAX_SIDE;
  for (let attempt = 0; attempt < 8; attempt++) {
    const k = Math.min(1, side / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    for (const q of [0.82, 0.72, 0.62, 0.52]) {
      const url = c.toDataURL('image/jpeg', q);
      if (kb(url) <= MAX_STORED_KB) return url;
    }
    side = Math.round(side * 0.8);
  }
  throw new Error(`사진을 ${MAX_STORED_KB}KB 이하로 줄이지 못했어요. 더 작은 사진을 써 주세요.`);
}

const blank = (n: number): Trek => ({
  id: '', title: { en: '', ko: '' }, area: 'chungcheong', courseName: { en: '', ko: '' }, addressKo: '', startSearch: '', notice: { en: '', ko: '' }, tips: [],
  points: [{ name: { en: '', ko: '' }, kind: 'start' }, { name: { en: '', ko: '' }, kind: 'end' }], distanceKm: 5, durationMin: 120, difficulty: 2, meal: { en: '', ko: '' },
  photos: [], lat: 36.5, lng: 127.8, status: 'draft', sortOrder: n + 1,
});

/** 🥾 Hidden-gem treks: everything shown on the trek pages of the app. */
export function Treks() {
  const { content, act } = useContent();
  const [edit, setEdit] = useState<{ t: Trek; isNew: boolean } | null>(null);
  const treks = [...(content.treks ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <div>
      <div className="page-head">
        <h2>숨은 명소 트레킹</h2>
        <button onClick={() => setEdit({ isNew: true, t: blank(treks.length) })}>+ 새 코스</button>
      </div>
      <p className="dim">앱의 미션 화면 → 🥾 숨은 명소 트레킹에 나오는 코스입니다. 안내문, 주소·코스 이름, 지점(코스 약도), 거리·시간, 식사, 사진 {TREK_MAX_PHOTOS}장까지 편집할 수 있어요.</p>
      <table>
        <thead>
          <tr>
            <th>순서</th>
            <th>코스</th>
            <th>지역</th>
            <th>거리·시간</th>
            <th>지점</th>
            <th>사진</th>
            <th>상태</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {treks.map((t) => (
            <tr key={t.id}>
              <td>{t.sortOrder}</td>
              <td>
                {tr(t.title, 'ko')}
                <div className="dim">{tr(t.courseName, 'ko')}</div>
              </td>
              <td>{AREAS.find((a) => a.id === t.area)?.name.ko}</td>
              <td>
                {t.distanceKm}km · {fmtTrekTime(t.durationMin, 'ko')}
              </td>
              <td>{t.points.length}곳</td>
              <td>{t.photos.length}장</td>
              <td>{STATUS.find(([v]) => v === t.status)?.[1]}</td>
              <td className="nowrap">
                <button className="small" onClick={() => setEdit({ t: structuredClone(t), isNew: false })}>
                  편집
                </button>{' '}
                <button className="small danger" onClick={() => confirm('이 코스를 삭제할까요? (잠시 내리려면 “일시중지”를 쓰세요)') && act('코스 삭제', () => repo.deleteTrek(t.id))}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {edit && <TrekModal init={edit.t} isNew={edit.isNew} onClose={() => setEdit(null)} />}
    </div>
  );
}

function TrekModal({ init, isNew, onClose }: { init: Trek; isNew: boolean; onClose: () => void }) {
  const { act } = useContent();
  const [t, setT] = useState(init);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<Trek>) => setT((x) => ({ ...x, ...p }));
  const setPoint = (i: number, p: Partial<TrekPoint>) => set({ points: t.points.map((x, k) => (k === i ? { ...x, ...p } : x)) });
  const move = <T,>(arr: T[], i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= arr.length) return arr;
    const c = [...arr];
    [c[i], c[j]] = [c[j], c[i]];
    return c;
  };

  const upload = async (i: number, file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await compress(file);
      const photos = [...t.photos];
      photos[i] = { ...(photos[i] ?? {}), src };
      set({ photos: photos.filter(Boolean) });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!t.id || !t.title.en || !t.title.ko) return alert('ID와 제목(영어·한국어)은 필수입니다.');
    if (!t.addressKo || !t.startSearch) return alert('주소와 출발지 지도 검색어는 필수입니다.');
    if (t.points.length < 2 || t.points.some((p) => !p.name.ko)) return alert('지점은 2곳 이상, 각 지점의 한국어 이름이 필요합니다.');
    if ((await act('코스 저장', () => repo.saveTrek(t)))) onClose();
  };

  return (
    <Modal title={isNew ? '새 트레킹 코스' : '트레킹 코스 편집'} onClose={onClose} wide>
      <div className="grid2">
        <Field label="ID (영문)">
          <input value={t.id} disabled={!isNew} onChange={(e) => set({ id: slug(e.target.value) })} placeholder="taean-solhyang-2" />
        </Field>
        <Field label="상태">
          <Select value={t.status} onChange={(status) => set({ status })} options={STATUS} />
        </Field>
      </div>
      <Field label="제목">
        <LText value={t.title} onChange={(title) => set({ title })} />
      </Field>

      <h3>1. 안내문</h3>
      <Field label="안내 (대중교통·렌트 등 꼭 알아야 할 내용)">
        <LText value={t.notice} onChange={(notice) => set({ notice })} multiline />
      </Field>
      <Field label="팁 목록 (렌트 방법, 주차, 준비물 등)">
        <div>
          {t.tips.map((x, i) => (
            <div key={i} className="row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <LText value={x} onChange={(v) => set({ tips: t.tips.map((y, k) => (k === i ? v : y)) })} multiline />
              </div>
              <button type="button" className="link" onClick={() => set({ tips: move(t.tips, i, -1) })}>
                ↑
              </button>
              <button type="button" className="link" onClick={() => set({ tips: move(t.tips, i, 1) })}>
                ↓
              </button>
              <button type="button" className="link red" onClick={() => set({ tips: t.tips.filter((_, k) => k !== i) })}>
                삭제
              </button>
            </div>
          ))}
          <button type="button" className="ghost small" onClick={() => set({ tips: [...t.tips, { en: '', ko: '' }] })}>
            + 팁 추가
          </button>
        </div>
      </Field>

      <h3>2. 주소·코스 이름</h3>
      <Field label="코스 이름">
        <LText value={t.courseName} onChange={(courseName) => set({ courseName })} />
      </Field>
      <div className="grid2">
        <Field label="정확한 주소 (한글)">
          <input value={t.addressKo} onChange={(e) => set({ addressKo: e.target.value })} placeholder="충청남도 태안군 이원면 내리 만대항" />
        </Field>
        <Field label="지역">
          <Select value={t.area} onChange={(area) => set({ area })} options={AREAS.map((a) => [a.id, `${a.icon} ${a.name.ko}`] as [Area, string])} />
        </Field>
        <Field label="출발지 지도 검색어" hint="네이버·카카오 지도 버튼이 이 단어로 검색해요">
          <input value={t.startSearch} onChange={(e) => set({ startSearch: e.target.value })} placeholder="만대항" />
        </Field>
        <Field label="도착지 지도 검색어 (선택)">
          <input value={t.endSearch ?? ''} onChange={(e) => set({ endSearch: e.target.value || undefined })} placeholder="꾸지나무골해수욕장" />
        </Field>
        <Field label="한국 지도 위치 – 위도" hint="네이버지도에서 장소를 우클릭 → 좌표 복사 (예: 36.96)">
          <input type="number" step="0.01" value={t.lat} onChange={(e) => set({ lat: Number(e.target.value) })} />
        </Field>
        <Field label="한국 지도 위치 – 경도" hint="예: 126.27">
          <input type="number" step="0.01" value={t.lng} onChange={(e) => set({ lng: Number(e.target.value) })} />
        </Field>
      </div>

      <h3>3. 코스 지점 (순서대로 – 앱에서 약도와 체크리스트로 나와요)</h3>
      {t.points.map((p, i) => (
        <div key={i} className="row" style={{ alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <b style={{ width: 22 }}>{i + 1}</b>
          <select value={p.kind} onChange={(e) => setPoint(i, { kind: e.target.value as TrekPointKind })} style={{ width: 110 }}>
            {KINDS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <input style={{ flex: 2 }} value={p.name.ko ?? ''} placeholder="지점 이름 (한국어)" onChange={(e) => setPoint(i, { name: { ...p.name, ko: e.target.value } })} />
          <input style={{ flex: 2 }} value={p.name.en} placeholder="English name" onChange={(e) => setPoint(i, { name: { ...p.name, en: e.target.value } })} />
          <input style={{ flex: 2 }} value={p.note?.ko ?? ''} placeholder="메모 (선택)" onChange={(e) => setPoint(i, { note: e.target.value ? { en: p.note?.en ?? '', ko: e.target.value } : undefined })} />
          <button type="button" className="link" onClick={() => set({ points: move(t.points, i, -1) })}>
            ↑
          </button>
          <button type="button" className="link" onClick={() => set({ points: move(t.points, i, 1) })}>
            ↓
          </button>
          <button type="button" className="link red" onClick={() => set({ points: t.points.filter((_, k) => k !== i) })}>
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="ghost small"
        onClick={() => {
          const pts = [...t.points];
          pts.splice(Math.max(0, pts.length - 1), 0, { name: { en: '', ko: '' }, kind: 'spot' });
          set({ points: pts });
        }}
      >
        + 지점 추가 (도착 앞에)
      </button>
      <p className="dim" style={{ fontSize: 12 }}>
        미리보기: {t.points.map((p) => `${TREK_POINT_ICON[p.kind]} ${p.name.ko || '?'}`).join(' → ')}
      </p>

      <h3>4. 거리·소요 시간</h3>
      <div className="grid2">
        <Field label="거리 (km)">
          <Num value={t.distanceKm} step={0.1} onChange={(distanceKm) => set({ distanceKm })} />
        </Field>
        <Field label={`소요 시간 (분) – ${fmtTrekTime(t.durationMin, 'ko')}`}>
          <Num value={t.durationMin} step={10} onChange={(durationMin) => set({ durationMin })} />
        </Field>
        <Field label="난이도">
          <Select value={String(t.difficulty) as '1' | '2' | '3'} onChange={(v) => set({ difficulty: Number(v) as 1 | 2 | 3 })} options={[['1', '쉬움'], ['2', '보통'], ['3', '어려움']]} />
        </Field>
        <Field label="정렬 순서">
          <Num value={t.sortOrder} onChange={(sortOrder) => set({ sortOrder })} />
        </Field>
      </div>

      <h3>5. 식사</h3>
      <LText value={t.meal} onChange={(meal) => set({ meal })} multiline />

      <h3>
        6. 사진 (최대 {TREK_MAX_PHOTOS}장)
      </h3>
      <p className="dim" style={{ fontSize: 12 }}>
        원본 {MAX_UPLOAD_MB}MB까지 올릴 수 있고, 브라우저에서 긴 변 {MAX_SIDE}px · {MAX_STORED_KB}KB 이하로 자동으로 줄여서 저장해요. 첫 번째 사진이 표지로 쓰여요.
      </p>
      <div className="photo-grid">
        {Array.from({ length: TREK_MAX_PHOTOS }).map((_, i) => {
          const p = t.photos[i];
          if (!p && i > t.photos.length) return null;
          return (
            <div key={i} className="photo-slot">
              {p ? <img src={photoUrl(p.src)} alt="" /> : <div className="photo-empty">사진 {i + 1}</div>}
              <label className="ghost small file-btn">
                {p ? '교체' : '+ 업로드'}
                <input type="file" accept="image/*" disabled={busy} onChange={(e) => upload(i, e.target.files?.[0])} />
              </label>
              {p && (
                <>
                  <span className="dim" style={{ fontSize: 11 }}>{p.src.startsWith('asset:') ? '앱 내장 사진' : `${kb(p.src)}KB`}</span>
                  <input placeholder="설명 (한국어)" value={p.caption?.ko ?? ''} onChange={(e) => set({ photos: t.photos.map((x, k) => (k === i ? { ...x, caption: { en: x.caption?.en ?? '', ko: e.target.value } } : x)) })} />
                  <input placeholder="Caption (English)" value={p.caption?.en ?? ''} onChange={(e) => set({ photos: t.photos.map((x, k) => (k === i ? { ...x, caption: { ...(x.caption ?? {}), en: e.target.value } } : x)) })} />
                  <div className="row">
                    <button type="button" className="link" onClick={() => set({ photos: move(t.photos, i, -1) })}>
                      ←
                    </button>
                    <button type="button" className="link" onClick={() => set({ photos: move(t.photos, i, 1) })}>
                      →
                    </button>
                    <button type="button" className="link red" onClick={() => set({ photos: t.photos.filter((_, k) => k !== i) })}>
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      {busy && <p className="dim">사진 줄이는 중…</p>}

      <button onClick={save} disabled={busy} style={{ marginTop: 14 }}>
        저장
      </button>
    </Modal>
  );
}
