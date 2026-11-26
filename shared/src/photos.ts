/**
 * "See real photos" links. We link to an image search for the place or thing rather than to a
 * single photo URL, so links never break when a photo is removed: Naver Images for Korean users
 * (best Korean results), Google Images otherwise.
 */
import type { KnowledgeCard, L, Scene } from './types';

export function photoUrl(q: L | undefined, lang = 'en'): string | null {
  if (!q) return null;
  if (lang === 'ko') {
    const k = q.ko ?? q.en;
    return `https://search.naver.com/search.naver?where=image&query=${encodeURIComponent(k)}`;
  }
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${q.en} Korea`)}`;
}
/** host name shown under the link so users know where it goes */
export const photoHost = (lang = 'en') => (lang === 'ko' ? 'search.naver.com' : 'google.com/images');

const clean = (s?: string) => (s ?? '').split(/ – | → | & |, |\(/)[0].trim();

/** what to search for a scene: explicit photo query, else the place name */
export const scenePhotoQuery = (scene: Scene): L | undefined =>
  scene.photo ?? (scene.location ? { en: clean(scene.location.en), ko: clean(scene.location.ko ?? scene.location.en) } : undefined);

/** Search queries for knowledge cards (what a visitor would want to see a picture of). */
export const CARD_PHOTO: Record<string, [ko: string, en: string]> = {
  'tr-arex': ['인천공항철도 직통열차', 'AREX airport railroad train'],
  'tr-tmoney': ['지하철 개찰구 교통카드 태그', 'Seoul subway ticket gate T-money'],
  'tr-transfer': ['서울 지하철 환승 표지판', 'Seoul subway transfer sign'],
  'tr-bus': ['서울 시내버스 하차 단말기', 'Seoul city bus card reader'],
  'tr-taxi': ['서울 택시', 'Seoul taxi'],
  'tr-ktx': ['KTX 열차 서울역', 'KTX train Seoul Station'],
  'tr-bike': ['따릉이 서울 공공자전거', 'Ttareungyi Seoul public bike'],
  'tr-drive': ['국제운전면허증', 'International Driving Permit'],
  'tr-ferry': ['연안여객터미널 여객선', 'Korea passenger ferry terminal'],
  'tr-walk': ['횡단보도 보행신호 잔여시간', 'Korea crosswalk countdown signal'],
  'tr-subway': ['지하철 출구 번호 표지판', 'Seoul subway exit number sign'],
  'lo-hotel': ['서울 호텔 객실', 'Seoul hotel room'],
  'lo-airbnb': ['한국 아파트 숙소', 'Korean apartment homestay'],
  'lo-motel': ['한국 모텔 무인 키오스크', 'Korean motel self check-in kiosk'],
  'lo-jjimjil': ['찜질방 내부', 'jjimjilbang interior'],
  'lo-hanok': ['한옥스테이 온돌방', 'hanok stay ondol room'],
  'lo-temple': ['템플스테이 사찰', 'temple stay Korea'],
  'lo-pension': ['제주 펜션', 'Korean pension guesthouse'],
  'fo-bell': ['식당 테이블 호출벨', 'Korean restaurant table call bell'],
  'fo-bibimbap': ['비빔밥', 'bibimbap'],
  'fo-chimaek': ['치맥 치킨 맥주', 'chimaek chicken and beer'],
  'fo-baekban': ['백반 반찬', 'Korean baekban side dishes'],
  'fo-tang': ['설렁탕', 'seolleongtang soup'],
  'fo-jjigae': ['김치찌개 된장찌개', 'kimchi jjigae stew'],
  'fo-gukbap': ['부산 돼지국밥', 'Busan dwaeji gukbap'],
  'fo-bbq': ['고깃집 연기 흡입 파이프 불판', 'Korean BBQ smoke extractor grill'],
  'fo-street': ['길거리 음식 떡볶이 호떡', 'Korean street food tteokbokki hotteok'],
  'fo-drink': ['소주 맥주 술자리', 'soju Korean drinking culture'],
  'fo-manners': ['한국 식사 예절 수저', 'Korean table manners spoon chopsticks'],
  'fo-kimchi': ['김치 종류 백김치 깍두기 총각김치', 'types of kimchi kkakdugi baek kimchi'],
  'fo-solo': ['식당 키오스크 주문', 'Korean restaurant ordering kiosk'],
  'fo-ssam': ['삼겹살 쌈 쌈장', 'samgyeopsal ssam ssamjang lettuce wrap'],
  'mo-notes': ['한국 지폐 천원 오천원 만원 오만원', 'Korean won banknotes'],
  'mo-coins': ['한국 동전 10원 50원 100원 500원', 'Korean won coins'],
  'mo-exchange': ['공항 환전소', 'Incheon airport currency exchange'],
  'mo-atm': ['글로벌 ATM 외국인 카드', 'Korea global ATM foreign card'],
  'mo-card': ['카드 결제 단말기', 'Korea card payment terminal'],
  'mo-fx': ['환율 전광판', 'exchange rate board Korea'],
  'mo-tax': ['택스리펀드 키오스크', 'tax refund kiosk Korea'],
  'et-right': ['지하철 에스컬레이터 우측', 'Seoul escalator keep right'],
  'et-queue': ['지하철 승강장 줄서기 표시', 'Seoul subway platform queue lines'],
  'et-quiet': ['지하철 객실 안', 'Seoul subway car interior'],
  'et-seats': ['지하철 임산부석 노약자석', 'Seoul subway pregnant women seat'],
  'et-trash': ['분리수거함', 'Korea recycling bins'],
  'et-shoes': ['신발 벗는 현관', 'Korean shoes off entrance'],
  'et-hands': ['두 손으로 건네기 예절', 'Korean two hands etiquette'],
  'et-photo': ['경복궁 수문장', 'Gyeongbokgung royal guard'],
  'la-police': ['관광경찰', 'Korea tourist police'],
  'la-traffic': ['한국 교통 단속 카메라', 'Korea traffic camera'],
  'la-minor': ['금연구역 표지판', 'Korea no smoking area sign'],
  'la-drugs': ['인천공항 세관', 'Incheon airport customs'],
  'la-camera': ['드론 비행금지구역 표지', 'Korea no drone zone sign'],
  'la-safety': ['서울 밤거리', 'Seoul street at night'],
  'la-bukchon': ['북촌 한옥마을 관광 허용시간 안내판', 'Bukchon hanok village visiting hours sign'],
  'we-seasons': ['한국 사계절', 'Korea four seasons'],
  'we-heat': ['폭염 그늘막 횡단보도', 'Korea heatwave shade tent'],
  'we-rain': ['장마 집중호우 서울', 'Seoul monsoon heavy rain'],
  'we-dust': ['미세먼지 서울', 'Seoul fine dust'],
  'we-cold': ['한파 핫팩', 'Korea cold wave heat pack'],
  'we-alert': ['재난문자 휴대폰', 'Korea emergency alert phone'],
  'me-pharmacy': ['약국 간판', 'Korean pharmacy sign'],
  'me-conv': ['편의점 상비약', 'Korea convenience store medicine'],
  'me-chae': ['소화제 활명수', 'Korean digestive medicine'],
  'me-clinic': ['동네 의원 내과', 'Korean local clinic'],
  'me-hanui': ['한의원 침', 'Korean medicine clinic acupuncture'],
  'me-er': ['응급실 입구', 'Korea hospital emergency room'],
  'me-insurance': ['여행자 보험', 'travel insurance'],
  'me-1330': ['1330 관광통역안내', '1330 Korea travel hotline'],
  'me-firstaid': ['구급상자 응급처치', 'first aid kit'],
  'cv-stores': ['편의점 GS25 CU 이마트24 세븐일레븐', 'Korean convenience store GS25 CU'],
  'cv-food': ['편의점 삼각김밥 컵라면 도시락', 'Korean convenience store triangle kimbap cup ramen'],
  'cv-howto': ['편의점 온수기 전자레인지 라면 조리기', 'Korean convenience store hot water ramen machine'],
  'cv-unmanned': ['무인 아이스크림 가게 키오스크', 'Korea unmanned ice cream store'],
};
export const cardPhotoQuery = (card: KnowledgeCard): L => {
  if (card.photo) return card.photo;
  const p = CARD_PHOTO[card.id];
  return p ? { ko: p[0], en: p[1] } : { en: card.title.en, ko: card.title.ko ?? card.title.en };
};

/** Better photo queries for scenes of the hand-written courses. */
export const SCENE_PHOTO: Record<string, [ko: string, en: string]> = {
  'sc-1': ['인천공항 제1터미널 입국장', 'Incheon Airport Terminal 1 arrivals'],
  'sc-2': ['공항철도 서울역 4호선 명동역', 'AREX Seoul Station Myeongdong station'],
  'sc-2b': ['인천공항 리무진버스 6015 명동', 'Incheon Airport limousine bus 6015 Myeongdong'],
  'sc-2c': ['인천공항 택시 승강장', 'Incheon Airport taxi rank'],
  'sc-3': ['명동 길거리 음식 야시장', 'Myeongdong street food'],
  'sc-4': ['을지로 삼겹살 고깃집', 'Euljiro samgyeopsal restaurant'],
  'sc-5': ['노래방 내부', 'Korean noraebang room'],
  'sc-6': ['명동 약국', 'Myeongdong pharmacy'],
  'sc-8': ['북촌 한옥마을', 'Bukchon Hanok Village'],
  'sc-10': ['N서울타워 야경', 'N Seoul Tower night'],
  'sc-7': ['경복궁 근정전 한복', 'Gyeongbokgung Palace hanbok'],
  'sc-9': ['성수동 카페거리', 'Seongsu-dong cafe street'],
  'sc-11': ['여의도 한강공원 홍대', 'Yeouido Hangang Park Hongdae'],
  'sc-12': ['인천공항 출국장', 'Incheon Airport departures'],
  'bf-1': ['부산항 국제여객터미널', 'Busan Port International Passenger Terminal'],
  'bf-2': ['자갈치시장', 'Jagalchi Fish Market'],
  'bf-3': ['국제시장 BIFF광장 씨앗호떡', 'Gukje Market BIFF Square'],
  'bf-4': ['서면 돼지국밥 골목', 'Seomyeon dwaeji gukbap'],
  'bf-5': ['감천문화마을', 'Gamcheon Culture Village'],
  'bf-6': ['해운대 해수욕장', 'Haeundae Beach'],
  'bf-7': ['광안리 드론쇼 광안대교', 'Gwangalli drone show'],
  'bf-8': ['센텀시티 스파랜드 찜질방', 'Spa Land Centum City'],
  'bf-9': ['김해국제공항', 'Gimhae International Airport'],
  'gj-1': ['서울역 KTX 승강장', 'Seoul Station KTX platform'],
  'gj-2': ['황리단길 한옥', 'Hwangnidan-gil hanok'],
  'gj-3': ['대릉원 첨성대', 'Daereungwon Cheomseongdae'],
  'gj-4': ['불국사 다보탑 석가탑', 'Bulguksa Dabotap Seokgatap'],
  'gj-5': ['템플스테이 발우공양', 'temple stay barugongyang'],
  'gj-6': ['교촌마을 쌈밥', 'Gyochon village ssambap'],
  'gj-7': ['경주 남산 등산로', 'Gyeongju Namsan trail'],
  'gj-8': ['김해국제공항', 'Gimhae International Airport'],
  'jj-1': ['제주국제공항 렌터카 하우스', 'Jeju Airport rental car house'],
  'jj-2': ['애월 펜션', 'Aewol pension Jeju'],
  'jj-3': ['한라산 백록담 성판악', 'Hallasan Baengnokdam'],
  'jj-4': ['성산일출봉 해녀', 'Seongsan Ilchulbong haenyeo'],
  'jj-5': ['제주올레 1코스', 'Jeju Olle trail 1'],
  'jj-6': ['제주 태풍', 'Jeju typhoon'],
  'jj-m': ['제주 동문시장', 'Jeju Dongmun Market'],
  'jj-7': ['제주 흑돼지 거리', 'Jeju black pork street'],
  'jj-8': ['제주국제공항', 'Jeju International Airport'],
  'kc-1': ['김포공항 9호선', 'Gimpo Airport subway line 9'],
  'kc-2': ['홍대 버스킹 댄스', 'Hongdae busking dance'],
  'kc-3': ['인사동 쿠킹클래스 김치', 'Insadong kimchi cooking class'],
  'kc-4': ['망원 한강공원 라면', 'Han River ramyeon convenience store'],
  'kc-5': ['명동 화장품 거리 PC방', 'Myeongdong cosmetics street PC bang'],
  'kc-6': ['임진각 DMZ 제3땅굴', 'Imjingak DMZ third tunnel'],
  'kc-7': ['신촌 이비인후과', 'Korean ENT clinic'],
  'kc-8': ['김포국제공항 국제선', 'Gimpo International Airport'],
};
