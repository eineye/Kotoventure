/**
 * Mission generator for the regional missions.
 *
 * Each mission is written as a compact `MissionDef` (places, facts, food, lodging) and expanded here
 * into a full Course whose scenes always cover all 8 topics:
 *   arrival (transport · law · weather) → places (etiquette · law + ticket/bus sims) → meal (food · money)
 *   → lodging → health (medical + pharmacy) → departure (money).
 * Question banks are keyed by place kind, so the same rules are taught in context everywhere.
 * Prices, hours and routes are realistic examples – players are told to check before travelling.
 */
import { TICKET_SITES, RESTAURANTS, type BusColor, type MenuItem } from '../practice';
import type { Area, ChoiceOption, Course, EstItem, PartyType, Scene, Step, TimeCat, TopicId } from '../types';
import { ask, event, learn, no, ok, P, say, simulate, talk } from '../dsl';

export type Kind =
  | 'palace' | 'temple' | 'market' | 'mountain' | 'beach' | 'museum' | 'street' | 'village'
  | 'night' | 'park' | 'island' | 'workshop' | 'river' | 'memorial' | 'cave' | 'farm';

export interface Stop {
  key: string;
  ko: string;
  en: string;
  kind: Kind;
  /** narration: what makes it special (facts) */
  text: string;
  /** optional guide line */
  tip?: string;
  bg?: string;
  /** ticket office (adult price etc.) */
  ticket?: { adult: number; youth?: number; child?: number; senior?: number; open: string; last: string; hanbok?: boolean; note?: string };
  /** take a city bus to get here: number, colour and stops (last = get off) */
  bus?: { no: string; color: BusColor; stops: string[] };
  /** a phrase a local says here */
  phrase?: [string, string, string];
  /** explicit day and time slot (for detailed itineraries) */
  day?: number;
  time?: string;
  /** travel here by taxi app first (destination name, Korean address, fare) */
  move?: { dest: string; addr: string; fare: number; text?: string };
  /** order at a Korean café kiosk here */
  kiosk?: boolean;
  /** time estimates: minutes spent here, minutes walking here (instead of a ride), minutes riding here */
  min?: number;
  walk?: number;
  ride?: number;
}

export interface Meal {
  place: [ko: string, en: string];
  text: string;
  dishes: Dish[];
  tip?: string;
  /** key of the stop after which this meal happens (default: 1st meal after stop 1, 2nd after stop 2, 3rd after stop 3) */
  after?: string;
  time?: string;
}

export type Dish = [ko: string, en: string, price: number, min?: number, spicy?: 0 | 1 | 2];

export interface MissionDef {
  id: string;
  area: Area;
  cat: 'sightseeing' | 'food' | 'culture' | 'adventure' | 'experience';
  title: [en: string, ko: string];
  sub: [en: string, ko: string];
  desc: string;
  hub: HubId;
  exit?: HubId;
  /** how to get from the hub to the first place (the correct answer) */
  go: string;
  days: number;
  nights: number;
  diff: 1 | 2 | 3;
  fit: [solo: number, couple: number, friends: number, group: number];
  budget: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  stay: 'hotel' | 'hanok' | 'guesthouse' | 'pension' | 'temple' | 'jjimjilbang' | 'motel' | 'resort';
  food: Meal;
  /** further meals */
  food2?: Meal;
  food3?: Meal;
  /** morning of day 2 (breakfast / check-out) */
  morning?: { time?: string; text: string };
  /** time the trip ends (shown on the last scene) */
  end?: string;
  version?: number;
  stops: Stop[];
  health?: 'heat' | 'sprain' | 'stomach' | 'cold';
  /** an extra everyday sim somewhere on the trip */
  extra?: 'kiosk' | 'recycle' | 'crosswalk' | 'locker' | 'taxi' | 'cashpay';
  tips?: Partial<Record<PartyType, string>>;
  /** 'base' = included with the app; otherwise sold in the area pack */
  free?: boolean;
}

/* ───────────── gateways ───────────── */
export type HubId = 'ICN' | 'GMP' | 'CJU' | 'PUS' | 'TAE' | 'CJJ' | 'YNY' | 'MWX' | 'RSU' | 'INCHEON-PORT' | 'BUSAN-PORT' | 'JEJU-PORT';
const HUBS: Record<HubId, { kind: 'airport' | 'port'; ko: string; en: string; bg: string }> = {
  ICN: { kind: 'airport', ko: '인천국제공항', en: 'Incheon International Airport', bg: 'airport' },
  GMP: { kind: 'airport', ko: '김포국제공항', en: 'Gimpo International Airport', bg: 'airport' },
  CJU: { kind: 'airport', ko: '제주국제공항', en: 'Jeju International Airport', bg: 'airport' },
  PUS: { kind: 'airport', ko: '김해국제공항', en: 'Gimhae International Airport', bg: 'airport' },
  TAE: { kind: 'airport', ko: '대구국제공항', en: 'Daegu International Airport', bg: 'airport' },
  CJJ: { kind: 'airport', ko: '청주국제공항', en: 'Cheongju International Airport', bg: 'airport' },
  YNY: { kind: 'airport', ko: '양양국제공항', en: 'Yangyang International Airport', bg: 'airport' },
  MWX: { kind: 'airport', ko: '무안국제공항', en: 'Muan International Airport', bg: 'airport' },
  RSU: { kind: 'airport', ko: '여수공항', en: 'Yeosu Airport', bg: 'airport' },
  'INCHEON-PORT': { kind: 'port', ko: '인천항 국제여객터미널', en: 'Incheon Port International Ferry Terminal', bg: 'port' },
  'BUSAN-PORT': { kind: 'port', ko: '부산항 국제여객터미널', en: 'Busan Port International Passenger Terminal', bg: 'port' },
  'JEJU-PORT': { kind: 'port', ko: '제주항 연안여객터미널', en: 'Jeju Port Ferry Terminal', bg: 'port' },
};

/* ───────────── helpers ───────────── */
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const pick = <T,>(arr: T[], seed: string) => arr[hash(seed) % arr.length];
type Q = () => Step;

