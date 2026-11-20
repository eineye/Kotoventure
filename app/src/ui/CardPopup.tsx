import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { TOPICS, tr, type KnowledgeCard } from '@kotoventure/shared';
import { Prop } from '../art/props';
import { Btn, H, P } from './kit';
import { C, R } from './theme';

/**
 * Pop-up for a knowledge card: the illustration bounces in, then the key points appear one by one
 * (a short "animated explainer"). ‹ › browse the other cards of the list.
 */
export function CardPopup({ cards, index, lang, onClose, onIndex, locked }: { cards: KnowledgeCard[]; index: number | null; lang: string; onClose: () => void; onIndex: (i: number) => void; locked?: (c: KnowledgeCard) => string[] | null }) {
  const { width, height } = useWindowDimensions();
  const card = index !== null ? cards[index] : null;
  const ko = lang === 'ko';
  // fresh animated values per opened card (keyed below), so every open replays the animation
  return (
    <Modal visible={!!card} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0F172ACC', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Pressable testID="card-popup-backdrop" onPress={onClose} style={StyleSheet.absoluteFill} accessibilityLabel={ko ? '닫기' : 'Close'} />
        {card && (
          <View style={{ width: Math.min(width - 32, 420), maxHeight: height * 0.88 }}>
            {/* the whole card scrolls when its content is taller than the screen */}
            <ScrollView testID="card-scroll" style={{ flexGrow: 0, borderRadius: R.l }} showsVerticalScrollIndicator>
              {locked?.(card) ? <LockedBody key={card.id} card={card} lang={lang} missions={locked(card)!} /> : <CardBody key={card.id} card={card} lang={lang} />}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <Btn testID="card-prev" small kind="ghost" label="‹" disabled={index === 0} onPress={() => onIndex(Math.max(0, (index ?? 0) - 1))} style={{ backgroundColor: '#FFF', width: 56 }} />
              <Text style={{ flex: 1, textAlign: 'center', color: '#FFF', fontWeight: '800' }}>
                {(index ?? 0) + 1} / {cards.length}
              </Text>
              <Btn testID="card-next" small kind="ghost" label="›" disabled={(index ?? 0) >= cards.length - 1} onPress={() => onIndex(Math.min(cards.length - 1, (index ?? 0) + 1))} style={{ backgroundColor: '#FFF', width: 56 }} />
              <Btn testID="card-close" small label={ko ? '닫기' : 'Close'} onPress={onClose} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

function CardBody({ card, lang }: { card: KnowledgeCard; lang: string }) {
  const ko = lang === 'ko';
  const topic = TOPICS.find((t) => t.id === card.topic)!;
  const points = [tr(card.body, lang), ...(card.tips ?? []).map((t) => tr(t, lang))];
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
      <View style={{ padding: 16, gap: 8 }}>
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
      </View>
    </Animated.View>
  );
}

/** A card the player has not collected yet: picture greyed out, contents hidden, hint where to find it. */
function LockedBody({ card, lang, missions }: { card: KnowledgeCard; lang: string; missions: string[] }) {
  const ko = lang === 'ko';
  const topic = TOPICS.find((t) => t.id === card.topic)!;
  const [pop] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
  }, [pop]);
  return (
    <Animated.View testID="card-locked" style={{ backgroundColor: '#FFF', borderRadius: R.l, overflow: 'hidden', opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
      <View style={{ backgroundColor: '#E5E7EB', alignItems: 'center', paddingVertical: 14 }}>
        <Text style={{ color: topic.color, fontWeight: '900', fontSize: 12 }}>
          {topic.icon} {tr(topic.name, lang)}
        </Text>
        <View style={{ marginTop: 6, opacity: 0.12 }}>
          <Prop id={card.prop} size={140} />
        </View>
        <Text style={{ position: 'absolute', top: 70, fontSize: 54 }}>🔒</Text>
      </View>
      <View style={{ padding: 16, gap: 8 }}>
        <H size={20}>{tr(card.title, lang)}</H>
        <View style={{ gap: 6 }}>
          {[0.95, 0.8, 0.6].map((w, i) => (
            <View key={i} style={{ height: 12, width: `${w * 100}%`, backgroundColor: '#E5E7EB', borderRadius: 6 }} />
          ))}
        </View>
        <P style={{ marginTop: 4 }}>{ko ? '아직 수집하지 않은 카드예요. 미션에서 찾으면 내용이 열려요.' : 'Not collected yet – find it in a mission to unlock the contents.'}</P>
        {missions.length > 0 && (
          <View style={{ backgroundColor: '#FFF4D6', borderRadius: R.m, padding: 10 }}>
            <Text style={{ fontWeight: '900', color: C.ink, marginBottom: 2 }}>🗺️ {ko ? '찾을 수 있는 미션' : 'Where to find it'}</Text>
            {missions.slice(0, 3).map((m) => (
              <Text key={m} style={{ color: C.ink }}>
                • {m}
              </Text>
            ))}
            {missions.length > 3 && <Text style={{ color: C.inkSoft, fontSize: 12 }}>{ko ? `외 ${missions.length - 3}개` : `+${missions.length - 3} more`}</Text>}
          </View>
        )}
      </View>
    </Animated.View>
  );
}
