/**
 * Runtime translation for languages beyond English/Korean (ja, zh, es).
 * Content keeps English as the source; every English sentence is looked up in a per-language dictionary.
 * Numbers are placeholders (#), so "3 people" and "5 people" share one entry. Sentences built from
 * generator templates ("Order at X") are matched by patterns and their parts translated recursively.
 */
import { DICT as JA } from './dict/ja';
import { DICT as ZH } from './dict/zh';
import { DICT as ES } from './dict/es';

export type Lang = 'en' | 'ko' | 'ja' | 'zh' | 'es';
/** languages translated through the dictionaries (en and ko are written in the content itself) */
export const DICT_LANGS = ['ja', 'zh', 'es'] as const;
export type DictLang = (typeof DICT_LANGS)[number];
const DICTS: Record<DictLang, Record<string, string>> = { ja: JA, zh: ZH, es: ES };

export const fnv = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
};
/** numbers (with ₩, thousands separators, decimals, clock times) become # */
export const NUM_RE = /₩?\d[\d,.:]*\d|₩?\d/g;
export const normalise = (s: string) => s.replace(NUM_RE, '#');

type Tpl = [RegExp, (m: RegExpMatchArray, t: (s: string) => string) => string];
/** sentences assembled by the mission generator */
export const TEMPLATES: Record<DictLang, Tpl[]> = {
  ja: [
    [/^Order at (.+)$/, (m, t) => `${t(m[1])}で注文する`],
    [/^How do you get to (.+)\?$/, (m, t) => `${t(m[1])}へはどう行きますか？`],
    [/^Taxi to (.+)$/, (m, t) => `${t(m[1])}までタクシー`],
    [/^Bus to (.+)$/, (m, t) => `${t(m[1])}までバス`],
    [/^(.+) tickets$/, (m, t) => `${t(m[1])}の入場券`],
    [/^(.+) ticket office$/, (m, t) => `${t(m[1])}のチケット売り場`],
    [/^Café kiosk at (.+)$/, (m, t) => `${t(m[1])}のカフェのキオスク`],
    [/^Walk to (.+)$/, (m, t) => `${t(m[1])}まで徒歩`],
    [/^Subway \/ bus to (.+)$/, (m, t) => `${t(m[1])}まで地下鉄・バス`],
    [/^Back to (.+)$/, (m, t) => `${t(m[1])}へ戻る`],
    [/^Arrive at (.+)$/, (m, t) => `${t(m[1])}に到着`],
    [/^To your (.+)$/, (m, t) => `${t(m[1])}へ移動`],
    [/^Your (.+)$/, (m, t) => `あなたの${t(m[1])}`],
    [/^Night at the (.+)$/, (m, t) => `${t(m[1])}で一泊`],
    [/^Night (\d+) at the (.+)$/, (m, t) => `${t(m[2])}で${m[1]}泊目`],
    [/^(.+) self check-in$/, (m, t) => `${t(m[1])}のセルフチェックイン`],
    [/^(.+) \(per person\)$/, (m, t) => `${t(m[1])}（1人）`],
    [/^Day (\d+) morning$/, (m) => `${m[1]}日目の朝`],
    [/^(\d\d:\d\d) · (.+)$/, (m, t) => `${m[1]} · ${t(m[2])}`],
    [/^Evening of day (\d+)\. You check into your (.+)\.$/, (m, t) => `${m[1]}日目の夜。${t(m[2])}にチェックインします。`],
    [/^Day (\d+)\. Time to head back to (.+)\.$/, (m, t) => `${m[1]}日目。${t(m[2])}へ戻る時間です。`],
    [/^What a trip – (.+)! See you on the next mission\.$/, (m, t) => `最高の旅でした – ${t(m[1])}！次のミッションで会いましょう。`],
    [/^Call a taxi in the app to (.+) – check the Korean address and the plate number\.$/, (m, t) => `アプリで${t(m[1])}までタクシーを呼びましょう。韓国語の住所とナンバーを確認します。`],
    [/^Take city bus (\S+): find it on the arrival board, tap in at the front, ring the bell and tap out at the back door\.$/, (m) => `市内バス${m[1]}番に乗ります。到着案内板で探し、前のドアから乗ってタッチし、降車ボタンを押して後ろのドアでタッチして降ります。`],
    [/^Buy tickets for your party at the (.+) ticket office( \(you are all wearing hanbok today!\))?, then scan in at the gate\.$/, (m, t) => `${t(m[1])}のチケット売り場でグループ全員のチケットを買い${m[2] ? '（今日は全員韓服姿です！）' : ''}、入口でチケットをスキャンして入ります。`],
    [/^Your own itinerary: (.+)\.$/, (m, t) => `自分で作った日程：${m[1].split(' → ').map(t).join(' → ')}。`],
    [/^My (.+) trip$/, (m, t) => `わたしの${t(m[1])}旅行`],
    [/^(\d+) nights? \/ (\d+) days? · (\d+) places$/, (m) => `${m[1]}泊${m[2]}日 · ${m[3]}か所`],
  ],
  zh: [
    [/^Order at (.+)$/, (m, t) => `在${t(m[1])}点餐`],
    [/^How do you get to (.+)\?$/, (m, t) => `怎么去${t(m[1])}？`],
    [/^Taxi to (.+)$/, (m, t) => `打车去${t(m[1])}`],
    [/^Bus to (.+)$/, (m, t) => `坐公交去${t(m[1])}`],
    [/^(.+) tickets$/, (m, t) => `${t(m[1])}门票`],
    [/^(.+) ticket office$/, (m, t) => `${t(m[1])}售票处`],
    [/^Café kiosk at (.+)$/, (m, t) => `${t(m[1])}的咖啡店自助点餐机`],
    [/^Walk to (.+)$/, (m, t) => `步行到${t(m[1])}`],
    [/^Subway \/ bus to (.+)$/, (m, t) => `坐地铁·公交去${t(m[1])}`],
    [/^Back to (.+)$/, (m, t) => `返回${t(m[1])}`],
    [/^Arrive at (.+)$/, (m, t) => `抵达${t(m[1])}`],
    [/^To your (.+)$/, (m, t) => `前往${t(m[1])}`],
    [/^Your (.+)$/, (m, t) => `你的${t(m[1])}`],
    [/^Night at the (.+)$/, (m, t) => `在${t(m[1])}住一晚`],
    [/^Night (\d+) at the (.+)$/, (m, t) => `在${t(m[2])}的第${m[1]}晚`],
    [/^(.+) self check-in$/, (m, t) => `${t(m[1])}自助入住`],
    [/^(.+) \(per person\)$/, (m, t) => `${t(m[1])}（每人）`],
    [/^Day (\d+) morning$/, (m) => `第${m[1]}天早上`],
    [/^(\d\d:\d\d) · (.+)$/, (m, t) => `${m[1]} · ${t(m[2])}`],
    [/^Evening of day (\d+)\. You check into your (.+)\.$/, (m, t) => `第${m[1]}天晚上。你入住${t(m[2])}。`],
    [/^Day (\d+)\. Time to head back to (.+)\.$/, (m, t) => `第${m[1]}天。该返回${t(m[2])}了。`],
    [/^What a trip – (.+)! See you on the next mission\.$/, (m, t) => `多么棒的旅行——${t(m[1])}！下个任务再见。`],
    [/^Call a taxi in the app to (.+) – check the Korean address and the plate number\.$/, (m, t) => `用App叫车去${t(m[1])}——确认韩文地址和车牌号。`],
    [/^Take city bus (\S+): find it on the arrival board, tap in at the front, ring the bell and tap out at the back door\.$/, (m) => `乘坐${m[1]}路市内公交：在到站信息屏上找到它，从前门上车刷卡，按下车铃，从后门刷卡下车。`],
    [/^Buy tickets for your party at the (.+) ticket office( \(you are all wearing hanbok today!\))?, then scan in at the gate\.$/, (m, t) => `在${t(m[1])}售票处为同行的人买票${m[2] ? '（今天大家都穿着韩服！）' : ''}，然后在入口扫票入场。`],
    [/^Your own itinerary: (.+)\.$/, (m, t) => `我的行程：${m[1].split(' → ').map(t).join(' → ')}。`],
    [/^My (.+) trip$/, (m, t) => `我的${t(m[1])}之旅`],
    [/^(\d+) nights? \/ (\d+) days? · (\d+) places$/, (m) => `${m[2]}天${m[1]}晚 · ${m[3]}个地点`],
  ],
  es: [
    [/^Order at (.+)$/, (m, t) => `Pedir en ${t(m[1])}`],
    [/^How do you get to (.+)\?$/, (m, t) => `¿Cómo llegas a ${t(m[1])}?`],
    [/^Taxi to (.+)$/, (m, t) => `Taxi a ${t(m[1])}`],
    [/^Bus to (.+)$/, (m, t) => `Autobús a ${t(m[1])}`],
    [/^(.+) tickets$/, (m, t) => `Entradas: ${t(m[1])}`],
    [/^(.+) ticket office$/, (m, t) => `Taquilla de ${t(m[1])}`],
    [/^Café kiosk at (.+)$/, (m, t) => `Quiosco de la cafetería en ${t(m[1])}`],
    [/^Walk to (.+)$/, (m, t) => `A pie hasta ${t(m[1])}`],
    [/^Subway \/ bus to (.+)$/, (m, t) => `Metro / autobús hasta ${t(m[1])}`],
    [/^Back to (.+)$/, (m, t) => `De vuelta a ${t(m[1])}`],
    [/^Arrive at (.+)$/, (m, t) => `Llegada a ${t(m[1])}`],
    [/^To your (.+)$/, (m, t) => `Hacia tu ${t(m[1])}`],
    [/^Your (.+)$/, (m, t) => `Tu ${t(m[1])}`],
    [/^Night at the (.+)$/, (m, t) => `Noche en ${t(m[1])}`],
    [/^Night (\d+) at the (.+)$/, (m, t) => `Noche ${m[1]} en ${t(m[2])}`],
    [/^(.+) self check-in$/, (m, t) => `Autocheck-in: ${t(m[1])}`],
    [/^(.+) \(per person\)$/, (m, t) => `${t(m[1])} (por persona)`],
    [/^Day (\d+) morning$/, (m) => `Mañana del día ${m[1]}`],
    [/^(\d\d:\d\d) · (.+)$/, (m, t) => `${m[1]} · ${t(m[2])}`],
    [/^Evening of day (\d+)\. You check into your (.+)\.$/, (m, t) => `Tarde del día ${m[1]}. Haces el check-in en tu ${t(m[2])}.`],
    [/^Day (\d+)\. Time to head back to (.+)\.$/, (m, t) => `Día ${m[1]}. Hora de volver a ${t(m[2])}.`],
    [/^What a trip – (.+)! See you on the next mission\.$/, (m, t) => `¡Qué viaje – ${t(m[1])}! Nos vemos en la próxima misión.`],
    [/^Call a taxi in the app to (.+) – check the Korean address and the plate number\.$/, (m, t) => `Pide un taxi con la app a ${t(m[1])}: comprueba la dirección en coreano y la matrícula.`],
    [/^Take city bus (\S+): find it on the arrival board, tap in at the front, ring the bell and tap out at the back door\.$/, (m) => `Toma el autobús urbano ${m[1]}: búscalo en el panel de llegadas, valida la tarjeta al subir por delante, pulsa el timbre y vuelve a validar al bajar por la puerta trasera.`],
    [/^Buy tickets for your party at the (.+) ticket office( \(you are all wearing hanbok today!\))?, then scan in at the gate\.$/, (m, t) => `Compra las entradas de tu grupo en la taquilla de ${t(m[1])}${m[2] ? ' (¡hoy todos lleváis hanbok!)' : ''} y escanéalas en la entrada.`],
    [/^Your own itinerary: (.+)\.$/, (m, t) => `Tu propio itinerario: ${m[1].split(' → ').map(t).join(' → ')}.`],
    [/^My (.+) trip$/, (m, t) => `Mi viaje a ${t(m[1])}`],
    [/^(\d+) nights? \/ (\d+) days? · (\d+) places$/, (m) => `${m[1]} noches / ${m[2]} días · ${m[3]} lugares`],
  ],
};

