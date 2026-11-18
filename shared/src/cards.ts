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
    title: { en: 'T-money card', ko: '티머니 카드' },
    body: { en: 'A rechargeable transit card for subway, bus, many taxis and convenience stores. Buy & top up (cash) at convenience stores (GS25, CU, 7-Eleven) or subway machines. Tap IN and OUT.', ko: '지하철·버스·택시·편의점에서 사용하는 교통카드. 편의점에서 구매·충전.' },
    phrase: { hangul: '티머니 충전해 주세요', roman: 'Ti-meo-ni chung-jeon-hae ju-se-yo', meaning: 'Please top up my T-money' },
    tips: [{ en: 'Top-ups are usually CASH only. Keep some ₩10,000 notes.' }, { en: 'Visitor cards such as WOWPASS or Climate Card combine transit and payment.' }],
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
    title: { en: 'Korean BBQ', ko: '고기구이' },
    body: { en: 'Samgyeopsal (pork belly) or galbi grilled at your table. Staff may grill for you – let them. Wrap meat in lettuce with garlic & ssamjang (ssam) in ONE bite. Many BBQ places require at least 2 portions.', ko: '삼겹살·갈비. 쌈 싸서 한입에. 2인분 이상 주문인 곳 많음.' },
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
    title: { en: 'Table manners', ko: '식사 예절' },
    body: { en: 'Do not stick chopsticks upright in rice (it looks like a funeral ritual). Don\'t lift the rice bowl to your mouth. Wait for the eldest to start. Say "Jal meok-get-seum-ni-da" before and "Jal meo-geot-seum-ni-da" after.', ko: '숟가락·젓가락 밥에 꽂지 않기. 어른이 먼저 수저를 들면 시작.' },
    phrase: { hangul: '잘 먹겠습니다', roman: 'Jal meok-get-seum-ni-da', meaning: 'I will eat well (before a meal)' },
  },
  {
    id: 'fo-kimchi', topic: 'food', prop: 'kimchi',
    title: { en: 'Kimchi', ko: '김치' },
    body: { en: 'Fermented napa cabbage with chili, garlic and fish sauce – served with almost every meal and refilled for free. Families make it together every late autumn (gimjang), listed by UNESCO as intangible heritage.', ko: '김장 문화는 유네스코 인류무형문화유산.' },
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
];
