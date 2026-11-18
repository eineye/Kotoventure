import type { AppConfig, Category, PartyType, Product, TopicId, L } from './types';

export const TOPICS: { id: TopicId; name: L; icon: string; color: string }[] = [
  { id: 'transport', name: { en: 'Transport', ko: '교통' }, icon: '🚇', color: '#2D6CDF' },
  { id: 'lodging', name: { en: 'Lodging', ko: '숙박' }, icon: '🏨', color: '#7A4FD6' },
  { id: 'food', name: { en: 'Food', ko: '음식' }, icon: '🍚', color: '#E8772E' },
  { id: 'money', name: { en: 'Money', ko: '돈' }, icon: '💴', color: '#1E9E6A' },
  { id: 'etiquette', name: { en: 'Etiquette', ko: '생활예절' }, icon: '🙇', color: '#D94A7A' },
  { id: 'law', name: { en: 'Law & Safety', ko: '법규' }, icon: '⚖️', color: '#4A5568' },
  { id: 'weather', name: { en: 'Weather', ko: '날씨' }, icon: '⛅', color: '#1FA2C7' },
  { id: 'medical', name: { en: 'Medical', ko: '의료' }, icon: '🏥', color: '#D63A3A' },
];

export const PARTY_TYPES: { id: PartyType; name: L; desc: L; size: string }[] = [
  { id: 'solo', name: { en: 'Solo', ko: '개인' }, desc: { en: 'Just me and my backpack', ko: '나 혼자 자유여행' }, size: '1' },
  { id: 'couple', name: { en: 'Couple', ko: '커플' }, desc: { en: 'Two of us, romantic mode', ko: '둘만의 여행' }, size: '2' },
  { id: 'friends', name: { en: 'Friends', ko: '2인 이상' }, desc: { en: '2–5 friends, max fun', ko: '친구들과 함께' }, size: '2-5' },
  { id: 'group', name: { en: 'Group / Family', ko: '단체·가족' }, desc: { en: '6+ people, family or tour group', ko: '가족·단체 여행' }, size: '6+' },
];

export const CATEGORIES: Category[] = [
  { id: 'sightseeing', name: { en: 'Sightseeing', ko: '관광' }, icon: '🏯', color: '#2D6CDF', sortOrder: 1, isActive: true },
  { id: 'food', name: { en: 'Food Trip', ko: '식도락' }, icon: '🍜', color: '#E8772E', sortOrder: 2, isActive: true },
  { id: 'culture', name: { en: 'Culture', ko: '문화' }, icon: '🏮', color: '#B83280', sortOrder: 3, isActive: true },
  { id: 'adventure', name: { en: 'Adventure', ko: '모험' }, icon: '🧗', color: '#2F855A', sortOrder: 4, isActive: true },
  { id: 'experience', name: { en: 'Experience', ko: '체험' }, icon: '🎤', color: '#6B46C1', sortOrder: 5, isActive: true },
];

export const PRODUCTS: Product[] = [
  {
    id: 'app_base',
    type: 'paid_app',
    title: { en: 'Kotoventure (paid app, $0.99)', ko: 'Kotoventure 앱 구매 ($0.99)' },
    priceUsd: 0.99,
    iosProductId: '(paid app – set price in App Store Connect)',
    androidProductId: '(paid app – set price in Play Console)',
    courseIds: ['seoul-classic', 'busan-food', 'gyeongju-heritage', 'jeju-adventure', 'kculture-experience'],
    isActive: true,
  },
  {
    id: 'pack_dmz_east',
    type: 'course_pack',
    title: { en: 'Mission Pack: DMZ & East Coast (coming soon)', ko: '미션팩: DMZ & 동해안 (예정)' },
    priceUsd: 1.99,
    iosProductId: 'com.kotoventure.pack.dmzeast',
    androidProductId: 'pack_dmz_east',
    courseIds: [],
    isActive: false,
  },
];

export const DEFAULT_CONFIG: AppConfig = {
  // Reference values only – the admin should update these. Players are always told to check a live rate.
  fxRates: { USD: 1400, AUD: 910, EUR: 1520, GBP: 1800, JPY: 9.3, CNY: 195 },
  fxUpdatedAt: '2026-11-01',
  emergencyNumbers: [
    { label: { en: 'Police', ko: '경찰' }, number: '112' },
    { label: { en: 'Fire / Ambulance', ko: '화재·구급' }, number: '119' },
    { label: { en: 'Travel hotline (24h, multilingual)', ko: '관광통역안내' }, number: '1330' },
    { label: { en: 'Immigration info', ko: '외국인종합안내' }, number: '1345' },
  ],
  notice: { en: 'Welcome to Korea! Tap a mission to start your trip.', ko: '한국에 오신 것을 환영합니다!' },
  minAppVersion: '1.0.0',
};
