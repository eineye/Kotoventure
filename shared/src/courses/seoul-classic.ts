import type { Course } from '../types';
import { ask, event, learn, no, ok, P, say, simulate, talk } from '../dsl';

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
    en: 'Fly in from Australia and survive your first Seoul trip: get out of Incheon Airport, eat and sing in Myeongdong, deal with a sudden "che-haet-da" indigestion, wear hanbok at Gyeongbokgung, hop the trendy cafés of Seongsu and fly home with a tax refund.',
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
  version: 1,
  sortOrder: 1,
  scenes: [
    {
      id: 'sc-1', day: 1, bg: 'airport',
      title: { en: 'Escape Incheon Airport', ko: '인천공항 빠져나가기' },
      location: { en: 'Incheon Airport T1', ko: '인천공항 제1터미널' },
      steps: [
        say('After a 10-hour overnight flight from Sydney you land at Incheon International Airport. Signs are in Korean, English, Chinese and Japanese.'),
        talk('guide', 'Annyeong! I\'m Kachi the magpie – magpies bring good news in Korea. I\'ll guide your trip!', P('안녕하세요', 'An-nyeong-ha-se-yo', 'Hello')),
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
        say('At Seoul Station you must transfer from AREX to Subway Line 4 (sky-blue) towards Dangogae.'),
        ask('transport', 'How do you find the right platform?', [
          ok('Follow the light-blue "4" signs and the direction (next station)', 'Yes! Every line has a colour and a number. Station numbers like 424 help too.', { manner: 3 }, 'subway-sign'),
          no('Ask everyone loudly in English', 'People may help, but the signs are faster – and quieter.', { manner: -3 }),
        ], 'tr-transfer'),
        say('The train arrives. People are lined up at the sides of the doors.'),
        ask('etiquette', 'The doors open. What do you do?', [
          ok('Stand aside and let passengers get off first', 'Correct. Then board quickly and move inside.', { manner: 5 }, 'queue'),
          no('Rush in first to get a seat', 'You blocked people getting off – everyone stares at you.', { manner: -8 }),
        ], 'et-queue'),
        ask('etiquette', 'The only empty seats are pink with a pregnant-woman sign, and two at the end of the car for elders. You are tired…', [
          ok('Stay standing and hold the strap', 'Respect! Pink seats are left empty for pregnant women.', { manner: 6, energy: -3 }, 'priority-seat'),
          no('Sit in the pink seat – nobody is pregnant now', 'Koreans leave it empty in case someone needs it. You get some looks.', { manner: -6 }),
        ], 'et-seats'),
        learn('et-quiet'),
      ],
    },
    {
      id: 'sc-3', day: 1, bg: 'street',
      title: { en: 'Myeongdong check-in & street food', ko: '명동 체크인 & 길거리 음식' },
      location: { en: 'Myeongdong', ko: '명동' },
      steps: [
        say('It\'s 11:00. Your hotel check-in is at 15:00.', { parties: ['solo', 'couple', 'group'] }),
        say('It\'s 11:00. Your hotel check-in is at 15:00 – and four friends\' worth of suitcases is a lot to drag around.', { parties: ['friends'] }),
        ask('lodging', 'What do you do with your luggage?', [
          ok('Ask the front desk to keep it until check-in', 'Almost every hotel does this for free.', { energy: 5 }, 'hotel'),
          no('Drag it around Myeongdong for four hours', 'Your arms hate you. And the streets are crowded.', { energy: -15 }),
        ], 'lo-hotel'),
        talk('staff', 'Of course. Here is your tag. Your room will be ready at 3 pm.', P('짐 좀 맡길 수 있을까요?', 'Jim jom mat-gil su i-sseul-kka-yo?', 'Can I leave my luggage?')),
        say('You charge your phone – wait, your Australian plug doesn\'t fit! Korean sockets are 220 V with two round pins. You borrow an adapter from the front desk.'),
        say('Myeongdong\'s street food stalls open in the afternoon: tteokbokki, egg bread, grilled cheese lobster, hotteok…'),
        ask('money', 'You want to pay for a ₩5,000 tteokbokki cup with cash. Which note is ₩5,000?', [
          ok('The red-orange note with Yi I', 'Correct!', { manner: 2 }, 'krw-5000'),
          no('The yellow note with Shin Saimdang', 'That\'s ₩50,000 – ten times more! The colours look similar, always check the number.', { money: -45000 }, 'krw-50000'),
          no('The green note with King Sejong', 'That\'s ₩10,000. The vendor gives you change, no harm done.', {}, 'krw-10000'),
        ], 'mo-notes'),
        learn('fo-street'),
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
        ask('food', 'You want to order. How do you call the staff?', [
          ok('Press the call bell (or raise a hand and say "Jeogiyo!")', 'Exactly. In Korea calling the staff like this is totally normal.', { manner: 3 }, 'call-bell'),
          no('Wait silently until they come', 'You wait… and wait. Staff won\'t come unless you call.', { energy: -5 }),
          no('Whistle', 'Very rude in Korea. Ouch.', { manner: -10 }),
        ], 'fo-bell'),
        ask('food', 'The meat is grilling. How do you eat it the Korean way?', [
          ok('Wrap meat, garlic and ssamjang in a lettuce leaf and eat it in one bite', 'Delicious! That\'s "ssam".', { energy: 10 }, 'bbq'),
          no('Cut the lettuce with the scissors and use a fork', 'The scissors are for the meat. There is no fork.', { energy: 5 }),
        ], 'fo-bbq'),
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
        ask('transport', 'It\'s 00:30. The subway has stopped. How do you get back?', [
          ok('Call a taxi with Kakao T or Uber and show the hotel address', 'Easy. Note the late-night surcharge on the meter.', { money: -12000 }, 'taxi'),
          no('Wait for the first subway at 05:30', 'You fall asleep on a bench. Not fun.', { energy: -25 }),
        ], 'tr-taxi'),
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
        ask('medical', 'Which sign means PHARMACY?', [
          ok('A big "약" sign', 'Correct – 약 (yak) means medicine.', { manner: 2 }, 'pharmacy'),
          no('"병원"', 'That means hospital.', {}, 'hospital'),
          no('"한의원"', 'That\'s a Korean medicine clinic.', {}, 'hanuiwon'),
        ], 'me-pharmacy'),
        talk('pharmacist', 'You ate too fast? Take this digestive and drink warm water. If you get a fever, go to a clinic.', P('소화제 주세요', 'So-hwa-je ju-se-yo', 'Digestive medicine, please')),
        ask('medical', 'By noon your stomach hurts more and you have a slight fever. Where do you go?', [
          ok('A nearby internal-medicine clinic (내과 의원) with my passport', 'Short wait, a doctor, a prescription. You pay around ₩20,000–40,000 without Korean insurance.', { energy: 20, money: -35000 }, 'hospital'),
          ok('A Korean medicine clinic (한의원) for acupuncture', 'Many Koreans swear by acupuncture for "che". It\'s a licensed medical clinic.', { energy: 15, money: -30000 }, 'hanuiwon'),
          no('Call 119 for an ambulance', '119 is for emergencies. You can walk – choose a clinic.', { manner: -5 }),
        ], 'me-clinic'),
        learn('me-hanui'),
        ask('medical', 'You paid the clinic. What do you keep for your travel insurance claim?', [
          ok('The receipt and ask for a medical certificate (진단서) in English', 'Exactly. Tourists aren\'t covered by Korean health insurance – your travel insurance will be.', { money: 30000 }, 'insurance'),
          no('Nothing, it was cheap', 'You can\'t claim anything now.', {}),
        ], 'me-insurance'),
        learn('me-1330'),
      ],
    },
    {
      id: 'sc-7', day: 4, bg: 'palace',
      title: { en: 'Gyeongbokgung Palace in hanbok', ko: '경복궁 한복 체험' },
      location: { en: 'Gyeongbokgung, Jongno', ko: '경복궁, 종로' },
      steps: [
        say('Feeling better! Day 4: Gyeongbokgung, the main royal palace of the Joseon dynasty (built 1395). In front of you stands Gwanghwamun Gate.'),
        ask('money', 'You rented a hanbok nearby. What\'s the advantage at the palace?', [
          ok('Free admission for visitors wearing hanbok', 'Yes! Adults normally pay about ₩3,000.', { money: 3000 }, 'hanbok'),
          no('You can enter closed areas', 'No – closed areas stay closed for everyone.', {}),
        ]),
        say('You and your partner rented matching hanbok – the photo spots around Gyeonghoeru Pavilion are perfect.', { parties: ['couple'] }),
        event('surprise', 'Changing of the Royal Guard', 'At 10:00 the royal guards in colourful uniforms perform the changing ceremony with drums at Gwanghwamun.'),
        event('weather', 'Heatwave alert', 'Your phone buzzes loudly: a heatwave alert. It\'s 34 °C and climbing – summers have been getting hotter in recent years.', { energy: -10 }, 'heatwave'),
        ask('weather', 'How do you continue your palace visit?', [
          ok('Drink water, rest in shade or a heat shelter, and visit indoor halls at noon', 'Sensible. Heatstroke is a real risk in recent Korean summers.', { energy: 10 }, 'heatwave'),
          no('Keep walking in full sun in your hanbok', 'You feel dizzy – heat exhaustion!', { energy: -20 }),
        ], 'we-heat'),
        learn('we-alert'),
        learn('me-firstaid'),
        ask('etiquette', 'A guard in costume is standing still. You want a photo.', [
          ok('Take a photo from a respectful distance without touching', 'Correct. Don\'t touch or block the guards.', { manner: 4 }, 'camera'),
          no('Put your arm around him and tug his beard', 'Not cool. He\'s working.', { manner: -10 }),
        ], 'et-photo'),
        say('Tip: Gyeongbokgung is closed on Tuesdays. Plan around it!'),
      ],
    },
    {
      id: 'sc-8', day: 4, bg: 'hanok',
      title: { en: 'Bukchon Hanok Village', ko: '북촌 한옥마을' },
      location: { en: 'Bukchon, Jongno', ko: '북촌, 종로' },
      steps: [
        say('A 10-minute walk east brings you to Bukchon, alleys of 600-year-old-style hanok houses – where real people still live.'),
        ask('law', 'It\'s 18:30 and you want photos in the famous alley. A sign shows visiting hours. What do you do?', [
          ok('Respect the hours and come back in the daytime', 'Right. Parts of Bukchon restrict tourist visits in the evening and fines can apply.', { manner: 8 }, 'quiet'),
          no('Sneak in anyway, it\'s only a photo', 'A guide stops you. Outside permitted hours you can be fined.', { manner: -8, money: -50000 }),
        ], 'la-bukchon'),
        ask('etiquette', 'A resident\'s gate is open with a beautiful courtyard inside.', [
          ok('Admire it from the street, whisper, move on', 'Perfect. It\'s someone\'s home.', { manner: 6 }),
          no('Step inside for a quick look', 'Trespassing on private property. The owner is upset.', { manner: -12 }),
        ], 'et-quiet'),
        learn('lo-hanok'),
      ],
    },
    {
      id: 'sc-9', day: 5, bg: 'cafe',
      title: { en: 'Seongsu-dong cafés & pop-ups', ko: '성수동 카페 & 팝업' },
      location: { en: 'Seongsu-dong', ko: '성수동' },
      steps: [
        say('Day 5. Seongsu-dong – old factories turned into cafés, galleries and brand pop-up stores. Take Line 2 (green) to Seongsu Station.'),
        say('Your fine-dust app shows "bad" (나쁨) air quality today.', undefined),
        ask('weather', 'The fine-dust index is "bad". What\'s the best move?', [
          ok('Wear a KF94 mask from the convenience store and stay indoors more', 'Good choice. Spring often has fine dust and yellow-dust days.', { energy: 5, money: -2000 }, 'fine-dust'),
          no('Ignore it and run along the river', 'Your throat is scratchy for the rest of the day.', { energy: -10 }),
        ], 'we-dust'),
        say('At a famous pop-up there\'s a long line and a tablet at the entrance.'),
        ask('etiquette', 'How do you get in?', [
          ok('Register on the waiting tablet (or app) and wait your turn', 'Yes. Queueing is sacred in Korea.', { manner: 5 }, 'queue'),
          no('Squeeze in next to a friend in the middle of the line', 'Line-cutting is a big no. People call staff.', { manner: -10 }),
        ]),
        ask('money', 'The café sign says "Card only / No cash". You only have coins and notes.', [
          ok('Pay with my foreign Visa/Mastercard', 'Cards work almost everywhere, even for one coffee.', { money: -6000 }, 'phone-pay'),
          no('Insist on paying cash', 'They can\'t accept it – more and more places are cashless.', { energy: -5 }),
        ], 'mo-coins'),
        ask('etiquette', 'You finished your iced latte. At the return station there are separate bins.', [
          ok('Pour leftover ice/liquid in the sink, put the cup and straw in recycling', 'Exactly how Koreans do it.', { manner: 6 }, 'trash-bins'),
          no('Throw the full cup into general waste', 'The staff sigh – liquids in bins make a mess.', { manner: -6 }),
        ], 'et-trash'),
        learn('mo-fx'),
      ],
    },
    {
      id: 'sc-10', day: 5, bg: 'tower',
      title: { en: 'N Seoul Tower at sunset', ko: '남산 N서울타워' },
      location: { en: 'Namsan', ko: '남산' },
      steps: [
        say('Late afternoon. You take the yellow Namsan circular bus to N Seoul Tower, on top of Namsan mountain.'),
        ask('transport', 'Getting off the bus, what must you not forget?', [
          ok('Tap my card again at the back door', 'Right – otherwise you lose the free transfer later.', { money: 1500 }, 'tmoney'),
          no('Nothing, I already paid when I got on', 'You lose the transfer discount on your next ride.', { money: -1500 }),
        ], 'tr-bus'),
        say('Couples attach "love locks" to the fence at the top. You write both names on a lock.', { parties: ['couple'] }),
        event('weather', 'Sudden downpour!', 'Out of nowhere, a violent rain shower hits. Short, intense downpours have become more frequent in Korean summers.', { energy: -8 }, 'typhoon'),
        ask('weather', 'Water is gushing down the steps. What do you do?', [
          ok('Wait inside the tower building until it passes; avoid underpasses on the way down', 'Smart. Flash flooding in underpasses is a real danger during cloudbursts.', { energy: 5 }, 'umbrella'),
          no('Run down the hill through the flooded underpass', 'Dangerous! Water rises fast in underpasses.', { energy: -15 }),
        ], 'we-rain'),
        say('The rain stops. The city lights turn on below – 10 million people, the Han River glittering. Worth it.'),
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
        ask('transport', 'The pedestrian light is red but the road looks empty.', [
          ok('Wait for the green walker and watch for delivery motorbikes', 'Good. Bikes and right-turning cars can appear suddenly.', { manner: 4 }, 'crosswalk'),
          no('Jaywalk across', 'A scooter nearly hits you – and jaywalking can be fined.', { energy: -10, money: -20000 }),
        ], 'tr-walk'),
        learn('la-traffic'),
      ],
    },
    {
      id: 'sc-12', day: 7, bg: 'airport',
      title: { en: 'Back to Incheon & fly home', ko: '인천공항 & 귀국' },
      location: { en: 'Incheon Airport T1', ko: '인천공항 제1터미널' },
      steps: [
        say('Day 7. Time to fly back to Australia. Your suitcase is heavier – cosmetics and snacks!'),
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