/* ───────────── question banks by place kind ───────────── */
const BANK: Record<Kind, Q[]> = {
  palace: [
    () => ask('etiquette', 'You want a photo with a royal guard in costume.', [
      ok('Take it from a respectful distance without touching', 'Perfect – guards are on duty and can\'t react.', { manner: 4 }, 'camera'),
      no('Put an arm around him and tug his beard', 'He\'s working – keep a polite distance and you\'ll still get a great photo.', { manner: -8 }),
    ], 'et-photo'),
    () => ask('law', 'There is a rope around an old wooden hall and a sign: 출입금지.', [
      ok('Stay outside the rope – 출입금지 means "no entry"', 'Right. Heritage buildings are protected by law.', { manner: 5 }),
      no('Step over quickly for a better angle', 'A guard calls you back. Damaging heritage can be fined – the view from the path is lovely too.', { manner: -8 }),
    ], 'la-camera'),
    () => ask('money', 'You are wearing a rented hanbok. What does that mean at many royal palaces?', [
      ok('Free admission for visitors in hanbok', 'Yes! And you\'ll get plenty of smiles and photo requests.', { money: 3000 }, 'hanbok'),
      no('You must pay double', 'No – hanbok wearers usually get in free.', {}),
    ]),
  ],
  temple: [
    () => ask('etiquette', 'You enter the main Buddha hall where people are praying.', [
      ok('Use a side door, keep quiet, no photos of worshippers', 'Respectful. The central door is traditionally for senior monks.', { manner: 6 }, 'temple'),
      no('Walk through the middle door and take flash photos', 'A monk gently asks you to stop. Side doors and quiet voices are the custom.', { manner: -8 }),
    ], 'et-quiet'),
    () => ask('etiquette', 'At the temple gate you meet a monk walking past.', [
      ok('Put my palms together and bow slightly', 'He returns the bow with a smile ("hapjang").', { manner: 5 }, 'temple'),
      no('Ask him for a high-five', 'Not the custom – a small bow with palms together is perfect.', { manner: -4 }),
    ], 'et-hands'),
    () => ask('law', 'You brought a small drone to film the temple roofs.', [
      ok('Check the signs and drone rules first – many sites ban flying', 'Good. Heritage sites and many areas need permission.', { manner: 4 }, 'drone'),
      no('Fly it over the crowd right away', 'Security stops you. Always check drone rules and signs first.', { manner: -10 }),
    ], 'la-camera'),
  ],
  market: [
    () => ask('money', 'A stall shows prices on handwritten cardboard. How do you pay?', [
      ok('Small notes or coins – and many stalls also take cards or bank transfer', 'Markets love small notes; ask "카드 돼요?" if you\'re unsure.', { manner: 3 }, 'krw-notes'),
      no('A ₩50,000 note for a ₩2,000 snack', 'The ajumma sighs – she may not have change. Keep small notes for markets.', { manner: -3 }),
    ], 'mo-notes'),
    () => ask('etiquette', 'You want to taste something at a crowded stall.', [
      ok('Ask "이거 맛볼 수 있어요?" or buy a small portion', 'Many vendors happily let you try!', { manner: 3 }),
      no('Pick food from the tray with your fingers', 'Please don\'t – ask first or buy a small portion.', { manner: -6 }),
    ], 'fo-street'),
    () => ask('food', 'Where do you eat your street food?', [
      ok('Standing at the stall or on its stools, and return the plate or skewer', 'That\'s how it\'s done – walking and eating in crowds is awkward.', { manner: 3 }, 'hotteok'),
      no('Walking through the packed alley with a dripping skewer', 'You bump into people – eat at the stall, it\'s part of the fun.', { manner: -3 }),
    ], 'fo-street'),
  ],
  mountain: [
    () => ask('weather', 'The forecast says sunny, but you\'re heading up a mountain.', [
      ok('Pack water, a windbreaker and start early – it\'s colder and changes fast up high', 'Prepared. It\'s often 5–10 °C colder at the top.', { energy: 8 }, 'seasons'),
      no('Go in sandals with no water at 3 pm', 'You turn back exhausted. Start early and pack layers.', { energy: -15 }),
    ], 'we-seasons'),
    () => ask('law', 'An older hiker offers you makgeolli at the summit.', [
      ok('Politely decline – drinking is banned in many park areas, and it\'s still a long way down', 'Wise. Alcohol rules apply in national parks and the descent is where accidents happen.', { manner: 4 }, 'soju'),
      no('Drink a few cups and run down', 'Many falls happen on the way down – and park drinking bans can be fined.', { energy: -12 }),
    ]),
    () => ask('etiquette', 'The trail is narrow and a group comes up the other way.', [
      ok('Step aside, greet them "안녕하세요!" and let uphill hikers pass', 'Korean hikers love a friendly greeting!', { manner: 5 }, 'walk-right'),
      no('Stand in the middle for selfies', 'People squeeze past grumbling – step aside and greet them instead.', { manner: -4 }),
    ], 'et-right'),
  ],
  beach: [
    () => ask('law', 'There are flags and a lifeguard tower. You want to swim far out.', [
      ok('Swim only inside the buoys during lifeguard hours', 'Safe. Swimming outside the zone or at night can be fined.', { energy: 4 }, 'firstaid'),
      no('Swim past the buoys at night', 'Very dangerous and not allowed – rip currents are strong.', { energy: -15 }),
    ], 'me-firstaid'),
    () => ask('etiquette', 'You finished a picnic on the sand.', [
      ok('Take everything back and sort it into the recycling bins', 'Thank you! Volunteers clean these beaches every morning.', { manner: 6 }, 'trash-bins'),
      no('Bury the cans in the sand', 'Please don\'t – use the sorting bins by the boardwalk.', { manner: -8 }),
    ], 'et-trash'),
    () => ask('weather', 'It\'s 33 °C on the beach at 2 pm.', [
      ok('Sunscreen, shade, lots of water – swim and rest in turns', 'Smart. Summer heat in Korea is humid and tiring.', { energy: 6 }, 'heatwave'),
      no('Sleep in the sun without sunscreen', 'Painful sunburn and a heat headache.', { energy: -12 }),
    ], 'we-heat'),
  ],
  museum: [
    () => ask('etiquette', 'Inside the exhibition hall a sign shows a crossed-out camera with a flash.', [
      ok('Photos only where allowed, never with flash, and keep my voice low', 'Exactly. Many Korean museums are free – treat them kindly.', { manner: 4 }, 'camera'),
      no('Take flash photos of every artefact', 'Flash damages old objects – a guard asks you to stop.', { manner: -6 }),
    ], 'la-camera'),
    () => ask('money', 'The national museum\'s permanent exhibition costs…', [
      ok('Nothing – many national museums in Korea are free', 'Yes! Special exhibitions may charge a small fee.', { money: 0 }),
      no('About ₩50,000', 'No – most national museums are free.', {}),
    ]),
  ],
  street: [
    () => ask('etiquette', 'The sidewalk is packed and you want to check your map.', [
      ok('Step to the side first, then look at my phone', 'Good – keep the flow moving. People walk on the right.', { manner: 4 }, 'walk-right'),
      no('Stop dead in the middle of the crowd', 'People bump into you. Step aside first.', { manner: -4 }),
    ], 'et-right'),
    () => ask('money', 'A shop has a "TAX FREE" sticker and you spend ₩60,000.', [
      ok('Show my passport for the instant tax refund', 'Money back right away!', { money: 4000 }, 'tax-refund'),
      no('Throw the receipt away', 'No receipt, no refund.', {}),
    ], 'mo-tax'),
    () => ask('law', 'You find a wallet on the street.', [
      ok('Hand it to a police box (파출소) or the nearest shop', 'Korea has a great lost-and-found culture – the owner gets it back.', { manner: 8 }, 'police'),
      no('Keep the cash', 'Taking lost property is a crime in Korea – and CCTV is everywhere.', { manner: -15 }),
    ], 'la-police'),
  ],
  village: [
    () => ask('etiquette', 'People live in these houses. A gate is open with a pretty courtyard.', [
      ok('Admire it from the street and keep my voice down', 'Perfect – it\'s someone\'s home.', { manner: 6 }, 'quiet'),
      no('Walk in for a quick look', 'The owner is upset – admiring from the street is perfectly fine.', { manner: -10 }),
    ], 'et-quiet'),
    () => ask('etiquette', 'You take off your shoes to enter a traditional house.', [
      ok('Leave them neatly on the stone step, toes pointing out', 'The host smiles – very well done.', { manner: 5 }, 'shoes-off'),
      no('Keep them on, they\'re clean', 'Wooden floors are always shoe-free in Korean homes.', { manner: -8 }),
    ], 'et-shoes'),
  ],
  night: [
    () => ask('law', 'It\'s midnight. You want to get back to your stay.', [
      ok('Check the last subway/bus time, or call a licensed taxi with an app', 'Good. Night surcharges apply 22:00–04:00.', { money: -12000 }, 'taxi'),
      no('Ride with a stranger offering a "cheap ride"', 'Unlicensed cars are unsafe and illegal – use a licensed taxi.', { money: -30000, energy: -10 }),
    ], 'tr-taxi'),
    () => ask('etiquette', 'The night view is beautiful and you are with friends in a residential area.', [
      ok('Keep voices down after 10 pm', 'Thank you – people are sleeping nearby.', { manner: 4 }, 'quiet'),
      no('Play music loudly on a speaker', 'A neighbour shouts from a window – keep it down after 10 pm.', { manner: -6 }),
    ], 'et-quiet'),
  ],
  park: [
    () => ask('etiquette', 'You want to have a picnic in the park.', [
      ok('Use the lawn areas, keep it tidy and take trash to the sorting bins', 'Lovely – Korean parks are clean thanks to everyone.', { manner: 5 }, 'trash-bins'),
      no('Cook with a camping stove on the grass', 'Open fires are banned in most parks – delivery food is the Korean way!', { manner: -6, money: -50000 }),
    ], 'et-trash'),
    () => ask('transport', 'You rent a public bike to ride around.', [
      ok('Use the bike paths, ride on the right and wear a helmet', 'Safe and fun.', { energy: 4 }, 'bike'),
      no('Ride fast on the sidewalk through crowds', 'Dangerous – use the bike paths.', { manner: -6 }),
    ], 'tr-bike'),
  ],
  island: [
    () => ask('transport', 'The ferry ticket office asks for something before you board.', [
      ok('My passport/ID – passenger lists are checked on ferries', 'Correct. Always carry ID for ferries.', { manner: 3 }, 'passport'),
      no('Nothing, I\'ll just walk on', 'You need ID for the passenger list – it\'s a safety rule.', { energy: -8 }),
    ], 'tr-ferry'),
    () => ask('weather', 'Strong wind is forecast for the afternoon.', [
      ok('Check the ferry schedule – boats are cancelled in strong wind', 'Smart. Plan an earlier return or a backup.', { energy: 5 }, 'typhoon'),
      no('Ignore it, ferries always run', 'The last ferry is cancelled and you\'re stuck overnight.', { money: -60000, energy: -10 }),
    ], 'we-rain'),
  ],
  workshop: [
    () => ask('etiquette', 'The teacher (older than you) hands you the materials.', [
      ok('Receive them with two hands and say "감사합니다"', 'The teacher beams – two hands show respect.', { manner: 5 }, 'two-hands'),
      no('Grab them with one hand while texting', 'Feels careless – two hands and a thank-you go a long way.', { manner: -4 }),
    ], 'et-hands'),
    () => ask('money', 'The class needs a reservation and the price is ₩30,000.', [
      ok('Book online in advance and pay by card', 'Easy – popular classes sell out on weekends.', { money: -30000 }, 'phone-pay'),
      no('Turn up without booking on Saturday', 'Fully booked – you wait for a later slot.', { energy: -8 }),
    ], 'mo-card'),
  ],
  river: [
    () => ask('law', 'A friend wants to swim in the river to cool down.', [
      ok('Don\'t – swimming is banned in most city rivers; use pools or beaches', 'Right. Currents and boats make it dangerous.', { manner: 4 }),
      no('Jump in from the bridge', 'Very dangerous and not allowed – park patrols will stop you.', { energy: -15 }),
    ]),
    () => ask('etiquette', 'You order chicken delivery to the riverside park.', [
      ok('Meet the rider at the delivery zone and clean up afterwards', 'The classic Korean riverside picnic!', { manner: 4 }, 'chicken'),
      no('Leave the boxes on the grass', 'Park staff have to clean it – use the bins.', { manner: -8 }),
    ], 'et-trash'),
  ],
  memorial: [
    () => ask('etiquette', 'You visit a memorial for people who died in a tragic event.', [
      ok('Speak quietly, read the stories, bow at the memorial altar if I wish', 'Respectful. Many Koreans visit to remember and learn.', { manner: 8 }, 'quiet'),
      no('Pose with funny faces for social media', 'Please be respectful – this is a place of mourning.', { manner: -10 }),
    ], 'et-quiet'),
  ],
  cave: [
    () => ask('medical', 'The cave path is wet and low in places.', [
      ok('Wear grippy shoes, watch my head and use the handrails', 'Safe exploring!', { energy: 4 }, 'firstaid'),
      no('Run through in flip-flops', 'You slip and bang your knee.', { energy: -12 }),
    ], 'me-firstaid'),
  ],
  farm: [
    () => ask('etiquette', 'At the farm you are allowed to pick fruit.', [
      ok('Pick only what the farmer shows me and pay for the basket', 'The farmer gives you a bonus tangerine!', { manner: 5 }),
      no('Pick from any tree and eat as I go', 'Ask first – fruit outside the experience area is someone\'s income.', { manner: -6 }),
    ]),
  ],
};
const KIND_BG: Record<Kind, string> = {
  palace: 'palace', temple: 'temple', market: 'market', mountain: 'mountain', beach: 'beach', museum: 'street', street: 'street', village: 'village',
  night: 'tower', park: 'river', island: 'coast', workshop: 'kitchen', river: 'river', memorial: 'tombs', cave: 'mountain', farm: 'village',
};

