/**
 * Web-only font preview: open the web app with `?font=pretendard` (or suit, noto, plex, gothic, system)
 * to see the whole app in a free sans-serif font, and switch between candidates with the bar at the bottom.
 * Nothing changes in the Android app or for normal web visitors (no `font` parameter = no change).
 */
import { Platform } from 'react-native';

export const PREVIEW_FONTS: Record<string, { label: string; family: string; css?: string; note: string }> = {
  system: { label: '현재 (기본)', family: '', note: 'device default' },
  pretendard: {
    label: 'Pretendard',
    family: "'Pretendard Variable', Pretendard",
    css: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css',
    note: 'OFL',
  },
  suit: { label: 'SUIT', family: "'SUIT Variable'", css: 'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css', note: 'OFL' },
  noto: { label: 'Noto Sans KR', family: "'Noto Sans KR'", css: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap', note: 'OFL' },
  plex: { label: 'IBM Plex Sans KR', family: "'IBM Plex Sans KR'", css: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap', note: 'OFL' },
  gothic: { label: 'Gothic A1', family: "'Gothic A1'", css: 'https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;500;700;800;900&display=swap', note: 'OFL' },
};

function apply(id: string) {
  const f = PREVIEW_FONTS[id] ?? PREVIEW_FONTS.system;
  if (f.css && !document.querySelector(`link[data-font="${id}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = f.css;
    l.dataset.font = id;
    document.head.appendChild(l);
  }
  let st = document.getElementById('font-preview-style') as HTMLStyleElement | null;
  if (!st) {
    st = document.createElement('style');
    st.id = 'font-preview-style';
    document.head.appendChild(st);
  }
  st.textContent = f.family ? `#root, #root *, #root svg text { font-family: ${f.family}, sans-serif !important; }` : '';
  document.querySelectorAll<HTMLButtonElement>('#font-preview-bar button').forEach((b) => {
    const on = b.dataset.font === id;
    b.style.background = on ? '#E5383B' : '#FFFFFF22';
    b.style.fontWeight = on ? '900' : '600';
  });
}

export function setupFontPreview() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const id = new URLSearchParams(window.location.search).get('font');
  if (!id) return;
  const bar = document.createElement('div');
  bar.id = 'font-preview-bar';
  bar.style.cssText =
    'position:fixed;left:50%;transform:translateX(-50%);bottom:64px;z-index:9999;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:96vw;padding:6px;border-radius:12px;background:#1F2A44EE;font:12px sans-serif';
  for (const [k, f] of Object.entries(PREVIEW_FONTS)) {
    const b = document.createElement('button');
    b.textContent = f.label;
    b.dataset.font = k;
    b.style.cssText = 'color:#fff;border:0;border-radius:8px;padding:6px 8px;cursor:pointer;font:inherit';
    b.style.fontFamily = f.family || 'sans-serif';
    b.onclick = () => {
      const u = new URL(window.location.href);
      u.searchParams.set('font', k);
      window.history.replaceState(null, '', u.toString());
      apply(k);
    };
    bar.appendChild(b);
  }
  const hide = document.createElement('button');
  hide.textContent = '✕';
  hide.title = 'hide';
  hide.style.cssText = 'color:#fff;border:0;border-radius:8px;padding:6px 8px;cursor:pointer;background:transparent';
  hide.onclick = () => bar.remove();
  bar.appendChild(hide);
  document.body.appendChild(bar);
  apply(id);
}
