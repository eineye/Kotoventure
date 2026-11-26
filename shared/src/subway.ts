/**
 * Subway subsets for the transfer puzzle (real lines, real station order and real positions):
 * central Seoul, Busan Metro and Incheon (Incheon Line 1/2, Gyeongin Line 1, Suin-Bundang, AREX).
 * Positions are WGS84 – the app draws them on a map of the city.
 */
export type SubwayNet = 'seoul' | 'busan' | 'incheon';
export interface SubwayLine {
  id: string;
  name: string;
  /** English name for the legend */
  en?: string;
  color: string;
  stations: string[];
  /** network (city); default seoul */
  net?: SubwayNet;
}
export interface SubwayStation {
  id: string;
  ko: string;
  en: string;
  lng: number;
  lat: number;
  net?: SubwayNet;
  /** label side on the map: top (default), bottom, left, right */
  lp?: 't' | 'b' | 'l' | 'r';
}

type Row = [id: string, ko: string, en: string, lng: number, lat: number, lp?: SubwayStation['lp']];
const rows = (net: SubwayNet, list: Row[]): SubwayStation[] => list.map(([id, ko, en, lng, lat, lp]) => ({ id, ko, en, lng, lat, ...(lp ? { lp } : {}), ...(net !== 'seoul' ? { net } : {}) }));

export const SUBWAY_STATIONS: SubwayStation[] = rows('seoul', [
  ['seoulstn', '서울역', 'Seoul Station', 126.9726, 37.5547, 'l'],
  ['cityhall', '시청', 'City Hall', 126.977, 37.5657, 'l'],
  ['jonggak', '종각', 'Jonggak', 126.9831, 37.5703, 't'],
  ['jongno3', '종로3가', 'Jongno 3-ga', 126.9917, 37.5715, 't'],
  ['jongno5', '종로5가', 'Jongno 5-ga', 127.0019, 37.5709, 't'],
  ['dongdaemun', '동대문', 'Dongdaemun', 127.011, 37.5714, 'r'],
  ['hyehwa', '혜화', 'Hyehwa', 127.0017, 37.5822, 'r'],
  ['hoehyeon', '회현', 'Hoehyeon', 126.9785, 37.5588, 'b'],
  ['myeongdong', '명동', 'Myeongdong', 126.986, 37.5609, 'b'],
  ['chungmuro', '충무로', 'Chungmuro', 126.994, 37.5612, 'b'],
  ['ddp', '동대문역사문화공원', 'DDP', 127.0074, 37.5652, 'l'],
  ['hongik', '홍대입구', 'Hongik Univ.', 126.9246, 37.5572, 't'],
  ['sinchon', '신촌', 'Sinchon', 126.9368, 37.5551, 't'],
  ['chungjeongno', '충정로', 'Chungjeongno', 126.9636, 37.56, 't'],
  ['euljiro1', '을지로입구', 'Euljiro 1-ga', 126.9822, 37.566, 'b'],
  ['euljiro3', '을지로3가', 'Euljiro 3-ga', 126.9917, 37.5663, 'b'],
  ['euljiro4', '을지로4가', 'Euljiro 4-ga', 126.9978, 37.5667, 't'],
  ['sindang', '신당', 'Sindang', 127.0177, 37.5657, 't'],
  ['sangwangsimni', '상왕십리', 'Sangwangsimni', 127.0293, 37.5645, 'r'],
  ['wangsimni', '왕십리', 'Wangsimni', 127.0379, 37.5612, 'r'],
  ['hanyang', '한양대', 'Hanyang Univ.', 127.0436, 37.5557, 'r'],
  ['ttukseom', '뚝섬', 'Ttukseom', 127.0474, 37.5472, 'r'],
  ['seongsu', '성수', 'Seongsu', 127.0557, 37.5445, 'r'],
  ['gyeongbokgung', '경복궁', 'Gyeongbokgung', 126.9731, 37.5757, 'l'],
  ['anguk', '안국', 'Anguk', 126.9856, 37.5765, 't'],
  ['dongguk', '동대입구', 'Dongguk Univ.', 127.0057, 37.559, 'b'],
  ['gwanghwamun', '광화문', 'Gwanghwamun', 126.9768, 37.571, 'l'],
  ['cheonggu', '청구', 'Cheonggu', 127.0138, 37.5603, 'b'],
  ['singeumho', '신금호', 'Singeumho', 127.0207, 37.5545, 'b'],
  ['haengdang', '행당', 'Haengdang', 127.0297, 37.5573, 'b'],
]);