/* ───────────── season, lodging, health, departure banks ───────────── */
const SEASON = {
  spring: { card: 'we-dust', prop: 'fine-dust', ev: ['Spring in Korea', 'Cherry blossoms are out – but the fine-dust app shows "나쁨" (bad) today.'], q: () => ask('weather', 'Fine dust (미세먼지) is "bad" today. What do you do?', [ok('Wear a KF94 mask outdoors and choose some indoor stops', 'Good. Check the air-quality app each morning.', { energy: 5 }, 'fine-dust'), no('Nothing – it\'s just haze', 'Your throat is scratchy by evening.', { energy: -8 })], 'we-dust') },
  summer: { card: 'we-heat', prop: 'heatwave', ev: ['Summer in Korea', 'It\'s 33 °C and humid, with sudden monsoon downpours in the afternoon.'], q: () => ask('weather', 'A heatwave alert (폭염주의보) pops up on your phone.', [ok('Drink water often, rest in the shade or a café at 12–16h', 'Smart. Convenience stores and cafés are perfect cool-down stops.', { energy: 6 }, 'heatwave'), no('Hike at 2 pm without water', 'Heat exhaustion – headache and dizziness.', { energy: -15 })], 'we-heat') },
  autumn: { card: 'we-seasons', prop: 'autumn', ev: ['Autumn in Korea', 'Clear blue skies and red maple leaves – but mornings are chilly and afternoons warm.'], q: () => ask('weather', 'It\'s 8 °C in the morning and 22 °C in the afternoon. How do you dress?', [ok('Layers: T-shirt plus a light jacket', 'Perfect for big day–night gaps.', { energy: 5 }, 'autumn'), no('Shorts only', 'You shiver after sunset.', { energy: -8 })], 'we-seasons') },
  winter: { card: 'we-cold', prop: 'winter', ev: ['Winter in Korea', 'It\'s −8 °C with an icy wind from Siberia. The pavements are slippery.'], q: () => ask('weather', 'A cold-wave alert (한파주의보) is on. What do you wear?', [ok('A padded coat, hat, gloves and heat packs (핫팩) from a convenience store', 'Warm and happy – heat packs are a Korean winter essential.', { energy: 6 }, 'winter'), no('A thin jacket – it can\'t be that cold', 'You\'re freezing within ten minutes.', { energy: -12 })], 'we-cold') },
} as const;

