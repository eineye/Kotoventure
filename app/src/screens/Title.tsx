import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import { Background } from '../art/backgrounds';
import { Kachi } from '../art/Characters';
import { Logo } from '../art/Logo';
import { t } from '../i18n';
import { C } from '../ui/theme';

export function Title({ onStart, lang }: { onStart: () => void; lang?: string }) {
  const { width, height } = useWindowDimensions();
  const bob = useState(() => new Animated.Value(0))[0];
  const fly = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
    Animated.timing(fly, { toValue: 1, duration: 1200, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }).start();
  }, [bob, fly]);

  return (
    <Pressable style={{ flex: 1, backgroundColor: C.paper }} onPress={onStart} accessibilityRole="button" accessibilityLabel="Start">
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.45, opacity: 0.95 }}>
        <Background id="palace" width={width} height={height * 0.45} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: height * 0.1, paddingHorizontal: 16 }}>
        <Animated.View style={{ opacity: fly, transform: [{ translateY: fly.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }}>
          <Logo width={Math.min(width - 32, 360)} />
        </Animated.View>
        <Animated.View style={{ marginTop: 24, transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}>
          <Kachi size={110} />
        </Animated.View>
        <View style={{ marginTop: 18, backgroundColor: '#FFFFFFE6', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 }}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>✈ {t(lang).tapToStart}</Text>
        </View>
      </View>
    </Pressable>
  );
}