export const SUBWAY_LINES: SubwayLine[] = [
  { id: '1', name: '1호선', en: 'Line 1', color: '#0052A4', stations: ['seoulstn', 'cityhall', 'jonggak', 'jongno3', 'jongno5', 'dongdaemun'] },
  { id: '2', name: '2호선', en: 'Line 2', color: '#00A84D', stations: ['hongik', 'sinchon', 'chungjeongno', 'cityhall', 'euljiro1', 'euljiro3', 'euljiro4', 'ddp', 'sindang', 'sangwangsimni', 'wangsimni', 'hanyang', 'ttukseom', 'seongsu'] },
  { id: '3', name: '3호선', en: 'Line 3', color: '#EF7C1C', stations: ['gyeongbokgung', 'anguk', 'jongno3', 'euljiro3', 'chungmuro', 'dongguk'] },
  { id: '4', name: '4호선', en: 'Line 4', color: '#00A5DE', stations: ['hyehwa', 'dongdaemun', 'ddp', 'chungmuro', 'myeongdong', 'hoehyeon', 'seoulstn'] },
  { id: '5', name: '5호선', en: 'Line 5', color: '#996CAC', stations: ['gwanghwamun', 'jongno3', 'euljiro4', 'ddp', 'cheonggu', 'singeumho', 'haengdang', 'wangsimni'] },
];

/** Busan Metro (Lines 1–3 subset, real order). */
SUBWAY_STATIONS.push(
  ...rows('busan', [
    ['bs-jagalchi', '자갈치', 'Jagalchi', 129.0306, 35.0967, 'l'],
    ['bs-nampo', '남포', 'Nampo', 129.0347, 35.0979, 'r'],
    ['bs-jungang', '중앙', 'Jungang', 129.0383, 35.1037, 'l'],
    ['bs-busanstn', '부산역', 'Busan Station', 129.0424, 35.115, 'l'],
    ['bs-choryang', '초량동', 'Choryang-dong', 129.0456, 35.1205, 'r'],
    ['bs-busanjin', '부산진', 'Busanjin', 129.0525, 35.1279, 'l'],
    ['bs-jwacheon', '좌천', 'Jwacheon', 129.0539, 35.1335, 'r'],
    ['bs-beomil', '범일', 'Beomil', 129.0578, 35.1405, 'l'],
    ['bs-beomnaegol', '범내골', 'Beomnaegol', 129.0598, 35.1471, 'l'],
    ['bs-seomyeon', '서면', 'Seomyeon', 129.059, 35.1579, 'l'],
    ['bs-bujeon', '부전', 'Bujeon', 129.0624, 35.1626, 'l'],
    ['bs-yangjeong', '양정', 'Yangjeong', 129.0717, 35.173, 'l'],
    ['bs-cityhall', '시청', 'City Hall', 129.0759, 35.1797, 'l'],
    ['bs-yeonsan', '연산', 'Yeonsan', 129.0814, 35.1855, 't'],
    ['bs-jeonpo', '전포', 'Jeonpo', 129.0656, 35.1528, 'r'],
    ['bs-bifc', '국제금융센터', 'BIFC', 129.0663, 35.1461, 'r'],
    ['bs-munjeon', '문전', 'Munjeon', 129.0751, 35.1413, 'b'],
    ['bs-jigegol', '지게골', 'Jigegol', 129.0804, 35.1381, 't'],
    ['bs-motgol', '못골', 'Motgol', 129.088, 35.1364, 'b'],
    ['bs-daeyeon', '대연', 'Daeyeon', 129.0948, 35.1356, 't'],
    ['bs-kyungsung', '경성대·부경대', 'Kyungsung Univ.', 129.1003, 35.1374, 'r'],
    ['bs-namcheon', '남천', 'Namcheon', 129.1093, 35.1426, 'r'],
    ['bs-geumnyeonsan', '금련산', 'Geumnyeonsan', 129.111, 35.1497, 'l'],
    ['bs-gwangan', '광안', 'Gwangan', 129.1131, 35.1576, 'l'],
    ['bs-suyeong', '수영', 'Suyeong', 129.1153, 35.1655, 'l'],
    ['bs-millak', '민락', 'Millak', 129.1235, 35.1617, 'b'],
    ['bs-centum', '센텀시티', 'Centum City', 129.1305, 35.169, 'b'],
    ['bs-bexco', '벡스코', 'BEXCO', 129.1406, 35.1694, 't'],
    ['bs-dongbaek', '동백', 'Dongbaek', 129.1477, 35.1615, 'b'],
    ['bs-haeundae', '해운대', 'Haeundae', 129.1588, 35.1634, 't'],
    ['bs-jungdong', '중동', 'Jung-dong', 129.1688, 35.1663, 'b'],
    ['bs-mangmi', '망미', 'Mangmi', 129.1066, 35.1718, 'r'],
    ['bs-baesan', '배산', 'Baesan', 129.0985, 35.1776, 'r'],
    ['bs-mulmangol', '물만골', 'Mulmangol', 129.0896, 35.1806, 't'],
  ]),
);
SUBWAY_LINES.push(
  { id: 'B1', name: '1호선', en: 'Line 1', color: '#F06E00', net: 'busan', stations: ['bs-jagalchi', 'bs-nampo', 'bs-jungang', 'bs-busanstn', 'bs-choryang', 'bs-busanjin', 'bs-jwacheon', 'bs-beomil', 'bs-beomnaegol', 'bs-seomyeon', 'bs-bujeon', 'bs-yangjeong', 'bs-cityhall', 'bs-yeonsan'] },
  { id: 'B2', name: '2호선', en: 'Line 2', color: '#81BF48', net: 'busan', stations: ['bs-seomyeon', 'bs-jeonpo', 'bs-bifc', 'bs-munjeon', 'bs-jigegol', 'bs-motgol', 'bs-daeyeon', 'bs-kyungsung', 'bs-namcheon', 'bs-geumnyeonsan', 'bs-gwangan', 'bs-suyeong', 'bs-millak', 'bs-centum', 'bs-bexco', 'bs-dongbaek', 'bs-haeundae', 'bs-jungdong'] },
  { id: 'B3', name: '3호선', en: 'Line 3', color: '#BB8C00', net: 'busan', stations: ['bs-suyeong', 'bs-mangmi', 'bs-baesan', 'bs-mulmangol', 'bs-yeonsan'] },
);

