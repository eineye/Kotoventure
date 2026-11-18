import type { Course } from '../types';
import { ask, event, learn, no, ok, P, say, talk } from '../dsl';

/** 체험 – K-culture hands-on: K-pop dance, kimchi class, Han River ramyeon, PC bang, DMZ tour. */
export const kcultureExperience: Course = {
  id: 'kculture-experience',
  categoryId: 'experience',
  title: { en: 'K-Culture Live', ko: 'K-컬처 라이브' },
  subtitle: { en: 'Dance, cook, game & the DMZ – 3 nights / 4 days', ko: 'K-팝·김치·한강라면·DMZ 3박4일' },
  description: {
    en: 'Fly into Gimpo, take a K-pop dance class in Hongdae, make your own kimchi, cook ramyeon by the Han River, shop K-beauty tax-free, visit the DMZ border and cure a cold at a Korean clinic.',
    ko: '김포공항 → 홍대 K-팝 댄스 → 김치 만들기 → 한강라면 → 올리브영 → DMZ → 감기 → 김포공항.',
  },
  region: { en: 'Seoul & DMZ', ko: '서울 & DMZ' },
  entry: { kind: 'airport', code: 'GMP', name: { en: 'Gimpo International Airport', ko: '김포국제공항' } },
  exit: { kind: 'airport', code: 'GMP', name: { en: 'Gimpo International Airport', ko: '김포국제공항' } },
  nights: 3,
  days: 4,
  difficulty: 2,
  partyFit: { solo: 5, couple: 3, friends: 5, group: 3 },
  partyTips: {
    solo: { en: 'One-day classes (dance, cooking) are a great way to meet other travellers.' },
    couple: { en: 'Book a couple photo studio session in hanbok or K-drama style.' },
    friends: { en: 'Film a dance challenge together after class – and race each other at a PC bang.' },
    group: { en: 'Many cooking classes offer private group sessions; DMZ tours need early booking for groups.' },
  },
  startBudget: 700000,
  coverBg: 'stage',
  access: 'base',
  isPublished: true,
  version: 1,
  sortOrder: 5,
  scenes: [
    {
      id: 'kc-1', day: 1, bg: 'airport',
      title: { en: 'Gimpo Airport arrival', ko: '김포공항 도착' },
      location: { en: 'Gimpo International Airport', ko: '김포국제공항' },
      steps: [
        say('You land at Gimpo, the city airport close to central Seoul with flights from Tokyo, Osaka, Shanghai and Taipei.'),
        ask('transport', 'Hongdae is on AREX/Line 2. Line 9 also runs from Gimpo – with red "Express" and grey "Local" trains. Which is true?', [
          ok('Express trains skip stations – check that my stop is an express stop', 'Right! The board shows 급행 (express) or 일반 (local).', { energy: 5 }, 'subway-sign'),
          no('All trains stop everywhere', 'You zoom past your station on an express.', { energy: -10 }),
        ], 'tr-transfer'),
        ask('money', 'You need a transit card and some payment method in one. What could you get?', [
          ok('A visitor prepaid card (e.g. WOWPASS) or T-money, topped up with cash', 'Handy – some visitor cards also exchange cash into the card.', { money: -5000 }, 'tmoney'),
          no('Nothing – I\'ll pay the subway with my foreign coins', 'Gates take cards, not coins.', { energy: -8 }),
        ], 'tr-tmoney'),
        learn('mo-card'),
        event('weather', 'Spring yellow dust', 'It\'s April. Cherry blossoms are out – but so is "hwangsa" (yellow dust) blowing from the continent.', { energy: -5 }, 'fine-dust'),
        learn('we-dust'),
      ],
    },
    {
      id: 'kc-2', day: 1, bg: 'stage',
      title: { en: 'K-pop dance class in Hongdae', ko: '홍대 K-팝 댄스 클래스' },
      location: { en: 'Hongdae', ko: '홍대' },
      steps: [
        say('You check into a guesthouse in Hongdae, then join a one-day K-pop dance class.'),
        learn('lo-motel'),
        talk('staff', 'Shoes off in the studio, indoor sneakers only! Five, six, seven, eight!'),
        ask('etiquette', 'Your instructor (older than you) gives you a water bottle. How do you take it?', [
          ok('With two hands and "Gamsahamnida!"', 'Instructor smiles. Two hands = respect.', { manner: 5 }, 'two-hands'),
          no('With one hand, without looking', 'Feels rude in Korea.', { manner: -4 }),
        ], 'et-hands'),
        say('After class, street buskers perform in Hongdae\'s walking street.'),
        ask('etiquette', 'You want to film the buskers and join the crowd.', [
          ok('Stand to the side, keep the walkway open, tip if I enjoyed it', 'Buskers love respectful fans.', { manner: 5, money: -5000 }, 'walk-right'),
          no('Stand in the middle of the street blocking everyone', 'People bump into you all the time.', { manner: -5 }),
        ], 'et-right'),
      ],
    },
    {
      id: 'kc-3', day: 2, bg: 'kitchen',
      title: { en: 'Kimchi & bibimbap class', ko: '김치 & 비빔밥 쿠킹클래스' },
      location: { en: 'Insadong cooking studio', ko: '인사동 쿠킹스튜디오' },
      steps: [
        say('Day 2. A cooking class! You put on red rubber gloves – essential for kimchi.'),
        learn('fo-kimchi'),
        ask('food', 'You make bibimbap. Before eating, what do you do?', [
          ok('Add gochujang and mix everything thoroughly with a spoon', 'That\'s the "bibim" – mixing!', { energy: 12 }, 'bibimbap'),
          no('Eat each topping separately with chopsticks', 'Technically allowed, but you miss the point.', { energy: 6 }),
        ], 'fo-bibimbap'),
        ask('food', 'The teacher says "Jal meokgesseumnida!" before the meal. What does it mean?', [
          ok('"I will eat well" – a thank-you before eating', 'Say it before every meal with Koreans!', { manner: 5 }, 'chopsticks'),
          no('"Hurry up and eat"', 'No – it\'s a polite thank-you.', {}),
        ], 'fo-manners'),
        ask('food', 'Lunch break! Next door they serve kimchi-jjigae in one big bubbling pot for the table.', [
          ok('Use the ladle or my own spoon to take some, blow, then sip', 'Hot, sour and comforting.', { energy: 12, money: -9000 }, 'jjigae'),
          no('Drink straight from the pot', 'No no no.', { manner: -8 }),
        ], 'fo-jjigae'),
      ],
    },
    {
      id: 'kc-4', day: 2, bg: 'river',
      title: { en: 'Han River ramyeon', ko: '한강 라면' },
      location: { en: 'Mangwon Hangang Park', ko: '망원 한강공원' },
      steps: [
        say('Sunset by the Han River. The convenience store here has an automatic ramyeon cooker: buy a pack, put it in a special paper bowl and press the button.'),
        say('With friends you spread a mat, order chicken and cook ramyeon for everyone.', { parties: ['friends', 'group'] }),
        ask('money', 'At the convenience store till, the clerk says "봉투 필요하세요?" (Do you need a bag?)', [
          ok('Say "Ne" (yes) and pay a small fee – or bring my own bag', 'Plastic bags cost extra in Korea.', { money: -100 }),
          no('Expect it to be free', 'It costs a little – no big deal.', {}),
        ]),
        ask('etiquette', 'Done eating. The park has bins with labels: 일반 / 재활용 / 음식물.', [
          ok('Drain soup in the food-waste bin, recycle the cup & cans, rest in general waste', 'Separation hero!', { manner: 8 }, 'trash-bins'),
          no('Leave the bowl with soup on the grass', 'Crows and park staff are not happy.', { manner: -12, money: -50000 }),
        ], 'et-trash'),
        ask('law', 'A friend wants to light some fireworks in the park.', [
          ok('No – fireworks and open flames are banned in most river parks', 'Correct. Fines apply.', { manner: 5 }),
          no('Light them up, it\'s a party!', 'Park patrol fines you.', { money: -50000, manner: -10 }),
        ], 'la-minor'),
      ],
    },
    {
      id: 'kc-5', day: 3, bg: 'shop',
      title: { en: 'K-beauty shopping & PC bang', ko: 'K-뷰티 쇼핑 & PC방' },
      location: { en: 'Myeongdong & Sinchon', ko: '명동 & 신촌' },
      steps: [
        say('Day 3 morning. K-beauty shops are packed with testers, sheet masks and sunscreen.'),
        ask('money', 'Your basket comes to ₩85,000. At the till they ask for your passport. Why?', [
          ok('For the instant tax-free refund – the VAT is taken off right away', 'You save several thousand won.', { money: 6000 }, 'tax-refund'),
          no('It\'s a scam, refuse', 'It\'s legit: tax-free shopping needs your passport.', {}),
        ], 'mo-tax'),
        say('In the afternoon you try a PC bang – a huge gaming café with fast PCs, ramyeon delivered to your seat and comfy chairs.'),
        ask('law', 'The PC bang staff ask for ID in the evening. Why?', [
          ok('Minors can\'t stay late in PC bangs – staff check age at night', 'Right. Keep a copy/ID on you.', { manner: 3 }, 'passport'),
          no('To keep my passport as a deposit', 'No – never leave your passport as a deposit.', {}),
        ]),
        learn('la-camera'),
      ],
    },
    {
      id: 'kc-6', day: 3, bg: 'dmz',
      title: { en: 'DMZ tour', ko: 'DMZ 투어' },
      location: { en: 'Imjingak & the DMZ', ko: '임진각 & DMZ' },
      steps: [
        say('An official tour bus takes you to the DMZ, the 4 km-wide buffer zone between South and North Korea.'),
        ask('law', 'What must you bring on a DMZ tour?', [
          ok('My passport – ID is checked at military checkpoints', 'Without it you\'d be turned back.', { manner: 5 }, 'passport'),
          no('Nothing, it\'s just sightseeing', 'You can\'t pass the checkpoint without your passport.', { energy: -20 }),
        ]),
        ask('law', 'A soldier says "No photos here." Your phone is in your hand.', [
          ok('Put it away and only shoot at marked photo points', 'Correct. Military rules here are strict.', { manner: 8 }, 'camera'),
          no('Sneak a quick photo', 'The soldier makes you delete it. The tour is delayed.', { manner: -15 }),
        ], 'la-camera'),
        event('weather', 'Cold wind', 'The open hills near the border are windy and colder than Seoul.', { energy: -8 }, 'winter'),
        learn('we-cold'),
        talk('guide', 'The DMZ is also an accidental nature reserve – cranes and rare animals live here.'),
      ],
    },
    {
      id: 'kc-7', day: 3, bg: 'hospital',
      title: { en: 'Caught a cold', ko: '감기에 걸렸어요' },
      location: { en: 'Sinchon clinic', ko: '신촌 의원' },
      steps: [
        event('health', 'Sniffles & fever', 'Dust, wind and dancing – by evening you have a sore throat and 38 °C fever.', { energy: -20 }, 'medicine'),
        ask('medical', 'It\'s 18:30 on a weekday. What\'s your best move?', [
          ok('Find an ENT (이비인후과) or internal-medicine clinic open in the evening', 'Many clinics stay open until 19:00–21:00. A quick consult and a prescription.', { energy: 15, money: -15000 }, 'hospital'),
          no('Go to a university-hospital ER', 'For a cold? Long wait and high fees.', { money: -100000, energy: -10 }, 'er'),
        ], 'me-clinic'),
        ask('medical', 'The doctor gives you a prescription. Where do you get the medicine?', [
          ok('At a pharmacy (약국) – usually right next to the clinic', 'Yes. In Korea, clinics prescribe and pharmacies dispense.', { energy: 10, money: -5000 }, 'pharmacy'),
          no('The doctor will hand it to me', 'In Korea clinics usually don\'t dispense pills themselves.', {}),
        ], 'me-pharmacy'),
        ask('medical', 'You can\'t explain your symptoms well in Korean. Who can help?', [
          ok('Call 1330 for free interpretation', 'They connect you with an interpreter on speakerphone.', { manner: 3 }, 'hotline'),
          no('Give up and leave', 'You don\'t get the right treatment.', { energy: -10 }),
        ], 'me-1330'),
        learn('me-insurance'),
      ],
    },
    {
      id: 'kc-8', day: 4, bg: 'airport',
      title: { en: 'Departure from Gimpo', ko: '김포공항 출국' },
      location: { en: 'Gimpo International Airport', ko: '김포국제공항' },
      steps: [
        say('Day 4. Feeling better, you head back to Gimpo by subway.'),
        ask('etiquette', 'On the subway escalator, people stand in two lines. What do you do?', [
          ok('Stand still, hold the handrail, keep right on the stairs', 'Safety first.', { manner: 4 }, 'walk-right'),
          no('Run down the escalator with my suitcase', 'You nearly knock someone over.', { manner: -8, energy: -5 }),
        ], 'et-right'),
        learn('lo-hotel'),
        learn('mo-fx'),
        talk('guide', 'You danced, cooked and explored like a local. Daebak!', P('대박!', 'Dae-bak!', 'Awesome!')),
      ],
    },
  ],
};
