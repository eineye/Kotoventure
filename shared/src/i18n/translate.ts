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
    [/^(🚇|🚌) (?:Subway|Bus) to (.+) \((\d+) min, (₩[\d,]+)\)$/, (m, t) => `${m[1]} ${t(m[2])}へ${m[1] === '🚇' ? '地下鉄' : 'バス'}で（${m[3]}分、${m[4]}）`],
    [/^(.+): meal, (\d+) min(?: \((₩[\d,]+)\))?$/, (m, t) => `${t(m[1])}：食事、${m[2]}分${m[3] ? `（${m[3]}）` : ''}`],
    [/^(.+): (\d+) min(?: \((₩[\d,]+)\))?$/, (m, t) => `${t(m[1])}：${m[2]}分${m[3] ? `（${m[3]}）` : ''}`],
    [/^(.+) opens at ([\d:]+) – waiting (\d+) min\.$/, (m, t) => `${t(m[1])}は${m[2]}に開きます――${m[3]}分待ち。`],
    [/^🥵 Heat at (.+): outdoor sightseeing in the afternoon heat \(energy −(\d+)\)\.$/, (m, t) => `🥵 ${t(m[1])}で暑さ：午後の炎天下で屋外観光（体力 −${m[2]}）。`],
    [/^🌧️ Downpour at (.+) and no umbrella – soaked \(energy −(\d+)\)\.$/, (m, t) => `🌧️ ${t(m[1])}で土砂降り、傘がなくてずぶ濡れ（体力 −${m[2]}）。`],
    [/^✨ Night view from (.+)!$/, (m, t) => `✨ ${t(m[1])}からの夜景！`],
    [/^(.+) is CLOSED on (\w+)! The trip was wasted\.$/, (m, t) => `${t(m[1])}は${t(m[2])}休み！無駄足になりました。`],
    [/^🌀 Typhoon warning: (.+) is closed \/ unsafe \(outdoor\)\. Trip wasted\.$/, (m, t) => `🌀 台風警報：${t(m[1])}は閉鎖／危険（屋外）。無駄足になりました。`],
    [/^Very late lunch at (.+) – you were starving by then \(energy −(\d+)\)\.$/, (m, t) => `${t(m[1])}でかなり遅い昼食――もうお腹ぺこぺこでした（体力 −${m[2]}）。`],
    [/^Too late for (.+) \(last entry ([\d:]+)\)\.$/, (m, t) => `${t(m[1])}には遅すぎます（最終入場 ${m[2]}）。`],
    [/^(?:start at|leave the) (.+)$/, (m, t) => `${t(m[1])}から出発`],
    [/^Paid (₩[\d,]+) for (₩[\d,]+) \((.+)\)$/, (m) => `${m[2]}の支払いに${m[1]}を出した（${m[3]}）`],
    [/^(\S+) → ([^.]+)\. (.+)$/, (m, t) => `${m[1]} → ${t(m[2])}。${t(m[3])}`],
    [/^(.+?) → (.+)$/, (m, t) => `${t(m[1])} → ${t(m[2])}`],
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
    [/^(🚇|🚌) (?:Subway|Bus) to (.+) \((\d+) min, (₩[\d,]+)\)$/, (m, t) => `${m[1]} ${m[1] === '🚇' ? '坐地铁' : '坐公交'}去${t(m[2])}（${m[3]}分钟，${m[4]}）`],
    [/^(.+): meal, (\d+) min(?: \((₩[\d,]+)\))?$/, (m, t) => `${t(m[1])}：用餐，${m[2]}分钟${m[3] ? `（${m[3]}）` : ''}`],
    [/^(.+): (\d+) min(?: \((₩[\d,]+)\))?$/, (m, t) => `${t(m[1])}：${m[2]}分钟${m[3] ? `（${m[3]}）` : ''}`],
    [/^(.+) opens at ([\d:]+) – waiting (\d+) min\.$/, (m, t) => `${t(m[1])}${m[2]}开门——等了${m[3]}分钟。`],
    [/^🥵 Heat at (.+): outdoor sightseeing in the afternoon heat \(energy −(\d+)\)\.$/, (m, t) => `🥵 ${t(m[1])}太热：下午顶着高温在户外观光（体力 −${m[2]}）。`],
    [/^🌧️ Downpour at (.+) and no umbrella – soaked \(energy −(\d+)\)\.$/, (m, t) => `🌧️ ${t(m[1])}下起大雨，没带伞——全身湿透（体力 −${m[2]}）。`],
    [/^✨ Night view from (.+)!$/, (m, t) => `✨ ${t(m[1])}的夜景！`],
    [/^(.+) is CLOSED on (\w+)! The trip was wasted\.$/, (m, t) => `${t(m[1])}${t(m[2])}闭馆！白跑一趟。`],
    [/^🌀 Typhoon warning: (.+) is closed \/ unsafe \(outdoor\)\. Trip wasted\.$/, (m, t) => `🌀 台风预警：${t(m[1])}关闭/不安全（户外）。白跑一趟。`],
    [/^Very late lunch at (.+) – you were starving by then \(energy −(\d+)\)\.$/, (m, t) => `在${t(m[1])}吃了很晚的午饭——那时你已经饿坏了（体力 −${m[2]}）。`],
    [/^Too late for (.+) \(last entry ([\d:]+)\)\.$/, (m, t) => `去${t(m[1])}太晚了（最晚入场 ${m[2]}）。`],
    [/^(?:start at|leave the) (.+)$/, (m, t) => `从${t(m[1])}出发`],
    [/^Paid (₩[\d,]+) for (₩[\d,]+) \((.+)\)$/, (m) => `${m[2]}的账单付了${m[1]}（${m[3]}）`],
    [/^(\S+) → ([^.]+)\. (.+)$/, (m, t) => `${m[1]} → ${t(m[2])}。${t(m[3])}`],
    [/^(.+?) → (.+)$/, (m, t) => `${t(m[1])} → ${t(m[2])}`],
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
    [/^(🚇|🚌) (?:Subway|Bus) to (.+) \((\d+) min, (₩[\d,]+)\)$/, (m, t) => `${m[1]} ${m[1] === '🚇' ? 'Metro' : 'Autobús'} a ${t(m[2])} (${m[3]} min, ${m[4]})`],
    [/^(.+): meal, (\d+) min(?: \((₩[\d,]+)\))?$/, (m, t) => `${t(m[1])}: comida, ${m[2]} min${m[3] ? ` (${m[3]})` : ''}`],
    [/^(.+): (\d+) min(?: \((₩[\d,]+)\))?$/, (m, t) => `${t(m[1])}: ${m[2]} min${m[3] ? ` (${m[3]})` : ''}`],
    [/^(.+) opens at ([\d:]+) – waiting (\d+) min\.$/, (m, t) => `${t(m[1])} abre a las ${m[2]}: esperas ${m[3]} min.`],
    [/^🥵 Heat at (.+): outdoor sightseeing in the afternoon heat \(energy −(\d+)\)\.$/, (m, t) => `🥵 Calor en ${t(m[1])}: turismo al aire libre con el calor de la tarde (energía −${m[2]}).`],
    [/^🌧️ Downpour at (.+) and no umbrella – soaked \(energy −(\d+)\)\.$/, (m, t) => `🌧️ Chaparrón en ${t(m[1])} y sin paraguas: empapado (energía −${m[2]}).`],
    [/^✨ Night view from (.+)!$/, (m, t) => `✨ ¡Vistas nocturnas desde ${t(m[1])}!`],
    [/^(.+) is CLOSED on (\w+)! The trip was wasted\.$/, (m, t) => `¡${t(m[1])} CIERRA los ${t(m[2])}! El viaje fue en vano.`],
    [/^🌀 Typhoon warning: (.+) is closed \/ unsafe \(outdoor\)\. Trip wasted\.$/, (m, t) => `🌀 Alerta de tifón: ${t(m[1])} está cerrado o no es seguro (exterior). Viaje en vano.`],
    [/^Very late lunch at (.+) – you were starving by then \(energy −(\d+)\)\.$/, (m, t) => `Comida muy tardía en ${t(m[1])}: para entonces estabas muerto de hambre (energía −${m[2]}).`],
    [/^Too late for (.+) \(last entry ([\d:]+)\)\.$/, (m, t) => `Demasiado tarde para ${t(m[1])} (última entrada ${m[2]}).`],
    [/^(?:start at|leave the) (.+)$/, (m, t) => `salida desde ${t(m[1])}`],
    [/^Paid (₩[\d,]+) for (₩[\d,]+) \((.+)\)$/, (m) => `Pagué ${m[1]} por ${m[2]} (${m[3]})`],
    [/^(\S+) → ([^.]+)\. (.+)$/, (m, t) => `${m[1]} → ${t(m[2])}. ${t(m[3])}`],
    [/^(.+?) → (.+)$/, (m, t) => `${t(m[1])} → ${t(m[2])}`],
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

