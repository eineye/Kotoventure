import { useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native';
import * as Speech from 'expo-speech';
import { tr } from '@kotoventure/shared';
import { SpotCard } from '../ui/SpotCard';
import { Text } from '../ui/Text';
import { useStore } from '../data/store';
import { CardPopup } from '../ui/CardPopup';
import { ChecklistPanel, buildChecklist, reviewItems } from '../ui/Checklist';
import { H, P, Panel } from '../ui/kit';
import { Prop } from '../art/props';
import { C, R, shadow } from '../ui/theme';

/** Phrases every traveller needs, even before playing a mission. Format: hangul|roman|meaning */
const ESSENTIALS = [
  '이거 주세요|I-geo ju-se-yo|This one, please',
  '얼마예요?|Eol-ma-ye-yo?|How much is it?',
  '카드 돼요?|Ka-deu dwae-yo?|Can I pay by card?',
  '화장실 어디예요?|Hwa-jang-sil eo-di-ye-yo?|Where is the restroom?',
  '여기로 가 주세요|Yeo-gi-ro ga ju-se-yo|Please take me here',
  '영어 하세요?|Yeong-eo ha-se-yo?|Do you speak English?',
  '도와주세요!|Do-wa-ju-se-yo!|Help me, please!',
  '감사합니다|Gam-sa-ham-ni-da|Thank you',
];

/**
 * Travel kit: everything learned in the missions, ready for the real trip –
 * phrases to show staff (big text + audio), emergency numbers, collected cards
 * and a personal checklist. All data is on the phone, so it works offline.
 */
export function Kit() {
  const { content, profile, progress, savedSpots } = useStore();
  const lang = profile?.lang ?? 'en';
  const ko = lang === 'ko';
  const [show, setShow] = useState<string[] | null>(null);
  const [openCard, setOpenCard] = useState<number | null>(null);

  const runs = useMemo(() => Object.values(progress).sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')), [progress]);
  const learned = useMemo(() => Array.from(new Set(runs.flatMap((p) => p.phrases))), [runs]);
  const phrases = useMemo(() => [...learned, ...ESSENTIALS.filter((e) => !learned.some((l) => l.split('|')[0] === e.split('|')[0]))].map((s) => s.split('|')), [learned]);
  const cardIds = useMemo(() => new Set(runs.flatMap((p) => p.cards)), [runs]);
  const cards = content.cards.filter((c) => cardIds.has(c.id));
  const list = buildChecklist({ lang, month: profile?.month, party: profile?.party ?? 'solo', review: reviewItems(content.courses, runs, lang) });

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
      <View>
        <H size={24}>🎒 {ko ? '여행 키트' : 'Travel kit'}</H>
        <P dim>{ko ? '미션에서 배운 것을 실제 여행에서 바로 꺼내 쓰세요. 인터넷 없이도 열려요.' : 'Everything you learned, ready for the real trip – works offline.'}</P>
      </View>

      <Panel>
        <H size={17}>🆘 {ko ? '긴급 전화' : 'Emergency numbers'}</H>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {content.config.emergencyNumbers.map((e) => (
            <Pressable key={e.number} testID={`kit-call-${e.number}`} onPress={() => Linking.openURL(`tel:${e.number}`)} accessibilityRole="button" style={{ flex: 1, alignItems: 'center', backgroundColor: '#FDECEC', borderRadius: R.m, paddingVertical: 10 }}>
              <Text style={{ color: C.red, fontWeight: '900', fontSize: 22 }}>{e.number}</Text>
              <Text style={{ color: C.ink, fontSize: 11, fontWeight: '700', textAlign: 'center' }} numberOfLines={2}>
                {tr(e.label, lang)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel>
        <H size={17}>🗣️ {ko ? '보여주는 한국어' : 'Show-to-staff phrases'}</H>
        <P dim style={{ fontSize: 12 }}>{ko ? '누르면 크게 보여 주고 소리로 들려줘요.' : 'Tap to show it big and hear it.'}</P>
        <View style={{ marginTop: 6, gap: 6 }}>
          {phrases.map(([h, r, m]) => (
            <Pressable key={h} testID={`kit-phrase-${h}`} onPress={() => setShow([h, r, m])} accessibilityRole="button" style={({ pressed }) => ({ borderLeftWidth: 4, borderLeftColor: C.blue, paddingLeft: 10, paddingVertical: 4, backgroundColor: pressed ? '#EEF4FF' : 'transparent', borderRadius: 4 })}>
              <Text style={{ fontWeight: '900', fontSize: 17, color: C.blue }}>{h}</Text>
              <Text style={{ color: C.inkSoft, fontSize: 12 }}>
                {r} – {m}
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      {(() => {
        const saved = (content.spots ?? []).filter((x) => savedSpots.includes(x.id) && x.status === 'published');
        return (
          <Panel style={{ gap: 8 }}>
            <H size={17}>♥ {ko ? '가 보고 싶은 곳' : 'Places I want to visit'}</H>
            {saved.length === 0 ? (
              <P dim>{ko ? '코스 화면의 카치 추천에서 ♡를 누르면 여기에 모여요.' : "Tap ♡ on Kachi's picks in a mission to save places here."}</P>
            ) : (
              saved.map((x) => <SpotCard key={x.id} spot={x} lang={lang} />)
            )}
          </Panel>
        );
      })()}

      <ChecklistPanel title={ko ? '나의 한국 여행 준비' : 'My Korea trip checklist'} lang={lang} list={list} />

      <Panel>
        <H size={17}>📚 {ko ? `모은 지식카드 (${cards.length})` : `Collected cards (${cards.length})`}</H>
        {cards.length === 0 ? (
          <P dim style={{ marginTop: 6 }}>{ko ? '미션을 하면 지식카드가 여기에 모여요.' : 'Cards you collect in missions appear here.'}</P>
        ) : (
          <View style={{ marginTop: 6, gap: 6 }}>
            {cards.map((c, i) => (
              <Pressable key={c.id} testID={`kit-card-${c.id}`} onPress={() => setOpenCard(i)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FAFAF7', borderRadius: R.s, padding: 6 }}>
                <Prop id={c.prop} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: C.ink }}>{tr(c.title, lang)}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 12, color: C.inkSoft }}>
                    {tr(c.body, lang)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        <CardPopup cards={cards} index={openCard} lang={lang} onClose={() => setOpenCard(null)} onIndex={setOpenCard} />
      </Panel>

      <Modal visible={!!show} transparent animationType="fade" onRequestClose={() => setShow(null)}>
        <Pressable testID="kit-phrase-close" onPress={() => setShow(null)} style={{ flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', padding: 20 }}>
          {show && (
            <View style={{ backgroundColor: '#FFF', borderRadius: R.l, padding: 24, alignItems: 'center', gap: 12, ...shadow }}>
              <Text style={{ fontSize: 44, fontWeight: '900', color: C.ink, textAlign: 'center' }}>{show[0]}</Text>
              <Text style={{ fontSize: 16, color: C.inkSoft, textAlign: 'center' }}>{show[1]}</Text>
              <Text style={{ fontSize: 15, color: C.ink, textAlign: 'center' }}>{show[2]}</Text>
              <Pressable testID="kit-speak" onPress={() => Speech.speak(show[0], { language: 'ko-KR', rate: 0.85 })} accessibilityRole="button" style={{ backgroundColor: C.blue, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 }}>
                <Text style={{ color: '#FFF', fontWeight: '900' }}>🔊 {ko ? '듣기' : 'Listen'}</Text>
              </Pressable>
              <Text style={{ fontSize: 12, color: C.inkSoft }}>{ko ? '화면을 직원에게 보여 주세요 · 아무 곳이나 누르면 닫혀요' : 'Show this screen to staff · tap anywhere to close'}</Text>
            </View>
          )}
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
