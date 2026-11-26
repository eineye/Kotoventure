/**
 * Simplified KTX network for the route-map & ticket-machine simulation.
 * Times/fares are approximate standard-class adult fares from Seoul Station (2025) – editable data.
 * Stations carry their real coordinates; the app draws them on a map of South Korea.
 */
export interface Station {
  id: string;
  ko: string;
  en: string;
  /** real position (WGS84) – the app projects it onto the illustrated map */
  lng: number;
  lat: number;
  line: 'gyeongbu' | 'gangneung' | 'honam' | 'jeolla' | 'hub';
  /** label position on the map: right (default), left, top, bottom */
  lp?: 'r' | 'l' | 't' | 'b';
  /** from Seoul Station: minutes and fare (KRW); undefined = not sold from Seoul Station */
  min?: number;
  fare?: number;
  note?: string;
}

export const STATIONS: Station[] = [
  { id: 'seoul', ko: '서울', en: 'Seoul', lng: 126.9707, lat: 37.5547, lp: 't', line: 'hub' },
  { id: 'yongsan', ko: '용산', en: 'Yongsan', lng: 126.9648, lat: 37.5299, lp: 'l', line: 'hub', note: 'Honam/Jeolla KTX mostly depart here' },
  { id: 'gwangmyeong', ko: '광명', en: 'Gwangmyeong', lng: 126.8848, lat: 37.4163, lp: 'l', line: 'gyeongbu', min: 18, fare: 8400 },
  { id: 'cheonan-asan', ko: '천안아산', en: 'Cheonan-Asan', lng: 127.1045, lat: 36.7945, lp: 'l', line: 'gyeongbu', min: 38, fare: 14400 },
  { id: 'osong', ko: '오송', en: 'Osong', lng: 127.3275, lat: 36.6203, lp: 'r', line: 'gyeongbu', min: 48, fare: 18500 },
  { id: 'daejeon', ko: '대전', en: 'Daejeon', lng: 127.4348, lat: 36.3323, lp: 'r', line: 'gyeongbu', min: 60, fare: 23700 },
  { id: 'gimcheon-gumi', ko: '김천구미', en: 'Gimcheon-Gumi', lng: 128.1813, lat: 36.1135, lp: 'l', line: 'gyeongbu', min: 85, fare: 34100 },
  { id: 'dongdaegu', ko: '동대구', en: 'Dongdaegu (Daegu)', lng: 128.6283, lat: 35.8793, lp: 'b', line: 'gyeongbu', min: 108, fare: 43500 },
  { id: 'singyeongju', ko: '신경주', en: 'Singyeongju (Gyeongju)', lng: 129.1897, lat: 35.7984, lp: 'r', line: 'gyeongbu', min: 125, fare: 49300 },
  { id: 'ulsan', ko: '울산', en: 'Ulsan', lng: 129.1378, lat: 35.5517, lp: 'r', line: 'gyeongbu', min: 140, fare: 53700 },
  { id: 'busan', ko: '부산', en: 'Busan', lng: 129.0414, lat: 35.1152, lp: 'b', line: 'gyeongbu', min: 160, fare: 59800 },
  { id: 'manjong', ko: '만종', en: 'Manjong (Wonju)', lng: 127.8966, lat: 37.3747, lp: 'b', line: 'gangneung', min: 60, fare: 15000 },
  { id: 'pyeongchang', ko: '평창', en: 'Pyeongchang', lng: 128.3966, lat: 37.5636, lp: 'b', line: 'gangneung', min: 95, fare: 23500 },
  { id: 'jinbu', ko: '진부(오대산)', en: 'Jinbu (Odaesan)', lng: 128.5594, lat: 37.6377, lp: 't', line: 'gangneung', min: 105, fare: 25000 },
  { id: 'gangneung', ko: '강릉', en: 'Gangneung', lng: 128.8977, lat: 37.7638, lp: 't', line: 'gangneung', min: 120, fare: 27600 },
  { id: 'gongju', ko: '공주', en: 'Gongju', lng: 127.1197, lat: 36.3632, lp: 'l', line: 'honam' },
  { id: 'iksan', ko: '익산', en: 'Iksan', lng: 126.9466, lat: 35.9405, lp: 'l', line: 'honam' },
  { id: 'jeongeup', ko: '정읍', en: 'Jeongeup', lng: 126.853, lat: 35.5754, lp: 'l', line: 'honam' },
  { id: 'gwangju-songjeong', ko: '광주송정', en: 'Gwangju-Songjeong', lng: 126.7936, lat: 35.1376, lp: 'l', line: 'honam' },
  { id: 'mokpo', ko: '목포', en: 'Mokpo', lng: 126.3911, lat: 34.791, lp: 'b', line: 'honam' },
  { id: 'jeonju', ko: '전주', en: 'Jeonju', lng: 127.1617, lat: 35.8497, lp: 'r', line: 'jeolla' },
  { id: 'namwon', ko: '남원', en: 'Namwon', lng: 127.3735, lat: 35.4097, lp: 'r', line: 'jeolla' },
  { id: 'suncheon', ko: '순천', en: 'Suncheon', lng: 127.4999, lat: 34.9455, lp: 'r', line: 'jeolla' },
  { id: 'yeosu', ko: '여수엑스포', en: 'Yeosu-EXPO', lng: 127.7437, lat: 34.753, lp: 'b', line: 'jeolla' },
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
