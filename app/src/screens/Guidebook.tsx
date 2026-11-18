import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { TOPICS, tr, type KnowledgeCard, type TopicId } from '@kotoventure/shared';
import { Prop } from '../art/props';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Btn, CardView, Chip, H, P } from '../ui/kit';
import { C, R, shadow } from '../ui/theme';

/** Collection of all knowledge cards; locked until found in a mission. */
export function Guidebook() {
  const { content, profile, collectedCards } = useStore();
  const lang = profile?.lang ?? 'en';
  const L = t(lang);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [open, setOpen] = useState<KnowledgeCard | null>(null);
  const cards = content.cards.filter((c) => !topic || c.topic === topic);
  const total = content.cards.length;
  const got = content.cards.filter((c) => collectedCards.has(c.id)).length;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <H>📖 {L.guidebook}</H>
        <P dim>
          {got} / {total} {L.collected}
        </P>
        <View style={{ height: 8, backgroundColor: C.line, borderRadius: 4, marginTop: 6 }}>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: C.green, width: `${(got / Math.max(1, total)) * 100}%` }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <Chip label={lang === 'ko' ? '전체' : 'All'} active={!topic} onPress={() => setTopic(null)} />
          {TOPICS.map((tp) => (
            <Chip key={tp.id} label={`${tp.icon} ${tr(tp.name, lang)}`} color={tp.color} active={topic === tp.id} onPress={() => setTopic(tp.id)} />
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          {cards.map((c) => {
            const has = collectedCards.has(c.id);
            const m = TOPICS.find((x) => x.id === c.topic)!;
            return (
              <Pressable
                key={c.id}
                onPress={() => setOpen(c)}
                accessibilityRole="button"
                style={{ width: '31%', flexGrow: 1, maxWidth: 160, backgroundColor: '#FFF', borderRadius: R.m, padding: 8, alignItems: 'center', borderTopWidth: 4, borderTopColor: m.color, ...shadow }}
              >
                <View style={{ opacity: has ? 1 : 0.25 }}>
                  <Prop id={c.prop} size={64} />
                </View>
                <Text numberOfLines={2} style={{ textAlign: 'center', fontWeight: '800', fontSize: 12, color: has ? C.ink : C.inkSoft, marginTop: 4 }}>
                  {has ? tr(c.title, lang) : '🔒 ' + tr(c.title, lang)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <View style={{ flex: 1, backgroundColor: '#0009', justifyContent: 'center', padding: 16 }}>
          <View style={{ maxWidth: 480, width: '100%', alignSelf: 'center' }}>
            {open && <CardView card={open} lang={lang} />}
            {open && !collectedCards.has(open.id) && (
              <P style={{ color: '#FFF', textAlign: 'center', marginTop: 8 }}>
                {lang === 'ko' ? '미션에서 이 카드를 찾으면 수집됩니다.' : 'Find this card in a mission to collect it.'}
              </P>
            )}
            <Btn label="OK" style={{ marginTop: 12 }} onPress={() => setOpen(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