/** Incheon: Incheon Line 1 & 2, the Gyeongin stretch of Seoul Line 1, Suin-Bundang and AREX (subset, real order). */
SUBWAY_STATIONS.push(
  ...rows('incheon', [
    ['ic-cheongna', '청라국제도시', 'Cheongna Int\'l City', 126.6264, 37.5574, 'b'],
    ['ic-geomam', '검암', 'Geomam', 126.6743, 37.5693, 't'],
    ['ic-gyeyang', '계양', 'Gyeyang', 126.7376, 37.5713, 't'],
    ['ic-gyesan', '계산', 'Gyesan', 126.728, 37.543, 'r'],
    ['ic-bupyeonggu', '부평구청', 'Bupyeong-gu Office', 126.7214, 37.5085, 'r'],
    ['ic-bupyeong', '부평', 'Bupyeong', 126.7234, 37.4895, 'r'],
    ['ic-cityhall', '인천시청', 'Incheon City Hall', 126.7027, 37.4573, 'r'],
    ['ic-terminal', '인천터미널', 'Incheon Bus Terminal', 126.7006, 37.4422, 'r'],
    ['ic-munhak', '문학경기장', 'Munhak Stadium', 126.6987, 37.4349, 'r'],
    ['ic-woninjae', '원인재', 'Woninjae', 126.6754, 37.4127, 'r'],
    ['ic-campustown', '캠퍼스타운', 'Campus Town', 126.6625, 37.388, 'b'],
    ['ic-centralpark', '센트럴파크', 'Central Park', 126.6348, 37.3929, 'b'],
    ['ic-ibd', '국제업무지구', 'Int\'l Business District', 126.6276, 37.3994, 'l'],
    ['ic-incheon', '인천', 'Incheon (Chinatown)', 126.6175, 37.4763, 't'],
    ['ic-dongincheon', '동인천', 'Dongincheon', 126.6328, 37.4753, 't'],
    ['ic-jemulpo', '제물포', 'Jemulpo', 126.6567, 37.4667, 't'],
    ['ic-juan', '주안', 'Juan', 126.68, 37.4648, 't'],
    ['ic-dongam', '동암', 'Dongam', 126.7029, 37.471, 't'],
    ['ic-sinpo', '신포', 'Sinpo', 126.6235, 37.4686, 'l'],
    ['ic-inha', '인하대', 'Inha Univ.', 126.656, 37.4485, 'l'],
    ['ic-songdo', '송도', 'Songdo', 126.6567, 37.428, 'l'],
    ['ic-gajeong', '가정', 'Gajeong', 126.6763, 37.5236, 'l'],
    ['ic-seokbawi', '석바위시장', 'Seokbawi Market', 126.6905, 37.4597, 'b'],
    ['ic-moraenae', '모래내시장', 'Moraenae Market', 126.7183, 37.4504, 'r'],
  ]),
);
SUBWAY_LINES.push(
  { id: 'I1', name: '인천1호선', en: 'Incheon Line 1', color: '#7CA8D5', net: 'incheon', stations: ['ic-gyeyang', 'ic-gyesan', 'ic-bupyeonggu', 'ic-bupyeong', 'ic-cityhall', 'ic-terminal', 'ic-munhak', 'ic-woninjae', 'ic-campustown', 'ic-centralpark', 'ic-ibd'] },
  { id: 'I2', name: '인천2호선', en: 'Incheon Line 2', color: '#ED8B00', net: 'incheon', stations: ['ic-geomam', 'ic-gajeong', 'ic-juan', 'ic-seokbawi', 'ic-cityhall', 'ic-moraenae'] },
  { id: 'IK', name: '1호선(경인선)', en: 'Line 1', color: '#0052A4', net: 'incheon', stations: ['ic-incheon', 'ic-dongincheon', 'ic-jemulpo', 'ic-juan', 'ic-dongam', 'ic-bupyeong'] },
  { id: 'IS', name: '수인분당선', en: 'Suin-Bundang', color: '#F5C400', net: 'incheon', stations: ['ic-incheon', 'ic-sinpo', 'ic-inha', 'ic-songdo', 'ic-woninjae'] },
  { id: 'IA', name: '공항철도', en: 'AREX', color: '#0090D2', net: 'incheon', stations: ['ic-cheongna', 'ic-geomam', 'ic-gyeyang'] },
);
export const netOf = (stationId?: string): SubwayNet => stationOf(stationId)?.net ?? 'seoul';

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
