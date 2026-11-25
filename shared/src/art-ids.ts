/**
 * Registry of 2D illustration ids implemented by the app (app/src/art).
 * The admin uses these lists for dropdowns; the validator warns about unknown ids.
 */
export const PROP_IDS = [
  // money
  'krw-1000', 'krw-5000', 'krw-10000', 'krw-50000', 'krw-notes', 'coins', 'atm', 'exchange', 'exchange-rate', 'phone-pay', 'tax-refund', 'kiosk',
  // transport
  'tmoney', 'arex', 'subway-sign', 'bus', 'taxi', 'ktx', 'bike', 'ferry', 'crosswalk', 'idp', 'passport',
  // lodging
  'hotel', 'house', 'motel', 'jjimjilbang', 'hanok', 'temple', 'pension',
  // food
  'call-bell', 'bibimbap', 'chicken', 'baekban', 'tang', 'jjigae', 'gukbap', 'bbq', 'hotteok', 'soju', 'chopsticks', 'kimchi',
  // etiquette
  'walk-right', 'queue', 'quiet', 'priority-seat', 'trash-bins', 'shoes-off', 'two-hands', 'camera', 'hanbok',
  // law
  'police', 'no-smoking', 'no-drugs', 'drone', 'alert-phone',
  // weather
  'seasons', 'spring', 'summer', 'autumn', 'winter', 'heatwave', 'typhoon', 'umbrella', 'fine-dust',
  // medical
  'pharmacy', 'hospital', 'hanuiwon', 'er', 'convenience', 'medicine', 'insurance', 'hotline', 'firstaid',
] as const;

export const BACKGROUND_IDS = [
  'airport', 'port', 'subway', 'street', 'restaurant', 'noraebang', 'pharmacy', 'hospital', 'palace', 'hanok',
  'cafe', 'tower', 'river', 'market', 'village', 'beach', 'night-beach', 'jjimjilbang', 'tombs', 'temple',
  'mountain', 'volcano', 'coast', 'storm', 'pension', 'stage', 'kitchen', 'shop', 'dmz', 'songdo', 'ulsanbawi', 'geomun', 'nogodan', 'igidae', 'bukchon', 'hanbike', 'railbike', 'paraglide', 'mudflat', 'bukhansan', 'pocha', 'towernight', 'templestay', 'citywall', 'kpop', 'lotteworld', 'hanbokroom', 'mangwon', 'kbeauty', 'museum', 'hallyeo', 'haenyeo', 'jejufood', 'haeinsa', 'hahoe',
] as const;

export type PropId = (typeof PROP_IDS)[number];
export type BackgroundId = (typeof BACKGROUND_IDS)[number];
