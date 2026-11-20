import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { AREAS, PARTY_TYPES, recommend, tr, type Course } from '@kotoventure/shared';
import { Background } from '../art/backgrounds';
import { Traveller, avatarById } from '../art/Characters';
import { LogoMark } from '../art/Logo';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Chip, H, P, Stars } from '../ui/kit';
import { C, R, shadow } from '../ui/theme';
import { Guidebook } from './Guidebook';
import { Me } from './Me';

export type Tab = 'missions' | 'guide' | 'me';

export function Home({ tab, setTab, openCourse }: { tab: Tab; setTab: (t: Tab) => void; openCourse: (id: string) => void }) {
  const { profile } = useStore();
  const L = t(profile?.lang);
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={{ flex: 1 }}>
        {tab === 'missions' && <Missions openCourse={openCourse} />}
        {tab === 'guide' && <Guidebook />}
        {tab === 'me' && <Me />}
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: C.line, paddingBottom: 6 }}>
        {(
          [
            ['missions', '🗺️', L.home],
            ['guide', '📖', L.guidebook],
            ['me', '🧳', L.me],
          ] as const
        ).map(([id, icon, label]) => (
          <Pressable key={id} onPress={() => setTab(id)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }} accessibilityRole="tab" accessibilityState={{ selected: tab === id }}>
            <Text style={{ fontSize: 22, opacity: tab === id ? 1 : 0.45 }}>{icon}</Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: tab === id ? C.red : C.inkSoft }}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Missions({ openCourse }: { openCourse: (id: string) => void }) {
  const { content, profile, progress } = useStore();
  const lang = profile?.lang ?? 'en';
  const L = t(lang);
  const [cat, setCat] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const party = profile?.party ?? 'solo';
  const published = content.courses.filter((c) => c.isPublished);
  const recs = useMemo(() => recommend(published, party).slice(0, 3), [published, party]);
  const cats = content.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const list = published.filter((c) => (!cat || c.categoryId === cat) && (!area || c.area === area)).sort((a, b) => a.sortOrder - b.sortOrder);
  const partyName = tr(PARTY_TYPES.find((p) => p.id === party)?.name, lang);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <LogoMark size={40} />
        <View style={{ flex: 1 }}>
          <H size={20}>
            Koto<Text style={{ color: C.red }}>venture</Text>
          </H>
          <Text style={{ color: C.inkSoft, fontWeight: '700' }}>
            {profile?.nickname} · {partyName}
          </Text>
        </View>
        <Traveller a={avatarById(profile?.avatar)} size={40} />
      </View>

      {content.config.notice && (
        <View style={{ backgroundColor: '#FFF4D6', borderRadius: R.m, padding: 12, marginTop: 14, borderLeftWidth: 4, borderLeftColor: C.yellow }}>
          <P>📢 {tr(content.config.notice, lang)}</P>
        </View>
      )}

      <H style={{ marginTop: 20 }} size={19}>
        ⭐ {L.recommended} <Text style={{ color: C.inkSoft, fontSize: 14 }}>({partyName})</Text>
      </H>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {recs.map((c) => (
          <BigCard key={c.id} c={c} lang={lang} onPress={() => openCourse(c.id)} done={!!progress[c.id]?.completedAt} />
        ))}
      </ScrollView>

      <H style={{ marginTop: 22 }} size={19}>
        🗺️ {L.allMissions}
      </H>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <Chip testID="area-all" label={`📍 ${lang === 'ko' ? '전 지역' : 'All regions'}`} active={!area} onPress={() => setArea(null)} color={C.navy} />
        {AREAS.map((a) => {
          const n = published.filter((c) => c.area === a.id).length;
          return n ? <Chip key={a.id} testID={`area-${a.id}`} label={`${a.icon} ${tr(a.name, lang)} ${n}`} color={C.navy} active={area === a.id} onPress={() => setArea(a.id)} /> : null;
        })}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <Chip label={lang === 'ko' ? '전체' : 'All'} active={!cat} onPress={() => setCat(null)} />
        {cats.map((c) => (
          <Chip key={c.id} label={`${c.icon} ${tr(c.name, lang)}`} color={c.color} active={cat === c.id} onPress={() => setCat(c.id)} />
        ))}
      </ScrollView>
      <View style={{ gap: 12, marginTop: 12 }}>
        {list.length === 0 && <P dim>{lang === 'ko' ? '이 조건의 미션이 없어요.' : 'No missions match these filters.'}</P>}
        {list.map((c) => (
          <RowCard key={c.id} c={c} lang={lang} onPress={() => openCourse(c.id)} />
        ))}
      </View>
    </ScrollView>
  );
}

