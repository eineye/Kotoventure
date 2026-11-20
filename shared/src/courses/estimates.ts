/**
 * Realistic time/cost estimates for the scenes of the five hand-written courses.
 * Minutes are typical for a first-time visitor; costs are KRW per person (stay: per room unless noted).
 */
import type { EstItem, SceneEst, TimeCat } from '../types';

const i = (min: number, cat: TimeCat, en: string, ko: string, cost?: number, perPerson?: boolean): EstItem => ({
  min, cat, label: { en, ko }, ...(cost ? { cost } : {}), ...(perPerson !== undefined ? { perPerson } : {}),
});
const stay = (en: string, ko: string, cost: number, perPerson = false): EstItem => ({ min: 0, cat: 'stay', label: { en, ko }, cost, perPerson });
const RECAP: SceneEst = { recap: true, items: [] };

export const ORIGINAL_EST: Record<string, SceneEst> = {
  /* Seoul Classic */
  'sc-1': { start: '10:00', items: [i(60, 'task', 'Immigration, baggage claim & customs', '입국심사·수하물·세관')] },
  'sc-2': { items: [i(70, 'move', 'AREX to Seoul Station + Line 4 to Myeongdong', '공항철도 → 서울역 → 4호선 명동', 4950)] },
  'sc-3': { items: [i(10, 'walk', 'Walk to the hotel', '숙소까지 도보'), i(30, 'task', 'Hotel check-in', '호텔 체크인'), i(90, 'visit', 'Myeongdong street food', '명동 길거리 음식', 8000), stay('Hotel in Myeongdong', '명동 호텔', 120000)] },
  'sc-4': { start: '18:00', items: [i(15, 'walk', 'Walk to Euljiro', '을지로까지 도보')] },
  'sc-5': { items: [i(10, 'walk', 'Walk to the noraebang', '노래방까지 도보'), i(120, 'visit', 'Noraebang (karaoke room)', '노래방', 12500), stay('Hotel in Myeongdong', '명동 호텔', 120000)] },
  'sc-6': { start: '09:00', items: [i(10, 'walk', 'Walk to the pharmacy', '약국까지 도보'), i(60, 'task', 'Clinic visit (waiting + consultation)', '의원 진료 (대기 + 진료)', 20000), stay('Hotel in Myeongdong', '명동 호텔', 120000)] },
  'sc-p1': { start: '09:00', items: [] },
  'sc-8': RECAP,
  'sc-10': RECAP,
  'sc-p2': { start: '09:00', items: [] },
  'sc-7': RECAP,
  'sc-9': RECAP,
  'sc-11': { start: '16:00', items: [i(30, 'move', 'Subway to Yeouido Hangang Park', '여의도 한강공원까지 지하철', 1550), i(120, 'visit', 'Han River picnic', '한강 피크닉', 10000), i(25, 'move', 'Subway to Hongdae', '홍대까지 지하철', 1550), i(150, 'visit', 'Hongdae at night', '홍대 밤거리'), stay('Hotel in Myeongdong', '명동 호텔', 120000)] },
  'sc-12': { start: '09:00', items: [i(30, 'task', 'Check-out', '체크아웃'), i(120, 'visit', 'Last walk around Seoul Station', '서울역 주변 마지막 산책'), i(60, 'move', 'AREX to Incheon Airport', '공항철도로 인천공항', 4450), i(180, 'task', 'Airport: tax refund, check-in, security (3 h before)', '공항: 택스리펀드·체크인·보안검색 (출발 3시간 전)')] },

  /* Busan Food Trail */
  'bf-1': { start: '10:30', items: [i(45, 'task', 'Immigration at the ferry terminal', '여객터미널 입국심사'), i(25, 'move', 'Subway Line 1 to Jagalchi', '1호선 자갈치역까지', 1600)] },
  'bf-2': { items: [i(30, 'visit', 'Pick fish at the market', '시장에서 생선 고르기'), i(60, 'meal', 'Raw-fish lunch upstairs', '2층 횟집 점심', 30000)] },
  'bf-3': { items: [i(10, 'walk', 'Walk to Gukje Market', '국제시장까지 도보'), i(90, 'visit', 'Gukje Market & BIFF Square', '국제시장·BIFF 광장'), stay('Hotel in Nampo-dong', '남포동 호텔', 90000)] },
  'bf-4': { start: '08:30', items: [i(20, 'move', 'Subway to Seomyeon', '서면까지 지하철', 1600), i(40, 'meal', 'Dwaeji gukbap breakfast', '돼지국밥 아침', 9000)] },
  'bf-p1': { start: '10:00', items: [] },
  'bf-5': RECAP,
  'bf-6': RECAP,
  'bf-7': { start: '17:00', items: [i(180, 'meal', 'Chimaek on the beach & drone show', '해변 치맥과 드론쇼', 15000)] },
  'bf-8': { items: [i(60, 'visit', 'Baths & sauna rooms', '목욕탕·찜질 사우나'), stay('Jjimjilbang (per person)', '찜질방 (1인)', 18000, true)] },
  'bf-9': { start: '09:00', items: [i(40, 'move', 'Light rail to Gimhae Airport', '경전철로 김해공항', 1500), i(150, 'task', 'Airport: tax refund, check-in, security', '공항: 택스리펀드·체크인·보안검색')] },

  /* Gyeongju */
  'gj-1': { start: '08:00', items: [i(60, 'task', 'Immigration, baggage & customs', '입국심사·수하물·세관'), i(45, 'move', 'AREX express to Seoul Station', '공항철도 직통열차로 서울역', 11000), i(30, 'move', 'Taxi from Singyeongju to Hwangnidan-gil', '신경주역 → 황리단길 택시', 8000)] },
  'gj-2': { items: [i(30, 'task', 'Hanok check-in', '한옥 체크인'), i(90, 'visit', 'Stroll Hwangnidan-gil', '황리단길 산책'), stay('Hanok stay', '한옥스테이', 130000)] },
  'gj-3': { start: '09:00', items: [i(10, 'task', 'Rent bikes', '자전거 대여', 5000), i(150, 'visit', 'Daereungwon & Cheomseongdae by bike', '자전거로 대릉원·첨성대', 3000)] },
  'gj-4': { items: [i(40, 'move', 'Bus to Bulguksa', '불국사까지 버스', 1500), i(90, 'visit', 'Bulguksa Temple', '불국사'), i(45, 'visit', 'Seokguram Grotto', '석굴암')] },
  'gj-5': { items: [i(180, 'visit', 'Temple programme & monastic meal', '템플스테이 프로그램·발우공양'), stay('Temple stay (per person)', '템플스테이 (1인)', 70000, true)] },
  'gj-p1': { start: '09:00', items: [] },
  'gj-6': RECAP,
  'gj-7': RECAP,
  'gj-8': { start: '09:00', items: [i(30, 'task', 'Check-out', '체크아웃'), i(70, 'move', 'Airport bus to Gimhae', '김해공항 리무진 버스', 11000), i(150, 'task', 'Airport: tax refund, check-in, security', '공항: 택스리펀드·체크인·보안검색')] },

  /* Jeju */
  'jj-1': { start: '11:00', items: [i(30, 'task', 'Arrival & baggage', '도착·수하물'), i(40, 'task', 'Rental-car shuttle & paperwork', '렌터카 셔틀·계약')] },
  'jj-2': { items: [i(30, 'move', 'Drive to Aewol', '애월까지 운전', 5000, false), i(90, 'meal', 'BBQ dinner at the pension', '펜션 바비큐 저녁', 25000), stay('Pension in Aewol', '애월 펜션', 150000)] },
  'jj-3': { start: '06:00', items: [i(50, 'move', 'Drive to Seongpanak trailhead', '성판악 탐방로까지 운전', 6000, false), i(540, 'visit', 'Hallasan summit hike (round trip)', '한라산 정상 왕복 산행'), i(50, 'move', 'Drive back', '숙소로 복귀', 6000, false), stay('Pension in Aewol', '애월 펜션', 150000)] },
  'jj-4': { start: '05:00', items: [i(70, 'move', 'Drive to Seongsan', '성산까지 운전', 8000, false), i(90, 'visit', 'Sunrise climb', '일출 등반'), i(60, 'meal', 'Haenyeo seafood', '해녀의 집 해산물', 20000)] },
  'jj-5': { items: [i(180, 'visit', 'Olle Trail 1 by e-bike', '올레 1코스 전기자전거', 20000), stay('Pension in Aewol', '애월 펜션', 150000)] },
  'jj-6': { start: '08:00', items: [i(20, 'task', 'Check alerts & change plans', '재난문자 확인·일정 변경')] },
  'jj-p1': { start: '09:00', items: [] },
  'jj-m': RECAP,
  'jj-7': { items: [i(10, 'walk', 'Walk to the restaurant', '식당까지 도보'), stay('Pension in Aewol', '애월 펜션', 150000)] },
  'jj-8': { start: '09:00', items: [i(30, 'task', 'Refuel & return the car', '주유·렌터카 반납', 40000, false), i(20, 'move', 'Shuttle to the airport', '공항 셔틀'), i(120, 'task', 'Check-in & security', '체크인·보안검색')] },

  /* K-Culture Live */
  'kc-1': { start: '11:00', items: [i(40, 'task', 'Immigration & baggage', '입국심사·수하물'), i(40, 'move', 'Line 9 / AREX to Hongdae', '9호선·공항철도로 홍대', 1650)] },
  'kc-2': { items: [i(120, 'visit', 'K-pop dance class', 'K-팝 댄스 클래스', 50000), i(60, 'visit', 'Hongdae buskers', '홍대 버스킹'), stay('Guesthouse dorm (per person)', '게스트하우스 (1인)', 35000, true)] },
  'kc-3': { start: '09:00', items: [i(150, 'visit', 'Kimchi & bibimbap cooking class', '김치·비빔밥 쿠킹클래스', 60000)] },
  'kc-p1': { start: '13:00', items: [] },
  'kc-4': RECAP,
  'kc-5': { start: '09:00', items: [i(90, 'visit', 'K-beauty shopping', 'K-뷰티 쇼핑', 30000), i(20, 'move', 'Subway to Sinchon', '신촌까지 지하철', 1550), i(60, 'visit', 'PC bang', 'PC방')] },
  'kc-6': { items: [i(360, 'visit', 'DMZ tour (bus, checkpoints, tunnel, observatory)', 'DMZ 투어 (버스·검문소·땅굴·전망대)', 60000)] },
  'kc-7': { items: [i(60, 'task', 'Clinic visit (waiting + consultation)', '의원 진료 (대기 + 진료)', 15000), stay('Guesthouse dorm (per person)', '게스트하우스 (1인)', 35000, true)] },
  'kc-8': { start: '09:00', items: [i(120, 'visit', 'Last walk in Hongdae', '홍대 마지막 산책'), i(30, 'move', 'Subway to Gimpo Airport', '김포공항까지 지하철', 1550), i(120, 'task', 'Check-in & security', '체크인·보안검색')] },
};
