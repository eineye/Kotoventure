import { useState } from 'react';
import { tr, type Product } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo } from '../repo';
import { Check, Field, LText, Modal, Num, Select } from '../ui';

export function Products() {
  const { content, act } = useContent();
  const [edit, setEdit] = useState<{ p: Product; isNew: boolean } | null>(null);
  return (
    <div>
      <div className="page-head">
        <h2>상품·인앱 결제</h2>
        <button
          onClick={() =>
            setEdit({ isNew: true, p: { id: '', type: 'course_pack', title: { en: '' }, priceUsd: 0.99, iosProductId: 'com.kotoventure.pack.', androidProductId: 'pack_', courseIds: [], isActive: false } })
          }
        >
          + 새 미션팩
        </button>
      </div>
      <div className="note">
        <b>판매 구조</b>
        <ul>
          <li>
            <b>앱 본체</b>: 유료 앱 $0.99 – 가격은 App Store Connect / Google Play Console 에서 설정 (기본 5개 미션 포함).
          </li>
          <li>
            <b>추가 미션팩</b>: 인앱 결제(비소모성). 스토어에 같은 상품 ID로 등록하고, 코스 편집에서 판매 방식을 “인앱”으로 지정하세요.
          </li>
          <li>개발 중에는 iOS Sandbox 테스터 / Google Play 라이선스 테스터 계정으로 결제를 테스트합니다 (실제 청구 없음).</li>
        </ul>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>유형</th>
            <th>이름</th>
            <th>가격</th>
            <th>iOS 상품 ID</th>
            <th>Android 상품 ID</th>
            <th>포함 코스</th>
            <th>판매</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {content.products.map((p) => (
            <tr key={p.id}>
              <td className="mono">{p.id}</td>
              <td>{p.type === 'paid_app' ? '유료 앱' : '미션팩(인앱)'}</td>
              <td>{tr(p.title, 'ko')}</td>
              <td>${p.priceUsd.toFixed(2)}</td>
              <td className="mono small">{p.iosProductId}</td>
              <td className="mono small">{p.androidProductId}</td>
              <td className="small">{p.courseIds.join(', ') || '–'}</td>
              <td>{p.isActive ? '✅' : '–'}</td>
              <td className="nowrap">
                <button className="small" onClick={() => setEdit({ p: JSON.parse(JSON.stringify(p)), isNew: false })}>
                  편집
                </button>{' '}
                {p.type !== 'paid_app' && (
                  <button className="small danger" onClick={() => confirm('삭제할까요?') && act('상품 삭제', () => repo.deleteProduct(p.id))}>
                    삭제
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {edit && <ProductModal init={edit.p} isNew={edit.isNew} onClose={() => setEdit(null)} />}
    </div>
  );
}

function ProductModal({ init, isNew, onClose }: { init: Product; isNew: boolean; onClose: () => void }) {
  const { content, act } = useContent();
  const [p, setP] = useState(init);
  const set = (x: Partial<Product>) => setP((o) => ({ ...o, ...x }));
  return (
    <Modal title={isNew ? '새 상품' : `상품 편집: ${p.id}`} onClose={onClose} wide>
      <div className="grid2">
        <Field label="ID">
          <input value={p.id} disabled={!isNew} onChange={(e) => set({ id: e.target.value.trim() })} placeholder="pack_dmz_east" />
        </Field>
        <Field label="유형">
          <Select value={p.type} onChange={(type) => set({ type })} options={[['course_pack', '미션팩(인앱)'], ['paid_app', '유료 앱']]} />
        </Field>
        <Field label="이름" wide>
          <LText value={p.title} onChange={(title) => set({ title })} />
        </Field>
        <Field label="가격 (USD, 표시용 – 실제 가격은 스토어 설정)">
          <Num value={p.priceUsd} step={0.01} onChange={(priceUsd) => set({ priceUsd })} />
        </Field>
        <Field label="판매">
          <Check checked={p.isActive} onChange={(isActive) => set({ isActive })} label="판매 중" />
        </Field>
        <Field label="iOS 상품 ID (App Store Connect)">
          <input value={p.iosProductId} onChange={(e) => set({ iosProductId: e.target.value })} />
        </Field>
        <Field label="Android 상품 ID (Play Console)">
          <input value={p.androidProductId} onChange={(e) => set({ androidProductId: e.target.value })} />
        </Field>
        <Field label="포함 코스" wide>
          <div className="row wrap">
            {content.courses.map((c) => (
              <Check
                key={c.id}
                checked={p.courseIds.includes(c.id)}
                onChange={(b) => set({ courseIds: b ? [...p.courseIds, c.id] : p.courseIds.filter((x) => x !== c.id) })}
                label={tr(c.title, 'ko')}
              />
            ))}
          </div>
        </Field>
      </div>
      <button onClick={async () => p.id && (await act('상품 저장', () => repo.saveProduct(p))) && onClose()}>저장</button>
    </Modal>
  );
}
