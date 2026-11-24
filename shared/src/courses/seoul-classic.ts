import type { Course } from '../types';
import { ask, event, learn, M, no, ok, P, say, simulate, talk } from '../dsl';

const flag = <T extends object>(o: T, ...f: string[]) => ({ ...o, setFlags: f });

/**
 * 관광 – Seoul Classic. Based on the most popular first-timer route for foreign visitors:
 * Incheon → Myeongdong → Gyeongbokgung/Bukchon → Seongsu → Namsan → Han River/Hongdae → Incheon.
 * Sample scenario from the brief: a traveller flying in from Australia, 5 nights / 7 days.
 */
export const seoulClassic: Course = {
  id: 'seoul-classic',
  categoryId: 'sightseeing',
  title: { en: 'Seoul Classic', ko: '서울 클래식' },
  subtitle: { en: 'First-timer\'s 5 nights / 7 days', ko: '첫 한국 여행 5박7일' },
  description: {
    en: 'Fly in from Australia and survive your first Seoul trip: get out of Incheon Airport, eat and sing in Myeongdong, deal with a sudden "che-haet-da" indigestion, then PLAN two free days yourself – opening days, weather, lunch, energy and the last subway all matter. Your early decisions (insurance, umbrella…) come back later!',
    ko: '호주에서 출발! 인천공항 탈출부터 명동, 노래방, 급체, 경복궁, 성수동, 남산, 한강까지.',
  },
  region: { en: 'Seoul', ko: '서울' },
  entry: { kind: 'airport', code: 'ICN', name: { en: 'Incheon International Airport', ko: '인천국제공항' } },
  exit: { kind: 'airport', code: 'ICN', name: { en: 'Incheon International Airport', ko: '인천국제공항' } },
  nights: 5,
  days: 7,
  difficulty: 1,
  partyFit: { solo: 5, couple: 5, friends: 5, group: 4 },
  partyTips: {
    solo: { en: 'Stay near Myeongdong or Hongdae: hostels, single-portion restaurants and safe late-night streets.' },
    couple: { en: 'Book a hanbok set for two at Gyeongbokgung and catch sunset at N Seoul Tower.' },
    friends: { en: 'Split taxis (max 4 per car), book a big noraebang room and try chimaek by the Han River.' },
    group: { en: 'Use airport limousine buses or a van taxi; reserve restaurants for 6+ in advance.' },
  },
  startBudget: 900000,
  coverBg: 'palace',
  access: 'base',
  isPublished: true,
  version: 5,
  sortOrder: 1,
  scenes: [
    {
      id: 'sc-1', day: 1, bg: 'airport',
      title: { en: 'Escape Incheon Airport', ko: '인천공항 빠져나가기' },
      location: { en: 'Incheon Airport T1', ko: '인천공항 제1터미널' },
      steps: [
        say('After a 10-hour overnight flight from Sydney you land at Incheon International Airport. Signs are in Korean, English, Chinese and Japanese.'),
        talk('guide', 'Annyeong! I\'m Kachi the magpie – magpies bring good news in Korea. I\'ll guide your trip!', P('안녕하세요', 'An-nyeong-ha-se-yo', 'Hello')),
        talk('guide', 'Quick question before we start – your choices on this trip will come back later. Think ahead!'),
        ask('medical', 'Back home, before flying: did you buy travel insurance?', [
          flag(ok('Yes – travel insurance for the whole trip (≈₩35,000)', 'A small cost now… we\'ll see if it pays off.', { money: -35000 }, 'insurance'), 'insured'),
          no('No – nothing ever happens to me, I\'ll save the money', 'Saved ₩35,000. Let\'s hope nothing happens…', {}),
        ]),
        ask('law', 'At immigration the officer asks for your documents. What should you have ready?', [
          ok('Passport + my entry approval (K-ETA/visa if my nationality needs one) + hotel address', 'Perfect. Rules for K-ETA/visa change – always check the official site before flying.', { manner: 5 }, 'passport'),
          no('Just a photo of my passport on my phone', 'A photo is not accepted. You need the physical passport.', { energy: -10 }),
          no('Nothing, Australians never need anything', 'Visa-waiver rules change from year to year. Check before every trip.', { energy: -10 }),
        ], 'la-safety'),
        event('weather', 'Welcome weather', 'The arrival screen shows today\'s weather. Korea has four distinct seasons – and they\'ve been getting more extreme lately.', undefined, 'seasons'),
        learn('we-seasons'),
        simulate('exchange', 'money', 'Airport exchange counter', 'You need some won for the T-money card and street food. Read the rate board for your currency, decide how much to change at the (expensive) airport counter, count the cash and get to know every Korean note and coin.', { venue: 'airport', targetKRW: 100000 }, 'mo-exchange'),
        learn('mo-notes'),
        ask('transport', 'You have one big suitcase. Which is the best way into central Seoul?', [
          ok('AREX train to Seoul Station', 'Fast, cheap and on time. Follow the "Train to Seoul" signs to B1.', { money: -11000 }, 'arex'),
          ok('Airport limousine bus to Myeongdong', 'Also great with luggage – it stops near big hotels.', { money: -18000 }, 'bus'),
          no('Regular taxi all the way', 'Possible, but about ₩60,000–90,000 with tolls and a late-night surcharge.', { money: -75000 }, 'taxi'),
        ], 'tr-arex'),
        say('For a group this size, everyone needs their own T-money card – one card can\'t pay for several people on the subway.', { parties: ['group'] }),
        simulate('tmoney', 'transport', 'T-money: buy, top up, tap', 'Buy a T-money card at the convenience store, top it up with cash at the station machine, then get through the ticket gates like a local.', { buyCard: true }, 'tr-tmoney'),
      ],
    },
    {
      id: 'sc-2', day: 1, bg: 'subway',
      title: { en: 'Subway to Myeongdong', ko: '지하철로 명동 가기' },
      location: { en: 'Seoul Station → Myeongdong (Line 4)', ko: '서울역 → 명동역 (4호선)' },
      steps: [
        learn('tr-subway'),
        say('At Seoul Station you must transfer from AREX to Subway Line 4 (sky-blue) towards Dangogae.'),
        ask('transport', 'How do you find the right platform?', [
          ok('Follow the light-blue "4" signs and the direction (next station)', 'Yes! Every line has a colour and a number. Station numbers like 424 help too.', { manner: 3 }, 'subway-sign'),
          no('Ask everyone loudly in English', 'People may help, but the signs are faster – and quieter.', { manner: -3 }),
        ], 'tr-transfer'),
        say('The train arrives. People are lined up at the sides of the doors.'),
        ask('etiquette', 'The doors open. What do you do?', [
          ok('Stand aside and let passengers get off first', 'Correct. Then board quickly and move inside.', { manner: 5 }, 'queue'),
          no('Rush in first to get a seat', 'You blocked people getting off. Just wait beside the doors – let people exit first, then board.', { manner: -8 }),
        ], 'et-queue'),
        ask('etiquette', 'The only empty seats are pink with a pregnant-woman sign, and two at the end of the car for elders. You are tired…', [
          ok('Stay standing and hold the strap', 'Respect! Pink seats are left empty for pregnant women.', { manner: 6, energy: -3 }, 'priority-seat'),
          no('Sit in the pink seat – nobody is pregnant now', 'Koreans keep this pink seat free for pregnant women, even on busy trains – a kind custom to follow.', { manner: -6 }),
        ], 'et-seats'),
        learn('et-quiet'),
      ],
    },
    {
      id: 'sc-3', day: 1, bg: 'street',
      title: { en: 'Myeongdong check-in & street food', ko: '명동 체크인 & 길거리 음식' },
      location: { en: 'Myeongdong', ko: '명동' },
      steps: [
        learn('cv-stores'),
        say('It\'s 11:00. Your hotel check-in is at 15:00.', { parties: ['solo', 'couple', 'group'] }),
        say('It\'s 11:00. Your hotel check-in is at 15:00 – and four friends\' worth of suitcases is a lot to drag around.', { parties: ['friends'] }),
        ask('lodging', 'What do you do with your luggage?', [
          ok('Ask the front desk to keep it until check-in', 'Almost every hotel does this for free.', { energy: 5 }, 'hotel'),
          no('Drag it around Myeongdong for four hours', 'Heavy bags on busy streets – tiring! Korea has handy luggage storage and same-day luggage delivery at major stations.', { energy: -15 }),
        ], 'lo-hotel'),
        talk('staff', 'Of course. Here is your tag. Your room will be ready at 3 pm.', P('짐 좀 맡길 수 있을까요?', 'Jim jom mat-gil su i-sseul-kka-yo?', 'Can I leave my luggage?')),
        say('You charge your phone – wait, your Australian plug doesn\'t fit! Korean sockets are 220 V with two round pins. You borrow an adapter from the front desk.'),
        say('Myeongdong\'s street food stalls open in the afternoon: tteokbokki, egg bread, grilled cheese lobster, hotteok…'),
        simulate('cashpay', 'money', 'Street-food stall: pay in cash', 'The stall only takes cash. Pick the right notes and coins from your wallet for a cup of tteokbokki and an egg bread – and check your change.', { shop: '명동 노점 Myeongdong street stall', items: [{ name: '떡볶이 Tteokbokki cup', price: 5000 }, { name: '계란빵 Egg bread', price: 2500 }], cashOnly: true }),
        learn('fo-street'),
        ask('weather', 'Your weather app warns of heavy showers on WEDNESDAY afternoon. The convenience store sells compact umbrellas for ₩6,000.', [
          flag(ok('Buy one now – it fits in my bag', 'Prepared for sudden downpours.', { money: -6000 }, 'umbrella'), 'umbrella'),
          no('Skip it – I\'ll deal with rain when it comes', 'Saved ₩6,000… for now.', {}),
        ]),
        ask('etiquette', 'You finished your snack. There\'s no bin in sight. What now?', [
          ok('Keep the cup in a bag and throw it away at the hotel', 'That\'s exactly what Koreans do – public bins are rare.', { manner: 6 }, 'trash-bins'),
          no('Leave it on a ledge', 'Littering can be fined, and someone else has to clean it.', { manner: -10, money: -20000 }),
        ], 'et-trash'),
        talk('police', 'Need help? We are the Tourist Police. We speak English, Japanese and Chinese.'),
        learn('la-police'),
      ],
    },
    {
      id: 'sc-4', day: 2, bg: 'restaurant',
      title: { en: 'Korean BBQ dinner', ko: '저녁: 고기구이' },
      location: { en: 'Euljiro', ko: '을지로' },
      steps: [
        say('Day 2 evening. You find a busy samgyeopsal (pork belly) restaurant in Euljiro.'),
        say('The sign says "2인분 이상" – minimum order 2 portions. As a solo traveller you look for a place showing "1인분 가능".', { parties: ['solo'] }),
        learn('fo-solo', { parties: ['solo'] }),
        say('You sit down. The table has a gas grill, scissors, tongs – and a small button.'),
        simulate('phrase', 'food', 'Order in Korean', 'The ajumma doesn\'t speak English. Build the Korean sentences from word tiles (watch the word order!) and listen to the pronunciation.', {
          phrases: [
            { ko: '삼겹살 2인분 주세요', roman: 'Sam-gyeop-sal i-in-bun ju-se-yo', en: 'Two portions of pork belly, please', extra: ['한', '잔'] },
            { ko: '물 좀 주세요', roman: 'Mul jom ju-se-yo', en: 'Some water, please', extra: ['저기요'] },
            { ko: '여기 계산해 주세요', roman: 'Yeo-gi gye-san-hae ju-se-yo', en: 'The bill here, please', extra: ['맛있어요'] },
          ],
        }),
        simulate('menu', 'food', 'Order from the Korean menu', 'The menu board is only in Korean. Order enough meat for your party (watch the "2인분 이상" rule), call the staff, get free refills and pay the Korean way.', { restaurant: 'bbq' }, 'fo-bell'),
        ask('food', 'The meat is grilling. How do you eat it the Korean way?', [
          ok('Wrap meat, garlic and ssamjang in a lettuce leaf and eat it in one bite', 'Delicious! That\'s "ssam".', { energy: 10 }, 'bbq'),
          no('Cut the lettuce with the scissors and use a fork', 'The scissors are for the meat. There is no fork.', { energy: 5 }),
        ], 'fo-bbq'),
        learn('fo-ssam'),
        say('Your friends order soju. Let\'s see if you know the drinking manners.', { parties: ['friends', 'group'] }),
        say('A friendly older man at the next table offers to share his soju with you.', { parties: ['solo', 'couple'] }),
        ask('food', 'An older person offers to pour you a glass. What do you do?', [
          ok('Hold the glass with two hands, then turn your head slightly when drinking', 'Beautiful manners! The ajeossi smiles.', { manner: 8 }, 'soju'),
          no('Pour your own glass to save him the effort', 'In Korea you never pour your own drink.', { manner: -5 }),
        ], 'fo-drink'),
        ask('money', 'Dinner is done. How do you pay?', [
          ok('Take the bill to the counter near the exit and pay by card – no tip', 'Correct. Tipping isn\'t part of Korean culture.', { money: -45000 }, 'phone-pay'),
          no('Leave 15% tip on the table', 'The staff may run after you to return it!', { money: -52000 }),
        ], 'mo-card'),
      ],
    },
    {
      id: 'sc-5', day: 2, bg: 'noraebang',
      title: { en: 'Noraebang time!', ko: '노래방' },
      location: { en: 'Myeongdong noraebang', ko: '명동 노래방' },
      steps: [
        say('After dinner: noraebang (karaoke)! You rent a private room by the hour. The remote has an English song search.'),
        say('Coin noraebang booths are perfect solo: pay per song, no shame.', { parties: ['solo'] }),
        say('The staff give you a big room with tambourines for the whole group.', { parties: ['friends', 'group'] }),
        talk('staff', 'One hour is ₩25,000. Drinks are at the fridge – pay at the counter.'),
        event('surprise', 'Service time!', 'The staff secretly added 15 minutes of "service" time. It\'s a common Korean kindness – say "kamsahamnida"!', { energy: 5, manner: 2 }),
        ask('etiquette', 'You walk to the restroom through the corridor at 23:30. Your friends are still shouting the chorus.', [
          ok('Close the door behind you and keep voices down in the corridor', 'Good. The room is for noise – the hallway isn\'t.', { manner: 4 }, 'quiet'),
          no('Leave the door open so everyone can hear your song', 'Other guests complain at the counter.', { manner: -6 }),
        ], 'et-quiet'),
        say('It\'s 00:30 and the subway has stopped. Time to call a taxi with an app.'),
        simulate('taxi', 'transport', 'Call a taxi with an app', 'Set your hotel as the destination (check the Korean address!), choose the ride type, find your car by its plate and get home safely.', { dest: '명동 호텔 Myeongdong Hotel', addr: '서울 중구 명동길 14', night: true, fare: 9000 }, 'tr-taxi'),
      ],
    },
    {
      id: 'sc-6', day: 3, bg: 'pharmacy',
      title: { en: 'Uh-oh: che-haet-da!', ko: '급체 → 약국 → 병원' },
      location: { en: 'Myeongdong – night & morning', ko: '명동 – 밤과 아침' },
      steps: [
        event('health', 'Sudden indigestion!', 'At 2 am your stomach feels like a rock. You ate the BBQ too fast and sang too hard. Koreans call this "che-haet-da" (체했다).', { energy: -25 }, 'medicine'),
        learn('me-chae'),
        ask('medical', 'It\'s 2 am. Pharmacies are closed. What can you do right now?', [
          ok('Buy digestive medicine at a 24h convenience store', 'Yes! Convenience stores sell a small set of safe household medicines.', { energy: 10, money: -4000 }, 'convenience'),
          no('Go straight to the emergency room', 'An ER for mild indigestion costs a lot and takes beds from real emergencies.', { money: -120000, energy: -10 }, 'er'),
        ], 'me-conv'),
        say('In the morning you still feel bad. You look for help.'),
        simulate('pharmacy', 'medical', 'At the pharmacy', 'Find the pharmacy among the shop signs, explain your indigestion in Korean, pick the right medicine and read the dosage label.', { symptom: 'stomach' }, 'me-pharmacy'),
        talk('pharmacist', 'You ate too fast? Take this digestive and drink warm water. If you get a fever, go to a clinic.', P('소화제 주세요', 'So-hwa-je ju-se-yo', 'Digestive medicine, please')),
        ask('medical', 'By noon your stomach hurts more and you have a slight fever. Where do you go?', [
          ok('A nearby internal-medicine clinic (내과 의원) with my passport', 'Short wait, a doctor, a prescription. You pay around ₩20,000–40,000 without Korean insurance.', { energy: 20, money: -35000 }, 'hospital'),
          ok('A Korean medicine clinic (한의원) for acupuncture', 'Many Koreans swear by acupuncture for "che". It\'s a licensed medical clinic.', { energy: 15, money: -30000 }, 'hanuiwon'),
          no('Call 119 for an ambulance', '119 is for emergencies. You can walk – choose a clinic.', { manner: -5 }),
        ], 'me-clinic'),
        learn('me-hanui'),
        event('money', 'The bill', 'Because you have travel insurance, you can claim the clinic and pharmacy costs back later. Keep every receipt!', { money: 30000 }, 'insurance', { ifFlags: ['insured'] }),
        event('money', 'The bill – no insurance', 'Tourists are not covered by Korean health insurance and you skipped travel insurance: you pay everything yourself, including the extra tests (−₩45,000).', { money: -45000 }, 'insurance', { unlessFlags: ['insured'] }),
        ask('medical', 'You paid the clinic. What do you keep for your travel insurance claim?', [
          ok('The receipt and ask for a medical certificate (진단서) in English', 'Exactly. Tourists aren\'t covered by Korean health insurance – your travel insurance will be.', { money: 30000 }, 'insurance'),
          no('Nothing, it was cheap', 'You can\'t claim anything now.', {}),
        ], 'me-insurance'),
        learn('me-1330'),
      ],
    },
    {
      id: 'sc-p1', day: 4, bg: 'street',
      title: { en: 'Free day 1: plan your Tuesday', ko: '자유일정 1: 화요일 계획' },
      location: { en: 'Seoul – your choice', ko: '서울 – 내가 고른 곳' },
      steps: [
        talk('guide', 'Today and tomorrow are FREE days. You plan them! Check opening days, last entry, the weather and lunch – and don\'t burn all your energy.'),
        simulate('dayplan', 'transport', 'Plan your Tuesday', 'Choose where to go, in which order and how to travel. Places you visit become scenes later today.', {
          weekday: 'Tue',
          hotel: 'hotel-myeongdong',
          weather: { kind: 'heat', from: '13:00', to: '16:00', text: 'Heatwave 33°C in the afternoon' },
          places: ['gyeongbokgung', 'changdeokgung', 'bukchon', 'insadong', 'gwangjang', 'nseoultower'],
        }, 'we-heat'),
      ],
    },
    {
      id: 'sc-8', day: 4, bg: 'bukchon', requires: ['visit:bukchon'],
      title: { en: 'Bukchon Hanok Village', ko: '북촌 한옥마을' },
      location: { en: 'Bukchon, Jongno', ko: '북촌, 종로' },
      steps: [
        say('Your plan brings you to Bukchon, alleys of 600-year-old-style hanok houses – where real people still live.'),
        ask('law', 'It\'s 18:30 and you want photos in the famous alley. A sign shows visiting hours. What do you do?', [
          ok('Respect the hours and come back in the daytime', 'Right. Parts of Bukchon restrict tourist visits in the evening and fines can apply.', { manner: 8 }, 'quiet'),
          no('Sneak in anyway, it\'s only a photo', 'A guide stops you. Outside permitted hours you can be fined.', { manner: -8, money: -50000 }),
        ], 'la-bukchon'),
        ask('etiquette', 'A resident\'s gate is open with a beautiful courtyard inside.', [
          ok('Admire it from the street, whisper, move on', 'Perfect. It\'s someone\'s home.', { manner: 6 }),
          no('Step inside for a quick look', 'That\'s someone\'s home, so the owner is upset. Admiring it from the street is perfectly fine!', { manner: -12 }),
        ], 'et-quiet'),
        learn('lo-hanok'),
      ],
    },
    {
      id: 'sc-10', day: 4, bg: 'tower', requires: ['visit:nseoultower'],
      title: { en: 'N Seoul Tower at sunset', ko: '남산 N서울타워' },
      location: { en: 'Namsan', ko: '남산' },
      steps: [
        say('Late afternoon. You take the yellow Namsan circular bus to N Seoul Tower, on top of Namsan mountain.'),
        simulate('bus', 'transport', 'Ride the Namsan circular bus', 'Find the right bus on the arrival board, board at the front and tap your T-money, ring the bell before your stop and tap again when you get off.', { busNo: '01A', busColor: 'yellow', stops: ['명동역 Myeongdong Stn.', '남산케이블카 Cable Car', '국립극장 National Theater', '남산서울타워 N Seoul Tower'], getOff: '남산서울타워 N Seoul Tower' }, 'tr-bus'),
        say('Couples attach "love locks" to the fence at the top. You write both names on a lock.', { parties: ['couple'] }),
        simulate('ticket', 'money', 'Observatory tickets', 'The plaza is free, but the observatory needs a ticket. Read the price board and buy the right tickets for everyone in your party.', { site: 'tower' }),
        event('weather', 'Sudden downpour!', 'Out of nowhere, a violent rain shower hits – but you have your compact umbrella. Smart purchase!', { energy: -2 }, 'umbrella', { ifFlags: ['umbrella'] }),
        event('weather', 'Sudden downpour!', 'Out of nowhere, a violent rain shower hits and you have no umbrella. Soaked! (The tower shop sells them for ₩15,000…)', { energy: -10, money: -15000 }, 'typhoon', { unlessFlags: ['umbrella'] }),
        ask('weather', 'Water is gushing down the steps. What do you do?', [
          ok('Wait inside the tower building until it passes; avoid underpasses on the way down', 'Smart. Flash flooding in underpasses is a real danger during cloudbursts.', { energy: 5 }, 'umbrella'),
          no('Run down the hill through the flooded underpass', 'Dangerous! Water rises fast in underpasses.', { energy: -15 }),
        ], 'we-rain'),
        say('The rain stops. The city lights turn on below – 10 million people, the Han River glittering. Worth it.'),
      ],
    },
    {
      id: 'sc-p2', day: 5, bg: 'street',
      title: { en: 'Free day 2: plan your Wednesday', ko: '자유일정 2: 수요일 계획' },
      location: { en: 'Seoul – your choice', ko: '서울 – 내가 고른 곳' },
      steps: [
        say('Wednesday morning. The forecast you saw on day 1 was right: heavy showers this afternoon.'),
        simulate('dayplan', 'weather', 'Plan your Wednesday', 'Rain from 15:00 to 18:00. Indoor places stay dry – outdoor ones are miserable without an umbrella.', {
          weekday: 'Wed',
          hotel: 'hotel-myeongdong',
          weather: { kind: 'rain', from: '15:00', to: '18:00', text: 'Heavy showers' },
          places: ['gyeongbokgung', 'museum', 'seongsu', 'starfield', 'ikseon', 'nseoultower'],
        }, 'we-rain'),
      ],
    },
    {
      id: 'sc-7', day: 5, bg: 'palace', requires: ['visit:gyeongbokgung'],
      title: { en: 'Gyeongbokgung Palace in hanbok', ko: '경복궁 한복 체험' },
      location: { en: 'Gyeongbokgung, Jongno', ko: '경복궁, 종로' },
      steps: [
        simulate('transfer', 'transport', 'Subway to the palace', 'Find the fastest subway route from Myeongdong to Gyeongbokgung station before the train leaves. Tip: bold circles are transfer stations.', { fromStation: 'myeongdong', toStation: 'gyeongbokgung', timeLimit: 60 }, 'tr-transfer'),
        say('Day 5: Gyeongbokgung, the main royal palace of the Joseon dynasty (built 1395). In front of you stands Gwanghwamun Gate.'),
        say('You rented hanbok at a shop near the palace. Time to get tickets!'),
        simulate('ticket', 'money', 'Palace ticket office', 'Read the ticket board at Gwanghwamun. Your whole party is wearing hanbok today – what does that mean at the ticket office?', { site: 'palace', hanbok: true }),
        say('You and your partner rented matching hanbok – the photo spots around Gyeonghoeru Pavilion are perfect.', { parties: ['couple'] }),
        event('surprise', 'Changing of the Royal Guard', 'At 10:00 the royal guards in colourful uniforms perform the changing ceremony with drums at Gwanghwamun.'),
        learn('we-alert'),
        learn('me-firstaid'),
        ask('etiquette', 'A guard in costume is standing still. You want a photo.', [
          ok('Take a photo from a respectful distance without touching', 'Correct. Don\'t touch or block the guards.', { manner: 4 }, 'camera'),
          no('Put your arm around him and tug his beard', 'He\'s on duty and can\'t move or react. Take your photo next to him from a respectful distance instead.', { manner: -10 }),
        ], 'et-photo'),
        say('Remember: Gyeongbokgung is closed on Tuesdays – good thing you planned it for Wednesday!'),
      ],
    },
    {
      id: 'sc-9', day: 5, bg: 'cafe', requires: ['visit:seongsu'],
      title: { en: 'Seongsu-dong cafés & pop-ups', ko: '성수동 카페 & 팝업' },
      location: { en: 'Seongsu-dong', ko: '성수동' },
      steps: [
        say('Seongsu-dong – old factories turned into cafés, galleries and brand pop-up stores.'),
        simulate('transfer', 'transport', 'Subway to Seongsu', 'Get from Myeongdong to Seongsu station by subway – find the fastest route (Line 2 is the green circle line).', { fromStation: 'myeongdong', toStation: 'seongsu', timeLimit: 60 }),
        say('Your fine-dust app shows "bad" (나쁨) air quality today.', undefined),
        ask('weather', 'The fine-dust index is "bad". What\'s the best move?', [
          ok('Wear a KF94 mask from the convenience store and stay indoors more', 'Good choice. Fine dust is common from late autumn to spring.', { energy: 5, money: -2000 }, 'fine-dust'),
          no('Ignore it and run along the river', 'Your throat is scratchy for the rest of the day.', { energy: -10 }),
        ], 'we-dust'),
        say('At a famous pop-up there\'s a long line and a tablet at the entrance.'),
        ask('etiquette', 'How do you get in?', [
          ok('Register on the waiting tablet (or app) and wait your turn', 'Yes. Queueing is sacred in Korea.', { manner: 5 }, 'queue'),
          no('Squeeze in next to a friend in the middle of the line', 'Queues are taken seriously in Korea and people call staff. Join the back – lines move fast!', { manner: -10 }),
        ]),
        simulate('kiosk', 'money', 'Café kiosk – Korean only', 'This café has only a Korean kiosk and people are queueing behind you. Order exactly what you want and pay by card – fast!', { menu: 'cafe', order: [{ id: 'americano', qty: 1, temp: 'ice', size: 'R' }, { id: 'croffle', qty: 1 }], dineIn: true, english: false }, 'fo-solo'),
        ask('etiquette', 'You finished your iced americano. At the return station there are separate bins.', [
          ok('Pour leftover ice/liquid in the sink, put the cup and straw in recycling', 'Exactly how Koreans do it.', { manner: 6 }, 'trash-bins'),
          no('Throw the full cup into general waste', 'The staff sigh – liquids in bins make a mess.', { manner: -6 }),
        ], 'et-trash'),
        learn('mo-fx'),
      ],
    },
    {
      id: 'sc-11', day: 6, bg: 'river',
      title: { en: 'Han River picnic & Hongdae night', ko: '한강 피크닉 & 홍대' },
      location: { en: 'Yeouido Hangang Park → Hongdae', ko: '여의도 한강공원 → 홍대' },
      steps: [
        say('Day 6. You rent a public "Ttareungyi" bike with the app and ride along the Han River.'),
        ask('law', 'There are also e-scooters for rent. You don\'t have a driving licence and no helmet. Can you ride one?', [
          ok('No – e-scooters need a licence and a helmet; stick to the bike', 'Correct. Riders get fined, and two people on one scooter is illegal.', { manner: 5 }, 'bike'),
          no('Sure, with my friend on the back', 'Police stop you: no licence, no helmet, two riders – fines!', { money: -50000, manner: -8 }),
        ], 'tr-bike'),
        ask('food', 'Picnic time! How do you get chimaek to the park?', [
          ok('Order chicken delivery to a "delivery zone" spot in the park', 'Classic Seoul! The rider calls when he arrives.', { energy: 15, money: -24000 }, 'chicken'),
          no('Grill meat on a portable BBQ on the grass', 'Cooking with fire is banned in most of the park.', { manner: -6, money: -10000 }),
        ], 'fo-chimaek'),
        say('At night you head to Hongdae: buskers, clubs and street dancers.'),
        ask('law', 'At a club, someone you just met offers you a drink and a "special" vape.', [
          ok('Politely refuse, watch my own drink and stay with friends', 'Smart. Korea has zero tolerance for drugs – even cannabis/CBD.', { manner: 5 }, 'no-drugs'),
          no('Why not, it\'s legal at home', 'Not in Korea. Drug crimes mean arrest and deportation.', { manner: -20, energy: -20 }),
        ], 'la-drugs'),
        learn('la-safety'),
        ask('law', '😱 Bad luck: you left your phone in the taxi back from Hongdae! What do you do?', [
          ok('Check the ride in Kakao T / my taxi receipt, call 1330 or 112, and look on lost112.go.kr', 'The driver drops it at a police box – you get it back the next morning.', { manner: 3 }, 'police'),
          no('Give up – it\'s gone forever', 'Lost items are very often returned in Korea. Never give up too soon!', { money: -300000 }),
        ], 'la-police', { chance: 0.45 }),
        simulate('crosswalk', 'transport', 'Crossing Seoul streets', 'Five crossings on the way back through Hongdae. Read the pedestrian light and countdown, and decide: cross or wait?', {}, 'tr-walk'),
        learn('la-traffic'),
      ],
    },
    {
      id: 'sc-12', day: 7, bg: 'airport',
      title: { en: 'Back to Incheon & fly home', ko: '인천공항 & 귀국' },
      location: { en: 'Incheon Airport T1', ko: '인천공항 제1터미널' },
      steps: [
        say('Day 7. Your flight is in the evening and your suitcase is heavier – cosmetics and snacks! You want one last walk without it.'),
        simulate('locker', 'lodging', 'Station storage locker', 'Leave your big suitcase in a locker at Seoul Station: choose the right size, pay, keep the PIN – and collect it later.', { bag: 'large' }),
        ask('money', 'You bought ₩200,000 of cosmetics at a "Tax Free" store. What should you do?', [
          ok('Show my passport for instant refund, or use the refund kiosk at the airport before check-in', 'Money back!', { money: 15000 }, 'tax-refund'),
          no('Nothing, it\'s too complicated', 'You leave the VAT refund on the table.', {}),
        ], 'mo-tax'),
        ask('transport', 'When should you arrive at Incheon for an international flight?', [
          ok('About 3 hours before departure', 'Correct – security lines can be long.', { energy: 5 }, 'arex'),
          no('30 minutes before', 'You sprint, sweat, and nearly miss the flight.', { energy: -25 }),
        ]),
        say('You spend your last coins at the convenience store – and remember the T-money balance can be refunded at convenience stores (small fee).'),
        talk('guide', 'You made it! Seoul in 7 days. Come back soon – Korea has many more missions waiting!', P('또 만나요', 'Tto man-na-yo', 'See you again')),
      ],
    },
  ],
};
