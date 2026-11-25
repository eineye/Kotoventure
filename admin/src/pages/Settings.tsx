import { useState } from 'react';
import type { AppConfig } from '@kotoventure/shared';
import { useContent } from '../App';
import { repo } from '../repo';
import { Field, LText, Num } from '../ui';
import { SeedUpload } from './SeedUpload';

export function Settings() {
  const { content, act } = useContent();
  const [cfg, setCfg] = useState<AppConfig>(() => JSON.parse(JSON.stringify(content.config)));
  const [newCur, setNewCur] = useState('');
  const set = (p: Partial<AppConfig>) => setCfg((c) => ({ ...c, ...p }));

  return (
    <div>
      <div className="page-head">
        <h2>앱 설정</h2>
        <button onClick={() => act('설정 저장', () => repo.saveConfig(cfg))}>저장</button>
      </div>

      <SeedUpload />

      <h3>📢 홈 화면 공지</h3>
      <p className="dim">기상 특보, 이벤트, 신규 미션 안내 등을 앱 홈 상단에 표시합니다.</p>
      <LText multiline value={cfg.notice} onChange={(notice) => set({ notice })} />

      <h3>💱 참고 환율 (1 외화 = ? 원)</h3>
      <div className="row wrap">
        {Object.entries(cfg.fxRates).map(([k, v]) => (
          <label key={k} className="fx">
            <b>{k}</b> <Num value={v} step={0.1} onChange={(n) => set({ fxRates: { ...cfg.fxRates, [k]: n } })} />
            <button className="link red" onClick={() => set({ fxRates: Object.fromEntries(Object.entries(cfg.fxRates).filter(([x]) => x !== k)) })}>
              ✕
            </button>
          </label>
        ))}
        <input placeholder="통화 코드 (예: THB)" value={newCur} onChange={(e) => setNewCur(e.target.value.toUpperCase().slice(0, 3))} style={{ width: 150 }} />
        <button className="ghost small" onClick={() => newCur && (set({ fxRates: { ...cfg.fxRates, [newCur]: 0 } }), setNewCur(''))}>
          + 통화 추가
        </button>
      </div>
      <Field label="환율 기준일">
        <input type="date" value={cfg.fxUpdatedAt} onChange={(e) => set({ fxUpdatedAt: e.target.value })} />
      </Field>

      <h3>🆘 긴급 전화</h3>
      {cfg.emergencyNumbers.map((e, i) => (
        <div key={i} className="row">
          <input value={e.number} style={{ width: 90 }} onChange={(x) => set({ emergencyNumbers: cfg.emergencyNumbers.map((y, k) => (k === i ? { ...y, number: x.target.value } : y)) })} />
          <div style={{ flex: 1 }}>
            <LText value={e.label} onChange={(label) => set({ emergencyNumbers: cfg.emergencyNumbers.map((y, k) => (k === i ? { ...y, label } : y)) })} />
          </div>
          <button className="link red" onClick={() => set({ emergencyNumbers: cfg.emergencyNumbers.filter((_, k) => k !== i) })}>
            삭제
          </button>
        </div>
      ))}
      <button className="ghost small" onClick={() => set({ emergencyNumbers: [...cfg.emergencyNumbers, { number: '', label: { en: '' } }] })}>
        + 번호 추가
      </button>

      <h3>📱 최소 앱 버전</h3>
      <Field label="이 버전보다 낮은 앱은 업데이트 안내 (강제 업데이트용)">
        <input value={cfg.minAppVersion} onChange={(e) => set({ minAppVersion: e.target.value })} />
      </Field>
    </div>
  );
}
