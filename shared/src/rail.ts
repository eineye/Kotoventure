/**
 * Simplified KTX network for the route-map & ticket-machine simulation.
 * Times/fares are approximate standard-class adult fares from Seoul Station (2025) – editable data.
 * Coordinates are for a 300×410 schematic map (legend below y=380).
 */
export interface Station {
  id: string;
  ko: string;
  en: string;
  x: number;
  y: number;
  line: 'gyeongbu' | 'gangneung' | 'honam' | 'jeolla' | 'hub';
  /** label position on the map: right (default), left, top, bottom */
  lp?: 'r' | 'l' | 't' | 'b';
  /** from Seoul Station: minutes and fare (KRW); undefined = not sold from Seoul Station */
  min?: number;
  fare?: number;
  note?: string;
}

export const STATIONS: Station[] = [
  { id: 'seoul', ko: '서울', en: 'Seoul', x: 150, y: 40, lp: 't', line: 'hub' },
  { id: 'yongsan', ko: '용산', en: 'Yongsan', x: 122, y: 58, lp: 'l', line: 'hub', note: 'Honam/Jeolla KTX mostly depart here' },
  { id: 'gwangmyeong', ko: '광명', en: 'Gwangmyeong', x: 140, y: 80, lp: 'l', line: 'gyeongbu', min: 18, fare: 8400 },
  { id: 'cheonan-asan', ko: '천안아산', en: 'Cheonan-Asan', x: 142, y: 112, line: 'gyeongbu', min: 38, fare: 14400 },
  { id: 'osong', ko: '오송', en: 'Osong', x: 150, y: 140, line: 'gyeongbu', min: 48, fare: 18500 },
  { id: 'daejeon', ko: '대전', en: 'Daejeon', x: 165, y: 170, line: 'gyeongbu', min: 60, fare: 23700 },
  { id: 'gimcheon-gumi', ko: '김천구미', en: 'Gimcheon-Gumi', x: 192, y: 210, line: 'gyeongbu', min: 85, fare: 34100 },
  { id: 'dongdaegu', ko: '동대구', en: 'Dongdaegu (Daegu)', x: 215, y: 238, line: 'gyeongbu', min: 108, fare: 43500 },
  { id: 'singyeongju', ko: '신경주', en: 'Singyeongju (Gyeongju)', x: 248, y: 262, line: 'gyeongbu', min: 125, fare: 49300 },
  { id: 'ulsan', ko: '울산', en: 'Ulsan', x: 258, y: 296, line: 'gyeongbu', min: 140, fare: 53700 },
  { id: 'busan', ko: '부산', en: 'Busan', x: 240, y: 336, lp: 'b', line: 'gyeongbu', min: 160, fare: 59800 },
  { id: 'manjong', ko: '만종', en: 'Manjong (Wonju)', x: 200, y: 70, lp: 'b', line: 'gangneung', min: 60, fare: 15000 },
  { id: 'pyeongchang', ko: '평창', en: 'Pyeongchang', x: 232, y: 58, lp: 't', line: 'gangneung', min: 95, fare: 23500 },
  { id: 'jinbu', ko: '진부(오대산)', en: 'Jinbu (Odaesan)', x: 258, y: 66, lp: 'b', line: 'gangneung', min: 105, fare: 25000 },
  { id: 'gangneung', ko: '강릉', en: 'Gangneung', x: 284, y: 44, lp: 't', line: 'gangneung', min: 120, fare: 27600 },
  { id: 'gongju', ko: '공주', en: 'Gongju', x: 122, y: 172, lp: 'l', line: 'honam' },
  { id: 'iksan', ko: '익산', en: 'Iksan', x: 104, y: 208, lp: 'l', line: 'honam' },
  { id: 'jeongeup', ko: '정읍', en: 'Jeongeup', x: 90, y: 246, lp: 'l', line: 'honam' },
  { id: 'gwangju-songjeong', ko: '광주송정', en: 'Gwangju-Songjeong', x: 80, y: 282, lp: 'l', line: 'honam' },
  { id: 'mokpo', ko: '목포', en: 'Mokpo', x: 48, y: 330, lp: 'b', line: 'honam' },
  { id: 'jeonju', ko: '전주', en: 'Jeonju', x: 126, y: 226, line: 'jeolla' },
  { id: 'namwon', ko: '남원', en: 'Namwon', x: 140, y: 266, line: 'jeolla' },
  { id: 'suncheon', ko: '순천', en: 'Suncheon', x: 150, y: 316, line: 'jeolla' },
  { id: 'yeosu', ko: '여수엑스포', en: 'Yeosu-EXPO', x: 162, y: 350, lp: 'b', line: 'jeolla' },
];

export const LINES: { id: Station['line']; ko: string; en: string; color: string; path: string[] }[] = [
  { id: 'gyeongbu', ko: '경부선', en: 'Gyeongbu Line', color: '#1D4ED8', path: ['seoul', 'gwangmyeong', 'cheonan-asan', 'osong', 'daejeon', 'gimcheon-gumi', 'dongdaegu', 'singyeongju', 'ulsan', 'busan'] },
  { id: 'gangneung', ko: '강릉선', en: 'Gangneung Line', color: '#16A34A', path: ['seoul', 'manjong', 'pyeongchang', 'jinbu', 'gangneung'] },
  { id: 'honam', ko: '호남선', en: 'Honam Line', color: '#E5383B', path: ['yongsan', 'gwangmyeong', 'osong', 'gongju', 'iksan', 'jeongeup', 'gwangju-songjeong', 'mokpo'] },
  { id: 'jeolla', ko: '전라선', en: 'Jeolla Line', color: '#F08A24', path: ['iksan', 'jeonju', 'namwon', 'suncheon', 'yeosu'] },
];

export const stationById = (id?: string) => STATIONS.find((s) => s.id === id);

export interface TrainRun {
  no: string;
  dep: string;
  arr: string;
  soldOut: boolean;
  fare: number;
}

const hm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

/** Deterministic timetable from Seoul Station to `to` between 06:00 and 21:00. */
export function timetable(to: string): TrainRun[] {
  const st = stationById(to);
  if (!st?.min || !st.fare) return [];
  const gangneung = st.line === 'gangneung';
  const runs: TrainRun[] = [];
  let n = 0;
  for (let t = 6 * 60 + 5; t <= 21 * 60; t += gangneung ? 55 : 28 + ((n * 7) % 9)) {
    const no = gangneung ? 801 + n * 2 : 1 + n * 2;
    runs.push({ no: `KTX ${String(no).padStart(3, '0')}`, dep: hm(t), arr: hm(t + st.min + (n % 3) * 4), soldOut: n % 5 === 2, fare: st.fare });
    n++;
  }
  return runs;
}
