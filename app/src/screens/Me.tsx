import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { PARTY_TYPES, tr } from '@kotoventure/shared';
import { AVATARS, Traveller, avatarById } from '../art/Characters';
import { useStore } from '../data/store';
import { isDemoMode } from '../data/supabase';
import { t } from '../i18n';
import { Btn, Chip, H, P, Panel, won } from '../ui/kit';
import { C, R } from '../ui/theme';

export function Me() {
  const { profile, updateProfile, content, resetProgress, signOut } = useStore();
  const lang = profile?.lang ?? 'en';
  const L = t(lang);
  const [amount, setAmount] = useState('100');
  const [cur, setCur] = useState(Object.keys(content.config.fxRates)[0] ?? 'USD');
  if (!profile) return null;
  const rate = content.config.fxRates[cur] ?? 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
      <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Traveller a={avatarById(profile.avatar)} size={64} wave />
        <View style={{ flex: 1 }}>
          <H>{profile.nickname}</H>
          <P dim>
            {profile.country} · {tr(PARTY_TYPES.find((p) => p.id === profile.party)?.name, lang)}
          </P>
          <Text style={{ fontSize: 11, color: isDemoMode ? C.orange : C.green, fontWeight: '800', marginTop: 4 }}>
            ● {isDemoMode ? L.demoMode : L.online}
          </Text>
        </View>
      </Panel>

      <Panel>
        <H size={17}>{L.language}</H>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Chip label="English" active={lang === 'en'} onPress={() => updateProfile({ lang: 'en' })} />
          <Chip label="한국어" active={lang === 'ko'} onPress={() => updateProfile({ lang: 'ko' })} />
        </View>
        <H size={17} style={{ marginTop: 14 }}>
          {lang === 'ko' ? '난이도' : 'Difficulty'}
        </H>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Chip testID="mode-guide" label={lang === 'ko' ? '🧭 가이드 모드' : '🧭 Guide'} active={(profile.mode ?? 'guide') === 'guide'} onPress={() => updateProfile({ mode: 'guide' })} color={C.green} />
          <Chip testID="mode-real" label={lang === 'ko' ? '🔥 실전 모드' : '🔥 Real trip'} active={profile.mode === 'real'} onPress={() => updateProfile({ mode: 'real' })} color={C.red} />
        </View>
        <P dim style={{ fontSize: 12, marginTop: 4 }}>
          {lang === 'ko' ? '실전 모드: 선택 즉시 정답을 알려주지 않고, 하루가 끝날 때 정산합니다.' : 'Real trip: no instant answers – you find out at the end of each day.'}
        </P>
        <H size={17} style={{ marginTop: 14 }}>
          {L.party}
        </H>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {PARTY_TYPES.map((p) => (
            <Chip key={p.id} label={tr(p.name, lang)} active={profile.party === p.id} onPress={() => updateProfile({ party: p.id })} color={C.red} />
          ))}
        </View>
        <H size={17} style={{ marginTop: 14 }}>
          {L.character}
        </H>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {AVATARS.map((a) => (
            <Pressable key={a.id} onPress={() => updateProfile({ avatar: a.id })} style={{ borderRadius: R.m, borderWidth: 3, borderColor: profile.avatar === a.id ? C.red : 'transparent' }}>
              <Traveller a={a} size={40} />
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel>
        <H size={17}>🆘 {L.emergency}</H>
        {content.config.emergencyNumbers.map((e) => (
          <Pressable key={e.number} onPress={() => Linking.openURL(`tel:${e.number}`)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={{ color: C.ink, fontWeight: '700', flex: 1 }}>{tr(e.label, lang)}</Text>
            <Text style={{ color: C.red, fontWeight: '900', fontSize: 18 }}>{e.number}</Text>
          </Pressable>
        ))}
      </Panel>

      <Panel>
        <H size={17}>💱 {L.fx}</H>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {Object.keys(content.config.fxRates).map((k) => (
            <Chip key={k} label={k} active={cur === k} onPress={() => setCur(k)} color={C.green} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <TextInput
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            style={{ borderWidth: 2, borderColor: C.line, borderRadius: R.s, padding: 8, width: 100, fontSize: 16, backgroundColor: '#FFF' }}
          />
          <Text style={{ fontWeight: '800', color: C.ink }}>{cur} ≈</Text>
          <Text style={{ fontWeight: '900', color: C.green, fontSize: 18 }}>{won((parseFloat(amount) || 0) * rate)}</Text>
        </View>
        <P dim style={{ fontSize: 12, marginTop: 6 }}>
          {L.fxNote} ({content.config.fxUpdatedAt})
        </P>
      </Panel>

      <Btn kind="ghost" label={L.resetAll} onPress={() => resetProgress()} />
      <Btn kind="danger" label={L.signOut} onPress={() => signOut()} />
      <P dim style={{ textAlign: 'center', fontSize: 12 }}>Kotoventure – Korea Touring Game Adventure v1.0.0</P>
    </ScrollView>
  );
}
