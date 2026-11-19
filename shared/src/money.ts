/**
 * Korean money facts used by the exchange / ATM simulations and the banknote art.
 * Banknote series issued 2006–2009 (current). Sizes in millimetres are real, so the app can
 * draw notes and coins at their true relative size.
 */
import type { L } from './types';

export interface NoteInfo {
  value: 1000 | 5000 | 10000 | 50000;
  ko: string;
  /** main colour and dark ink colour */
  color: string;
  dark: string;
  sizeMm: [number, number];
  person: L;
  front: L;
  back: L;
  security: L;
}

export const KRW_NOTES: NoteInfo[] = [
  {
    value: 1000, ko: '천원', color: '#A9CCE8', dark: '#1F4E79', sizeMm: [136, 68],
    person: { en: 'Yi Hwang (Toegye), Joseon scholar', ko: '퇴계 이황' },
    front: { en: 'Myeongnyundang lecture hall of Seonggyungwan & plum blossoms', ko: '명륜당·매화' },
    back: { en: '"Gyesang Jeonggeo-do" – a scholar\'s house by painter Jeong Seon', ko: '계상정거도 (정선)' },
    security: { en: 'Watermark portrait on the left, colour-changing ink number', ko: '숨은 초상(워터마크), 색변환 잉크' },
  },
  {
    value: 5000, ko: '오천원', color: '#F2B48C', dark: '#8A3B12', sizeMm: [142, 68],
    person: { en: 'Yi I (Yulgok), Joseon scholar', ko: '율곡 이이' },
    front: { en: 'Ojukheon house with black bamboo', ko: '오죽헌·오죽' },
    back: { en: '"Chochungdo" – watermelon & cockscomb painting by Shin Saimdang', ko: '초충도 (신사임당)' },
    security: { en: 'Round hologram on the left, watermark portrait', ko: '원형 홀로그램, 숨은 초상' },
  },
  {
    value: 10000, ko: '만원', color: '#A8D5A2', dark: '#1E5631', sizeMm: [148, 68],
    person: { en: 'King Sejong the Great – creator of Hangul', ko: '세종대왕' },
    front: { en: '"Irworobongdo" sun, moon & five peaks screen; Yongbieocheonga text', ko: '일월오봉도·용비어천가' },
    back: { en: 'Honcheonsigye celestial globe & Bohyunsan optical telescope', ko: '혼천시계·보현산 천체망원경' },
    security: { en: 'Square hologram on the left, watermark portrait', ko: '사각 홀로그램, 숨은 초상' },
  },
  {
    value: 50000, ko: '오만원', color: '#F5DC8A', dark: '#8A6A08', sizeMm: [154, 68],
    person: { en: 'Shin Saimdang – artist & calligrapher', ko: '신사임당' },
    front: { en: '"Mukpodo" ink grapes & eggplant embroidery', ko: '묵포도도·초충도수병' },
    back: { en: '"Wolmaedo" plum & moon and "Pungjukdo" bamboo in the wind', ko: '월매도·풍죽도' },
    security: { en: 'Vertical hologram stripe + moving 3D security thread', ko: '띠형 홀로그램, 입체형 부분노출 은선' },
  },
];

export interface CoinInfo {
  value: 10 | 50 | 100 | 500;
  diameterMm: number;
  color: string;
  motif: L;
}

export const KRW_COINS: CoinInfo[] = [
  { value: 10, diameterMm: 18, color: '#D49A6A', motif: { en: 'Dabotap pagoda (Bulguksa)', ko: '다보탑' } },
  { value: 50, diameterMm: 21.6, color: '#D7DBE0', motif: { en: 'Ear of rice', ko: '벼 이삭' } },
  { value: 100, diameterMm: 24, color: '#D7DBE0', motif: { en: 'Admiral Yi Sun-sin', ko: '이순신 장군' } },
  { value: 500, diameterMm: 26.5, color: '#E4E7EB', motif: { en: 'Red-crowned crane', ko: '학' } },
];

/** Split an amount into the fewest notes/coins (how a cashier would hand it over). */
export function breakdownKRW(amount: number): { value: number; count: number }[] {
  let rest = Math.floor(amount / 10) * 10;
  const out: { value: number; count: number }[] = [];
  for (const v of [50000, 10000, 5000, 1000, 500, 100, 50, 10]) {
    const n = Math.floor(rest / v);
    if (n) out.push({ value: v, count: n });
    rest -= n * v;
  }
  return out;
}