const STAY: Record<MissionDef['stay'], { ko: string; en: string; card: string; prop: string; q: Q; checkin?: boolean }> = {
  hotel: { ko: '호텔', en: 'hotel', card: 'lo-hotel', prop: 'hotel', q: () => ask('lodging', 'At check-in the hotel asks for a deposit.', [ok('Let them pre-authorise my card – it\'s released after check-out', 'Normal practice.', {}, 'hotel'), no('Refuse and argue', 'A deposit is standard – it\'s returned later.', { manner: -4 })], 'lo-hotel') },
  hanok: { ko: '한옥스테이', en: 'hanok stay', card: 'lo-hanok', prop: 'hanok', q: () => ask('lodging', 'The room has no bed, only folded quilts on a warm floor.', [ok('Roll out the yo mattress on the heated ondol floor', 'Cosy – the ondol floor warms you all night.', { energy: 12 }, 'hanok'), no('Ask for a refund – there\'s no bed!', 'It\'s a traditional room – that\'s the experience!', { manner: -4 })], 'lo-hanok') },
  guesthouse: { ko: '게스트하우스', en: 'guesthouse', card: 'lo-motel', prop: 'house', checkin: true, q: () => ask('lodging', 'It\'s 23:00 in the shared dorm.', [ok('Use headphones, dim light, pack quietly', 'Your roommates thank you in the morning.', { manner: 5 }, 'quiet'), no('Video-call home on speaker', 'Everyone is trying to sleep – take calls to the lounge.', { manner: -6 })], 'et-quiet') },
  pension: { ko: '펜션', en: 'pension', card: 'lo-pension', prop: 'pension', checkin: true, q: () => ask('lodging', 'The pension has a BBQ deck. What\'s the rule?', [ok('Use it only in the allowed hours and sort the trash afterwards', 'The host loves guests like you.', { manner: 5 }, 'pension'), no('Grill inside the room', 'Fire risk – absolutely not. Use the BBQ deck.', { manner: -10, money: -50000 })], 'lo-pension') },
  temple: { ko: '템플스테이', en: 'temple stay', card: 'lo-temple', prop: 'temple', q: () => ask('lodging', 'At the temple-stay dinner (baru gongyang) how much do you take?', [ok('Only what I can finish – no food is wasted', 'That\'s the heart of temple meals.', { manner: 8 }, 'baekban'), no('A big heap – I can leave the rest', 'Wasting food is a no-go at temples.', { manner: -8 })], 'lo-temple') },
  jjimjilbang: { ko: '찜질방', en: 'jjimjilbang', card: 'lo-jjimjil', prop: 'jjimjilbang', q: () => ask('lodging', 'You enter the jjimjilbang bath area.', [ok('Shower first, no swimsuit in the gender-separated baths', 'Correct – that\'s how Korean bathhouses work.', { manner: 6, energy: 10 }, 'jjimjilbang'), no('Jump into the hot pool in my swimsuit', 'Shower first, no swimsuits – the sign shows the rules.', { manner: -6 })], 'lo-jjimjil') },
  motel: { ko: '모텔', en: 'motel', card: 'lo-motel', prop: 'motel', q: () => ask('lodging', 'You need a cheap private room tonight.', [ok('A clean modern motel with a self check-in kiosk', 'Korean motels are budget-friendly and private.', { money: -60000, energy: 12 }, 'motel'), no('Sleep on a bench', 'Security wakes you at 3 am – motels are affordable!', { energy: -20 })], 'lo-motel') },
  resort: { ko: '리조트', en: 'resort', card: 'lo-hotel', prop: 'hotel', q: () => ask('lodging', 'Check-out is 11:00 and your bus leaves at 16:00.', [ok('Ask the front desk to keep my luggage', 'Most hotels and resorts store bags for free.', { energy: 5 }, 'hotel'), no('Stay in the room until 15:00', 'A late check-out fee is charged.', { money: -30000 })], 'lo-hotel') },
};

