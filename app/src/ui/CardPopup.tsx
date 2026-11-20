import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { TOPICS, tr, type KnowledgeCard } from '@kotoventure/shared';
import { Prop } from '../art/props';
import { Btn, H, P } from './kit';
import { C, R } from './theme';

/**
 * Pop-up for a knowledge card: the illustration bounces in, then the key points appear one by one
 * (a short "animated explainer"). ‹ › browse the other cards of the list.
 */
export function CardPopup({ cards, index, lang, onClose, onIndex, noteFor }: { cards: KnowledgeCard[]; index: number | null; lang: string; onClose: () => void; onIndex: (i: number) => void; noteFor?: (c: KnowledgeCard) => string | undefined }) {
  const { width } = useWindowDimensions();
  const card = index !== null ? cards[index] : null;
  const ko = lang === 'ko';
  // fresh animated values per opened card (keyed below), so every open replays the animation
  return (
    <Modal visible={!!card} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable testID="card-popup-backdrop" onPress={onClose} style={{ flex: 1, backgroundColor: '#0F172ACC', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        {card && (
          <Pressable onPress={() => {}} style={{ width: Math.min(width - 32, 420), maxHeight: '90%' }}>
            <CardBody key={card.id} card={card} lang={lang} />
            {noteFor?.(card) && <Text style={{ color: '#FDE68A', textAlign: 'center', fontWeight: '800', marginTop: 8 }}>{noteFor(card)}</Text>}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <Btn testID="card-prev" small kind="ghost" label="‹" disabled={index === 0} onPress={() => onIndex(Math.max(0, (index ?? 0) - 1))} style={{ backgroundColor: '#FFF', width: 56 }} />
              <Text style={{ flex: 1, textAlign: 'center', color: '#FFF', fontWeight: '800' }}>
                {(index ?? 0) + 1} / {cards.length}
              </Text>
              <Btn testID="card-next" small kind="ghost" label="›" disabled={(index ?? 0) >= cards.length - 1} onPress={() => onIndex(Math.min(cards.length - 1, (index ?? 0) + 1))} style={{ backgroundColor: '#FFF', width: 56 }} />
              <Btn testID="card-close" small label={ko ? '닫기' : 'Close'} onPress={onClose} />
            </View>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}

function CardBody({ card, lang }: { card: KnowledgeCard; lang: string }) {
  const ko = lang === 'ko';
  const topic = TOPICS.find((t) => t.id === card.topic)!;
  const points = [tr(card.body, lang), ...(card.tips ?? []).slice(0, 3).map((t) => tr(t, lang))];
  const [pop] = useState(() => new Animated.Value(0));
  const [bob] = useState(() => new Animated.Value(0));
  const [shown] = useState(() => points.map(() => new Animated.Value(0)));

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    Animated.stagger(450, shown.map((v) => Animated.timing(v, { toValue: 1, duration: 380, delay: 250, useNativeDriver: true }))).start();
    return () => loop.stop();
  }, [pop, bob, shown]);

  return (
    <Animated.View style={{ backgroundColor: '#FFF', borderRadius: R.l, overflow: 'hidden', transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }], opacity: pop }}>
      <View style={{ backgroundColor: topic.color + '22', alignItems: 'center', paddingVertical: 14 }}>
        <Text style={{ color: topic.color, fontWeight: '900', fontSize: 12 }}>
          {topic.icon} {tr(topic.name, lang)}
        </Text>
        <Animated.View
          style={{
            marginTop: 6,
            transform: [
              { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
              { rotate: bob.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) },
            ],
          }}
        >
          <Prop id={card.prop} size={140} />
        </Animated.View>
      </View>
      <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ padding: 16, gap: 8 }}>
        <H size={20}>{tr(card.title, lang)}</H>
        {points.map((pt, i) => (
          <Animated.View key={i} style={{ flexDirection: 'row', gap: 8, opacity: shown[i], transform: [{ translateX: shown[i].interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: i === 0 ? topic.color : C.yellow, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: i === 0 ? '#FFF' : C.ink, fontWeight: '900', fontSize: 12 }}>{i === 0 ? '!' : i}</Text>
            </View>
            <P style={{ flex: 1, fontSize: 15 }}>{pt}</P>
          </Animated.View>
        ))}
        {card.phrase && (
          <Pressable
            testID="card-speak"
            onPress={() => Speech.speak(card.phrase!.hangul, { language: 'ko-KR', rate: 0.85 })}
            style={{ marginTop: 6, backgroundColor: '#EEF4FF', borderRadius: R.m, padding: 12, borderLeftWidth: 4, borderLeftColor: C.blue }}
          >
            <Text style={{ fontSize: 20, fontWeight: '900', color: C.blue }}>🔊 {card.phrase.hangul}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.inkSoft }}>{card.phrase.roman}</Text>
            <Text style={{ fontSize: 13, color: C.ink }}>“{card.phrase.meaning}”</Text>
            <Text style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>{ko ? '눌러서 발음 듣기' : 'Tap to hear it'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </Animated.View>
  );
}