/** UI sentences from the practice simulations; captured names (often Korean + English) are kept as they are. */
const SIM_PHRASES: Record<DictLang, Record<string, string>> = {
  ja: { reallife: '· 実際は約', photos: '実際の写真を見る：', ordered: '注文：', bought: '購入：', said: '言ったこと：', dest: '目的地：{0}――どのバスに乗る？', stopmap: '停留所の路線図によると、{0}番バスは{1}に止まります。バスの色で路線の種類がわかります。', here: '{0}番バスが来ました！前のドアから乗りましょう。', arriving: '{0}に到着。後ろのドアから降りましょう。', gettingoff: '{0}で降車', found: '到着案内板で{0}番バスを見つけた', address: '韓国語の住所で目的地を設定：{0}' },
  zh: { reallife: '· 实际约', photos: '查看实景照片：', ordered: '已点：', bought: '已购买：', said: '说了：', dest: '目的地：{0}——坐哪路公交？', stopmap: '站牌上的线路图显示{0}路公交停靠{1}。公交的颜色代表线路类型。', here: '{0}路公交来了！从前门上车。', arriving: '即将到达{0}。请从后门下车。', gettingoff: '在{0}下车', found: '在到站信息屏上找到了{0}路公交', address: '用韩文地址设置目的地：{0}' },
  es: { reallife: '· en la vida real ~', photos: 'Ver fotos reales: ', ordered: 'Pedido: ', bought: 'Comprado: ', said: 'Dijiste: ', dest: 'Destino: {0}. ¿Qué autobús tomas?', stopmap: 'El mapa de la parada muestra que el autobús {0} para en {1}. El color del autobús indica el tipo de línea.', here: '¡Llega el autobús {0}! Sube por la puerta delantera.', arriving: 'Llegando a {0}. Baja por la puerta trasera.', gettingoff: 'Bajando en {0}', found: 'Encontré el autobús {0} en el panel de llegadas', address: 'Destino fijado con la dirección coreana: {0}' },
};
const fill = (t: string, ...a: string[]) => t.replace(/\{(\d)\}/g, (_, i) => a[Number(i)]);
/** durations like "1 h 30 min", "~50 min", "overnight" in the local units */
const UNITS: Record<DictLang, { h: string; min: string; night: string; s: string }> = {
  ja: { h: '時間', min: '分', night: '泊', s: '秒' },
  zh: { h: '小时', min: '分钟', night: '过夜', s: '秒' },
  es: { h: ' h', min: ' min', night: 'noche', s: ' s' },
};
function localDuration(s: string, lang: DictLang): string | undefined {
  const rest = s.replace(/\d+\s*(h|min)\b|overnight|[~·\s]|[^\p{L}\p{N}]/gu, '');
  if (/[A-Za-z]/.test(rest)) return undefined;
  const u = UNITS[lang];
  return s.replace(/(\d+)\s*h\s+(?=\d)/g, lang === 'es' ? '$1 h ' : `$1${u.h}`).replace(/(\d+)\s*h\b/g, `$1${u.h}`).replace(/(\d+)\s*min\b/g, `$1${u.min}`).replace(/overnight/g, u.night);
}
function simPhrase(s: string, lang: DictLang): string | undefined {
  const P = SIM_PHRASES[lang];
  const tk = (x: string) => lookupCached(x.trim(), lang) ?? x;
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^See real photos: (.+)$/))) return P.photos + m[1];
  if ((m = s.match(/^· real life ~ ([^·]+?)(\s*·\s*₩[\d,]+)?$/))) return P.reallife + (localDuration(m[1], lang) ?? m[1]) + (m[2] ?? '');
  if ((m = s.match(/^Ordered: (.+?) – (₩[\d,]+)$/))) return P.ordered + m[1].split(', ').map((it) => it.replace(/^(.+?) ×(\d+)$/, (_, n, q) => `${tk(n)} ×${q}`)).join(', ') + ' – ' + m[2];
  if ((m = s.match(/^Bought (\d+)× (.+)$/))) return `${P.bought}${tk(m[2])} ×${m[1]}`;
  if ((m = s.match(/^Bought (.+)$/))) return P.bought + tk(m[1]);
  if ((m = s.match(/^Said: (.+)$/))) return P.said + m[1];
  if ((m = s.match(/^Destination: (.+) – which bus do you take\?$/))) return fill(P.dest, m[1]);
  if ((m = s.match(/^The stop sign map shows bus (\S+) stops at (.+)\. Bus colours tell you the route type\.$/))) return fill(P.stopmap, m[1], m[2]);
  if ((m = s.match(/^Bus (\S+) is here! Board at the front door\.$/))) return fill(P.here, m[1]);
  if ((m = s.match(/^Arriving at (.+)\. Get off at the back door\.$/))) return fill(P.arriving, m[1]);
  if ((m = s.match(/^Getting off at (.+)$/))) return fill(P.gettingoff, m[1]);
  if ((m = s.match(/^Found bus (\S+) on the arrival board$/))) return fill(P.found, m[1]);
  if ((m = s.match(/^Set destination by its Korean address: (.+)$/))) return fill(P.address, m[1]);
  if ((m = s.match(/^(.+?) ×(\d+)$/))) { const r = lookupCached(m[1], lang); if (r !== undefined) return `${r} ×${m[2]}`; }
  if ((m = s.match(/^(.+?) · ([\u3131-\uD79D].*)$/))) { const r = lookupCached(m[1], lang); if (r !== undefined) return `${r} · ${m[2]}`; }
  if ((m = s.match(/^(\d+)h (\d+)m$/))) return localDuration(`${m[1]} h ${m[2]} min`, lang);
  return localDuration(s, lang);
}

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
  const sp = simPhrase(s, lang);
  if (sp !== undefined) return sp;
  // a template applies only when all its parts translate (never half-translated sentences)
  for (const [re, f] of TEMPLATES[lang]) {
    const m = s.match(re);
    if (!m) continue;
    let ok = true;
    const out = f(m, (x) => {
      const t = x.trim();
      // names may stay the same in a language (Spanish keeps romanised names) – what matters is that we know them
      const r = !/[A-Za-z]/.test(t) ? t : lookupCached(t, lang);
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
