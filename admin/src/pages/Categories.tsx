import { useState } from 'react';
import { tr, type Category } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo } from '../repo';
import { Check, Field, LText, Modal, Num, slug } from '../ui';

export function Categories() {
  const { content, act } = useContent();
  const [edit, setEdit] = useState<{ c: Category; isNew: boolean } | null>(null);
  return (
    <div>
      <div className="page-head">
        <h2>미션 분류</h2>
        <button onClick={() => setEdit({ isNew: true, c: { id: '', name: { en: '', ko: '' }, icon: '✨', color: '#2D6CDF', sortOrder: content.categories.length + 1, isActive: true } })}>
          + 새 분류
        </button>
      </div>
      <p className="dim">기본: 관광 / 식도락 / 문화 / 모험 / 체험. 분류는 자유롭게 추가할 수 있습니다.</p>
      <table>
        <thead>
          <tr>
            <th>순서</th>
            <th>아이콘</th>
            <th>ID</th>
            <th>이름</th>
            <th>색상</th>
            <th>코스 수</th>
            <th>활성</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[...content.categories]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c) => (
              <tr key={c.id}>
                <td>{c.sortOrder}</td>
                <td style={{ fontSize: 22 }}>{c.icon}</td>
                <td className="mono">{c.id}</td>
                <td>
                  {tr(c.name, 'ko')} <span className="dim">/ {c.name.en}</span>
                </td>
                <td>
                  <span className="swatch" style={{ background: c.color }} /> {c.color}
                </td>
                <td>{content.courses.filter((x) => x.categoryId === c.id).length}</td>
                <td>{c.isActive ? '✅' : '–'}</td>
                <td className="nowrap">
                  <button className="small" onClick={() => setEdit({ c: { ...c }, isNew: false })}>
                    편집
                  </button>{' '}
                  <button
                    className="small danger"
                    onClick={() => {
                      if (content.courses.some((x) => x.categoryId === c.id)) return alert('이 분류를 사용하는 코스가 있어 삭제할 수 없습니다. 비활성화를 이용하세요.');
                      if (confirm('삭제할까요?')) act('분류 삭제', () => repo.deleteCategory(c.id));
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {edit && <CategoryModal init={edit.c} isNew={edit.isNew} onClose={() => setEdit(null)} />}
    </div>
  );
}

function CategoryModal({ init, isNew, onClose }: { init: Category; isNew: boolean; onClose: () => void }) {
  const { act } = useContent();
  const [c, setC] = useState(init);
  const set = (p: Partial<Category>) => setC((x) => ({ ...x, ...p }));
  return (
    <Modal title={isNew ? '새 분류' : '분류 편집'} onClose={onClose}>
      <Field label="ID (영문)">
        <input value={c.id} disabled={!isNew} onChange={(e) => set({ id: slug(e.target.value) })} placeholder="nightlife" />
      </Field>
      <Field label="이름">
        <LText value={c.name} onChange={(name) => set({ name })} />
      </Field>
      <div className="grid2">
        <Field label="아이콘 (이모지)">
          <input value={c.icon} onChange={(e) => set({ icon: e.target.value })} />
        </Field>
        <Field label="색상">
          <input type="color" value={c.color} onChange={(e) => set({ color: e.target.value })} />
        </Field>
        <Field label="정렬 순서">
          <Num value={c.sortOrder} onChange={(sortOrder) => set({ sortOrder })} />
        </Field>
        <Field label="상태">
          <Check checked={c.isActive} onChange={(isActive) => set({ isActive })} label="앱에 표시" />
        </Field>
      </div>
      <button onClick={async () => c.id && c.name.en && (await act('분류 저장', () => repo.saveCategory(c))) && onClose()}>저장</button>
    </Modal>
  );
}
