import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { L } from '@kotoventure/shared';

export const LANGS = ['en', 'ko'] as const;

export function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={'field' + (wide ? ' wide' : '')}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

/** Localised text input: one box per language (en required). */
export function LText({ value, onChange, multiline, placeholder }: { value: L | undefined; onChange: (v: L) => void; multiline?: boolean; placeholder?: string }) {
  const v = value ?? { en: '' };
  return (
    <div className="ltext">
      {LANGS.map((lg) => (
        <div key={lg} className="ltext-row">
          <span className="lang">{lg}</span>
          {multiline ? (
            <textarea rows={3} value={v[lg] ?? ''} placeholder={lg === 'en' ? placeholder : '(선택)'} onChange={(e) => onChange({ ...v, [lg]: e.target.value } as L)} />
          ) : (
            <input value={v[lg] ?? ''} placeholder={lg === 'en' ? placeholder : '(선택)'} onChange={(e) => onChange({ ...v, [lg]: e.target.value } as L)} />
          )}
        </div>
      ))}
    </div>
  );
}

export function Num({ value, onChange, min, max, step }: { value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  return <input type="number" value={Number.isFinite(value) ? value : 0} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />;
}

export function Select<T extends string>({ value, onChange, options }: { value: T | undefined; onChange: (v: T) => void; options: (T | [T, string])[] }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => {
        const [v, label] = Array.isArray(o) ? o : [o, o];
        return (
          <option key={v} value={v}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

export function Check({ checked, onChange, label }: { checked: boolean; onChange: (b: boolean) => void; label: string }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="ghost" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/** JSON textarea that only reports valid JSON upward. */
export function JsonEdit<T>({ value, onChange, rows = 14 }: { value: T; onChange: (v: T) => void; rows?: number }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => setText(JSON.stringify(value, null, 2)), [value]);
  return (
    <div>
      <textarea
        className="mono"
        rows={rows}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            setErr(null);
            onChange(parsed);
          } catch (x: any) {
            setErr(x.message);
          }
        }}
      />
      {err && <div className="err">JSON 오류: {err}</div>}
    </div>
  );
}

/* ── toasts ── */
const ToastCtx = createContext<(msg: string, kind?: 'ok' | 'err') => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; kind: 'ok' | 'err' }[]>([]);
  const push = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, msg, kind }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts">
        {items.map((i) => (
          <div key={i.id} className={'toast ' + i.kind}>
            {i.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }) : '–');
export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
