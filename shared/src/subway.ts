/**
 * Central Seoul subway subset for the transfer puzzle (real line/station order).
 * Coordinates are for a 300×200 schematic map.
 */
export interface SubwayLine {
  id: string;
  name: string;
  color: string;
  stations: string[];
  /** network (city); default seoul */
  net?: 'seoul' | 'busan';
}
export interface SubwayStation {
  id: string;
  ko: string;
  en: string;
  x: number;
  y: number;
  net?: 'seoul' | 'busan';
  /** draw the label under the dot */
  below?: boolean;
}

export const SUBWAY_STATIONS: SubwayStation[] = [
  { id: 'seoulstn', ko: '서울역', en: 'Seoul Station', x: 55, y: 150 },
  { id: 'cityhall', ko: '시청', en: 'City Hall', x: 70, y: 110 },
  { id: 'jonggak', ko: '종각', en: 'Jonggak', x: 100, y: 88 },
  { id: 'jongno3', ko: '종로3가', en: 'Jongno 3-ga', x: 130, y: 88 },
  { id: 'jongno5', ko: '종로5가', en: 'Jongno 5-ga', x: 160, y: 88 },
  { id: 'dongdaemun', ko: '동대문', en: 'Dongdaemun', x: 190, y: 88 },
  { id: 'hyehwa', ko: '혜화', en: 'Hyehwa', x: 190, y: 50 },
  { id: 'hoehyeon', ko: '회현', en: 'Hoehyeon', x: 85, y: 150 },
  { id: 'myeongdong', ko: '명동', en: 'Myeongdong', x: 112, y: 142 },
  { id: 'chungmuro', ko: '충무로', en: 'Chungmuro', x: 140, y: 132 },
  { id: 'ddp', ko: '동대문역사문화공원', en: 'DDP', x: 175, y: 116 },
  { id: 'hongik', ko: '홍대입구', en: 'Hongik Univ.', x: 8, y: 110 },
  { id: 'sinchon', ko: '신촌', en: 'Sinchon', x: 28, y: 110 },
  { id: 'chungjeongno', ko: '충정로', en: 'Chungjeongno', x: 48, y: 110 },
  { id: 'euljiro1', ko: '을지로입구', en: 'Euljiro 1-ga', x: 100, y: 112 },
  { id: 'euljiro3', ko: '을지로3가', en: 'Euljiro 3-ga', x: 130, y: 112 },
  { id: 'euljiro4', ko: '을지로4가', en: 'Euljiro 4-ga', x: 155, y: 114 },
  { id: 'sindang', ko: '신당', en: 'Sindang', x: 200, y: 122 },
  { id: 'sangwangsimni', ko: '상왕십리', en: 'Sangwangsimni', x: 222, y: 125 },
  { id: 'wangsimni', ko: '왕십리', en: 'Wangsimni', x: 245, y: 128 },
  { id: 'hanyang', ko: '한양대', en: 'Hanyang Univ.', x: 258, y: 145 },
  { id: 'ttukseom', ko: '뚝섬', en: 'Ttukseom', x: 268, y: 163 },
  { id: 'seongsu', ko: '성수', en: 'Seongsu', x: 280, y: 182 },
  { id: 'gyeongbokgung', ko: '경복궁', en: 'Gyeongbokgung', x: 112, y: 30 },
  { id: 'anguk', ko: '안국', en: 'Anguk', x: 130, y: 52 },
  { id: 'dongguk', ko: '동대입구', en: 'Dongguk Univ.', x: 150, y: 152 },
  { id: 'gwanghwamun', ko: '광화문', en: 'Gwanghwamun', x: 92, y: 66 },
  { id: 'cheonggu', ko: '청구', en: 'Cheonggu', x: 200, y: 145 },
  { id: 'singeumho', ko: '신금호', en: 'Singeumho', x: 218, y: 158 },
  { id: 'haengdang', ko: '행당', en: 'Haengdang', x: 236, y: 150 },
];