const caches: Record<string, Map<string, string>> = {};
/** strings that had no translation (dev tooling reads this to find gaps) */
export const MISSING: Record<string, Set<string>> = { ja: new Set(), zh: new Set(), es: new Set() };

const found: Record<string, Map<string, string | undefined>> = {};
function lookupCached(s: string, lang: DictLang): string | undefined {
  const m = (found[lang] ??= new Map());
  if (!m.has(s)) m.set(s, lookup(s, lang));
  return m.get(s);
}

function lookup(s: string, lang: DictLang): string | undefined {
  const d = DICTS[lang];
  const exact = d['=' + fnv(s)];
  if (exact !== undefined) return exact;
  const nums = s.match(NUM_RE) ?? [];
  const hit = d[fnv(normalise(s))];
  if (hit !== undefined) {
    let i = 0;
    return hit.replace(/#/g, () => nums[i++] ?? '#');
  }
  // a template applies only when all its parts translate (never half-translated sentences)
  for (const [re, f] of TEMPLATES[lang]) {
    const m = s.match(re);
    if (!m) continue;
    let ok = true;
    const out = f(m, (x) => {
      const t = x.trim();
      // names may stay the same in a language (Spanish keeps romanised names) – what matters is that we know them
      const r = /^[\d:]+$/.test(t) ? t : lookupCached(t, lang);
      if (r === undefined) {
        ok = false;
        return x;
      }
      return r;
    });
    if (ok) return out;
  }
  // a leading icon/symbol (emoji, ✈, 📍…) or a trailing count: translate the words only
  const pre = s.match(/^([^\p{L}\p{N}"'(¿¡]+?)\s*([\p{L}\p{N}"'(¿¡].*)$/u);
  if (pre && pre[1]) {
    const r = lookupCached(pre[2], lang);
    if (r !== undefined) return `${pre[1]} ${r}`;
  }
  const cnt = s.match(/^(\p{L}.*?)\s+(\d+)$/u);
  if (cnt) {
    const r = lookupCached(cnt[1], lang);
    if (r !== undefined) return `${r} ${cnt[2]}`;
  }
  // several sentences joined together: translate each one
  const parts = s.split(/(?<=[.!?])\s+(?=[A-Z"🌶])/);
  if (parts.length > 1) {
    const tr = parts.map((x) => lookupCached(x, lang));
    if (tr.every((x) => x !== undefined)) return tr.join(lang === 'es' ? ' ' : '');
  }
  return undefined;
}

/** Translate one English string into ja/zh/es (returns the input for en/ko or when unknown). */
export function translateText(s: string, lang: string): string {
  if (lang !== 'ja' && lang !== 'zh' && lang !== 'es') return s;
  if (!s || !/[A-Za-z]/.test(s)) return s;
  const cache = (caches[lang] ??= new Map());
  const c = cache.get(s);
  if (c !== undefined) return c;
  // keep surrounding spaces/punctuation-free padding (JSX splits text around {expressions})
  const lead = s.match(/^\s*/)![0];
  const tail = s.match(/\s*$/)![0];
  const core = s.slice(lead.length, s.length - tail.length);
  const out = lookup(core, lang);
  if (out === undefined) MISSING[lang].add(core);
  const res = out === undefined ? s : lead + out + tail;
  cache.set(s, res);
  return res;
}

/** True when the dictionaries know this English text (even if the translation is identical, e.g. a place name). */
export function hasTranslation(s: string, lang: DictLang): boolean {
  const core = s.trim();
  return !/[A-Za-z]/.test(core) || lookupCached(core, lang) !== undefined;
}
