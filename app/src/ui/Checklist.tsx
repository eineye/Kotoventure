import { Pressable, Share, View, Linking, Platform } from 'react-native';
import { seasonOf, tr, type Course, type CourseProgress, type L, type PartyType } from '@kotoventure/shared';
import { Text } from './Text';
import { translateText } from '@kotoventure/shared';
import { H, P, Panel } from './kit';
import { C, R } from './theme';

const BASE: L[] = [
  { en: 'Passport + entry approval (K-ETA/visa if needed) + travel insurance', ko: '여권 + 입국 허가(필요 시 K-ETA/비자) + 여행자 보험' },
  { en: 'T-money / visitor card · some cash in ₩10,000 notes', ko: 'T-money/관광 카드 · ₩10,000권 현금 조금' },
  { en: 'Naver Map or KakaoMap + Kakao T / Uber installed', ko: '네이버지도나 카카오맵 + 카카오T/우버 설치' },
  { en: '220 V plug adapter (Type C/F)', ko: '220V 플러그 어댑터(C/F형)' },
  { en: 'Save 112 · 119 · 1330 in your phone', ko: '112 · 119 · 1330 휴대폰에 저장' },
];

const SEASON_ITEMS: Record<'spring' | 'summer' | 'autumn' | 'winter', L> = {
  spring: { en: 'KF94 masks for fine dust and a light jacket for chilly evenings', ko: '미세먼지 대비 KF94 마스크와 쌀쌀한 저녁용 가벼운 재킷' },
  summer: { en: 'Light clothes, sunscreen, a hat and a small umbrella – heat and sudden downpours', ko: '가벼운 옷, 선크림, 모자, 작은 우산 – 더위와 갑작스러운 소나기 대비' },
  autumn: { en: 'Layers – cool mornings and warm afternoons', ko: '겹쳐 입을 옷 – 아침은 쌀쌀하고 오후는 따뜻해요' },
  winter: { en: 'Padded coat, gloves, a hat and heat packs – it can drop below −10 °C', ko: '패딩, 장갑, 모자, 핫팩 – 영하 10°C 아래로 떨어지기도 해요' },
};

const PARTY_ITEMS: Record<PartyType, L> = {
  solo: { en: 'Share your plan with someone at home and save your stay\'s address in Korean', ko: '집에 있는 사람에게 일정을 공유하고, 숙소 주소를 한글로 저장해 두기' },
  couple: { en: 'Book popular restaurants and hanbok or photo spots for two in advance', ko: '인기 식당과 한복·사진 명소는 2인으로 미리 예약하기' },
  friends: { en: 'Split costs with an app – taxis take max. 4 people', ko: '비용은 앱으로 나누기 – 택시는 최대 4명' },
  group: { en: 'Reserve restaurants for 6+ and check van taxis or airport limousine buses', ko: '6명 이상 식당 예약, 대형 승합 택시나 공항 리무진 버스 확인' },
};

/** Lessons from wrong answers: "what happened → what locals recommend". */
export function reviewItems(courses: Course[], runs: CourseProgress[], lang: string, max = 8): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of runs) {
    const course = courses.find((c) => c.id === p.courseId);
    if (!course) continue;
    for (const key of p.stats.missed ?? []) {
      const [sceneId, si] = key.split(':');
      const step = course.scenes.find((s) => s.id === sceneId)?.steps[Number(si)];
      if (!step) continue;
      let line = '';
      if (step.type === 'choice') {
        const good = step.options.filter((o) => o.correct).map((o) => tr(o.text, lang));
        if (!good.length) continue;
        line = good.join(' / ');
      } else if (step.type === 'sim') line = tr(step.title, lang);
      if (!line || seen.has(line)) continue;
      seen.add(line);
      out.push(line);
      if (out.length >= max) return out;
    }
  }
  return out;
}

export function buildChecklist(opts: { lang: string; month?: number; party: PartyType; review: string[]; course?: Course }) {
  const { lang, month, party, review, course } = opts;
  const pack = [...BASE.map((x) => tr(x, lang))];
  if (month) pack.push(tr(SEASON_ITEMS[seasonOf(month)], lang));
  pack.push(tr(PARTY_ITEMS[party], lang));
  const route = course ? `${tr(course.entry.name, lang)} → ${tr(course.exit.name, lang)}` : undefined;
  return { pack, review, route };
}

const label = (lang: string, en: string, ko: string) => (lang === 'ko' ? ko : translateText(en, lang));

export function checklistText(title: string, lang: string, c: ReturnType<typeof buildChecklist>) {
  const lines = [`🧳 ${title}`, ''];
  if (c.route) lines.push(`✈ ${c.route}`, '');
  lines.push(`✅ ${label(lang, 'To pack & prepare', '챙길 것·준비할 것')}`);
  c.pack.forEach((x) => lines.push(`☐ ${x}`));
  if (c.review.length) {
    lines.push('', `⚠️ ${label(lang, 'Remember on the trip', '여행 중 꼭 기억하기')}`);
    c.review.forEach((x) => lines.push(`• ${x}`));
  }
  lines.push('', `📞 112 · 119 · 1330`, '— Kotoventure');
  return lines.join('\n');
}

export async function shareText(text: string) {
  try {
    await Share.share({ message: text });
  } catch {
    if (Platform.OS === 'web') await Linking.openURL(`mailto:?body=${encodeURIComponent(text)}`);
  }
}

/** "My checklist" panel with a share button. */
export function ChecklistPanel({ title, lang, list }: { title: string; lang: string; list: ReturnType<typeof buildChecklist> }) {
  const ko = lang === 'ko';
  return (
    <Panel>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <H size={17}>✅ {ko ? '나만의 준비 체크리스트' : 'My trip checklist'}</H>
        <Pressable testID="share-checklist" onPress={() => shareText(checklistText(title, lang, list))} accessibilityRole="button" style={{ backgroundColor: C.blue, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>📤 {ko ? '공유' : 'Share'}</Text>
        </Pressable>
      </View>
      <Text style={{ fontWeight: '900', color: C.inkSoft, marginTop: 8, fontSize: 12 }}>{ko ? '챙길 것·준비할 것' : 'To pack & prepare'}</Text>
      {list.pack.map((x) => (
        <P key={x} style={{ marginTop: 4 }}>
          ☐ {x}
        </P>
      ))}
      {list.review.length > 0 && (
        <View style={{ marginTop: 10, backgroundColor: '#FFF4D6', borderRadius: R.s, padding: 10 }}>
          <Text style={{ fontWeight: '900', color: C.orange, fontSize: 12 }}>⚠️ {ko ? '시뮬레이션에서 놓친 것 – 여행 중 꼭 기억하기' : 'Missed in the simulation – remember on the trip'}</Text>
          {list.review.map((x) => (
            <Text key={x} style={{ marginTop: 4, color: C.ink, fontSize: 13 }}>
              • {x}
            </Text>
          ))}
        </View>
      )}
    </Panel>
  );
}