export const SUBWAY_LINES: SubwayLine[] = [
  { id: '1', name: '1호선', color: '#0052A4', stations: ['seoulstn', 'cityhall', 'jonggak', 'jongno3', 'jongno5', 'dongdaemun'] },
  { id: '2', name: '2호선', color: '#00A84D', stations: ['hongik', 'sinchon', 'chungjeongno', 'cityhall', 'euljiro1', 'euljiro3', 'euljiro4', 'ddp', 'sindang', 'sangwangsimni', 'wangsimni', 'hanyang', 'ttukseom', 'seongsu'] },
  { id: '3', name: '3호선', color: '#EF7C1C', stations: ['gyeongbokgung', 'anguk', 'jongno3', 'euljiro3', 'chungmuro', 'dongguk'] },
  { id: '4', name: '4호선', color: '#00A5DE', stations: ['hyehwa', 'dongdaemun', 'ddp', 'chungmuro', 'myeongdong', 'hoehyeon', 'seoulstn'] },
  { id: '5', name: '5호선', color: '#996CAC', stations: ['gwanghwamun', 'jongno3', 'euljiro4', 'ddp', 'cheonggu', 'singeumho', 'haengdang', 'wangsimni'] },
];

/** Busan Metro (Lines 1–3 subset, real order). */
const BUSAN: [string, string, string, number, number, boolean?][] = [
  ['bs-jagalchi', '자갈치', 'Jagalchi', 16, 186],
  ['bs-nampo', '남포', 'Nampo', 30, 176, true],
  ['bs-jungang', '중앙', 'Jungang', 44, 166],
  ['bs-busanstn', '부산역', 'Busan Station', 56, 154, true],
  ['bs-choryang', '초량동', 'Choryang-dong', 66, 142],
  ['bs-busanjin', '부산진', 'Busanjin', 76, 130, true],
  ['bs-jwacheon', '좌천', 'Jwacheon', 86, 118],
  ['bs-beomil', '범일', 'Beomil', 96, 106, true],
  ['bs-beomnaegol', '범내골', 'Beomnaegol', 106, 96],
  ['bs-seomyeon', '서면', 'Seomyeon', 116, 86],
  ['bs-bujeon', '부전', 'Bujeon', 120, 70],
  ['bs-yangjeong', '양정', 'Yangjeong', 126, 56],
  ['bs-cityhall', '시청', 'City Hall', 136, 42],
  ['bs-yeonsan', '연산', 'Yeonsan', 150, 28],
  ['bs-jeonpo', '전포', 'Jeonpo', 124, 104, true],
  ['bs-bifc', '국제금융센터', 'BIFC', 134, 118, true],
  ['bs-munjeon', '문전', 'Munjeon', 146, 126],
  ['bs-jigegol', '지게골', 'Jigegol', 158, 134, true],
  ['bs-motgol', '못골', 'Motgol', 170, 138],
  ['bs-daeyeon', '대연', 'Daeyeon', 182, 140, true],
  ['bs-kyungsung', '경성대·부경대', 'Kyungsung Univ.', 194, 136],
  ['bs-namcheon', '남천', 'Namcheon', 204, 128, true],
  ['bs-geumnyeonsan', '금련산', 'Geumnyeonsan', 212, 118],
  ['bs-gwangan', '광안', 'Gwangan', 218, 106, true],
  ['bs-suyeong', '수영', 'Suyeong', 226, 94],
  ['bs-millak', '민락', 'Millak', 236, 104, true],
  ['bs-centum', '센텀시티', 'Centum City', 246, 94],
  ['bs-bexco', '벡스코', 'BEXCO', 256, 84, true],
  ['bs-dongbaek', '동백', 'Dongbaek', 266, 94],
  ['bs-haeundae', '해운대', 'Haeundae', 278, 86, true],
  ['bs-jungdong', '중동', 'Jung-dong', 290, 78],
  ['bs-mangmi', '망미', 'Mangmi', 212, 72],
  ['bs-baesan', '배산', 'Baesan', 196, 54],
  ['bs-mulmangol', '물만골', 'Mulmangol', 176, 38],
];
SUBWAY_STATIONS.push(...BUSAN.map(([id, ko, en, x, y, below]) => ({ id, ko, en, x, y, below, net: 'busan' as const })));
SUBWAY_LINES.push(
  { id: 'B1', name: '1호선', color: '#F06E00', net: 'busan', stations: ['bs-jagalchi', 'bs-nampo', 'bs-jungang', 'bs-busanstn', 'bs-choryang', 'bs-busanjin', 'bs-jwacheon', 'bs-beomil', 'bs-beomnaegol', 'bs-seomyeon', 'bs-bujeon', 'bs-yangjeong', 'bs-cityhall', 'bs-yeonsan'] },
  { id: 'B2', name: '2호선', color: '#81BF48', net: 'busan', stations: ['bs-seomyeon', 'bs-jeonpo', 'bs-bifc', 'bs-munjeon', 'bs-jigegol', 'bs-motgol', 'bs-daeyeon', 'bs-kyungsung', 'bs-namcheon', 'bs-geumnyeonsan', 'bs-gwangan', 'bs-suyeong', 'bs-millak', 'bs-centum', 'bs-bexco', 'bs-dongbaek', 'bs-haeundae', 'bs-jungdong'] },
  { id: 'B3', name: '3호선', color: '#BB8C00', net: 'busan', stations: ['bs-suyeong', 'bs-mangmi', 'bs-baesan', 'bs-mulmangol', 'bs-yeonsan'] },
);
export const netOf = (stationId?: string) => stationOf(stationId)?.net ?? 'seoul';

