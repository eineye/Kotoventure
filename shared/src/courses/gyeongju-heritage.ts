import type { Course } from '../types';
import { ask, event, learn, no, ok, P, say, simulate, talk } from '../dsl';

const flag = <T extends object>(o: T, ...f: string[]) => ({ ...o, setFlags: f });

/** 문화 – Gyeongju, the 1,000-year capital of Silla. Gimhae Airport in & out. */
export const gyeongjuHeritage: Course = {
  id: 'gyeongju-heritage',
  categoryId: 'culture',
  title: { en: 'Gyeongju: Museum Without Walls', ko: '경주: 지붕 없는 박물관' },
  subtitle: { en: 'Silla heritage & temple stay – 3 nights / 4 days', ko: '신라 천년 고도 3박4일' },
  description: {
    en: 'Land at Incheon, read the KTX map and buy your own train ticket to Gyeongju, sleep in a hanok, cycle between royal tombs and the 1,400-year-old Cheomseongdae observatory, bow at UNESCO-listed Bulguksa Temple and spend a night as a monk.',
    ko: '인천공항 → 서울역 KTX 발권 → 신경주 → 한옥 → 대릉원·첨성대 → 불국사 → 템플스테이 → 김해공항.',
  },
  region: { en: 'Gyeongju, North Gyeongsang', ko: '경상북도 경주' },
  entry: { kind: 'airport', code: 'ICN', name: { en: 'Incheon International Airport', ko: '인천국제공항' } },
  exit: { kind: 'airport', code: 'PUS', name: { en: 'Gimhae International Airport', ko: '김해국제공항' } },
  nights: 3,
  days: 4,
  difficulty: 2,
  partyFit: { solo: 5, couple: 4, friends: 3, group: 4 },
  partyTips: {
    solo: { en: 'A temple stay is a peaceful, social way to travel alone.' },
    couple: { en: 'Night-time Donggung Palace & Wolji Pond reflections are the most romantic view in Gyeongju.' },
    friends: { en: 'Rent bikes together – the heritage sites are flat and close to each other.' },
    group: { en: 'City-tour buses and private hanok houses suit families and groups.' },
  },
  startBudget: 500000,
  coverBg: 'temple',
  access: 'base',
  isPublished: true,
  version: 4,
  sortOrder: 3,
  scenes: [
    {
      id: 'gj-1', day: 1, bg: 'airport',
      title: { en: 'Incheon → Seoul Station → KTX', ko: '인천공항 → 서울역 → KTX' },
      location: { en: 'Incheon Airport & Seoul Station', ko: '인천공항 · 서울역' },
      steps: [
        say('You land at Incheon in the morning. Gyeongju has no international airport – the fastest way is the KTX high-speed train from Seoul Station (about 2 hours).'),
        talk('guide', 'Remember: choices you make today can come back days later. Think ahead!'),
        ask('medical', 'Before the trip: did you buy travel insurance? (Gyeongju means lots of hiking and cycling…)', [
          flag(ok('Yes – travel insurance for the whole trip (≈₩35,000)', 'A small cost now… we\'ll see if it pays off.', { money: -35000 }, 'insurance'), 'insured'),
          no('No – I\'ll save the money', 'Saved ₩35,000. Let\'s hope nothing happens…', {}),
        ]),
        ask('transport', 'How do you get from Incheon Airport to Seoul Station?', [
          ok('AREX airport railroad to Seoul Station', 'Direct and about 45–50 minutes on the Express.', { money: -11000 }, 'arex'),
          no('A taxi all the way', 'Possible, but expensive and slower in traffic.', { money: -75000 }, 'taxi'),
        ], 'tr-arex'),
        simulate('train', 'transport', 'KTX map & ticket machine', 'At Seoul Station, find Gyeongju on the KTX map, then buy a ticket for your whole party at the self-service machine. Your hanok check-in is at 13:00 – arrive in time!', { from: 'seoul', to: 'singyeongju', arriveBy: '13:00' }, 'tr-ktx'),
        event('weather', 'Autumn in Gyeongju', 'It\'s late October – clear blue skies and ginkgo trees turning gold. But mornings are chilly (8 °C) and afternoons warm (22 °C).', undefined, 'autumn'),
        ask('weather', 'How do you pack for a day like this?', [
          ok('Layers: T-shirt + light jacket', 'Perfect. Big day–night temperature gaps are typical in spring and autumn.', { energy: 5 }, 'autumn'),
          no('Only shorts and a tank top', 'You shiver at sunset.', { energy: -10 }),
        ], 'we-seasons'),
        say('From Singyeongju Station, city buses (or a taxi) take you to the historic centre in about 30 minutes. You take a taxi – and the driver speaks only Korean.'),
        simulate('phrase', 'transport', 'Taxi Korean', 'Build the taxi sentences from the word tiles and listen to the pronunciation.', {
          phrases: [
            { ko: '황리단길로 가 주세요', roman: 'Hwang-ni-dan-gil-lo ga ju-se-yo', en: 'To Hwangnidan-gil, please', extra: ['에서'] },
            { ko: '얼마나 걸려요', roman: 'Eol-ma-na geol-lyeo-yo', en: 'How long does it take?', extra: ['얼마예요'] },
            { ko: '여기서 세워 주세요', roman: 'Yeo-gi-seo se-wo ju-se-yo', en: 'Please stop here', extra: ['가'] },
          ],
        }),
      ],
    },
    {
      id: 'gj-2', day: 1, bg: 'hanok',
      title: { en: 'Hanok stay in Hwangnidan-gil', ko: '황리단길 한옥스테이' },
      location: { en: 'Hwangnidan-gil', ko: '황리단길' },
      steps: [
        say('Your lodging is a hanok with a wooden veranda (maru) and paper doors (changhoji).'),
        ask('etiquette', 'At the stone step in front of the wooden floor, what do you do?', [
          ok('Take off my shoes and leave them on the stone step', 'Exactly. The wood floor is a clean, shoes-free zone.', { manner: 5 }, 'shoes-off'),
          no('Walk in with shoes – they\'re clean', 'The host gently stops you: wooden floors in Korean homes are shoe-free. Leave your shoes on the stone step – easy!', { manner: -10 }),
        ], 'et-shoes'),
        learn('lo-hanok'),
        say('Your family books a whole hanok house so the kids can run around the courtyard.', { parties: ['group'] }),
        ask('lodging', 'The room has no bed, only folded quilts. How do you sleep?', [
          ok('Unfold the yo mattress on the warm ondol floor', 'The heated floor is wonderfully cosy.', { energy: 15 }, 'hanok'),
          no('Complain and ask for a refund', 'It\'s a traditional room – that\'s the experience!', { manner: -5 }),
        ]),
        ask('lodging', 'Your host asks about tomorrow night\'s temple stay at a famous temple. What did you do?', [
          flag(ok('I booked it online weeks ago (templestay.com)', 'Great – popular temples fill up, especially in autumn.', { money: -70000 }, 'temple'), 'templeBooked'),
          no('Nothing yet – I\'ll just show up', 'Hmm… we\'ll see tomorrow.', {}),
        ], 'lo-temple'),
        ask('lodging', '😓 Midnight: the ondol floor is so hot you can\'t sleep. What do you do?', [
          ok('Turn down the ondol thermostat on the wall and open the window a little', 'Sweet dreams – the floor heating has its own controller.', { energy: 8 }, 'hanok'),
          no('Pour water on the floor to cool it down', 'Never! Water on ondol floors and paper doors causes damage.', { manner: -10, energy: -8 }),
        ], undefined, { chance: 0.45 }),
        say('Next morning you grab breakfast in a hanok café on Hwangnidan-gil – ordering is by kiosk only.'),
        simulate('kiosk', 'money', 'Hanok café kiosk', 'Korean-only kiosk, people waiting behind you. Order a large hot café latte and a croffle to take away, and pay by card.', { menu: 'cafe', order: [{ id: 'latte', qty: 1, temp: 'hot', size: 'L' }, { id: 'croffle', qty: 1 }], dineIn: false, english: false }),
        learn('lo-airbnb'),
      ],
    },
    {
      id: 'gj-3', day: 2, bg: 'tombs',
      title: { en: 'Royal tombs & Cheomseongdae', ko: '대릉원 & 첨성대' },
      location: { en: 'Daereungwon', ko: '대릉원' },
      steps: [
        say('Day 2. Giant grass mounds rise in the middle of town: tombs of Silla kings and queens, 1,500 years old.'),
        ask('law', 'The grassy mound looks perfect to climb for a photo.', [
          ok('Stay on the path – climbing tombs damages a protected heritage site', 'Correct. Damaging cultural heritage is punishable by law.', { manner: 8 }),
          no('Climb up quickly for a selfie', 'A guard calls you back. These 1,500-year-old tombs are protected by law – and the best photos are from the path anyway!', { manner: -12, money: -30000 }),
        ]),
        say('A short ride away stands Cheomseongdae, the oldest surviving astronomical observatory in East Asia (7th century).'),
        ask('transport', 'You rent bikes for the day. Where do you ride?', [
          ok('On the bike paths, slowly near pedestrians, helmet on', 'Safe and pleasant.', { energy: 5, money: -5000 }, 'bike'),
          no('On the busy road against traffic', 'Cars honk. In Korea you ride on the right with the traffic.', { energy: -10 }),
        ], 'tr-bike'),
        say('At night, Donggung Palace and Wolji Pond are lit up and mirrored on the water.', { parties: ['couple'] }),
        learn('et-photo'),
      ],
    },
    {
      id: 'gj-4', day: 2, bg: 'temple',
      title: { en: 'Bulguksa Temple', ko: '불국사' },
      location: { en: 'Bulguksa, Mt. Tohamsan', ko: '불국사, 토함산' },
      steps: [
        say('Bulguksa, a UNESCO World Heritage temple built in 751. Two stone pagodas face each other: the ornate Dabotap and the simple Seokgatap.'),
        ask('money', 'Fun fact: one of these pagodas is on a Korean coin. Which one?', [
          ok('Dabotap is on the ₩10 coin', 'Yes! Take out a ₩10 coin and compare.', { manner: 3 }, 'coins'),
          no('Seokgatap is on the ₩50,000 note', 'No – the ₩50,000 note shows Shin Saimdang and the ₩10 coin shows Dabotap.', {}),
        ], 'mo-coins'),
        ask('etiquette', 'You enter the main hall where people are praying.', [
          ok('Enter by a side door, keep quiet, no photos of worshippers', 'Respectful. The central door is traditionally for senior monks.', { manner: 8 }, 'temple'),
          no('Walk through the central door and take flash photos of the Buddha', 'A monk gently asks you to stop.', { manner: -10 }),
        ], 'et-quiet'),
        simulate('bus', 'transport', 'Bus up to Seokguram', 'Seokguram Grotto is high up on Tohamsan. Take the city bus from Bulguksa – T-money works in Gyeongju too. Don\'t miss your stop!', { busNo: '12', busColor: 'green', stops: ['불국사 Bulguksa', '불국사 주차장 Bulguksa Parking', '토함산 고개 Tohamsan Pass', '석굴암 Seokguram'], getOff: '석굴암 Seokguram' }, 'tr-bus'),
      ],
    },
    {
      id: 'gj-5', day: 2, bg: 'temple',
      title: { en: 'Temple stay night', ko: '템플스테이' },
      location: { en: 'Golgulsa-area temple', ko: '사찰' },
      steps: [
        event('surprise', 'Your booking is ready', 'Your name is on the list. A monk hands you temple clothes and shows you the dormitory.', { energy: 3 }, 'temple', { ifFlags: ['templeBooked'] }),
        event('surprise', 'Fully booked!', 'Without a reservation the temple stay is full. A kind monk lets you join the evening programme only – then you need a last-minute room in town (−₩80,000, a late taxi and less sleep).', { money: -80000, energy: -10 }, 'temple', { unlessFlags: ['templeBooked'] }),
        say('You change into the loose grey/orange temple clothes.'),
        learn('lo-temple'),
        talk('monk', 'At the meal we eat in silence and leave nothing behind – not even one grain.'),
        ask('food', 'At the barugongyang (monastic meal), how much food do you take?', [
          ok('Only what I can finish completely', 'Wonderful. No waste is the core of temple meals.', { manner: 8, energy: 8 }, 'baekban'),
          no('A big heap, I can leave the rest', 'Wasting food is a no-go at the temple.', { manner: -10 }),
        ]),
        ask('law', 'You packed a bottle of makgeolli for the night.', [
          ok('Leave it closed in my bag – alcohol is not allowed at the temple', 'Correct.', { manner: 5 }),
          no('Open it in the dormitory', 'Alcohol isn\'t allowed at temples – keep it closed until after your stay. Monks appreciate guests who follow the simple rules.', { manner: -15 }),
        ]),
        event('surprise', '4 am wake-up', 'A wooden fish drum (moktak) sounds at 4 am. You join the dawn chanting under the stars.', { energy: -8, manner: 5 }),
      ],
    },
    {
      id: 'gj-p1', day: 3, bg: 'street',
      title: { en: 'Free day: plan your Monday', ko: '자유일정: 월요일 계획' },
      location: { en: 'Gyeongju – your choice', ko: '경주 – 내가 고른 곳' },
      steps: [
        talk('guide', 'Today you plan! Gyeongju has no subway – buses are slow and infrequent, taxis are quick. Monday closures, rain this afternoon and the last bus at 22:30… choose wisely.'),
        simulate('dayplan', 'transport', 'Plan your Gyeongju Monday', 'Pick places, order and transport. Where you go becomes the next scenes.', {
          weekday: 'Mon',
          hotel: 'hotel-hwangnidan',
          weather: { kind: 'rain', from: '14:00', to: '17:00', text: 'Autumn showers' },
          places: ['gyochon', 'gjmuseum', 'hwangnyongsa', 'namsan-gj', 'seokguram', 'hwangnidan-cafe', 'wolji'],
        }, 'tr-bus'),
      ],
    },
    {
      id: 'gj-6', day: 3, bg: 'restaurant', requires: ['visit:gyochon'],
      title: { en: 'Gyeongju flavours', ko: '경주의 맛' },
      location: { en: 'Gyochon Traditional Village', ko: '교촌마을' },
      steps: [
        say('Day 3. Gyochon Village is home to Gyeongju Gyodong Beopju, a traditional rice liquor, and the restaurant street serves ssambap (wraps with 20 kinds of leaves).'),
        simulate('menu', 'food', 'Order ssambap', 'The menu is handwritten in Korean. Order for your whole party – sets are "2인분 이상" – then enjoy the meal and pay.', { restaurant: 'ssambap' }),
        ask('food', 'The ssambap table has dozens of leaves, rice and pastes. How do you eat?', [
          ok('Put rice and a bit of paste on a leaf, wrap and eat in one bite', 'Perfect, like Korean BBQ ssam!', { energy: 6 }, 'baekban'),
          no('Eat the leaves one by one as a salad', 'You can – but the wrap is the point!', { energy: 2 }),
        ], 'fo-baekban'),
        say('Dessert: Hwangnam-ppang, a small round bread filled with red bean paste, a Gyeongju speciality.'),
        simulate('cashpay', 'money', 'Buy Hwangnam-ppang', 'The old bakery takes cards, but the owner smiles at cash. Pay for a box with your notes and coins.', { shop: '황남빵 Hwangnam-ppang bakery', items: [{ name: '황남빵 10개입 Box of 10', price: 13000 }], cashOnly: false }),
        ask('etiquette', 'An elderly shop owner hands you a free sample with both hands.', [
          ok('Receive it with two hands and a small bow: "Gamsahamnida"', 'She beams!', { manner: 6 }, 'two-hands'),
          no('Grab it with one hand while looking at my phone', 'Not a big deal – but receiving with both hands shows respect in Korea, a small gesture that makes people smile.', { manner: -5 }),
        ], 'et-hands'),
        learn('fo-manners'),
      ],
    },
    {
      id: 'gj-7', day: 3, bg: 'mountain',
      title: { en: 'Twisted ankle!', ko: '발목 부상' },
      location: { en: 'Gyeongju', ko: '경주' },
      steps: [
        say('Gyeongju\'s Namsan mountain is full of Buddha statues carved in rock. The trail is rocky – and wet from the showers…', { ifFlags: ['visit:namsan-gj'] }),
        say('Back in town in the evening, the old stone steps near Wolji are slippery from the afternoon rain…', { unlessFlags: ['visit:namsan-gj'] }),
        event('health', 'Twisted ankle!', 'You slip on a wet stone and twist your ankle. It swells quickly.', { energy: -25 }, 'firstaid'),
        ask('medical', 'First aid first. What do you do?', [
          ok('Rest, cold compress, bandage, raise the leg – then get help down', 'R.I.C.E. – the classic first aid for sprains.', { energy: 10 }, 'firstaid'),
          no('Keep hiking to the summit', 'The ankle swells more and the way down gets harder. Rest first – and remember help (119) is always one call away.', { energy: -20 }),
        ], 'me-firstaid'),
        ask('medical', 'Down in town, the ankle still hurts. Where do you go?', [
          ok('An orthopaedic clinic (정형외과) for an X-ray', 'Nothing broken – a sprain. Total about ₩60,000 incl. X-ray.', { energy: 15, money: -60000 }, 'hospital'),
          ok('A Korean medicine clinic for acupuncture and cupping', 'Popular for sprains in Korea. You feel looser.', { energy: 12, money: -30000 }, 'hanuiwon'),
          no('The ER of a big hospital', 'Long wait, high fees for a non-emergency.', { money: -150000 }, 'er'),
        ], 'me-clinic'),
        simulate('pharmacy', 'medical', 'Pain patch from the pharmacy', 'The clinic suggests a pain-relief patch. Find the pharmacy, explain your sprain and read how to use it.', { symptom: 'sprain' }, 'me-pharmacy'),
        event('money', 'The bill', 'Your travel insurance covers the clinic – keep the receipt and ask for an English diagnosis. (+₩50,000 back later)', { money: 50000 }, 'insurance', { ifFlags: ['insured'] }),
        event('money', 'The bill – no insurance', 'Tourists are not covered by Korean health insurance and you skipped travel insurance. A follow-up visit and an ankle brace: −₩40,000 more.', { money: -40000 }, 'insurance', { unlessFlags: ['insured'] }),
        learn('me-hanui'),
        learn('me-insurance'),
        learn('me-er'),
      ],
    },
    {
      id: 'gj-8', day: 4, bg: 'airport',
      title: { en: 'Back to Gimhae', ko: '김해공항 귀국' },
      location: { en: 'Gimhae International Airport', ko: '김해국제공항' },
      steps: [
        say('Day 4. You take the limousine back to Gimhae with heritage souvenirs.'),
        ask('law', 'At the airport you want to fly a small drone for one last aerial shot.', [
          ok('No – airports and many areas are no-fly zones', 'Correct. Drone rules are strict in Korea.', { manner: 5 }, 'drone'),
          no('Launch it from the car park', 'Airports are strict no-fly zones and security arrives quickly. Check a drone-zone map app before flying anywhere in Korea.', { manner: -15, money: -100000 }),
        ], 'la-camera'),
        learn('mo-tax'),
        talk('guide', 'A thousand years of history in four days. Annyeonghi gaseyo!', P('안녕히 가세요', 'An-nyeong-hi ga-se-yo', 'Goodbye (to someone leaving)')),
      ],
    },
  ],
};