export interface HomeCurrency {
  code: string;
  symbol: string;
  name: string;
  /** sensible amounts to offer on the exchange counter */
  presets: number[];
}

const C = (code: string, symbol: string, name: string, presets: number[]): HomeCurrency => ({ code, symbol, name, presets });
export const CURRENCIES: Record<string, HomeCurrency> = {
  USD: C('USD', '$', 'US dollar', [50, 100, 200, 300, 500]),
  AUD: C('AUD', 'A$', 'Australian dollar', [50, 100, 200, 300, 500]),
  JPY: C('JPY', '¥', 'Japanese yen', [5000, 10000, 20000, 30000, 50000]),
  CNY: C('CNY', '¥', 'Chinese yuan', [300, 500, 1000, 1500, 2000]),
  TWD: C('TWD', 'NT$', 'New Taiwan dollar', [1000, 3000, 5000, 7000, 10000]),
  VND: C('VND', '₫', 'Vietnamese dong', [1000000, 2000000, 4000000, 6000000, 8000000]),
  THB: C('THB', '฿', 'Thai baht', [1000, 3000, 5000, 7000, 10000]),
  PHP: C('PHP', '₱', 'Philippine peso', [2000, 5000, 8000, 12000, 15000]),
  SGD: C('SGD', 'S$', 'Singapore dollar', [50, 100, 200, 300, 500]),
  INR: C('INR', '₹', 'Indian rupee', [5000, 10000, 15000, 20000, 30000]),
  GBP: C('GBP', '£', 'British pound', [50, 100, 150, 200, 300]),
  EUR: C('EUR', '€', 'Euro', [50, 100, 150, 200, 300]),
  CAD: C('CAD', 'C$', 'Canadian dollar', [50, 100, 200, 300, 500]),
  BRL: C('BRL', 'R$', 'Brazilian real', [200, 500, 800, 1200, 1500]),
};

const BY_COUNTRY: Record<string, string> = {
  AU: 'AUD', US: 'USD', JP: 'JPY', CN: 'CNY', TW: 'TWD', VN: 'VND', TH: 'THB', PH: 'PHP', SG: 'SGD',
  IN: 'INR', GB: 'GBP', DE: 'EUR', FR: 'EUR', CA: 'CAD', BR: 'BRL',
};

export const currencyForCountry = (country?: string): HomeCurrency => CURRENCIES[BY_COUNTRY[country ?? ''] ?? 'USD'];

/** Spread a money changer applies on top of the reference rate when buying your currency. */
export const VENUE_SPREAD = { airport: 0.06, downtown: 0.015 } as const;

/* ── wallet of physical cash ───────────────────────────────── */
export type Cash = Record<string, number>;
export const DENOMS = [50000, 10000, 5000, 1000, 500, 100, 50, 10] as const;

/** Won the traveller brought from home (₩50,000) – used before any exchange/ATM. */
export const DEFAULT_CASH: Cash = { 10000: 3, 5000: 2, 1000: 10 };

export const cashTotal = (w: Cash = {}) => Object.entries(w).reduce((a, [v, n]) => a + Number(v) * n, 0);

export function addCash(w: Cash, amount: number): Cash {
  const out: Cash = { ...w };
  for (const p of breakdownKRW(amount)) out[p.value] = (out[p.value] ?? 0) + p.count;
  return out;
}

export function removePieces(w: Cash, pieces: number[]): Cash {
  const out: Cash = { ...w };
  for (const v of pieces) out[v] = Math.max(0, (out[v] ?? 0) - 1);
  return out;
}

/**
 * Smallest amount ≥ `total` that can be paid with the wallet's pieces (what a careful
 * customer hands over). Returns null if the wallet can't cover the total.
 */
export function bestPayment(w: Cash, total: number): number | null {
  if (cashTotal(w) < total) return null;
  const unit = 10;
  const cap = total + 50000;
  const max = Math.floor(cap / unit);
  const reach = new Uint8Array(max + 1);
  reach[0] = 1;
  for (const d of DENOMS) {
    const n = w[d] ?? 0;
    const step = d / unit;
    for (let k = 0; k < n; k++) for (let i = max; i >= step; i--) if (reach[i - step]) reach[i] = 1;
  }
  for (let i = Math.ceil(total / unit); i <= max; i++) if (reach[i]) return i * unit;
  return cashTotal(w);
}