export const HOP_MIN = 2;
export const TRANSFER_MIN = 5;
export const stationOf = (id?: string) => SUBWAY_STATIONS.find((s) => s.id === id);

/** lines that directly connect two adjacent stations */
export function linesBetween(a: string, b: string): string[] {
  return SUBWAY_LINES.filter((l) => {
    const i = l.stations.indexOf(a);
    const j = l.stations.indexOf(b);
    return i >= 0 && j >= 0 && Math.abs(i - j) === 1;
  }).map((l) => l.id);
}
export const neighbours = (a: string) => SUBWAY_STATIONS.map((s) => s.id).filter((b) => b !== a && linesBetween(a, b).length);

/** Minutes for a path of station ids (hops + transfers), choosing lines greedily to avoid transfers. */
export function routeTime(path: string[]): { min: number; transfers: number; lines: string[] } {
  let line: string | null = null;
  let transfers = 0;
  const lines: string[] = [];
  for (let i = 1; i < path.length; i++) {
    const opts = linesBetween(path[i - 1], path[i]);
    // prefer staying on the current line, else a line that also continues to the next hop
    const pick: string = line && opts.includes(line) ? line : opts.find((o) => i + 1 < path.length && linesBetween(path[i], path[i + 1]).includes(o)) ?? opts[0];
    if (line && pick !== line) transfers++;
    line = pick;
    lines.push(pick);
  }
  return { min: (path.length - 1) * HOP_MIN + transfers * TRANSFER_MIN, transfers, lines };
}

/** Dijkstra over (station, line) states → fastest path. */
export function bestRoute(from: string, to: string): { path: string[]; min: number; transfers: number } {
  type St = { s: string; l: string | null; t: number; path: string[]; tr: number };
  const q: St[] = [{ s: from, l: null, t: 0, path: [from], tr: 0 }];
  const seen = new Map<string, number>();
  while (q.length) {
    q.sort((a, b) => a.t - b.t);
    const cur = q.shift()!;
    if (cur.s === to) return { path: cur.path, min: cur.t, transfers: cur.tr };
    const key = `${cur.s}|${cur.l}`;
    if ((seen.get(key) ?? Infinity) <= cur.t) continue;
    seen.set(key, cur.t);
    for (const n of neighbours(cur.s))
      for (const l of linesBetween(cur.s, n)) {
        const tr = cur.l && cur.l !== l ? 1 : 0;
        q.push({ s: n, l, t: cur.t + HOP_MIN + tr * TRANSFER_MIN, path: [...cur.path, n], tr: cur.tr + tr });
      }
  }
  return { path: [from], min: 0, transfers: 0 };
}