const HEALTH = {
  heat: { ev: ['Feeling dizzy', 'The heat and the long walk catch up with you – dizzy and slightly nauseous.'], energy: -18, sym: 'heat' },
  sprain: { ev: ['Twisted ankle!', 'You slip on an uneven step and twist your ankle.'], energy: -20, sym: 'sprain' },
  stomach: { ev: ['Ate too much!', 'All that delicious food at once – your stomach feels heavy (체했다).'], energy: -15, sym: 'stomach' },
  cold: { ev: ['Caught a cold', 'Wind and long days – you wake up with a sore throat and a slight fever.'], energy: -15, sym: 'cold' },
} as const;

/* ───────────── time estimates ───────────── */
const est = (min: number, cat: TimeCat, en: string, ko: string, cost?: number, perPerson?: boolean): EstItem => ({ min, cat, label: { en, ko }, ...(cost ? { cost } : {}), ...(perPerson !== undefined ? { perPerson } : {}) });
/** minutes from the gateway to the first place, and fare per person */
const HUB_TIME: Record<HubId, [number, number]> = {
  ICN: [70, 10000], GMP: [40, 1650], CJU: [30, 1500], PUS: [40, 1500], TAE: [25, 1500], CJJ: [60, 5000], YNY: [40, 3000], MWX: [80, 10000], RSU: [30, 3000],
  'INCHEON-PORT': [25, 1500], 'BUSAN-PORT': [20, 1500], 'JEJU-PORT': [20, 1500],
};
/** typical visit length by place kind (minutes) */
const VISIT_MIN: Record<Kind, number> = {
  palace: 120, temple: 90, market: 60, mountain: 240, beach: 90, museum: 90, street: 60, village: 60, night: 60, park: 60, island: 150, workshop: 90, river: 60, memorial: 60, cave: 60, farm: 60,
};
/** overnight cost: [KRW, per person?] */
const STAY_COST: Record<MissionDef['stay'], [number, boolean]> = {
  hotel: [120000, false], hanok: [130000, false], guesthouse: [35000, true], pension: [150000, false], temple: [70000, true], jjimjilbang: [18000, true], motel: [60000, false], resort: [180000, false],
};

/* ───────────── builder ───────────── */
const wrongGo = (h: HubId): ChoiceOption[] => [
  no('Accept a ride from a stranger offering a "taxi" in the arrivals hall', 'Unlicensed drivers overcharge and aren\'t insured – use official transport.', { money: -50000 }),
  no(HUBS[h].kind === 'port' ? 'Walk along the highway with my suitcase' : 'Rent a car with only my home licence', HUBS[h].kind === 'port' ? 'Unsafe and slow – use the shuttle, bus or taxi rank.' : 'Without an International Driving Permit you can\'t rent a car.', { energy: -12 }),
];

function registerTicket(def: MissionDef, s: Stop) {
  const t = s.ticket!;
  const id = `${def.id}-${s.key}`;
  TICKET_SITES[id] = {
    id,
    ko: `${s.ko} 매표소`,
    en: `${s.en} ticket office`,
    open: t.open,
    lastEntry: t.last,
    prices: { adult: t.adult, youth: t.youth ?? Math.round(t.adult * 0.7 / 100) * 100, child: t.child ?? Math.round(t.adult * 0.5 / 100) * 100, senior: t.senior ?? 0 },
    hanbokFree: t.hanbok,
    note: { en: t.note ?? 'Keep your ticket until you leave.' },
  };
  return id;
}

function registerMenu(id: string, place: [string, string], dishes: Dish[]) {
  const items: MenuItem[] = dishes.map(([ko, en, price, min, spicy], i) => ({ id: `d${i}`, ko, en, price, main: true, ...(min ? { min } : {}), ...(spicy ? { spicy } : {}), cat: 'main' }));
  items.push({ id: 'rice', ko: '공기밥', en: 'Bowl of rice', price: 1000, cat: 'side' }, { id: 'drink', ko: '음료수', en: 'Soft drink', price: 2000, cat: 'drink' });
  RESTAURANTS[id] = { id, ko: place[0], en: place[1], items, payAt: 'counter', selfBar: false };
  // a mild main dish is needed for the family test; guarantee one exists
  if (!items.some((i) => i.main && !i.spicy)) items[0] = { ...items[0], spicy: 0 };
  return id;
}

