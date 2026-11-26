import type { KnowledgeCard } from './types';

/**
 * Knowledge cards = the "real life" facts a traveller must know.
 * Prices/rules change: the admin can edit every card. Text says "about" for prices on purpose.
 */
export const CARDS: KnowledgeCard[] = [
  // ───────────── TRANSPORT ─────────────
  {
    id: 'tr-arex', topic: 'transport', prop: 'arex',
    title: { en: 'AREX – Airport Railroad', ko: '공항철도 AREX' },
    body: { en: 'From Incheon Airport, the AREX Express runs non-stop to Seoul Station in about 45–50 min (about ₩11,000). The All-Stop train is cheaper (about ₩4,000–5,000), takes ~60 min and accepts T-money.', ko: '인천공항에서 서울역까지 직통열차 약 45~50분, 일반열차 약 60분.' },
    tips: [{ en: 'Airport limousine buses go directly to big hotel areas like Myeongdong – easier with heavy luggage.' }],
  },
  {
    id: 'tr-tmoney', topic: 'transport', prop: 'tmoney',
    title: { en: 'Subway tickets, T-money & deposit refund', ko: '지하철 표 사기·티머니·보증금 반환' },
    body: { en: 'Three ways to ride: a T-money card (rechargeable, also for buses, taxis and convenience stores), a single-journey card from the station machine, or a visitor/unlimited pass (e.g. Climate Card in Seoul).', ko: '티머니(충전식 교통카드), 1회용 교통카드(역 발매기), 외국인·정기권(예: 서울 기후동행카드) 중에서 골라요.' },
    tips: [
      { en: 'T-money: buy at a convenience store (₩3,000–4,000) and top up with CASH at the store or the station top-up machine.', ko: '티머니: 편의점에서 구입하고, 편의점이나 역 충전기에서 현금으로 충전해요.' },
      { en: 'Single-journey card: choose your destination on the ticket machine – the fare includes a ₩500 deposit. After the ride, put the card into the deposit-refund machine (보증금 환급기) to get ₩500 back.', ko: '1회용 교통카드: 발매기에서 목적지를 고르면 보증금 ₩500이 포함돼요. 내린 뒤 보증금 환급기에 넣으면 ₩500을 돌려받아요.' },
      { en: 'Gates: hold the card flat on the reader until it beeps, then walk through. One card per person – every person taps. Wide gates are for wheelchairs, strollers and big luggage.', ko: '개찰구: 카드를 단말기에 평평하게 대고 "삑" 소리가 나면 통과. 1인 1카드. 넓은 게이트는 휠체어·유모차·큰 짐용이에요.' },
      { en: 'Tap OUT at the exit gate too – the fare depends on distance.', ko: '나갈 때도 꼭 찍어요 – 요금은 거리에 따라 달라요.' },
    ],
    phrase: { hangul: '티머니 충전해 주세요', roman: 'Ti-meo-ni chung-jeon-hae ju-se-yo', meaning: 'Please top up my T-money' },
  },
  {
    id: 'tr-transfer', topic: 'transport', prop: 'subway-sign',
    title: { en: 'Free transfers (환승)', ko: '환승 방법' },
    body: { en: 'Subway ↔ bus transfers are free or discounted if you transfer within about 30 minutes (longer late at night). The trick: you MUST tap your card when getting OFF the bus too, or you lose the transfer.', ko: '버스 하차 시에도 카드를 찍어야 환승 할인.' },
    phrase: { hangul: '환승입니다', roman: 'Hwan-seung-im-ni-da', meaning: '"Transfer" (the reader says this when you tap)' },
    tips: [{ en: 'Subway lines are numbered AND colour-coded. Follow the colour + station number (e.g. 201).' }, { en: 'Use Naver Map or KakaoMap – Google Maps walking/driving directions are limited in Korea.' }],
  },
  {
    id: 'tr-bus', topic: 'transport', prop: 'bus',
    title: { en: 'City buses', ko: '시내버스' },
    body: { en: 'Board at the FRONT door and tap, exit at the BACK door and tap again. Press the red STOP button before your stop. Blue = trunk lines, green = local, red = express to suburbs, yellow = downtown loop (Seoul).', ko: '앞문 승차, 뒷문 하차. 하차벨을 미리 누르세요.' },
    tips: [{ en: 'Hold on – Korean buses start quickly.' }, { en: 'Takeaway drinks without a lid may be refused on Seoul buses.' }],
  },
  {
    id: 'tr-taxi', topic: 'transport', prop: 'taxi',
    title: { en: 'Taxis & ride apps', ko: '택시·호출앱' },
    body: { en: 'Orange/silver/white = regular taxis. BLACK "Deluxe/모범" taxis cost more. Kakao T (main Korean app) and Uber both work in big cities. A late-night surcharge applies around 22:00–04:00. No tipping.', ko: '일반택시와 모범택시(검정). 카카오T·우버 호출 가능. 심야할증 있음.' },
    phrase: { hangul: '여기로 가 주세요', roman: 'Yeo-gi-ro ga ju-se-yo', meaning: 'Please take me here (show the address)' },
    tips: [{ en: 'Show the destination in Korean on your phone.' }, { en: 'Fasten your seat belt – it is required in back seats too.' }],
  },
  {
    id: 'tr-ktx', topic: 'transport', prop: 'ktx',
    title: { en: 'KTX high-speed train', ko: 'KTX 고속열차' },
    body: { en: 'Seoul ↔ Busan in about 2.5 h, Seoul ↔ Gyeongju (Singyeongju) about 2 h. Book on the Korail app/website (Korail Talk) – weekends sell out. A KR Pass for foreigners gives unlimited rides for a set number of days.', ko: '서울-부산 약 2시간30분. 코레일톡 예매.' },
    tips: [{ en: 'Be on the platform a few minutes early: trains leave exactly on time.' }, { en: 'SRT is a second high-speed line leaving from Suseo (Gangnam).' }],
  },
  {
    id: 'tr-bike', topic: 'transport', prop: 'bike',
    title: { en: 'Bikes & e-scooters', ko: '자전거·전동킥보드' },
    body: { en: 'Seoul public bikes (Ttareungyi) can be rented by app. Ride on bike lanes, not crowded sidewalks. Electric kick-scooters legally need a driving licence, a helmet and only ONE rider – fines apply.', ko: '따릉이 앱 대여. 전동킥보드는 면허·헬멧 필수, 1인 탑승.' },
    tips: [{ en: 'Han River parks have long, flat bike paths – perfect at sunset.' }],
  },
  {
    id: 'tr-drive', topic: 'transport', prop: 'idp',
    title: { en: 'Driving: licence & IDP', ko: '운전: 국제운전면허' },
    body: { en: 'To rent a car or motorbike you need your home licence, passport and an International Driving Permit (Geneva/Vienna convention) – or a Korean licence. Drive on the RIGHT. Speed cameras are everywhere.', ko: '렌터카·오토바이: 국제운전면허증 + 본국면허 + 여권 필요. 우측 통행.' },
    tips: [{ en: 'Rental motorbikes require a motorcycle-class licence and a helmet.' }, { en: 'Jeju is the most popular self-drive island.' }],
  },
  {
    id: 'tr-ferry', topic: 'transport', prop: 'ferry',
    title: { en: 'Ferries & ports', ko: '여객선·항구' },
    body: { en: 'International ferries link Busan with Japan (Fukuoka, Osaka, Shimonoseki). Domestic ferries go to Jeju, Ulleungdo and islands. Bring your passport even for domestic ferries – ID is checked.', ko: '부산항국제여객터미널: 일본 노선. 국내 여객선도 신분증 필수.' },
    tips: [{ en: 'Ferries can be cancelled in strong wind – keep a buffer day.' }],
  },
  {
    id: 'tr-walk', topic: 'transport', prop: 'crosswalk',
    title: { en: 'Walking & crosswalks', ko: '도보·횡단보도' },
    body: { en: 'Cross only at crosswalks when the green walker is on – the number shows remaining seconds. Watch for right-turning cars and delivery motorbikes, which may still move. Jaywalking can be fined.', ko: '보행 신호(초록불)에만 횡단. 우회전 차량과 오토바이 주의.' },
  },
  // ───────────── LODGING ─────────────
  {
    id: 'lo-hotel', topic: 'lodging', prop: 'hotel',
    title: { en: 'Hotels', ko: '호텔' },
    body: { en: 'Check-in is usually 15:00, check-out 11:00–12:00. Most hotels keep your luggage for free before check-in. Electricity is 220 V with round two-pin plugs (Type C/F).', ko: '체크인 15시 전후. 220V 둥근 2핀 플러그.' },
    phrase: { hangul: '짐 좀 맡길 수 있을까요?', roman: 'Jim jom mat-gil su i-sseul-kka-yo?', meaning: 'Can I leave my luggage?' },
  },
  {
    id: 'lo-airbnb', topic: 'lodging', prop: 'house',
    title: { en: 'Airbnb & homestays', ko: '에어비앤비·민박' },
    body: { en: 'Book only listings that show a Korean business registration – unregistered rentals are illegal and can be cancelled. Respect quiet hours in apartments, separate your trash the local way and never use the building\'s shared spaces for parties.', ko: '영업 신고된 숙소만 예약. 아파트 소음·분리수거 주의.' },
  },
  {
    id: 'lo-motel', topic: 'lodging', prop: 'motel',
    title: { en: 'Motels & guesthouses', ko: '모텔·게스트하우스' },
    body: { en: 'Korean motels are cheap, private and usually very clean – walk-in is possible, often with self check-in kiosks. Guesthouses and hostels are the social, budget choice for solo travellers.', ko: '모텔은 저렴하고 깨끗한 편. 게스트하우스는 혼행족에게 인기.' },
  },
  {
    id: 'lo-jjimjil', topic: 'lodging', prop: 'jjimjilbang',
    title: { en: 'Jjimjilbang (Korean spa)', ko: '찜질방' },
    body: { en: 'A 24h bathhouse with saunas, a big shared hall and snacks. Entry includes a uniform and towel. The baths are gender-separated and NUDE; wash fully before entering the pool. You can sleep in the common hall cheaply – keep valuables in your locker.', ko: '24시간 사우나. 탕은 남녀 분리·탈의, 입욕 전 샤워 필수.' },
    tips: [{ en: 'Try sikhye (sweet rice drink) and baked eggs – the classic spa snack.' }, { en: 'Roll your towel into the famous "lamb head" (yangmeori) hat.' }],
  },
  {
    id: 'lo-hanok', topic: 'lodging', prop: 'hanok',
    title: { en: 'Hanok stay', ko: '한옥스테이' },
    body: { en: 'Traditional houses with heated floors (ondol). You sleep on a thick mattress (yo) on the floor. Shoes off on the stone step before the wooden floor. Walls are thin – keep voices low at night.', ko: '온돌방, 요 위에서 취침. 툇마루 전에 신발 벗기.' },
  },
  {
    id: 'lo-temple', topic: 'lodging', prop: 'temple',
    title: { en: 'Temple stay', ko: '템플스테이' },
    body: { en: 'Stay overnight at a Buddhist temple: wake up around 4 am, join chanting, the 108 bows and a silent monastic meal (barugongyang) where you finish every grain. Wear the provided clothes, no alcohol.', ko: '사찰에서 하룻밤. 새벽예불, 발우공양.' },
  },
  {
    id: 'lo-pension', topic: 'lodging', prop: 'pension',
    title: { en: 'Pension (group villa)', ko: '펜션' },
    body: { en: 'Self-catering villas in the countryside or by the sea, popular with families and groups. Many have a BBQ terrace (extra charge for charcoal). Check the max-guest number – extra people cost extra.', ko: '단체·가족 여행용 독채 숙소. 바비큐 가능.' },
  },
  // ───────────── FOOD ─────────────
  {
    id: 'fo-bell', topic: 'food', prop: 'call-bell',
    title: { en: 'Calling the staff', ko: '직원 호출' },
    body: { en: 'Many tables have a CALL BELL button. Otherwise raise your hand and say "Jeogiyo!" – it is polite, not rude. Water is often self-service, banchan (side dishes) are free and refillable. Pay at the counter on your way out. No tipping.', ko: '호출벨 또는 "저기요!". 물은 셀프, 반찬 리필 무료, 계산은 카운터.' },
    phrase: { hangul: '저기요! 반찬 좀 더 주세요', roman: 'Jeo-gi-yo! Ban-chan jom deo ju-se-yo', meaning: 'Excuse me! More side dishes, please' },
  },
  {
    id: 'fo-bibimbap', topic: 'food', prop: 'bibimbap',
    title: { en: 'Bibimbap', ko: '비빔밥' },
    body: { en: 'Rice topped with vegetables, egg and gochujang (chili paste). MIX everything well with your spoon before eating. In a hot stone bowl (dolsot) leave it a minute so the bottom rice gets crispy (nurungji).', ko: '고추장을 넣고 숟가락으로 잘 비벼 먹기. 돌솥은 누룽지까지.' },
    tips: [{ en: 'In Korea rice and soup are eaten with a SPOON; chopsticks are for side dishes.' }],
  },
  {
    id: 'fo-chimaek', topic: 'food', prop: 'chicken',
    title: { en: 'Chimaek (chicken + beer)', ko: '치맥' },
    body: { en: 'Korean fried chicken: crispy "fried", sweet-spicy "yangnyeom" or "ban-ban" (half & half). Pickled radish cubes cleanse the palate. You can even order delivery to a spot in a Han River park.', ko: '후라이드, 양념, 반반. 치킨무와 함께.' },
    phrase: { hangul: '반반 하나 주세요', roman: 'Ban-ban ha-na ju-se-yo', meaning: 'One half-and-half, please' },
  },
  {
    id: 'fo-baekban', topic: 'food', prop: 'baekban',
    title: { en: 'Baekban (home-style set)', ko: '백반' },
    body: { en: 'Rice, soup and many side dishes – the everyday Korean meal, cheap and filling. Common at lunch near offices. Some places serve only one menu: just sit down and hold up fingers for the number of people.', ko: '밥·국·반찬 정식. 인원수만 말하면 되는 곳도 많음.' },
  },
  {
    id: 'fo-tang', topic: 'food', prop: 'tang',
    title: { en: 'Tang & guk (soups)', ko: '탕·국' },
    body: { en: 'Seolleongtang & gomtang (beef bone broth) come unsalted – YOU season with salt and green onion on the table. Samgyetang (ginseng chicken) is eaten on the hottest summer days to "fight heat with heat".', ko: '설렁탕은 소금·파로 직접 간하기. 삼계탕은 복날 보양식.' },
  },
  {
    id: 'fo-jjigae', topic: 'food', prop: 'jjigae',
    title: { en: 'Jjigae (stews)', ko: '찌개' },
    body: { en: 'Kimchi-jjigae, doenjang-jjigae (soybean paste), sundubu (soft tofu). Often served in one bubbling pot to share – use your own spoon or a ladle. Very hot: blow and sip!', ko: '김치찌개·된장찌개·순두부. 냄비 하나를 함께 나눠 먹음.' },
  },
  {
    id: 'fo-gukbap', topic: 'food', prop: 'gukbap',
    title: { en: 'Dwaeji gukbap (Busan)', ko: '돼지국밥' },
    body: { en: 'Busan\'s soul food: pork broth with rice. Season it yourself with saeujeot (salted shrimp), chives (buchu) and chili paste. Dip pork slices in saeujeot too.', ko: '새우젓·부추로 간하기. 부산 대표 음식.' },
  },
  {
    id: 'fo-bbq', topic: 'food', prop: 'bbq',
    title: { en: 'Korean BBQ: how the table works', ko: '고깃집 이용법' },
    body: { en: 'Meat (samgyeopsal, moksal, galbi) is grilled on a grill built into your table – staff often grill and cut it for you. Most places need at least 2 portions (2인분 이상).', ko: '테이블 화로에서 고기를 구워 먹어요. 직원이 구워 주는 곳도 많고, 보통 2인분 이상 주문해요.' },
    tips: [
      { en: 'Smoke pipe: the silver duct above the grill sucks up smoke – pull it down close to the grill.', ko: '연기 흡입 파이프: 화로 위 은색 관을 아래로 내려 연기를 빨아들여요.' },
      { en: 'Scissors & tongs: meat is cut with kitchen scissors, flipped with tongs – there is no knife or fork.', ko: '가위·집게: 고기는 가위로 자르고 집게로 뒤집어요. 칼·포크는 없어요.' },
      { en: 'Cutlery drawer: spoons and chopsticks are in a drawer on the side of the table (or a box on it) – set them for everyone.', ko: '수저통: 식탁 옆 서랍(또는 통)에 수저가 있어요. 일행 수저를 놓아 주면 좋아요.' },
      { en: 'Storage seats: lift the seat of the stool – put your coat and bag inside so they don\'t smell of smoke (or ask for a cover/apron).', ko: '수납 의자: 의자 뚜껑을 열고 옷·가방을 넣어 냄새가 배지 않게 해요 (앞치마·옷 덮개도 요청 가능).' },
      { en: 'Finish with "후식 냉면" – a small bowl of cold noodles after the meat – or fried rice in the pan.', ko: '마무리는 후식 냉면이나 볶음밥!' },
    ],
    phrase: { hangul: '불판 좀 갈아 주세요', roman: 'Bul-pan jom ga-ra ju-se-yo', meaning: 'Please change the grill plate' },
  },
  {
    id: 'fo-street', topic: 'food', prop: 'hotteok',
    title: { en: 'Street & market food', ko: '길거리·시장 음식' },
    body: { en: 'Tteokbokki, hotteok (sweet pancake), eomuk (fish cake skewers – the broth is free), gimbap. Hotteok filling is boiling hot sugar: bite carefully. Markets often prefer cash.', ko: '떡볶이·호떡·어묵·김밥. 호떡 속 뜨거움 주의.' },
  },
  {
    id: 'fo-drink', topic: 'food', prop: 'soju',
    title: { en: 'Drinking culture', ko: '음주 문화' },
    body: { en: 'Legal drinking age is 19 (by year). Never pour your own glass – pour for others and they pour for you. Hold the bottle with two hands for elders and turn your head slightly away when drinking in front of them. "Geonbae!" = Cheers.', ko: '자작 금지, 어른께 두 손으로, 고개 돌려 마시기. 건배!' },
    phrase: { hangul: '건배!', roman: 'Geon-bae!', meaning: 'Cheers!' },
    tips: [{ en: 'It is fine to say no: "Jeo-neun an ma-syeo-yo" – I don\'t drink.' }],
  },
  {
    id: 'fo-manners', topic: 'food', prop: 'chopsticks',
    title: { en: 'Table manners & meal greetings', ko: '식사 예절과 인사' },
    body: { en: 'Before eating say "잘 먹겠습니다" (I will eat well); when you leave say "잘 먹었습니다" (I ate well) – to your host or to the restaurant staff at the counter.', ko: '식사 전 "잘 먹겠습니다", 다 먹고 나갈 때 "잘 먹었습니다"라고 인사해요.' },
    tips: [
      { en: 'Don\'t stick chopsticks upright in rice (it looks like a funeral ritual) and don\'t lift the rice bowl to your mouth.', ko: '밥에 수저를 꽂지 않고, 밥그릇을 들고 먹지 않아요.' },
      { en: 'Wait for the eldest to start eating; pour drinks for others, not yourself.', ko: '어른이 먼저 수저를 든 뒤 먹고, 술은 서로 따라 줘요.' },
      { en: 'Pay at the counter by the exit – no tipping.', ko: '계산은 출구 쪽 카운터에서, 팁은 없어요.' },
    ],
    phrase: { hangul: '잘 먹었습니다', roman: 'Jal meo-geot-seum-ni-da', meaning: 'I ate well – thank you (after a meal)' },
  },
  {
    id: 'fo-kimchi', topic: 'food', prop: 'kimchi',
    title: { en: 'Kinds of kimchi', ko: '김치의 종류' },
    body: { en: 'Kimchi comes with almost every meal and refills are free. Making it together in late autumn (gimjang) is UNESCO intangible heritage. Different dishes come with different kimchi:', ko: '김치는 거의 모든 식사에 나오고 리필은 무료예요. 김장 문화는 유네스코 인류무형문화유산이에요.' },
    tips: [
      { en: 'Baechu-kimchi (napa cabbage, red) – the classic. Baek-kimchi (white kimchi) – no chili, mild and refreshing.', ko: '배추김치 – 기본 김치. 백김치 – 고춧가루 없이 시원하고 순해요.' },
      { en: 'Kkakdugi – cubed radish, crunchy; served with gukbap and seolleongtang. Chonggak-kimchi – whole "ponytail" radishes.', ko: '깍두기 – 깍둑썬 무, 국밥·설렁탕과 함께. 총각김치 – 작은 무를 통째로.' },
      { en: 'Pa-kimchi – green onion, great with BBQ. Geotjeori – fresh, unfermented "salad" kimchi, often with kalguksu or bossam.', ko: '파김치 – 고기와 찰떡. 겉절이 – 익히지 않은 생김치, 칼국수·보쌈과 함께.' },
      { en: 'Cut long kimchi with the scissors on the table if needed.', ko: '긴 김치는 식탁의 가위로 잘라 먹어도 돼요.' },
    ],
  },
  {
    id: 'fo-solo', topic: 'food', prop: 'kiosk',
    title: { en: 'Eating alone & kiosks', ko: '혼밥·키오스크' },
    body: { en: 'Solo dining (honbap) is common now. Many places use kiosks or table tablets with English. Some BBQ/stew places require a 2-person minimum order – look for "1인분 가능" (single portion OK).', ko: '혼밥 OK. 1인분 가능 확인.' },
  },
  // ───────────── MONEY ─────────────
  {
    id: 'mo-notes', topic: 'money', prop: 'krw-notes',
    title: { en: 'Korean banknotes', ko: '지폐' },
    body: { en: '₩1,000 (blue, Yi Hwang) · ₩5,000 (red-orange, Yi I) · ₩10,000 (green, King Sejong) · ₩50,000 (yellow, Shin Saimdang). ₩5,000 and ₩50,000 look alike in colour – check the number!', ko: '천원(파랑), 오천원(주황), 만원(초록), 오만원(노랑).' },
  },
  {
    id: 'mo-coins', topic: 'money', prop: 'coins',
    title: { en: 'Coins', ko: '동전' },
    body: { en: '₩10 (gold, Dabotap pagoda), ₩50 (rice plant), ₩100 (Admiral Yi Sun-sin), ₩500 (crane). Coins are used less and less – many cafes are card-only and give no change.', ko: '10원·50원·100원·500원.' },
  },
  {
    id: 'mo-exchange', topic: 'money', prop: 'exchange',
    title: { en: 'Exchanging money', ko: '환전' },
    body: { en: 'Airport rates are poor: change only a little there. Licensed money changers in Myeongdong usually give better rates (bring your passport). Unmanned exchange kiosks (e.g. WOWPASS machines) are in hotels and subway stations.', ko: '공항은 소액만. 명동 사설 환전소가 유리. 여권 지참.' },
    phrase: { hangul: '환전하고 싶어요', roman: 'Hwan-jeon-ha-go si-peo-yo', meaning: 'I\'d like to exchange money' },
  },
  {
    id: 'mo-atm', topic: 'money', prop: 'atm',
    title: { en: 'ATMs & banks', ko: 'ATM·은행' },
    body: { en: 'Use ATMs marked "Global ATM" / "Foreign Card" (big banks, many convenience stores). Choose ENGLISH on screen and ALWAYS decline "conversion to your currency" (DCC). Banks open about 09:00–16:00 on weekdays.', ko: 'Global ATM 이용, 원화로 인출. 은행은 평일 9~16시.' },
  },
  {
    id: 'mo-card', topic: 'money', prop: 'phone-pay',
    title: { en: 'Cards & mobile pay', ko: '카드·모바일 결제' },
    body: { en: 'Visa/Mastercard work almost everywhere, even for small amounts. Foreign Apple/Google Pay works only at some terminals – carry a physical card. Some apps (Kakao Pay, Naver Pay, Alipay+, WOWPASS) now work with foreign cards or partner wallets.', ko: '해외카드 대부분 가능. 실물카드 필수 지참.' },
  },
  {
    id: 'mo-fx', topic: 'money', prop: 'exchange-rate',
    title: { en: 'Exchange rate & budget', ko: '환율·예산' },
    body: { en: 'Prices are in won (₩, KRW). Drop three zeros for a quick feel: ₩10,000 is roughly 7 USD / 11 AUD (rates move – check a live rate). A simple meal is about ₩10,000–15,000, a coffee ₩4,000–6,000, a subway ride ₩1,500–2,000.', ko: '₩10,000 ≈ 7달러. 환율은 실시간 확인.' },
  },
  {
    id: 'mo-tax', topic: 'money', prop: 'tax-refund',
    title: { en: 'Tax-free shopping', ko: '택스리펀드' },
    body: { en: 'Look for "Tax Free" shops. Show your passport: many stores refund the VAT instantly for qualifying purchases (from about ₩15,000). Otherwise use refund kiosks at the airport before check-in.', ko: '여권 제시, 즉시환급 또는 공항 키오스크.' },
  },
  // ───────────── ETIQUETTE ─────────────
  {
    id: 'et-right', topic: 'etiquette', prop: 'walk-right',
    title: { en: 'Keep right', ko: '우측 보행' },
    body: { en: 'Walk on the RIGHT on stairs, corridors and sidewalks. On escalators, stand still and hold the handrail. Don\'t stop suddenly in the middle of a busy flow to take photos.', ko: '계단·통로는 우측 통행.' },
  },
  {
    id: 'et-queue', topic: 'etiquette', prop: 'queue',
    title: { en: 'Queueing', ko: '줄서기' },
    body: { en: 'Koreans queue everywhere: subway doors (stand at the side, let people out first), buses, taxi stands, popular restaurants (write your name on the waiting list or use the tablet).', ko: '지하철은 내리는 사람 먼저. 맛집은 대기 명단.' },
  },
  {
    id: 'et-quiet', topic: 'etiquette', prop: 'quiet',
    title: { en: 'Quiet in public', ko: '공공장소 정숙' },
    body: { en: 'Subways and buses are quiet: speak softly, no speaker-phone, no loud videos. Avoid eating smelly food on the subway. Residential areas (like Bukchon) are people\'s homes – whisper.', ko: '대중교통에서는 조용히. 주거지역 소음 주의.' },
  },
  {
    id: 'et-seats', topic: 'etiquette', prop: 'priority-seat',
    title: { en: 'Priority seats', ko: '노약자·임산부석' },
    body: { en: 'Seats at the end of subway cars are for the elderly, disabled and pregnant. Pink seats are for pregnant women – leave them empty. Respect for elders is a core value: offer your seat.', ko: '노약자석, 분홍색 임산부 배려석은 비워두기.' },
  },
  {
    id: 'et-trash', topic: 'etiquette', prop: 'trash-bins',
    title: { en: 'Trash & recycling', ko: '쓰레기 분리배출' },
    body: { en: 'Public bins are rare – carry a small bag and take trash back to your lodging. Korea separates general waste, recyclables (plastic, cans, paper, glass) and food waste. Empty liquids from cups first.', ko: '공공 쓰레기통이 적음. 일반·재활용·음식물 분리.' },
  },
  {
    id: 'et-shoes', topic: 'etiquette', prop: 'shoes-off',
    title: { en: 'Shoes off', ko: '신발 벗기' },
    body: { en: 'Take shoes off in homes, hanok, temples\' halls, many traditional restaurants with floor seating and jjimjilbang. If you see a step up and shoes lined up – that\'s your signal.', ko: '단이 높아지고 신발이 놓여 있으면 벗기.' },
  },
  {
    id: 'et-hands', topic: 'etiquette', prop: 'two-hands',
    title: { en: 'Two hands & bowing', ko: '두 손·인사' },
    body: { en: 'Give and receive things (money, cards, gifts, drinks) with two hands, or your right hand with the left touching your wrist. A small bow with "Annyeonghaseyo" is the standard greeting.', ko: '두 손으로 주고받기. 가볍게 목례.' },
    phrase: { hangul: '안녕하세요', roman: 'An-nyeong-ha-se-yo', meaning: 'Hello' },
  },
  {
    id: 'et-photo', topic: 'etiquette', prop: 'camera',
    title: { en: 'Photo manners', ko: '촬영 예절' },
    body: { en: 'Ask before photographing people, especially children, elders, haenyeo divers and monks. Shops and pop-ups may ban photos – look for the sign.', ko: '사람 촬영 전 동의 구하기.' },
    phrase: { hangul: '사진 찍어도 돼요?', roman: 'Sa-jin jji-geo-do dwae-yo?', meaning: 'May I take a photo?' },
  },
  // ───────────── LAW ─────────────
  {
    id: 'la-police', topic: 'law', prop: 'police',
    title: { en: 'Police & tourist police', ko: '경찰·관광경찰' },
    body: { en: 'Emergency: 112. Tourist Police (blue/navy uniform & beret) patrol Myeongdong, Hongdae, Itaewon and other hotspots and speak foreign languages. Lost items: lost112.go.kr or the nearest police box (파출소).', ko: '112. 관광경찰은 주요 관광지에 상주.' },
  },
  {
    id: 'la-traffic', topic: 'law', prop: 'crosswalk',
    title: { en: 'Traffic rules', ko: '교통법규' },
    body: { en: 'Drive on the right. Drink-driving limit is 0.03% BAC – just one drink can be too much, and penalties are severe (also for e-scooters & bikes). Right turns on red: stop first and give way to pedestrians. School zones: 30 km/h.', ko: '음주운전 0.03%. 스쿨존 30km/h.' },
  },
  {
    id: 'la-minor', topic: 'law', prop: 'no-smoking',
    title: { en: 'Minor offences (경범죄)', ko: '경범죄' },
    body: { en: 'Fines exist for littering, smoking in no-smoking zones (most streets near stations, parks, bus stops), jaywalking, public urination and drunken disorder. Smoke only in marked smoking booths.', ko: '쓰레기 투기·금연구역 흡연·무단횡단 등 과태료.' },
  },
  {
    id: 'la-drugs', topic: 'law', prop: 'no-drugs',
    title: { en: 'Drugs & medicines', ko: '마약·의약품 반입' },
    body: { en: 'Korea has zero tolerance: cannabis is illegal even if legal at home (CBD products too). Some prescription meds (e.g. ADHD stimulants, strong painkillers) are restricted – bring the doctor\'s note and original packaging, and check before you fly.', ko: '대마·CBD 불법. 일부 처방약 반입 제한.' },
  },
  {
    id: 'la-camera', topic: 'law', prop: 'drone',
    title: { en: 'Filming, drones & privacy', ko: '촬영·드론·사생활' },
    body: { en: 'Secretly filming people is a serious crime. Drones are banned over much of central Seoul and near military sites; you need permission elsewhere. In the DMZ follow the guide: photos are allowed only at marked spots.', ko: '몰래 촬영은 중범죄. 서울 도심 드론 금지구역.' },
  },
  {
    id: 'la-safety', topic: 'law', prop: 'alert-phone',
    title: { en: 'Crime prevention', ko: '범죄 예방' },
    body: { en: 'Korea is very safe, but: watch drinks in clubs, use official taxis/apps, beware of "free" street fortune-telling or religious invitations, and keep your passport in the hotel safe (carry a copy). Lost phones are often returned via police.', ko: '대체로 안전. 음료 관리, 공식 택시, 여권 사본.' },
  },
  {
    id: 'la-bukchon', topic: 'law', prop: 'quiet',
    title: { en: 'Bukchon curfew zone', ko: '북촌 관광 제한구역' },
    body: { en: 'Parts of Bukchon Hanok Village are a "special management zone": tourists may visit only during daytime hours (roughly 10:00–17:00) and fines can apply outside them. People live here – no shouting, no entering gates.', ko: '북촌 특별관리지역: 관광 허용시간 준수, 과태료.' },
  },
  // ───────────── WEATHER ─────────────
  {
    id: 'we-seasons', topic: 'weather', prop: 'seasons',
    title: { en: 'Four seasons', ko: '사계절' },
    body: { en: 'Spring (Mar–May): cherry blossoms, mild, yellow-dust days. Summer (Jun–Aug): hot & humid, monsoon rains (jangma) from late June. Autumn (Sep–Nov): clear skies, red leaves – best season. Winter (Dec–Feb): dry and freezing, often −10 °C in Seoul.', ko: '봄 황사, 여름 장마·폭염, 가을 단풍, 겨울 한파.' },
  },
  {
    id: 'we-heat', topic: 'weather', prop: 'heatwave',
    title: { en: 'Heatwaves & tropical nights', ko: '폭염·열대야' },
    body: { en: 'Recent summers have broken records: 35 °C+ days and nights that stay above 25 °C. Summer now feels longer and autumn heat can last into September–October. Drink water, rest in "heat shelters" (cooling centres) and avoid hiking at midday.', ko: '최근 기록적 폭염·긴 여름. 무더위쉼터 이용.' },
  },
  {
    id: 'we-rain', topic: 'weather', prop: 'typhoon',
    title: { en: 'Monsoon, downpours & typhoons', ko: '장마·집중호우·태풍' },
    body: { en: 'Sudden extreme downpours have become more frequent – underpasses and semi-basement rooms can flood. Typhoons mainly hit Jeju and the south coast in Aug–Sep: flights and ferries get cancelled. Follow the emergency alerts on your phone.', ko: '국지성 집중호우 증가. 태풍 시 항공·배 결항.' },
  },
  {
    id: 'we-dust', topic: 'weather', prop: 'fine-dust',
    title: { en: 'Fine dust (미세먼지)', ko: '미세먼지·황사' },
    body: { en: 'Some days (mostly late winter–spring) the air quality is bad. Check an AQI app; on "bad" days wear a KF94 mask (sold at convenience stores) and keep outdoor activity short.', ko: '미세먼지 "나쁨"이면 KF94 마스크.' },
  },
  {
    id: 'we-cold', topic: 'weather', prop: 'winter',
    title: { en: 'Cold waves', ko: '한파' },
    body: { en: 'Siberian cold snaps bring −15 °C wind chill. Dress in layers, use heat packs (hot packs at convenience stores) and watch for black ice. Warm floors (ondol) make indoors cosy.', ko: '한파 시 핫팩·겹쳐 입기, 블랙아이스 주의.' },
  },
  {
    id: 'we-alert', topic: 'weather', prop: 'alert-phone',
    title: { en: 'Emergency alerts', ko: '재난문자' },
    body: { en: 'Your phone may blast loud emergency alerts (heat, rain, earthquake, missing person). They are in Korean (often with English). Install the "Emergency Ready" (Safety Korea) app for alerts and shelters in English.', ko: '재난문자 수신. 안전디딤돌 앱(영문).' },
  },
  {
    id: 'we-blossom', topic: 'weather', prop: 'spring',
    title: { en: 'Cherry-blossom season', ko: '벚꽃 시즌' },
    body: { en: 'Late March–mid April the cherry trees bloom from Jeju and Busan up to Seoul. Festivals (Jinhae, Yeouido, Gyeongju) are packed on weekends, and evenings are still chilly – bring a light jacket.', ko: '3월 말–4월 중순, 남쪽부터 벚꽃이 피어요. 주말 축제는 붐비고 저녁은 아직 쌀쌀해요.' },
    tips: [
      { en: 'Go on a weekday morning – weekend festival roads and trains are crowded.', ko: '평일 오전에 가세요. 주말 축제 도로와 열차는 붐벼요.' },
      { en: 'Spring days can also bring yellow dust – check the air quality and carry a mask.', ko: '봄에는 황사도 와요. 대기질을 확인하고 마스크를 챙기세요.' },
    ],
  },
  {
    id: 'we-foliage', topic: 'weather', prop: 'autumn',
    title: { en: 'Autumn leaves', ko: '단풍철' },
    body: { en: 'Mid October–mid November the mountains turn red and gold, starting in Seoraksan and moving south. It is the busiest hiking season: trails and buses to national parks are crowded at weekends.', ko: '10월 중순–11월 중순, 설악산부터 남쪽으로 단풍이 내려와요. 주말 국립공원 등산로와 버스는 붐벼요.' },
    tips: [
      { en: 'Mornings can be near 5 °C and afternoons 20 °C – dress in layers.', ko: '아침 5°C, 오후 20°C까지 일교차가 커요. 겹쳐 입으세요.' },
      { en: 'The sun sets around 17:30 in November – start hikes early.', ko: '11월엔 17시 30분쯤 해가 져요. 산행은 일찍 시작하세요.' },
    ],
  },
  {
    id: 'we-snow', topic: 'weather', prop: 'winter',
    title: { en: 'Snow & black ice', ko: '눈·빙판길' },
    body: { en: 'From December to February snow and "black ice" make pavements and stairs slippery, and mountain roads may need snow chains. Ski resorts in Gangwon open in December.', ko: '12–2월에는 눈과 블랙아이스로 길과 계단이 미끄러워요. 강원도 스키장은 12월에 개장해요.' },
    tips: [
      { en: 'Wear shoes with grip and hold the handrails on outdoor stairs.', ko: '미끄럼 방지 신발을 신고 바깥 계단에선 난간을 잡으세요.' },
      { en: 'Heat packs (핫팩) from the convenience store keep hands and pockets warm.', ko: '편의점 핫팩으로 손과 주머니를 따뜻하게 하세요.' },
    ],
  },
  {
    id: 'et-seollal', topic: 'etiquette', prop: 'hanbok',
    title: { en: 'Seollal – Lunar New Year', ko: '설날' },
    body: { en: 'Korea\'s biggest holiday (late January or February, 3 days). Families travel home, so trains and buses sell out weeks ahead and many small restaurants and markets close. Palaces and museums usually stay open, some with free entry and folk games.', ko: '1월 말이나 2월의 3일 연휴. 귀성 행렬로 기차·버스가 일찍 매진되고 작은 식당과 시장은 쉬는 곳이 많아요. 궁궐과 박물관은 대부분 열고, 무료 입장이나 민속놀이 행사도 있어요.' },
    tips: [
      { en: 'Book KTX and express buses early and check opening days before you go.', ko: 'KTX와 고속버스는 일찍 예매하고, 영업일을 미리 확인하세요.' },
      { en: 'Say "새해 복 많이 받으세요" – "Have lots of luck in the new year".', ko: '"새해 복 많이 받으세요"라고 인사해 보세요.' },
    ],
    phrase: { hangul: '새해 복 많이 받으세요', roman: 'Sae-hae bok ma-ni ba-deu-se-yo', meaning: 'Happy New Year' },
  },
  {
    id: 'et-chuseok', topic: 'etiquette', prop: 'hanbok',
    title: { en: 'Chuseok – harvest holiday', ko: '추석' },
    body: { en: 'Korean Thanksgiving (September or early October, 3 days). Roads and trains are packed, many shops and restaurants close for a day or two, and people eat songpyeon rice cakes. Palaces often have free entry and traditional events.', ko: '9월이나 10월 초의 3일 연휴. 도로와 기차가 꽉 차고 하루이틀 쉬는 가게와 식당이 많아요. 송편을 먹고, 궁궐은 무료 입장과 전통 행사가 열리기도 해요.' },
    tips: [
      { en: 'Convenience stores, big chains and tourist areas stay open – plan meals there.', ko: '편의점, 대형 체인, 관광지는 문을 열어요. 식사는 그곳에서 계획하세요.' },
      { en: 'Inter-city travel is hardest on the first and last holiday days.', ko: '연휴 첫날과 마지막 날은 도시 간 이동이 가장 힘들어요.' },
    ],
  },
  // ───────────── MEDICAL ─────────────
  {
    id: 'me-pharmacy', topic: 'medical', prop: 'pharmacy',
    title: { en: 'Pharmacy (약국)', ko: '약국' },
    body: { en: 'Look for the big "약" sign. Pharmacists can sell many over-the-counter medicines and give advice; some meds need a doctor\'s prescription. Most close in the evening and on Sundays – search "휴일지킴이 약국" for duty pharmacies.', ko: '"약" 간판. 일반의약품 구매 가능. 저녁·일요일 휴무 많음.' },
    phrase: { hangul: '소화제 주세요', roman: 'So-hwa-je ju-se-yo', meaning: 'Digestive medicine, please' },
  },
  {
    id: 'me-conv', topic: 'medical', prop: 'convenience',
    title: { en: 'Medicine at convenience stores', ko: '편의점 상비약' },
    body: { en: 'At night, convenience stores sell a limited set of "safe household medicines": painkillers/fever reducers, digestive aids, cold medicine and pain patches. Ask the clerk – they are usually behind the counter.', ko: '편의점 안전상비의약품: 해열진통제, 소화제, 감기약, 파스.' },
  },
  {
    id: 'me-chae', topic: 'medical', prop: 'medicine',
    title: { en: '"Che-haet-da" – indigestion', ko: '체했다 (급체)' },
    body: { en: 'Koreans call sudden indigestion after eating too fast "che-haet-da". Pharmacies sell digestive drinks (like the famous herbal ones) and tablets. Rest and warm water help. Severe pain, fever or vomiting → see a doctor.', ko: '급체: 소화제, 따뜻한 물, 심하면 병원.' },
    phrase: { hangul: '체한 것 같아요', roman: 'Che-han geot ga-ta-yo', meaning: 'I think I have indigestion' },
  },
  {
    id: 'me-clinic', topic: 'medical', prop: 'hospital',
    title: { en: 'Clinics & hospitals', ko: '의원·병원' },
    body: { en: 'For minor illness go to a local clinic (의원/clinic) – walk-in, short wait, affordable even without Korean insurance. Bring your passport. Big university hospitals have International Healthcare Centres with interpreters.', ko: '가벼운 질환은 동네 의원. 여권 지참. 대학병원 국제진료센터.' },
    phrase: { hangul: '여기가 아파요', roman: 'Yeo-gi-ga a-pa-yo', meaning: 'It hurts here' },
  },
  {
    id: 'me-hanui', topic: 'medical', prop: 'hanuiwon',
    title: { en: 'Korean medicine (한의원)', ko: '한의원' },
    body: { en: 'Traditional Korean medicine clinics offer acupuncture, cupping and herbal medicine – a licensed medical profession in Korea. Popular for muscle pain and digestion. Tell the doctor about allergies and current medications.', ko: '침·뜸·부항·한약. 정식 의료기관.' },
  },
  {
    id: 'me-er', topic: 'medical', prop: 'er',
    title: { en: 'Emergency room & 119', ko: '응급실·119' },
    body: { en: 'Call 119 for an ambulance (free, interpreters available) – they also tell you which ER can take you. ERs (응급실) are for real emergencies and cost much more for non-urgent cases. Don\'t walk in for a cold.', ko: '119 구급차 무료. 응급실은 응급 상황에만.' },
  },
  {
    id: 'me-insurance', topic: 'medical', prop: 'insurance',
    title: { en: 'Health insurance', ko: '의료보험' },
    body: { en: 'Short-term tourists are NOT covered by Korea\'s National Health Insurance, so you pay the full (still reasonable) price. Buy travel insurance before you fly and keep all receipts and the medical report (진단서) for your claim.', ko: '단기 관광객은 건강보험 미적용. 여행자보험 필수, 영수증 보관.' },
  },
  {
    id: 'me-1330', topic: 'medical', prop: 'hotline',
    title: { en: '1330 Travel hotline', ko: '1330 관광통역안내' },
    body: { en: 'Call 1330 (24/7) for free help in English, Japanese, Chinese and more: interpretation with a doctor, taxi driver or police, directions and complaints. From a foreign phone dial +82-2-1330.', ko: '24시간 다국어 통역 안내.' },
  },
  {
    id: 'me-firstaid', topic: 'medical', prop: 'firstaid',
    title: { en: 'First aid basics', ko: '응급처치' },
    body: { en: 'Heatstroke: move to shade, cool the body, small sips of water, call 119 if confused. Sprain: rest, ice, compress, elevate. Jellyfish sting: rinse with seawater (not fresh water), remove tentacles with a card. AEDs are in subway stations and big buildings.', ko: '열사병·염좌·해파리 응급처치. 지하철역 AED.' },
  },
  // ───────────── SUBWAY & CONVENIENCE STORES (guidebook additions) ─────────────
  {
    id: 'tr-subway', topic: 'transport', prop: 'subway-sign',
    title: { en: 'Subway: numbers, exits, music & queues', ko: '지하철: 번호·출구·안내 음악·줄서기' },
    body: { en: 'Every line has a number and a colour, and every station a number (e.g. 201 = Line 2, City Hall). Follow the colour and the number on the signs.', ko: '노선마다 번호와 색이 있고, 역에도 번호가 있어요 (예: 201 = 2호선 시청). 색과 번호를 따라가요.' },
    tips: [
      { en: 'Exit numbers: big stations have 10+ exits. Maps and apps tell you which exit (출구) to use – e.g. "Exit 3" – check the yellow exit signs before going up.', ko: '출구 번호: 큰 역은 출구가 10개 이상이에요. 지도 앱에서 "3번 출구"처럼 확인하고 노란 출구 표지판을 따라가요.' },
      { en: 'Music: in Seoul a short traditional tune plays before a TRANSFER station; announcements are in Korean, English, Chinese and Japanese.', ko: '안내 음악: 서울 지하철은 환승역 전에 짧은 국악 환승 음악이 나와요. 안내 방송은 한·영·중·일 4개 언어.' },
      { en: 'Queues: stand in the marked lines on both sides of the screen door; let people get off first, then board.', ko: '줄서기: 스크린도어 양옆 표시된 줄에 서고, 내리는 사람이 먼저 내린 뒤 타요.' },
      { en: 'Pink seats are for pregnant women; seats at the car ends are for elderly and disabled people.', ko: '분홍 좌석은 임산부석, 칸 끝 좌석은 노약자석이에요.' },
    ],
    phrase: { hangul: '몇 번 출구예요?', roman: 'Myeot beon chul-gu-ye-yo?', meaning: 'Which exit number?' },
  },
  {
    id: 'tr-sim', topic: 'transport', prop: 'phone-pay',
    title: { en: 'SIM, eSIM & pocket Wi-Fi', ko: '유심·eSIM·포켓 와이파이' },
    body: { en: 'Korea has fast 5G/LTE almost everywhere – even deep in the subway. Get a prepaid tourist SIM or eSIM (data-only, or with a Korean phone number), or rent a pocket Wi-Fi. The easiest place is the telecom counters (KT, SK telecom, LG U+) in the arrivals hall of Incheon, Gimpo, Gimhae and Jeju airports.', ko: '한국은 지하철 안까지 5G/LTE가 거의 모든 곳에서 빨라요. 관광객용 선불 유심이나 eSIM(데이터 전용 또는 한국 전화번호 포함)을 사거나 포켓 와이파이를 빌려요. 가장 쉬운 곳은 인천·김포·김해·제주공항 입국장의 통신사(KT·SKT·LG U+) 카운터예요.' },
    tips: [
      { en: 'Bring your passport – SIM cards are registered to your name in Korea.', ko: '여권을 꼭 챙기세요. 한국은 유심을 실명으로 등록해요.' },
      { en: 'eSIM: order online before you fly and scan the QR code on arrival – your phone must be unlocked and eSIM-compatible.', ko: 'eSIM: 출발 전에 온라인으로 사서 도착 후 QR코드를 스캔해요. 휴대폰이 잠금 해제된 eSIM 지원 기종이어야 해요.' },
      { en: 'Pre-ordering online and picking up at the airport counter is often cheaper and skips the queue.', ko: '온라인으로 미리 주문하고 공항 카운터에서 받으면 대개 더 싸고 줄도 덜 서요.' },
      { en: 'A plan with a Korean number helps when apps or restaurants send a text-message code; data-only plans are cheaper.', ko: '앱이나 식당 예약이 문자 인증을 요구할 때는 한국 번호가 있는 요금제가 편해요. 데이터 전용은 더 저렴해요.' },
      { en: 'Missed the airport? Some convenience stores and telecom shops downtown sell tourist SIMs too, and free "Public WiFi" covers subways, buses and parks.', ko: '공항에서 못 샀다면 시내 일부 편의점과 통신사 매장에서도 팔아요. 지하철·버스·공원에는 무료 "Public WiFi"도 있어요.' },
    ],
    phrase: { hangul: '유심 사고 싶어요', roman: 'Yu-sim sa-go si-peo-yo', meaning: 'I\'d like to buy a SIM card' },
  },
  {
    id: 'tr-airbus', topic: 'transport', prop: 'bus',
    title: { en: 'Airport limousine & intercity buses', ko: '공항버스·시외버스 타는 법' },
    body: { en: 'Airport limousine buses go from the airport straight to hotel areas and other cities. Find your destination on the route board in the arrivals hall, buy a ticket at the counter or kiosk (many routes also take a transit card or bank card), and wait at the stop number shown on your ticket – staff load your suitcase under the bus.', ko: '공항 리무진 버스는 공항에서 호텔 밀집 지역과 다른 도시로 바로 가요. 입국장의 노선 안내판에서 목적지를 찾고, 매표소나 키오스크에서 표를 산 뒤(교통카드·신용카드로 타는 노선도 많아요), 표에 적힌 정류장 번호에서 기다려요. 짐은 버스 아래 짐칸에 실어 줘요.' },
    tips: [
      { en: 'Paying by card: tap once when you get on. On city buses also tap when you get off – that gives the free transfer.', ko: '카드로 탈 때는 승차할 때 한 번 찍어요. 시내버스는 내릴 때도 찍어야 환승 할인을 받아요.' },
      { en: 'Getting off: the next stop is announced in Korean and English and shown on the screen. Press the STOP button before your stop and follow the route in a map app.', ko: '내릴 때: 다음 정류장이 한국어·영어 방송과 화면으로 나와요. 내리기 전에 하차벨을 누르고, 지도 앱으로 경로를 함께 보세요.' },
      { en: 'Tell the driver or the luggage staff your hotel or stop when you board – they often call it out for you.', ko: '탈 때 기사님이나 짐 담당 직원에게 호텔이나 정류장 이름을 말해 두면 알려 주는 경우가 많아요.' },
      { en: 'Intercity buses (고속·시외버스) leave from bus terminals: buy at the kiosk or app, sit in the seat on your ticket, and note the bus number at rest stops.', ko: '고속·시외버스는 버스터미널에서 타요. 키오스크나 앱으로 사고, 표에 적힌 좌석에 앉고, 휴게소에서는 버스 번호를 기억해 두세요.' },
    ],
    phrase: { hangul: '이 버스 명동 가요?', roman: 'I beo-seu Myeong-dong ga-yo?', meaning: 'Does this bus go to Myeongdong?' },
  },
  {
    id: 'tr-metro', topic: 'transport', prop: 'subway-sign',
    title: { en: 'Subway: express trains, riding & announcements', ko: '지하철 타는 법·급행·안내 방송' },
    body: { en: 'Tap your transit card at the gate, find the platform by the line colour and the direction sign ("…방면" = towards …), and tap again at the exit gate – the fare depends on the distance. Trains run about every 3–10 minutes from roughly 5:30 until around midnight.', ko: '개찰구에서 교통카드를 찍고, 노선 색과 방향 표지("○○ 방면")로 승강장을 찾은 뒤, 나갈 때 다시 찍어요. 요금은 거리에 따라 달라요. 열차는 새벽 5시 30분쯤부터 자정 무렵까지 3~10분마다 와요.' },
    tips: [
      { en: 'Express (급행, often shown in red) skips stations; local (일반) stops everywhere. Line 9 and several suburban lines have both – check the sign on the train and the platform screen.', ko: '급행(보통 빨간색 표시)은 일부 역만 서고, 일반은 모든 역에 서요. 9호선과 여러 광역 노선에 둘 다 있으니 열차와 승강장 화면을 확인하세요.' },
      { en: 'Door numbers like 3-2 (car 3, door 2) are painted on the platform; map apps tell you the best door for a quick transfer or exit.', ko: '승강장 바닥의 3-2 같은 번호는 3번 칸 2번 문이에요. 지도 앱이 빠른 환승·출구에 좋은 문을 알려 줘요.' },
      { en: 'Announcements give the next station, transfer lines and which side the doors open, in Korean and English (plus Chinese and Japanese on many lines). A short traditional tune plays before transfer stations.', ko: '안내 방송은 다음 역, 환승 노선, 내리는 문 방향을 한국어·영어로(많은 노선은 중국어·일본어도) 알려 줘요. 환승역 전에는 짧은 국악 음악이 나와요.' },
      { en: 'Rush hours (about 7:30–9:00 and 18:00–19:30) are packed – travel with big suitcases outside these times. Check the last train in your app.', ko: '출퇴근 시간(약 7:30~9:00, 18:00~19:30)은 매우 붐벼요. 큰 짐은 이 시간을 피하고, 막차 시간은 앱으로 확인하세요.' },
      { en: 'Wrong gate or card problem? Press the help button at the gate; lost items go to the station office.', ko: '개찰구에서 문제가 생기면 도움 버튼을 누르세요. 분실물은 역무실에서 찾아요.' },
    ],
    phrase: { hangul: '이 열차 급행이에요?', roman: 'I yeol-cha geu-paeng-i-e-yo?', meaning: 'Is this train an express?' },
  },
  {
    id: 'et-toilet', topic: 'etiquette', prop: 'toilet',
    title: { en: 'Public toilets & bidets', ko: '공중화장실·비데 사용법' },
    body: { en: 'Korea has plenty of free, clean public toilets – in subway stations, parks, tourist sites, department stores and highway rest areas. Look for the 화장실 (toilet) sign.', ko: '한국에는 무료이고 깨끗한 공중화장실이 많아요. 지하철역, 공원, 관광지, 백화점, 고속도로 휴게소에 있어요. "화장실" 표지를 찾으세요.' },
    tips: [
      { en: 'Toilet paper goes into the toilet – most public toilets have no paper bin any more. Only sanitary products go in the small bin.', ko: '휴지는 변기에 버려요. 대부분의 공중화장실에는 이제 휴지통이 없어요. 위생용품만 작은 휴지통에 버려요.' },
      { en: 'Bidet buttons: 세정 = rear wash, 비데 = front wash, 건조 = dry, 정지 (often red ■) = stop. Press stop before you stand up!', ko: '비데 버튼: 세정 = 뒷물, 비데 = 앞물, 건조 = 말림, 정지(보통 빨간 ■) = 멈춤. 일어나기 전에 꼭 정지를 누르세요!' },
      { en: 'Wait in one line at the entrance, not in front of a single stall, and knock lightly before opening a door.', ko: '칸 앞이 아니라 입구에서 한 줄로 기다리고, 문을 열기 전에 가볍게 노크해요.' },
      { en: 'Older markets and rural toilets may lack paper or have a squat toilet (face the hooded end) – carry tissues.', ko: '오래된 시장이나 시골 화장실은 휴지가 없거나 좌변기가 아닌 경우도 있어요(가리개 쪽을 보고 앉아요). 휴지를 챙기세요.' },
      { en: 'Many public toilets have an emergency bell (비상벨) that calls security or the police.', ko: '많은 공중화장실에 경비실·경찰과 연결된 비상벨이 있어요.' },
    ],
    phrase: { hangul: '화장실 어디예요?', roman: 'Hwa-jang-sil eo-di-ye-yo?', meaning: 'Where is the restroom?' },
  },
  {
    id: 'fo-order', topic: 'food', prop: 'kiosk',
    title: { en: 'Ordering at restaurants & kiosks', ko: '식당 주문하는 법·키오스크' },
    body: { en: 'In most local restaurants you just sit down. Water and side dishes are free. Call the staff with the bell on the table or "저기요!", order, and pay at the counter on your way out. Many places now use a table tablet, a QR code or a kiosk instead.', ko: '대부분의 동네 식당은 그냥 빈자리에 앉으면 돼요. 물과 반찬은 무료예요. 테이블 벨을 누르거나 "저기요!"라고 불러 주문하고, 나갈 때 계산대에서 계산해요. 요즘은 테이블 태블릿, QR코드, 키오스크로 주문하는 곳도 많아요.' },
    tips: [
      { en: 'Kiosk steps: language button (often top-right) → menu → options (size, spice, hot/iced) → 매장 eat in / 포장 take out → pay (card in the slot, chip first) → keep the receipt with your number.', ko: '키오스크 순서: 언어 버튼(보통 오른쪽 위) → 메뉴 → 옵션(크기·맵기·HOT/ICE) → 매장/포장 → 결제(카드는 칩 쪽부터 투입) → 번호가 적힌 영수증 챙기기.' },
      { en: 'When your number appears on the screen (or the buzzer rings), pick up the food at the counter.', ko: '화면에 내 번호가 뜨거나 진동벨이 울리면 카운터에서 음식을 받아요.' },
      { en: 'Some dishes are for 2 or more people (2인분 이상), e.g. BBQ and stews – solo travellers look for 1인분 or 혼밥 places.', ko: '고기나 찌개는 2인분 이상만 파는 곳이 있어요. 혼자라면 1인분이나 혼밥 식당을 찾으세요.' },
      { en: 'No tipping – menu prices include tax. Water, cutlery and refills are often at the self-service corner (셀프).', ko: '팁은 없고 메뉴 가격에 세금이 포함돼 있어요. 물·수저·리필은 셀프 코너에 있는 경우가 많아요.' },
    ],
    phrase: { hangul: '이거 주세요', roman: 'I-geo ju-se-yo', meaning: 'This one, please' },
  },
  {
    id: 'cv-stores', topic: 'money', prop: 'convenience',
    title: { en: 'Convenience stores (편의점)', ko: '편의점 문화' },
    body: { en: 'GS25, CU, emart24 and 7-Eleven are on almost every corner – most open 24 hours. They are more than shops: you can top up T-money, use an ATM, pay bills, pick up parcels and buy basic medicine.', ko: 'GS25·CU·이마트24·세븐일레븐이 거의 모든 골목에 있고 대부분 24시간이에요. 티머니 충전, ATM, 택배, 상비약까지 가능해요.' },
    tips: [
      { en: 'Look for "1+1" and "2+1" stickers – buy one, get one free.', ko: '"1+1", "2+1" 스티커 = 하나 더 공짜!' },
      { en: 'Plastic bags cost a little extra – bring your own or say "봉투 필요 없어요".', ko: '봉투는 유료예요. "봉투 필요 없어요"라고 해도 돼요.' },
      { en: 'Cards and mobile pay work everywhere; T-money can also pay for snacks.', ko: '카드·모바일 결제 가능, 티머니로도 결제할 수 있어요.' },
    ],
    phrase: { hangul: '봉투 필요 없어요', roman: 'Bong-tu pil-yo eop-seo-yo', meaning: 'I don\'t need a bag' },
  },
  {
    id: 'cv-food', topic: 'food', prop: 'convenience',
    title: { en: 'Convenience-store food & how to eat it', ko: '편의점 대표 음식·먹는 법' },
    body: { en: 'Favourites: triangle gimbap, dosirak (lunch boxes), cup ramyeon, banana milk, hot dogs and fried chicken. Many stores have a small eat-in table with a microwave and hot water.', ko: '대표 음식: 삼각김밥, 도시락, 컵라면, 바나나우유, 핫바·치킨. 매장 안 테이블에 전자레인지와 온수기가 있어요.' },
    tips: [
      { en: 'Triangle gimbap: pull tab ① down the middle, then pull corners ② and ③ – the seaweed stays crisp.', ko: '삼각김밥: ①번 띠를 가운데로 쭉 내리고 ②·③ 모서리를 당겨요 – 김이 바삭해요.' },
      { en: 'Cup ramyeon: open the lid halfway, fill to the inside line with hot water, wait 3–4 minutes.', ko: '컵라면: 뚜껑을 반만 열고 안쪽 선까지 뜨거운 물을 부은 뒤 3~4분 기다려요.' },
      { en: 'Dosirak: remove the sauce cup and lid as printed, microwave about 1–2 minutes (check the label).', ko: '도시락: 소스 컵을 빼고 표시대로 전자레인지에 1~2분 데워요.' },
    ],
  },
  {
    id: 'cv-howto', topic: 'etiquette', prop: 'trash-bins',
    title: { en: 'Using the store machines & eat-in table', ko: '편의점 기기 사용법·이용 예절' },
    body: { en: 'Self-service hot-water dispenser, microwave, coffee machine and (in some stores) a self-checkout kiosk. Han River stores even have automatic ramyeon cookers.', ko: '온수기·전자레인지·커피머신, 일부 매장은 셀프 계산대도 있어요. 한강 편의점에는 즉석 라면 조리기도 있어요.' },
    tips: [
      { en: 'Hot water: put the cup under the nozzle and press – mind your fingers.', ko: '온수기: 컵을 노즐 아래 두고 버튼을 눌러요. 손 조심!' },
      { en: 'Ramyeon cooker: buy the paper-bowl ramyeon, put noodles + soup in the bowl, place it on the plate and press start (about 2–3 min).', ko: '라면 조리기: 종이 용기 라면을 사서 면·스프를 넣고 받침에 올려 시작 버튼 (약 2~3분).' },
      { en: 'After eating: pour leftover soup into the sink/food-waste bin, sort cups and cans, wipe the table.', ko: '다 먹으면 국물은 개수대·음식물 통에, 용기·캔은 분리하고 테이블을 닦아요.' },
    ],
  },
  {
    id: 'cv-unmanned', topic: 'money', prop: 'kiosk',
    title: { en: '24-hour unmanned stores', ko: '24시간 무인 판매점' },
    body: { en: 'Unmanned ice-cream shops, snack stores and late-night convenience stores have no staff – you scan and pay yourself at a kiosk.', ko: '무인 아이스크림 가게·과자점·심야 무인 편의점은 직원 없이 키오스크에서 직접 계산해요.' },
    tips: [
      { en: 'Entry: some doors open only after you tap a card or scan a QR code (adult check at night).', ko: '입장: 카드를 대거나 QR을 찍어야 문이 열리는 곳도 있어요 (밤에는 성인 인증).' },
      { en: 'Pay: scan each barcode at the kiosk, then pay by card – many take no cash.', ko: '결제: 키오스크에 바코드를 하나씩 찍고 카드로 결제 – 현금이 안 되는 곳이 많아요.' },
      { en: 'Everything is on CCTV – always pay before leaving and keep the receipt.', ko: 'CCTV가 있어요 – 꼭 결제하고 나가고 영수증을 챙겨요.' },
    ],
  },
  {
    id: 'fo-ssam', topic: 'food', prop: 'bbq',
    title: { en: 'Ssam & ssamjang: how to wrap', ko: '쌈 싸 먹는 법·쌈장' },
    body: { en: 'Ssam = a bite wrapped in a leaf. Ssamjang is the thick reddish-brown dip (soybean paste + chili paste) that comes with BBQ.', ko: '쌈은 잎에 싸서 한입에 먹는 방식이에요. 쌈장은 된장과 고추장을 섞은 걸쭉한 양념이에요.' },
    tips: [
      { en: '1) Lettuce or perilla leaf in your palm  2) a piece of meat  3) a dab of ssamjang, garlic, green chili or kimchi  4) fold and eat in ONE bite.', ko: '① 상추·깻잎을 손바닥에 ② 고기 한 점 ③ 쌈장·마늘·고추·김치 조금 ④ 싸서 한입에!' },
      { en: 'Too big for one bite? Make a smaller one – biting a ssam in half gets messy.', ko: '한입에 너무 크면 작게 싸요 – 반으로 베어 먹으면 흘러요.' },
      { en: 'Leaves and side dishes are refilled for free – ask "상추 좀 더 주세요".', ko: '쌈 채소와 반찬은 무료 리필 – "상추 좀 더 주세요".' },
    ],
    phrase: { hangul: '상추 좀 더 주세요', roman: 'Sang-chu jom deo ju-se-yo', meaning: 'More lettuce, please' },
  },
];
