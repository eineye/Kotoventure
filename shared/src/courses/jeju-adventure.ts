import type { Course } from '../types';
import { ask, event, learn, M, no, ok, P, say, simulate, talk } from '../dsl';

const flag = <T extends object>(o: T, ...f: string[]) => ({ ...o, setFlags: f });

/** 모험 – Jeju Island: Hallasan, Seongsan Ilchulbong, Olle trails and a typhoon. */
export const jejuAdventure: Course = {
  id: 'jeju-adventure',
  categoryId: 'adventure',
  title: { en: 'Jeju Volcano Quest', ko: '제주 화산섬 탐험' },
  subtitle: { en: 'Hike, drive & survive a typhoon – 4 nights / 5 days', ko: '한라산·성산일출봉 4박5일' },
  description: {
    en: 'Land at Jeju International Airport, rent a car (with your International Driving Permit!), summit Hallasan – Korea\'s highest mountain – watch sunrise at Seongsan Ilchulbong, meet the haenyeo women divers and ride out a typhoon.',
    ko: '제주공항 → 렌터카 → 한라산 등반 → 성산일출봉 → 해녀 → 올레길 → 태풍 → 흑돼지.',
  },
  region: { en: 'Jeju Island', ko: '제주도' },
  entry: { kind: 'airport', code: 'CJU', name: { en: 'Jeju International Airport', ko: '제주국제공항' } },
  exit: { kind: 'airport', code: 'CJU', name: { en: 'Jeju International Airport', ko: '제주국제공항' } },
  nights: 4,
  days: 5,
  difficulty: 3,
  partyFit: { solo: 3, couple: 4, friends: 5, group: 5 },
  partyTips: {
    solo: { en: 'Without a car, use Jeju\'s express buses and walk the Olle trails – guesthouses are social.' },
    couple: { en: 'Rent a small EV and drive the coastal road at sunset.' },
    friends: { en: 'Split a rental car and a pension with a BBQ terrace.' },
    group: { en: 'Rent a van with a driver or book a pension villa for the whole group.' },
  },
  startBudget: 800000,
  coverBg: 'mountain',
  access: 'base',
  isPublished: true,
  version: 4,
  sortOrder: 4,
  scenes: [
    {
      id: 'jj-1', day: 1, bg: 'airport-cju',
      title: { en: 'Jeju Airport & rental car', ko: '제주공항 & 렌터카' },
      location: { en: 'Jeju International Airport', ko: '제주국제공항' },
      steps: [
        say('You land on Jeju, a volcanic island and UNESCO natural heritage site. Palm trees and black lava stones everywhere!'),
        talk('guide', 'Look – the stone grandfathers! They are dol hareubang, guardians of Jeju.'),
        simulate('exchange', 'money', 'Exchange at Jeju Airport', 'Change a little money for the village markets and fuel for the trip – most places on Jeju take cards, but small shops and haenyeo kitchens like cash.', { venue: 'airport', targetKRW: 100000 }, 'mo-exchange'),
        say('Rental car companies run shuttle buses from the airport to a big rental-car centre.', { parties: ['couple', 'friends', 'group'] }),
        say('Travelling solo, you think about renting a small car – or using Jeju\'s express buses.', { parties: ['solo'] }),
        ask('transport', 'At the rental counter, which documents do you need?', [
          flag(ok('Home licence + International Driving Permit + passport (or a Korean licence)', 'All set. Keys please!', { money: -150000 }, 'idp'), 'rentalCar'),
          no('Just my home driving licence', 'Without an IDP you can\'t rent. You\'ll travel by bus and taxi for the whole trip.', { energy: -15 }),
        ], 'tr-drive'),
        ask('money', 'The clerk offers "완전자차" – full damage cover with zero excess – for ₩40,000 extra.', [
          flag(ok('Take full cover and film the car all around before driving off', 'Peace of mind. The video is your proof of old scratches.', { money: -40000 }, 'insurance'), 'carInsured'),
          no('No thanks, I\'m a careful driver', 'Saved ₩40,000… for now.', {}),
        ], 'me-insurance', { ifFlags: ['rentalCar'] }),
        ask('law', 'On the road, which side do you drive on and what about speed?', [
          ok('Right side; follow limits – there are many speed cameras', 'Safe driving. Cameras flash often on Jeju.', { manner: 5 }, 'crosswalk'),
          no('Left side like in Australia/Japan, as fast as I want', 'Koreans drive on the right – a near-miss and a speed-camera fine. Take it slow and enjoy the island roads!', { money: -60000, energy: -15 }),
        ], 'la-traffic'),
      ],
    },
    {
      id: 'jj-2', day: 1, bg: 'pension',
      title: { en: 'Pension check-in', ko: '펜션 체크인' },
      location: { en: 'Aewol', ko: '애월' },
      steps: [
        say('You arrive at a pension near the sea in Aewol. The host isn\'t there – it\'s self check-in.'),
        simulate('checkin', 'lodging', 'Self check-in', 'Read the host\'s message, open the digital door lock, find your room and remember the house rules.', { code: '0614', room: '201', checkout: '11:00' }),
        learn('lo-pension'),
        ask('lodging', 'The pension is booked for 4 people but your group is 6.', [
          ok('Tell the host and pay the extra-guest fee', 'Honest – and safe for fire regulations.', { money: -40000, manner: 5 }, 'pension'),
          no('Sneak the extra two in', 'The host notices and charges extra (rooms have fire-safety limits). Just ask – most hosts are flexible!', { manner: -12, money: -60000 }),
        ], undefined, { parties: ['friends', 'group'] }),
        ask('lodging', 'Solo on Jeju: where do you stay to meet people?', [
          ok('A guesthouse with a shared kitchen and evening gatherings', 'You meet hikers for tomorrow.', { money: -35000, energy: 10 }, 'house'),
          no('Sleep in the car', 'Cramped and cold.', { energy: -20 }),
        ], 'lo-motel', { parties: ['solo', 'couple'] }),
        simulate('recycle', 'etiquette', 'Sort your BBQ trash', 'Jeju is strict about sorting. Take your BBQ leftovers to the village "clean house" and put each item in the right bin – watch out for the trick items!', { trash: ['can', 'pet', 'chicken-meat', 'bones', 'peel', 'eggshell', 'soju', 'bag'] }, 'et-trash'),
        ask('law', 'Tomorrow is Hallasan. Your host asks: "Did you reserve the summit trail?"', [
          flag(ok('Yes – I booked Seongpanak online (free, QR code) and will start before 08:00', 'Perfect. Summit trails need a reservation and close the summit section around noon.', { manner: 5 }, 'passport'), 'hallaBooked'),
          no('Reserve? I\'ll just turn up', 'Hmm… we\'ll see.', {}),
        ]),
      ],
    },
    {
      id: 'jj-3', day: 2, bg: 'mountain',
      title: { en: 'Hallasan summit', ko: '한라산 등반' },
      location: { en: 'Hallasan National Park (1,947 m)', ko: '한라산국립공원' },
      steps: [
        say('Day 2. Hallasan, 1,947 m – Korea\'s highest mountain, with a crater lake (Baengnokdam) on top.'),
        event('surprise', 'QR check at the gate', 'The ranger scans your reservation QR code: "Summit section closes at 13:30 – have a good hike!"', { energy: 3 }, 'passport', { ifFlags: ['hallaBooked'] }),
        event('law', 'No reservation!', 'The Seongpanak summit trail is reservation-only and today\'s slots are gone. You take the Eorimok trail to Witse-oreum (1,700 m) instead – beautiful, but no crater lake.', { energy: 5 }, 'passport', { unlessFlags: ['hallaBooked'] }),
        event('weather', 'Four seasons in one day', 'At the bottom it\'s 20 °C. Halfway up, fog rolls in, the wind howls and it drops below 8 °C.', { energy: -10 }, 'winter'),
        ask('weather', 'What should be in your backpack?', [
          ok('Water, snacks, windbreaker, warm layer and a headlamp', 'Prepared like a pro.', { energy: 15 }),
          no('Just a bottle of soju', 'Cold, thirsty and drinking on the mountain is banned in national parks.', { energy: -20, manner: -5 }, 'soju'),
        ], 'we-cold'),
        ask('medical', 'A hiker near you suddenly collapses, breathing but confused. What do you do?', [
          ok('Call 119, tell them the trail marker number, keep him warm', 'Rescue arrives. Trail post numbers help 119 find you.', { manner: 10 }, 'er'),
          no('Take a photo and keep walking', 'Always help: call 119 – it\'s free, and operators can connect an interpreter.', { manner: -20 }),
        ], 'me-er'),
        say('You reach the summit and see the crater lake through the clouds. Incredible!', { ifFlags: ['hallaBooked'] }),
        say('From Witse-oreum you can see the summit wall above you. Next time: reserve!', { unlessFlags: ['hallaBooked'] }),
      ],
    },
    {
      id: 'jj-4', day: 3, bg: 'volcano',
      title: { en: 'Seongsan Ilchulbong sunrise & haenyeo', ko: '성산일출봉 & 해녀' },
      location: { en: 'Seongsan', ko: '성산' },
      steps: [
        say('Day 3, before sunrise. Seongsan Ilchulbong ("Sunrise Peak") is a 5,000-year-old tuff cone rising from the sea.'),
        simulate('ticket', 'money', 'Sunrise Peak ticket office', 'Buy tickets for your party at the Seongsan Ilchulbong ticket office, then scan in at the gate.', { site: 'seongsan' }),
        say('You climb the steep stairs and watch the sun rise out of the sea.'),
        say('Below, Jeju\'s haenyeo – women free-divers, some over 70 – go into the sea without oxygen tanks. Their culture is UNESCO intangible heritage.'),
        talk('haenyeo', 'Hoi~! We dive for conch, abalone and sea urchin. The sea is our field.', P('해녀', 'Hae-nyeo', 'Woman diver')),
        ask('law', 'You see conch shells in the shallow water near the village. Can you take some?', [
          ok('No – the village fishing grounds belong to the haenyeo; buy from them instead', 'Correct. Gathering seafood there is illegal.', { manner: 8, money: -20000 }),
          no('Yes, the sea is free', 'These waters are the haenyeo\'s fishing grounds, so taking seafood is illegal and fined. Buying from them supports their UNESCO-listed culture!', { manner: -12, money: -100000 }),
        ]),
        simulate('cashpay', 'money', 'Buy from the haenyeo', 'The haenyeo sell their fresh catch on the rocks – cash only. Pay for a plate of sea urchin and conch.', { shop: '해녀의 집 Haenyeo seafood stand', items: [{ name: '성게·소라 한 접시 Sea urchin & conch plate', price: 20000 }, { name: '소주 Soju (to share)', price: 5000 }], cashOnly: true }),
        ask('etiquette', 'You want a portrait of a haenyeo grandmother.', [
          ok('Ask politely first and accept a "no"', 'She agrees, smiling.', { manner: 6 }, 'camera'),
          no('Zoom in from behind a rock', 'Taking photos of people secretly is a big problem in Korea.', { manner: -10 }),
        ], 'et-photo'),
        ask('food', 'At the haenyeo kitchen you\'re served abalone porridge (jeonbok-juk). The little green dish is…?', [
          ok('Seasoned seaweed – a side dish, refillable', 'Free and tasty!', { energy: 12, money: -15000 }, 'baekban'),
          no('Decoration only', 'It\'s banchan – eat it!', { energy: 8, money: -15000 }),
        ], 'fo-bell'),
      ],
    },
    {
      id: 'jj-5', day: 3, bg: 'coast',
      title: { en: 'Olle trail by e-bike', ko: '올레길 전기자전거' },
      location: { en: 'Jeju Olle Trail 1', ko: '제주올레 1코스' },
      steps: [
        say('Afternoon: you follow the Olle trail markers – blue and orange ribbons and a horse-shaped "ganse" sign.'),
        ask('transport', 'You rent an e-bike. What\'s mandatory/required to stay safe and legal?', [
          ok('Wear a helmet, ride on the right, one person per bike', 'Good. Same rules as for e-scooters: one rider, helmet.', { energy: 5, money: -20000 }, 'bike'),
          no('Put my kid on the handlebars', 'Dangerous and illegal.', { manner: -10, energy: -10 }),
        ], 'tr-bike'),
        say('You stop at a seaside café – it has a Korean-only kiosk.'),
        simulate('kiosk', 'food', 'Café kiosk on the Olle trail', 'Order a LARGE hallabong ade and a regular ICED americano to drink here, then pay by card. The cyclists behind you are waiting!', { menu: 'cafe', order: [{ id: 'hallabong', qty: 1, size: 'L' }, { id: 'americano', qty: 1, temp: 'ice', size: 'R' }], dineIn: true, english: false }),
        ask('weather', 'The sun is blazing and there\'s no shade along the coast.', [
          ok('Sunscreen, hat, lots of water and a break in a café at the hottest hour', 'Your skin thanks you.', { energy: 8, money: -6000 }, 'heatwave'),
          no('Push on until 2 pm without water', 'Heat exhaustion: headache and nausea.', { energy: -20 }),
        ], 'we-heat', { months: M.warmHalf }),
        ask('weather', 'A strong, cold sea wind blows along the coast and there is no shelter.', [
          ok('A windproof jacket, gloves and a warm drink break in a café', 'Much better – Jeju\'s coastal wind is famous.', { energy: 8, money: -6000 }, 'winter'),
          no('Keep riding in a T-shirt', 'You are frozen and exhausted.', { energy: -15 }),
        ], 'we-cold', { months: M.coldHalf }),
      ],
    },
    {
      id: 'jj-6', day: 4, bg: 'storm',
      title: { en: 'Typhoon day!', ko: '태풍 상륙!' },
      location: { en: 'Jeju City', ko: '제주시' },
      steps: [
        event('weather', 'Typhoon warning', 'Your phone blasts an emergency alert: a typhoon reaches Jeju this afternoon (strong winds from 13:00). Flights tomorrow morning may be cancelled.', { energy: -10 }, 'alert-phone'),
        learn('we-alert'),
        ask('weather', 'What\'s your typhoon plan?', [
          ok('Stay indoors, stock water & snacks, charge phones, away from the coast', 'Safe. The storm roars all night but you\'re fine.', { energy: 5, money: -15000 }, 'typhoon'),
          no('Go to the cliffs to film the giant waves', 'People are swept away like this every year. Police turn you back.', { energy: -25, manner: -10 }),
        ], 'we-rain'),
        ask('money', 'Your flight is cancelled. How do you handle the extra night?', [
          ok('Rebook with the airline app/counter, keep receipts for insurance', 'Your travel insurance may cover delay costs.', { money: -70000 }, 'insurance'),
          no('Sleep on the airport floor without telling anyone', 'Exhausting – and you missed rebooking for the first flights.', { energy: -25 }),
        ], 'me-insurance'),
        learn('mo-card'),
      ],
    },
    {
      id: 'jj-p1', day: 4, bg: 'storm',
      title: { en: 'Plan around the typhoon', ko: '태풍 속 일정 짜기' },
      location: { en: 'Jeju – your choice', ko: '제주 – 내가 고른 곳' },
      steps: [
        talk('guide', 'The morning is still calm, but from 13:00 outdoor places close and ferries stop. Jeju is big – without a rental car, buses are slow!'),
        simulate('dayplan', 'weather', 'Typhoon-day plan', 'Plan your Thursday: outdoor spots only in the morning, indoor ones once the wind picks up.', {
          weekday: 'Thu',
          hotel: 'pension-aewol',
          weather: { kind: 'storm', from: '13:00', to: '22:00', text: 'Typhoon – gale-force winds' },
          places: ['hyeopjae', 'udo', 'manjanggul', 'osulloc', 'aquaplanet', 'jejumuseum', 'dongmun', 'aewol-cafe'],
        }, 'we-alert'),
      ],
    },
    {
      id: 'jj-m', day: 4, bg: 'market', requires: ['visit:dongmun'],
      title: { en: 'Dongmun Market', ko: '동문시장' },
      location: { en: 'Jeju City', ko: '제주시' },
      steps: [
        say('Under the market roof you\'re safe from the wind. Tangerines, hallabong, fish and steaming snacks everywhere.'),
        simulate('phrase', 'food', 'Market Korean', 'Shop like a local – build the sentences from word tiles and listen.', {
          phrases: [
            { ko: '귤 한 봉지 주세요', roman: 'Gyul han bong-ji ju-se-yo', en: 'One bag of tangerines, please', extra: ['두'] },
            { ko: '카드 돼요', roman: 'Ka-deu dwae-yo?', en: 'Can I pay by card?', extra: ['현금'] },
            { ko: '택배 보낼 수 있어요', roman: 'Taek-bae bo-nael su i-sseo-yo?', en: 'Can you ship it?', extra: ['없어요'] },
          ],
        }),
        ask('law', 'You want to take a box of tangerines home on the plane abroad.', [
          ok('Check my country\'s plant/food import rules first', 'Many countries ban fresh fruit. Buy chocolate or tea instead if so.', { manner: 4 }),
          no('Hide them in my suitcase', 'Customs at home may fine you heavily.', { money: -50000 }),
        ]),
      ],
    },
    {
      id: 'jj-7', day: 4, bg: 'jejufood',
      title: { en: 'Black pork BBQ', ko: '흑돼지 구이' },
      location: { en: 'Jeju City black-pork street', ko: '제주 흑돼지거리' },
      steps: [
        say('The wind howls outside, but the black-pork restaurant near your stay is warm. Time for Jeju\'s famous black pork (heuk-dwaeji), grilled thick over charcoal.'),
        simulate('menu', 'food', 'Order black pork', 'The menu is in Korean only. Order black pork for everyone (2 portions minimum), call the staff and pay at the end.', { restaurant: 'blackpork' }),
        talk('staff', 'Dip it in the anchovy sauce (myeolchi-jeot)! I\'ll grill it for you.'),
        ask('food', 'The staff starts grilling your meat for you. What do you do?', [
          ok('Let them – they know exactly when to cut and flip it', 'Juicy perfection.', { energy: 5 }, 'bbq'),
          no('Take the tongs away from them', 'Awkward… and the meat burns.', { manner: -4 }),
        ], 'fo-bbq'),
        ask('food', 'Your friends want to toast with the eldest in the group (an uncle).', [
          ok('Clink my glass slightly lower than his and turn my head when drinking', 'Respect earned!', { manner: 8 }, 'soju'),
          no('Pour my own glass first and drink before the toast', 'The uncle coughs politely.', { manner: -6 }),
        ], 'fo-drink', { parties: ['friends', 'group'] }),
        learn('fo-drink', { parties: ['solo', 'couple'] }),
        learn('la-safety'),
      ],
    },
    {
      id: 'jj-8', day: 5, bg: 'airport-cju',
      title: { en: 'Fly home from Jeju', ko: '제주공항 출국' },
      location: { en: 'Jeju International Airport', ko: '제주국제공항' },
      steps: [
        say('Day 5. The typhoon has passed. You return the car, fill up the tank and ride the shuttle back to the airport.', { ifFlags: ['rentalCar'] }),
        say('Day 5. The typhoon has passed. You take the airport limousine bus from Aewol.', { unlessFlags: ['rentalCar'] }),
        ask('money', 'The rental car tank must be returned full. You pay at a self-service gas station.', [
          ok('Pay with card at the pump (choose "가득/Full"), or ask the attendant', 'Done. Many stations still have attendants.', { money: -40000 }),
          no('Return it empty and hope', 'The rental company charges a refuelling fee.', { money: -80000 }),
        ], undefined, { ifFlags: ['rentalCar'] }),
        ask('money', '😬 At the return, the staff points at a small scratch on the rear bumper. What do you do?', [
          flag(ok('Stay calm, show my pick-up video and check the insurance terms', 'Calm and prepared – the right way.', { manner: 4 }, 'insurance'), 'scratch'),
          flag(no('Shout that it wasn\'t me and walk away', 'They hold your deposit. Shouting never helps.', { manner: -10 }), 'scratch'),
        ], 'me-insurance', { ifFlags: ['rentalCar'], chance: 0.5 }),
        event('money', 'Covered', 'Your full-cover insurance (완전자차) pays for the scratch – no charge.', undefined, 'insurance', { ifFlags: ['scratch', 'carInsured'] }),
        event('money', 'Repair bill', 'Without full cover you pay the excess for the repair: −₩150,000.', { money: -150000 }, 'insurance', { ifFlags: ['scratch'], unlessFlags: ['carInsured'] }),
        learn('mo-exchange'),
        talk('guide', 'Volcano conquered, typhoon survived. You\'re a true adventurer!', P('수고하셨습니다', 'Su-go-ha-syeot-seum-ni-da', 'Thank you for your hard work')),
      ],
    },
  ],
};