function GatewayBadge({ c }: { c: Course }) {
  return (
    <View style={{ backgroundColor: C.navy, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '900' }}>
        {c.entry.kind === 'airport' ? '✈' : '⚓'} {c.entry.code}
      </Text>
    </View>
  );
}

function BigCard({ c, lang, onPress, done }: { c: Course; lang: string; onPress: () => void; done: boolean }) {
  const { content, isUnlocked, profile } = useStore();
  const { width } = useWindowDimensions();
  const w = Math.min(width * 0.72, 300);
  const cat = content.categories.find((x) => x.id === c.categoryId);
  return (
    <Pressable onPress={onPress} style={{ width: w, backgroundColor: '#FFF', borderRadius: R.l, overflow: 'hidden', ...shadow }} accessibilityRole="button">
      <View style={{ height: 120 }}>
        <Background id={c.coverBg} width={w} height={120} />
        <View style={{ position: 'absolute', top: 8, left: 8 }}>
          <GatewayBadge c={c} />
        </View>
        {done && <Text style={{ position: 'absolute', top: 6, right: 8, fontSize: 22 }}>🏅</Text>}
        {!isUnlocked(c) && <Text style={{ position: 'absolute', top: 6, right: 8, fontSize: 22 }}>🔒</Text>}
      </View>
      <View style={{ padding: 12 }}>
        <Text style={{ color: cat?.color, fontWeight: '900', fontSize: 12 }}>
          {cat?.icon} {tr(cat?.name, lang)}
        </Text>
        <H size={17}>{tr(c.title, lang)}</H>
        <P dim style={{ fontSize: 13 }}>{tr(c.subtitle, lang)}</P>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Stars n={c.partyFit[profile?.party ?? 'solo']} />
          <Text style={{ fontSize: 12, color: C.inkSoft, fontWeight: '700' }}>fit</Text>
        </View>
      </View>
    </Pressable>
  );
}

function RowCard({ c, lang, onPress }: { c: Course; lang: string; onPress: () => void }) {
  const { content, progress, isUnlocked } = useStore();
  const L = t(lang as any);
  const cat = content.categories.find((x) => x.id === c.categoryId);
  const p = progress[c.id];
  const pct = p ? (p.completedAt ? 1 : p.sceneIndex / c.scenes.length) : 0;
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', backgroundColor: '#FFF', borderRadius: R.l, overflow: 'hidden', ...shadow }} accessibilityRole="button">
      <View style={{ width: 104 }}>
        <Background id={c.coverBg} width={104} height={112} />
      </View>
      <View style={{ flex: 1, padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: cat?.color, fontWeight: '900', fontSize: 12 }}>
            {cat?.icon} {tr(cat?.name, lang)}
          </Text>
          <GatewayBadge c={c} />
        </View>
        <H size={16} style={{ marginTop: 2 }}>
          {!isUnlocked(c) ? '🔒 ' : ''}
          {tr(c.title, lang)}
        </H>
        <Text style={{ color: C.inkSoft, fontSize: 12, fontWeight: '700' }}>
          {tr(c.region, lang)} · {c.nights}
          {L.nights} {c.days}
          {L.days}
        </Text>
        <View style={{ height: 6, backgroundColor: C.line, borderRadius: 3, marginTop: 8 }}>
          <View style={{ height: 6, width: `${pct * 100}%`, backgroundColor: pct >= 1 ? C.green : C.orange, borderRadius: 3 }} />
        </View>
      </View>
    </Pressable>
  );
}
