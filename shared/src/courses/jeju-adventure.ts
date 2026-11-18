import type { Course } from '../types';
import { ask, event, learn, no, ok, P, say, talk } from '../dsl';

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
  version: 1,
  sortOrder: 4,
  scenes: [
    {
      id: 'jj-1', day: 1, bg: 'airport',
      title: { en: 'Jeju Airport & rental car', ko: '제주공항 & 렌터카' },
      location: { en: 'Jeju International Airport', ko: '제주국제공항' },
      steps: [
        say('You land on Jeju, a volcanic island and UNESCO natural heritage site. Palm trees and black lava stones everywhere!'),
        talk('guide', 'Look – the stone grandfathers! They are dol hareubang, guardians of Jeju.'),
        say('Rental car companies run shuttle buses from the airport to a big rental-car centre.', { parties: ['couple', 'friends', 'group'] }),
        say('Travelling solo, you think about renting a small car – or using Jeju\'s express buses.', { parties: ['solo'] }),
        ask('transport', 'At the rental counter, which documents do you need?', [
          ok('Home licence + International Driving Permit + passport (or a Korean licence)', 'All set. Keys please!', { money: -150000 }, 'idp'),
          no('Just my home driving licence', 'Without an IDP you can\'t rent. You take the bus instead.', { energy: -15 }),
        ], 'tr-drive'),
        ask('law', 'On the road, which side do you drive on and what about speed?', [
          ok('Right side; follow limits – there are many speed cameras', 'Safe driving. Cameras flash often on Jeju.', { manner: 5 }, 'crosswalk'),
          no('Left side like in Australia/Japan, as fast as I want', 'Wrong side – a near-miss and a speeding fine.', { money: -60000, energy: -15 }),
        ], 'la-traffic'),
      ],
    },
    {
      id: 'jj-2', day: 1, bg: 'pension',
      title: { en: 'Pension check-in', ko: '펜션 체크인' },
      location: { en: 'Aewol', ko: '애월' },
      steps: [
        say('You check into a pension near the sea in Aewol.'),
        learn('lo-pension'),
        ask('lodging', 'The pension is booked for 4 people but your group is 6.', [
          ok('Tell the host and pay the extra-guest fee', 'Honest – and safe for fire regulations.', { money: -40000, manner: 5 }, 'pension'),
          no('Sneak the extra two in', 'The host counts the shoes at the door…', { manner: -12, money: -60000 }),
        ], undefined, { parties: ['friends', 'group'] }),
        ask('lodging', 'Solo on Jeju: where do you stay to meet people?', [
          ok('A guesthouse with a shared kitchen and evening gatherings', 'You meet hikers for tomorrow.', { money: -35000, energy: 10 }, 'house'),
          no('Sleep in the car', 'Cramped and cold.', { energy: -20 }),
        ], 'lo-motel', { parties: ['solo', 'couple'] }),
        ask('etiquette', 'Jeju has strict trash rules. Your BBQ left cans, plastic and food scraps.', [
          ok('Separate them and use the village "clean house" bins on the right days', 'Great. Jeju works hard to stay clean.', { manner: 8 }, 'trash-bins'),
          no('Put everything in one bag by the road', 'Neighbours report it. Fine!', { manner: -10, money: -50000 }),
        ], 'et-trash'),
      ],
    },
    {
      id: 'jj-3', day: 2, bg: 'mountain',
      title: { en: 'Hallasan summit', ko: '한라산 등반' },
      location: { en: 'Hallasan National Park (1,947 m)', ko: '한라산국립공원' },
      steps: [
        say('Day 2. Hallasan, 1,947 m – Korea\'s highest mountain, with a crater lake (Baengnokdam) on top.'),
        ask('law', 'You want to hike the Seongpanak trail to the summit. What must you do first?', [
          ok('Make an online reservation in advance and arrive before the cut-off time', 'Correct – summit trails require reservations and have time limits.', { manner: 5 }),
          no('Just show up at noon', 'Too late – the summit section has already closed for the day.', { energy: -10 }),
        ]),
        event('weather', 'Four seasons in one day', 'At the bottom it\'s 20 °C. Halfway up, fog rolls in, the wind howls and it drops below 8 °C.', { energy: -10 }, 'winter'),
        ask('weather', 'What should be in your backpack?', [
          ok('Water, snacks, windbreaker, warm layer and a headlamp', 'Prepared like a pro.', { energy: 15 }),
          no('Just a bottle of soju', 'Cold, thirsty and drinking on the mountain is banned in national parks.', { energy: -20, manner: -5 }, 'soju'),
        ], 'we-cold'),
        ask('medical', 'A hiker near you suddenly collapses, breathing but confused. What do you do?', [
          ok('Call 119, tell them the trail marker number, keep him warm', 'Rescue arrives. Trail post numbers help 119 find you.', { manner: 10 }, 'er'),
          no('Take a photo and keep walking', 'Never. Call 119.', { manner: -20 }),
        ], 'me-er'),
        say('You reach the summit and see the crater lake through the clouds. Incredible!'),
      ],
    },
    {
      id: 'jj-4', day: 3, bg: 'volcano',
      title: { en: 'Seongsan Ilchulbong sunrise & haenyeo', ko: '성산일출봉 & 해녀' },
      location: { en: 'Seongsan', ko: '성산' },
      steps: [
        say('Day 3, 5 am. You climb Seongsan Ilchulbong ("Sunrise Peak"), a 5,000-year-old tuff cone rising from the sea.'),
        say('Below, Jeju\'s haenyeo – women free-divers, some over 70 – go into the sea without oxygen tanks. Their culture is UNESCO intangible heritage.'),
        talk('haenyeo', 'Hoi~! We dive for conch, abalone and sea urchin. The sea is our field.', P('해녀', 'Hae-nyeo', 'Woman diver')),
        ask('law', 'You see conch shells in the shallow water near the village. Can you take some?', [
          ok('No – the village fishing grounds belong to the haenyeo; buy from them instead', 'Correct. Gathering seafood there is illegal.', { manner: 8, money: -20000 }),
          no('Yes, the sea is free', 'Haenyeo and police disagree. Fine!', { manner: -12, money: -100000 }),
        ]),
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
        ask('weather', 'The sun is blazing and there\'s no shade along the coast.', [
          ok('Sunscreen, hat, lots of water and a break in a café at the hottest hour', 'Your skin thanks you.', { energy: 8, money: -6000 }, 'heatwave'),
          no('Push on until 2 pm without water', 'Heat exhaustion: headache and nausea.', { energy: -20 }),
        ], 'we-heat'),
      ],
    },
    {
      id: 'jj-6', day: 4, bg: 'storm',
      title: { en: 'Typhoon day!', ko: '태풍 상륙!' },
      location: { en: 'Jeju City', ko: '제주시' },
      steps: [
        event('weather', 'Typhoon warning', 'Your phone blasts an emergency alert: a typhoon will pass Jeju tonight. All flights tomorrow morning may be cancelled.', { energy: -10 }, 'alert-phone'),
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
      id: 'jj-7', day: 4, bg: 'restaurant',
      title: { en: 'Black pork BBQ', ko: '흑돼지 구이' },
      location: { en: 'Jeju City black-pork street', ko: '제주 흑돼지거리' },
      steps: [
        say('The storm has passed. Time for Jeju\'s famous black pork (heuk-dwaeji), grilled thick over charcoal.'),
        talk('staff', 'Dip it in the anchovy sauce (myeolchi-jeot)! I\'ll grill it for you.'),
        ask('food', 'The staff starts grilling your meat for you. What do you do?', [
          ok('Let them – they know exactly when to cut and flip it', 'Juicy perfection.', { energy: 15, money: -60000 }, 'bbq'),
          no('Take the tongs away from them', 'Awkward… and the meat burns.', { manner: -4, energy: 5, money: -60000 }),
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
      id: 'jj-8', day: 5, bg: 'airport',
      title: { en: 'Fly home from Jeju', ko: '제주공항 출국' },
      location: { en: 'Jeju International Airport', ko: '제주국제공항' },
      steps: [
        say('Day 5. You return the car, fill up the tank and ride the shuttle back to the airport.'),
        ask('money', 'The rental car tank must be returned full. You pay at a self-service gas station.', [
          ok('Pay with card at the pump (choose "가득/Full"), or ask the attendant', 'Done. Many stations still have attendants.', { money: -40000 }),
          no('Return it empty and hope', 'The rental company charges a refuelling fee.', { money: -80000 }),
        ]),
        learn('mo-exchange'),
        talk('guide', 'Volcano conquered, typhoon survived. You\'re a true adventurer!', P('수고하셨습니다', 'Su-go-ha-syeot-seum-ni-da', 'Thank you for your hard work')),
      ],
    },
  ],
};
