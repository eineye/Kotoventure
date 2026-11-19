import type { Course } from '../types';
import { ask, event, learn, no, ok, P, say, simulate, talk } from '../dsl';

/** 식도락 – Busan food trail. Starts at a PORT (ferry from Fukuoka), ends at Gimhae Airport. */
export const busanFood: Course = {
  id: 'busan-food',
  categoryId: 'food',
  title: { en: 'Busan Food Trail', ko: '부산 먹방 투어' },
  subtitle: { en: 'Ferry in, eat everything – 3 nights / 4 days', ko: '배 타고 부산 먹방 3박4일' },
  description: {
    en: 'Arrive by ferry from Japan at Busan Port, then eat your way through Jagalchi fish market, Gukje market hotteok, dwaeji gukbap, chimaek at Gwangalli beach under the drone show, and sleep in a giant jjimjilbang.',
    ko: '부산항 입국 → 자갈치 → 국제시장 → 돼지국밥 → 감천 → 해운대 → 광안리 치맥 → 찜질방 → 김해공항.',
  },
  region: { en: 'Busan', ko: '부산' },
  entry: { kind: 'port', code: 'BUSAN-PORT', name: { en: 'Busan Port International Passenger Terminal', ko: '부산항 국제여객터미널' } },
  exit: { kind: 'airport', code: 'PUS', name: { en: 'Gimhae International Airport', ko: '김해국제공항' } },
  nights: 3,
  days: 4,
  difficulty: 1,
  partyFit: { solo: 4, couple: 4, friends: 5, group: 5 },
  partyTips: {
    solo: { en: 'Gukbap restaurants and market stalls are perfect for eating alone.' },
    couple: { en: 'Watch the Gwangalli drone light show (Saturday nights) from the beach.' },
    friends: { en: 'Share a big platter of raw fish at Jagalchi – more people, more dishes.' },
    group: { en: 'Busan seafood restaurants have big rooms for groups – book ahead on weekends.' },
  },
  startBudget: 600000,
  coverBg: 'market',
  access: 'base',
  isPublished: true,
  version: 1,
  sortOrder: 2,
  scenes: [
    {
      id: 'bf-1', day: 1, bg: 'port',
      title: { en: 'Arrive at Busan Port', ko: '부산항 도착' },
      location: { en: 'Busan Port International Passenger Terminal', ko: '부산항 국제여객터미널' },
      steps: [
        say('Your ferry from Fukuoka glides into Busan Port. Seagulls, container cranes and the mountains of Korea\'s second city greet you.'),
        talk('guide', 'Welcome to Busan! Locals say "Annyeong-haseyo" with a strong, friendly accent here.'),
        ask('law', 'At the port arrival hall, what do you need?', [
          ok('My passport and entry approval – same as at an airport', 'Yes. Ports are international borders too.', { manner: 3 }, 'passport'),
          no('Only my ferry ticket', 'The ticket is not an ID. Immigration needs your passport.', { energy: -10 }),
        ], 'tr-ferry'),
        event('weather', 'Typhoon season note', 'It\'s late summer. The captain says yesterday\'s sailing was cancelled for strong winds – typhoons often reach the south coast in August–September.', undefined, 'typhoon'),
        ask('weather', 'Your return flight is in 4 days and a typhoon is forecast for the weekend. What do you do?', [
          ok('Watch the forecast & phone alerts and keep a buffer in my plans', 'Good. Flights and ferries are cancelled during typhoons.', { energy: 5 }, 'typhoon'),
          no('Ignore it, typhoons never reach Korea', 'They do – mostly Jeju and the south coast in Aug–Sep.', { energy: -5 }),
        ], 'we-rain'),
        simulate('atm', 'money', 'Global ATM at the ferry terminal', 'You need about ₩100,000 in cash for the fish market and street food. Use the Global ATM: choose the right menu, insert your card, enter your PIN, pick the amount – and don\'t fall for the currency-conversion trap. Bonus: practise a Korean passbook update.', { targetKRW: 100000, passbookPractice: true }, 'mo-atm'),
        say('You take the subway – T-money cards work in Busan too. Line 1 (orange) runs to Jagalchi.'),
      ],
    },
    {
      id: 'bf-2', day: 1, bg: 'market',
      title: { en: 'Jagalchi Fish Market', ko: '자갈치 시장' },
      location: { en: 'Jagalchi, Jung-gu', ko: '자갈치, 중구' },
      steps: [
        say('Korea\'s biggest fish market. Ajumma vendors shout "Oiso! Boiso! Saiso!" – Busan dialect for "Come, look, buy!"'),
        talk('local', 'Pick your fish downstairs, eat it upstairs! Hoe (raw fish) is fresh, fresh!', P('이거 얼마예요?', 'I-geo eol-ma-ye-yo?', 'How much is this?')),
        ask('money', 'You picked fish downstairs and go upstairs to eat. The bill has an extra "상차림비". What is it?', [
          ok('A per-person table-setting fee for side dishes, sauces and cooking', 'Correct. It\'s normal in fish markets – ask the price first.', { money: -20000 }),
          no('A scam – refuse to pay', 'It\'s a standard charge. Arguing just ruins the meal.', { manner: -8, money: -20000 }),
        ]),
        ask('etiquette', 'You want a photo of a vendor gutting an octopus.', [
          ok('Ask first: "Sajin jjigeodo dwaeyo?"', 'She laughs and poses with the octopus!', { manner: 6 }, 'camera'),
          no('Shove the camera in her face', 'She waves you off. Ask first.', { manner: -6 }),
        ], 'et-photo'),
        say('Your table fills: raw fish, spicy fish stew (maeuntang) – and more banchan.'),
        learn('fo-bell'),
      ],
    },
    {
      id: 'bf-3', day: 1, bg: 'street',
      title: { en: 'Gukje Market & BIFF Square', ko: '국제시장 & BIFF 광장' },
      location: { en: 'Gukje Market, Nampo-dong', ko: '국제시장, 남포동' },
      steps: [
        say('Across the road: BIFF Square (named after the Busan International Film Festival) with actors\' handprints – and the famous seed hotteok (ssiat-hotteok) stands.'),
        ask('food', 'You get a hot ssiat-hotteok stuffed with sugar and seeds. How do you eat it?', [
          ok('Wait a moment and bite carefully – the syrup is boiling hot', 'Crunchy, sweet and nobody got burnt!', { energy: 8, money: -2000 }, 'hotteok'),
          no('Stuff it all in at once', 'Burnt tongue! Ow!', { energy: -8, money: -2000 }),
        ], 'fo-street'),
        simulate('cashpay', 'money', 'Pay the hotteok ajumma', 'Market stalls take cash. Pay for two seed hotteok and two fish-cake skewers with the money in your wallet – small notes and coins make the ajumma happy.', { shop: 'BIFF 씨앗호떡 · 어묵 Seed hotteok & eomuk stall', items: [{ name: '씨앗호떡 ×2 Seed hotteok', price: 4000 }, { name: '어묵 ×2 Fish-cake skewers', price: 2000 }], cashOnly: true }, 'mo-notes'),
        ask('food', 'Fish-cake (eomuk) skewers simmer in broth. The paper cups next to them?', [
          ok('The broth is free – ladle some into a cup; pay per skewer when done', 'Yes! Keep your sticks so the vendor can count.', { energy: 6, money: -3000 }),
          no('The broth costs extra so skip it', 'It\'s free. You missed the best part!', {}),
        ]),
        learn('et-trash'),
      ],
    },
    {
      id: 'bf-4', day: 2, bg: 'restaurant',
      title: { en: 'Dwaeji gukbap breakfast', ko: '돼지국밥 아침' },
      location: { en: 'Seomyeon gukbap alley', ko: '서면 국밥골목' },
      steps: [
        say('Day 2. Busan\'s soul food for breakfast: dwaeji gukbap – milky pork-bone soup with rice.'),
        say('Gukbap shops are honbap (solo dining) heaven: single seats at the counter.', { parties: ['solo'] }),
        ask('food', 'Your soup arrives plain, with small bowls of salted shrimp, chives and chili paste. What do you do?', [
          ok('Season it myself with saeujeot and buchu, to taste', 'That\'s the way. Every Busan local has their own mix.', { energy: 15 }, 'gukbap'),
          no('Complain that it has no taste', 'It\'s meant to be seasoned by you!', { manner: -5, energy: 10 }),
        ], 'fo-gukbap'),
        ask('food', 'Where is the water?', [
          ok('Look for the water dispenser and cups – "Water is self-service" (물은 셀프)', 'Right!', { manner: 3 }),
          no('Wait for the staff to bring a bottle', 'In many Korean eateries water is self-service.', { energy: -3 }),
        ]),
        ask('food', 'How do you eat the rice and soup?', [
          ok('With a spoon; chopsticks for kimchi and side dishes', 'Correct Korean style!', { manner: 4 }, 'chopsticks'),
          no('Lift the bowl to my mouth and slurp the rice', 'In Korea bowls stay on the table.', { manner: -3 }),
          no('Stick the chopsticks upright in the rice while I rest', 'That resembles a funeral ritual – avoid it!', { manner: -8 }),
        ], 'fo-manners'),
        learn('fo-tang'),
        learn('fo-kimchi'),
      ],
    },
    {
      id: 'bf-5', day: 2, bg: 'village',
      title: { en: 'Gamcheon Culture Village', ko: '감천문화마을' },
      location: { en: 'Gamcheon, Saha-gu', ko: '감천, 사하구' },
      steps: [
        say('A hillside of pastel houses, murals and the "Little Prince" statue. A small green "maeul bus" (village bus) climbs the steep road.'),
        ask('transport', 'On the packed village bus an elderly lady gets on with groceries.', [
          ok('Offer her my seat', 'She pats your arm: "Gomawoyo!" Respect for elders matters a lot.', { manner: 8, energy: -3 }, 'priority-seat'),
          no('Pretend to sleep', 'Everyone noticed.', { manner: -6 }),
        ], 'et-seats'),
        ask('etiquette', 'The alleys are tiny and people\'s laundry hangs outside.', [
          ok('Keep voices low and stay on the marked tour route', 'Residents appreciate it.', { manner: 5 }, 'quiet'),
          no('Play music on a speaker', 'A resident shuts her window with a bang.', { manner: -8 }),
        ], 'et-quiet'),
        event('weather', 'Steep hill + heat', 'Climbing in 33 °C humid heat drains your energy fast.', { energy: -10 }, 'heatwave'),
        learn('we-heat'),
      ],
    },
    {
      id: 'bf-6', day: 2, bg: 'beach',
      title: { en: 'Haeundae Beach', ko: '해운대 해수욕장' },
      location: { en: 'Haeundae', ko: '해운대' },
      steps: [
        say('Haeundae: Korea\'s most famous beach, with skyscrapers on one side and the sea on the other.'),
        say('Your family sets up under a rented parasol – lifeguards watch the swimming zone.', { parties: ['group'] }),
        event('health', 'Jellyfish sting!', 'Ouch! Something stung your leg while swimming. A red line appears – a jellyfish.', { energy: -12 }, 'firstaid'),
        ask('medical', 'What\'s the right first aid?', [
          ok('Get out, rinse with SEAWATER, remove bits with a card, go to the lifeguard first-aid post', 'Correct! Fresh water can make it worse.', { energy: 8 }, 'firstaid'),
          no('Rinse with bottled fresh water and rub it hard', 'Fresh water and rubbing can trigger more venom.', { energy: -8 }),
        ], 'me-firstaid'),
        ask('law', 'You want to smoke a cigarette on the sand.', [
          ok('Find the designated smoking area off the beach', 'Right. Smoking on the beach can be fined.', { manner: 4 }, 'no-smoking'),
          no('Smoke on the sand and bury the butt', 'Fined – and kids play here.', { money: -50000, manner: -10 }),
        ], 'la-minor'),
        ask('lodging', 'Tonight you need a cheap, private room near the beach. What\'s a good Korean option?', [
          ok('A clean modern motel with a self check-in kiosk', 'Korean motels are budget-friendly and private.', { money: -60000, energy: 15 }, 'motel'),
          ok('A guesthouse dorm (social & cheapest)', 'Great for meeting other travellers.', { money: -30000, energy: 10 }, 'house'),
          no('Sleep on the beach', 'Security wakes you at 3 am. You feel awful.', { energy: -25 }),
        ], 'lo-motel'),
      ],
    },
    {
      id: 'bf-7', day: 3, bg: 'night-beach',
      title: { en: 'Gwangalli chimaek & drone show', ko: '광안리 치맥 & 드론쇼' },
      location: { en: 'Gwangalli Beach', ko: '광안리 해수욕장' },
      steps: [
        say('Day 3 night. Gwangan Bridge glows in colours. On Saturday nights hundreds of drones draw pictures above the sea.'),
        ask('food', 'You order fried chicken. What comes in the little square container?', [
          ok('Pickled radish (chikin-mu) to refresh your palate', 'Exactly – it\'s free with every chicken.', { energy: 8 }, 'chicken'),
          no('Dessert', 'Not quite – it\'s tangy pickled radish!', {}),
        ], 'fo-chimaek'),
        say('Your friends order soju and beer and make "somaek" (soju + beer).', { parties: ['friends', 'group'] }),
        ask('food', 'Your glass is empty. Your friend\'s glass is also empty.', [
          ok('Fill your friend\'s glass – they will fill yours', 'Yes! Never pour for yourself.', { manner: 6 }, 'soju'),
          no('Refill only your own glass', 'Your friend raises an eyebrow…', { manner: -5 }),
        ], 'fo-drink'),
        ask('law', 'You had two drinks. Your rental e-scooter is parked nearby.', [
          ok('Take a taxi – drink-riding is illegal on scooters too', 'Right. Korea\'s limit is 0.03% and police check scooters too.', { money: -9000, manner: 5 }, 'taxi'),
          no('Ride the scooter back, it\'s only 2 km', 'Police checkpoint! Fine and licence trouble.', { money: -100000, manner: -15 }),
        ], 'la-traffic'),
      ],
    },
    {
      id: 'bf-8', day: 3, bg: 'jjimjilbang',
      title: { en: 'Giant jjimjilbang night', ko: '찜질방에서 하룻밤' },
      location: { en: 'Centum City', ko: '센텀시티' },
      steps: [
        say('Instead of a hotel you try a giant jjimjilbang (Korean spa) for the night.'),
        learn('lo-jjimjil'),
        ask('lodging', 'You enter the bath area. What\'s the rule?', [
          ok('Strip completely in the gender-separated bath and shower BEFORE entering the hot pools', 'Correct. Swimsuits are not worn in the baths.', { manner: 6, energy: 10 }, 'jjimjilbang'),
          no('Jump into the hot pool in my swimsuit', 'An ajeossi points at the sign: shower first, no swimsuits.', { manner: -8 }),
        ]),
        ask('etiquette', 'Where do you leave your shoes?', [
          ok('In the shoe locker at the entrance', 'Yes. Shoes come off at the entrance.', { manner: 3 }, 'shoes-off'),
          no('Carry them inside', 'Staff stop you.', { manner: -4 }),
        ], 'et-shoes'),
        event('health', 'Feeling dizzy', 'Too long in the 70 °C sauna right after drinks – your head spins.', { energy: -15 }, 'medicine'),
        ask('medical', 'What do you do?', [
          ok('Get out, lie down in a cool room and drink water or sikhye', 'You feel better soon. Avoid saunas after alcohol.', { energy: 12 }),
          no('Go back in to "sweat it out"', 'Worse! That\'s how people faint.', { energy: -15 }),
        ], 'me-firstaid'),
        learn('me-1330'),
      ],
    },
    {
      id: 'bf-9', day: 4, bg: 'airport',
      title: { en: 'Fly home from Gimhae', ko: '김해공항 출국' },
      location: { en: 'Gimhae International Airport', ko: '김해국제공항' },
      steps: [
        say('Day 4. You take the Busan–Gimhae Light Rail to the airport.'),
        ask('money', 'You bought ₩60,000 of snacks at a big Tax Free store.', [
          ok('Show my passport for the instant refund at the till', 'Easy refund.', { money: 4000 }, 'tax-refund'),
          no('Throw away the receipt', 'No receipt, no refund.', {}),
        ], 'mo-tax'),
        learn('mo-fx'),
        learn('me-insurance'),
        talk('guide', 'Your stomach is full of Busan! Come back for more missions.', P('맛있었어요!', 'Ma-si-sseo-sseo-yo!', 'It was delicious!')),
      ],
    },
  ],
};