export function buildMission(def: MissionDef, sortOrder: number): Course {
  const hub = HUBS[def.hub];
  const exit = HUBS[def.exit ?? def.hub];
  const S = SEASON[def.season];
  const st = STAY[def.stay];
  const scenes: Scene[] = [];
  const perDay = Math.max(1, Math.ceil(def.stops.length / Math.max(1, def.days - 1)));
  const dayOf = (i: number) => def.stops[i].day ?? Math.min(def.days, 1 + Math.floor(i / perDay));
  const lastOfDay1 = Math.max(...def.stops.map((_, i) => i).filter((i) => dayOf(i) === 1));
  const meals = [def.food, def.food2, def.food3].filter(Boolean) as Meal[];
  const mealAt = (i: number) => meals.map((m, k) => ({ m, k })).filter(({ m, k }) => (m.after ? def.stops.findIndex((x) => x.key === m.after) : k) === i);
  const tl = (time: string | undefined, en: string, ko: string) => ({ en: time ? `${time} · ${en}` : en, ko: time ? `${time} · ${ko}` : ko });

  // 1 · arrival: transport · law · weather
  scenes.push({
    id: `${def.id}-1`, day: 1, bg: hub.bg,
    est: {
      start: '10:00',
      items: [
        hub.kind === 'port' ? est(45, 'task', 'Immigration at the ferry terminal', '여객터미널 입국심사') : est(50, 'task', 'Immigration, baggage claim & customs', '입국심사·수하물·세관'),
        est(HUB_TIME[def.hub][0], 'move', def.go, `${def.stops[0].ko}까지 이동`, HUB_TIME[def.hub][1]),
      ],
    },
    title: { en: `Arrive at ${hub.en.replace(' International', '')}`, ko: `${hub.ko} 도착` },
    location: { en: hub.en, ko: hub.ko },
    steps: [
      say(`${def.desc}`),
      talk('guide', pick([
        'Annyeong! Kachi here. Choices you make on this trip come back later – think ahead!',
        'Welcome! Let\'s explore like a local. Remember: small choices add up.',
        'Here we go! Read the signs, watch the locals – and ask me when unsure.',
      ], def.id), P('안녕하세요', 'An-nyeong-ha-se-yo', 'Hello')),
      hub.kind === 'port'
        ? ask('law', 'At the ferry terminal arrival hall, what do you need?', [ok('My passport and entry approval – same as at an airport', 'Yes. Ports are international borders too.', { manner: 3 }, 'passport'), no('Only my ferry ticket', 'The ticket isn\'t ID – immigration needs your passport.', { energy: -8 })], 'tr-ferry')
        : ask('law', 'Customs asks if you have fresh fruit or meat in your bag.', [ok('Declare it honestly – many fresh foods can\'t be brought in', 'Correct. Undeclared food can be fined.', { manner: 4 }, 'passport'), no('Say no and hope', 'The detector dog finds the sausage – fine!', { money: -100000 })], 'la-safety'),
      ask('transport', `How do you get to ${def.stops[0].en}?`, [ok(def.go, 'Good choice – easy and good value.', { money: -5000 }, 'subway-sign'), ...wrongGo(def.hub)], 'tr-transfer'),
      event('weather', S.ev[0], S.ev[1], undefined, S.prop),
      S.q(),
      ...(['seoul', 'incheon', 'gyeonggi'].includes(def.area) ? [learn('tr-subway')] : []),
    ],
  });

  // 2 · places
  def.stops.forEach((s, i) => {
    if (def.morning && i > 0 && dayOf(i) > 1 && dayOf(i - 1) === 1) {
      scenes.push({
        id: `${def.id}-m`, day: dayOf(i), bg: 'street',
        est: { start: '08:00', items: [est(40, 'meal', 'Breakfast', '아침 식사', 12000), est(20, 'task', 'Check-out', '체크아웃')] }, title: tl(def.morning.time, `Day ${dayOf(i)} morning`, `${dayOf(i)}일차 아침`), location: { en: `Your ${st.en}`, ko: st.ko },
        steps: [
          say(def.morning.text),
          ask('lodging', 'You check out, but want to explore before heading home. Your suitcase?', [ok('Ask the front desk to keep it, or use a station locker', 'Most hotels store luggage for free after check-out.', { energy: 5 }, 'hotel'), no('Drag it everywhere all day', 'Heavy and tiring – luggage storage is easy in Korea.', { energy: -10 })], 'lo-hotel'),
        ],
      });
    }
    const steps: Step[] = [];
    if (s.move) {
      if (s.move.text) steps.push(say(s.move.text));
      steps.push(simulate('taxi', 'transport', `Taxi to ${s.en}`, `Call a taxi in the app to ${s.en} – check the Korean address and the plate number.`, { dest: s.move.dest, addr: s.move.addr, fare: s.move.fare }, 'tr-taxi'));
    }
    if (s.bus) steps.push(simulate('bus', 'transport', `Bus to ${s.en}`, `Take city bus ${s.bus.no}: find it on the arrival board, tap in at the front, ring the bell and tap out at the back door.`, { busNo: s.bus.no, busColor: s.bus.color, stops: s.bus.stops, getOff: s.bus.stops[s.bus.stops.length - 1] }, 'tr-bus'));
    steps.push(say(s.text));
    if (s.tip) steps.push(talk('guide', s.tip));
    if (s.phrase) steps.push(talk('local', s.phrase[2], P(s.phrase[0], s.phrase[1], s.phrase[2])));
    if (s.ticket) steps.push(simulate('ticket', 'money', `${s.en} tickets`, `Buy tickets for your party at the ${s.en} ticket office${s.ticket.hanbok ? ' (you are all wearing hanbok today!)' : ''}, then scan in at the gate.`, { site: registerTicket(def, s), ...(s.ticket.hanbok ? { hanbok: true } : {}) }));
    const bank = BANK[s.kind];
    steps.push(pick(bank, `${def.id}|${s.key}`)());
    if (def.cat === 'culture' || def.cat === 'sightseeing') {
      const second = bank[(hash(`${def.id}|${s.key}`) + 1) % bank.length];
      if (bank.length > 1 && i % 2 === 1) steps.push(second());
    }
    if (s.kiosk) steps.push(simulate('kiosk', 'money', `Café kiosk at ${s.en}`, 'Coffee break! The café only has a Korean kiosk – order an iced americano and a croffle to take away.', { menu: 'cafe', order: [{ id: 'americano', qty: 1, temp: 'ice', size: 'R' }, { id: 'croffle', qty: 1 }], dineIn: false, english: false }));
    if (def.extra === 'crosswalk' && i === 0) steps.push(simulate('crosswalk', 'transport', 'Crossing the streets', 'Read the pedestrian lights and countdowns on the way – cross or wait?', {}, 'tr-walk'));
    if (def.extra === 'recycle' && i === def.stops.length - 1) steps.push(simulate('recycle', 'etiquette', 'Recycling station', 'Sort everything from your day out into the right bins.', { trash: ['pet', 'can', 'chicken-meat', 'bones', 'peel', 'tissue', 'bag', 'box'] }, 'et-trash'));
    if (def.extra === 'cashpay' && i === 1) steps.push(simulate('cashpay', 'money', 'Pay a cash-only stall', 'This little stall only takes cash. Pick the right notes and coins and check your change.', { shop: `${s.ko} 노점 Stall`, items: [{ name: '간식 Snack', price: 3000 }, { name: '음료 Drink', price: 2000 }], cashOnly: true }, 'mo-notes'));
    const items: EstItem[] = [];
    if (i > 0 && !s.bus && !s.move) {
      if (s.walk) items.push(est(s.walk, 'walk', `Walk to ${s.en}`, `${s.ko}까지 도보`));
      else items.push(est(s.ride ?? 20, 'move', `Subway / bus to ${s.en}`, `${s.ko}까지 지하철·버스`, 1500));
    }
    items.push(est(s.min ?? VISIT_MIN[s.kind], 'visit', s.en, s.ko));
    scenes.push({ id: `${def.id}-s${i + 1}`, day: dayOf(i), bg: s.bg ?? KIND_BG[s.kind], title: tl(s.time, s.en, s.ko), location: { en: s.en, ko: s.ko }, est: { items }, steps });

    // 3 · meals after this place
    for (const { m: f, k } of mealAt(i)) {
      if (k > 0) {
        scenes.push({
          id: `${def.id}-f${k + 1}`, day: dayOf(i), bg: 'restaurant', est: { items: [est(10, 'walk', 'Walk to the restaurant', '식당까지 도보')] }, title: tl(f.time, f.place[1], f.place[0]), location: { en: f.place[1], ko: f.place[0] },
          steps: [
            say(f.text),
            simulate('menu', 'food', `Order at ${f.place[1]}`, 'Another Korean-only menu – order for everyone (watch the 2-portion minimums and spicy marks).', { restaurant: registerMenu(`${def.id}-food${k + 1}`, f.place, f.dishes) }),
            ...(f.tip ? [talk('local', f.tip)] : []),
            k === 1
              ? ask('food', 'An older person at your table pours you a drink.', [ok('Hold the glass with two hands and turn slightly when drinking', 'Beautiful manners!', { manner: 6 }, 'soju'), no('Pour my own glass next time', 'In Korea you pour for each other, not yourself.', { manner: -4 })], 'fo-drink')
              : ask('food', 'You can\'t finish everything. What do you do?', [ok('Ask "포장해 주세요" – take-away boxes are normal', 'The staff pack it for you with a smile.', { energy: 3 }), no('Hide the leftovers under a napkin', 'No need – asking for a take-away box is perfectly normal.', { manner: -3 })], 'fo-manners'),
          ],
        });
        continue;
      }
      const fsteps: Step[] = [
        say(f.text),
        simulate('menu', 'food', `Order at ${f.place[1]}`, `The menu is in Korean. Order the right amount for your party, call the staff, enjoy free refills and pay the Korean way.`, { restaurant: registerMenu(`${def.id}-food`, f.place, f.dishes) }, 'fo-bell'),
      ];
      if (f.tip) fsteps.push(talk('local', f.tip));
      fsteps.push(pick([
        () => ask('food', 'Your meal comes with lots of small side dishes (banchan). They are…', [ok('Free and refillable – just ask', 'Yes! Ask "반찬 좀 더 주세요".', { energy: 6 }, 'baekban'), no('Charged per dish', 'No – banchan are free and refillable.', {})], 'fo-baekban'),
        () => ask('food', 'Where is the water?', [ok('Self-service – look for the water dispenser and cups (물은 셀프)', 'Right!', { manner: 3 }), no('Wait for the staff to bring a bottle', 'In most eateries water is self-service.', { energy: -3 })], 'fo-manners'),
        () => ask('food', 'How do you eat the rice and soup?', [ok('With a spoon – chopsticks for side dishes; the bowl stays on the table', 'Correct Korean style!', { manner: 4 }, 'chopsticks'), no('Stick the chopsticks upright in the rice', 'That resembles a funeral ritual – lay them down instead.', { manner: -6 })], 'fo-manners'),
      ], def.id + 'food')());
      scenes.push({ id: `${def.id}-f1`, day: dayOf(i), bg: 'restaurant', est: { items: [est(10, 'walk', 'Walk to the restaurant', '식당까지 도보')] }, title: tl(f.time, f.place[1], f.place[0]), location: { en: f.place[1], ko: f.place[0] }, steps: fsteps });
    }
    // 4 · lodging after the first day's places
    if (i === lastOfDay1 && def.nights > 0) {
      const lsteps: Step[] = [say(`Evening of day ${dayOf(i)}. You check into your ${st.en}.`)];
      if (st.checkin) lsteps.push(simulate('checkin', 'lodging', `${st.en[0].toUpperCase()}${st.en.slice(1)} self check-in`, 'Read the host\'s message, open the digital door lock, find your room and remember the house rules.', { code: String(1000 + (hash(def.id) % 9000)), room: `${2 + (hash(def.id) % 3)}0${1 + (hash(def.id + 'r') % 3)}`, checkout: '11:00' }));
      lsteps.push(st.q(), learn(st.card));
      scenes.push({ id: `${def.id}-l`, day: dayOf(i), est: { items: [est(20, 'move', `To your ${st.en}`, `${st.ko}까지 이동`, 1500), est(0, 'stay', `${st.en[0].toUpperCase()}${st.en.slice(1)}${STAY_COST[def.stay][1] ? ' (per person)' : ''}`, `${st.ko}${STAY_COST[def.stay][1] ? ' (1인)' : ''}`, STAY_COST[def.stay][0], STAY_COST[def.stay][1])] }, bg: def.stay === 'temple' ? 'temple' : def.stay === 'jjimjilbang' ? 'jjimjilbang' : def.stay === 'hanok' ? 'hanok' : def.stay === 'pension' ? 'pension' : 'street', title: { en: `Night at the ${st.en}`, ko: `${st.ko}에서 하룻밤` }, location: { en: st.en, ko: st.ko }, steps: lsteps });
    }
  });

  // 5 · health
  const h = HEALTH[def.health ?? pick(['heat', 'sprain', 'stomach', 'cold'] as const, def.id + 'h')];
  scenes.push({
    id: `${def.id}-h`, day: def.days, bg: 'pharmacy', est: { items: [est(10, 'walk', 'Walk to a pharmacy', '약국까지 도보')] }, title: { en: h.ev[0], ko: '건강 챙기기' }, location: { en: 'Nearby pharmacy', ko: '근처 약국' },
    steps: [
      event('health', h.ev[0], h.ev[1], { energy: h.energy }, 'medicine'),
      learn(pick(['cv-stores', 'cv-food', 'cv-howto', 'cv-unmanned'], def.id + 'cv')),
      simulate('pharmacy', 'medical', 'At the pharmacy', 'Find the 약 sign, explain what\'s wrong in Korean, pick the right medicine and read the label.', { symptom: h.sym }, 'me-pharmacy'),
      ask('medical', 'If it gets worse and you can\'t explain it in Korean?', [ok('Visit a clinic (의원) with my passport and call 1330 for free interpretation', 'Exactly – 1330 interprets 24/7.', { manner: 3 }, 'hotline'), no('Call 119 for a mild problem', '119 is for emergencies – a clinic and 1330 are the right help.', { manner: -4 })], 'me-1330'),
    ],
  });

  // 6 · departure
  const dsteps: Step[] = [say(`Day ${def.days}. Time to head back to ${exit.en}.`)];
  if (def.extra === 'locker') dsteps.push(simulate('locker', 'lodging', 'Station locker', 'Store your suitcase for a last walk: pick the size, pay, keep the PIN and collect it later.', { bag: 'carryon' }));
  if (def.extra === 'taxi') dsteps.push(simulate('taxi', 'transport', 'Taxi to the terminal', 'Call a taxi in the app – check the destination\'s Korean name and the plate number.', { dest: `${exit.ko} ${exit.en}`, addr: exit.ko, fare: 18000 }, 'tr-taxi'));
  if (def.extra === 'kiosk') dsteps.push(simulate('kiosk', 'money', 'Café kiosk before departure', 'One last iced americano and a croffle – the café only has a Korean kiosk.', { menu: 'cafe', order: [{ id: 'americano', qty: 1, temp: 'ice', size: 'R' }, { id: 'croffle', qty: 1 }], dineIn: false, english: false }));
  const hasTopic = (t: TopicId) => scenes.some((sc) => sc.steps.some((x) => (x.type === 'choice' || x.type === 'sim') && x.topic === t));
  if (!hasTopic('etiquette'))
    dsteps.push(ask('etiquette', 'On the subway escalator with your suitcase, what do you do?', [ok('Stand still, hold the rail, keep the suitcase in front of me', 'Safe for everyone.', { manner: 4 }, 'walk-right'), no('Run down with the suitcase bouncing', 'You nearly bump into someone – stand still and hold the rail.', { manner: -6 })], 'et-right'));
  dsteps.push(
    pick([
      () => ask('money', 'You have ₩35,000 in coins and notes left.', [ok('Spend the coins, keep notes for next time or exchange notes back', 'Coins usually can\'t be exchanged abroad.', { energy: 2 }, 'coins'), no('Try to exchange the coins at home', 'Most exchange offices abroad don\'t take coins.', {})], 'mo-fx'),
      () => ask('money', 'You bought souvenirs worth ₩80,000 at a Tax Free shop.', [ok('Use the refund kiosk at the airport/port before check-in', 'Money back!', { money: 5000 }, 'tax-refund'), no('Skip it – too complicated', 'You leave the refund on the table.', {})], 'mo-tax'),
    ], def.id + 'dep')(),
    talk('guide', pick([`What a trip – ${def.title[0]}! See you on the next mission.`, 'You travelled like a local. 다음에 또 봐요!', 'Mission complete – Korea is waiting for your next visit!'], def.id + 'bye'), P('또 올게요!', 'Tto ol-ge-yo!', 'I\'ll come again!')),
  );
  scenes.push({
    id: `${def.id}-z`, day: def.days, bg: exit.bg,
    est: { items: [est(HUB_TIME[def.exit ?? def.hub][0], 'move', `Back to ${exit.en}`, `${exit.ko}까지 이동`, HUB_TIME[def.exit ?? def.hub][1]), exit.kind === 'airport' ? est(150, 'task', 'Airport: tax refund, check-in, security', '공항: 택스리펀드·체크인·보안검색') : est(60, 'task', 'Ferry check-in & departure', '여객선 수속·출국')] }, title: tl(def.end, `Back to ${exit.en.replace(' International', '')}`, `${exit.ko} 귀국`), location: { en: exit.en, ko: exit.ko }, steps: dsteps });

  const [solo, couple, friends, group] = def.fit;
  return {
    id: def.id,
    categoryId: def.cat,
    area: def.area,
    title: { en: def.title[0], ko: def.title[1] },
    subtitle: { en: def.sub[0], ko: def.sub[1] },
    description: { en: def.desc },
    region: { en: AREA_NAME[def.area][0], ko: AREA_NAME[def.area][1] },
    entry: { kind: hub.kind, code: def.hub, name: { en: hub.en, ko: hub.ko } },
    exit: { kind: exit.kind, code: def.exit ?? def.hub, name: { en: exit.en, ko: exit.ko } },
    nights: def.nights,
    days: def.days,
    difficulty: def.diff,
    partyFit: { solo, couple, friends, group },
    partyTips: Object.fromEntries(Object.entries(def.tips ?? {}).map(([k, v]) => [k, { en: v }])),
    startBudget: def.budget,
    coverBg: def.stops[0].bg ?? KIND_BG[def.stops[0].kind],
    // all missions are currently free (included with the app); set access 'iap' + productId `pack_<area>` to sell them
    access: 'base',
    isPublished: true,
    version: def.version ?? 1,
    sortOrder,
    scenes,
  };
}

const AREA_NAME: Record<Area, [string, string]> = {
  seoul: ['Seoul', '서울'], gyeonggi: ['Gyeonggi-do', '경기도'], incheon: ['Incheon', '인천'], chungcheong: ['Chungcheong', '충청도'],
  gangwon: ['Gangwon', '강원도'], jeolla: ['Jeolla', '전라도'], gyeongsang: ['Gyeongsang', '경상도'], jeju: ['Jeju', '제주도'],
};

/** Used by the validator: topic ids every generated course covers by construction. */
export const GEN_TOPICS: TopicId[] = ['transport', 'lodging', 'food', 'money', 'etiquette', 'law', 'weather', 'medical'];
