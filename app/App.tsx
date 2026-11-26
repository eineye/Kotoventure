import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, View } from 'react-native';
import { confirmExit } from './src/ui/exit';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider, useStore } from './src/data/store';
import { Title } from './src/screens/Title';
import { Onboarding } from './src/screens/Onboarding';
import { Home, type Tab } from './src/screens/Home';
import { CourseDetail } from './src/screens/CourseDetail';
import { Play } from './src/screens/Play';
import { Result } from './src/screens/Result';
import { C } from './src/ui/theme';
import { ArtGallery } from './src/screens/ArtGallery';
import { Planner } from './src/screens/Planner';
import { TrekDetail, TrekList } from './src/screens/Treks';

// Web preview only: render SVG text with a sans-serif stack (native already uses the system font)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const st = document.createElement('style');
  st.textContent = 'svg text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR","Apple SD Gothic Neo",sans-serif}';
  document.head.appendChild(st);
}

const showGallery = Platform.OS === 'web' && typeof window !== 'undefined' && window.location.search.includes('gallery');

type Route =
  | { name: 'title' }
  | { name: 'onboarding' }
  | { name: 'home'; tab: Tab }
  | { name: 'course'; id: string }
  | { name: 'play'; id: string; restart: boolean }
  | { name: 'result'; id: string; review?: boolean }
  | { name: 'planner'; tripId?: string }
  | { name: 'treks' }
  | { name: 'trek'; id: string };

function Router() {
  const { ready, profile } = useStore();
  const [stack, setStack] = useState<Route[]>([{ name: 'title' }]);
  const route = stack[stack.length - 1];
  const push = (r: Route) => setStack((s) => [...s, r]);
  const reset = (r: Route) => setStack([r]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        pop();
        return true;
      }
      confirmExit(profile?.lang);
      return true;
    });
    return () => sub.remove();
  }, [stack.length, profile?.lang]);

  // signed out from the "Me" tab → back to onboarding
  useEffect(() => {
    if (ready && !profile && route.name !== 'title' && route.name !== 'onboarding') reset({ name: 'onboarding' });
  }, [ready, profile, route.name]);

  if (!ready)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper }}>
        <ActivityIndicator color={C.red} size="large" />
      </View>
    );

  switch (route.name) {
    case 'title':
      return <Title lang={profile?.lang} onStart={() => reset(profile ? { name: 'home', tab: 'missions' } : { name: 'onboarding' })} />;
    case 'onboarding':
      return <Onboarding onDone={() => reset({ name: 'home', tab: 'missions' })} />;
    case 'home':
      return (
        <Home
          tab={route.tab}
          setTab={(tab) => setStack((s) => [...s.slice(0, -1), { name: 'home', tab }])}
          openCourse={(id) => push({ name: 'course', id })}
          openPlanner={() => push({ name: 'planner' })}
          openTreks={() => push({ name: 'treks' })}
          openResult={(id) => push({ name: 'result', id, review: true })}
        />
      );
    case 'course':
      return (
        <CourseDetail
          id={route.id}
          onBack={pop}
          onPlay={(restart) => push({ name: 'play', id: route.id, restart })}
          onEdit={() => push({ name: 'planner', tripId: route.id })}
          onResult={() => push({ name: 'result', id: route.id, review: true })}
        />
      );
    case 'planner':
      return (
        <Planner
          key={route.tripId ?? 'new'}
          tripId={route.tripId}
          onBack={pop}
          onDeleted={() => reset({ name: 'home', tab: 'missions' })}
          onSaved={(id) => setStack((s) => [...s.slice(0, route.tripId ? -2 : -1), { name: 'course', id }])}
        />
      );
    case 'treks':
      return <TrekList onBack={pop} onOpen={(id) => push({ name: 'trek', id })} />;
    case 'trek':
      return <TrekDetail id={route.id} onBack={pop} />;
    case 'play':
      return (
        <Play
          key={route.id + String(route.restart) + stack.length}
          id={route.id}
          restart={route.restart}
          onQuit={pop}
          onFinish={() => setStack((s) => [...s.slice(0, -1), { name: 'result', id: route.id }])}
        />
      );
    case 'result':
      return (
        <Result
          id={route.id}
          onHome={() => reset({ name: 'home', tab: 'missions' })}
          onReplay={() => setStack((s) => [...s.slice(0, -1), { name: 'play', id: route.id, restart: true }])}
          onBack={route.review ? pop : undefined}
        />
      );
  }
}

export default function App() {
  if (showGallery) return <ArtGallery />;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.navy }} edges={['top', 'bottom']}>
          <StatusBar style="light" />
          {/* On tablets / web keep a phone-like column */}
          <View style={{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: C.paper }}>
            <Router />
          </View>
        </SafeAreaView>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
