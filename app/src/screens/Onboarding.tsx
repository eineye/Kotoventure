import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { PARTY_TYPES, tr, type PartyType } from '@kotoventure/shared';
import { AVATARS, Kachi, PartyArt, Traveller, avatarById } from '../art/Characters';
import { useStore } from '../data/store';
import { t } from '../i18n';
import { Btn, Chip, H, P } from '../ui/kit';
import { C, R, shadow } from '../ui/theme';

const COUNTRIES = [
  ['AU', '🇦🇺 Australia'], ['US', '🇺🇸 USA'], ['JP', '🇯🇵 Japan'], ['CN', '🇨🇳 China'], ['TW', '🇹🇼 Taiwan'],
  ['VN', '🇻🇳 Vietnam'], ['TH', '🇹🇭 Thailand'], ['PH', '🇵🇭 Philippines'], ['SG', '🇸🇬 Singapore'], ['IN', '🇮🇳 India'],
  ['GB', '🇬🇧 UK'], ['DE', '🇩🇪 Germany'], ['FR', '🇫🇷 France'], ['CA', '🇨🇦 Canada'], ['BR', '🇧🇷 Brazil'], ['OT', '🌍 Other'],
] as const;

/** Simplest signup: nickname + country → party type → character. No email or password. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { signUp } = useStore();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('AU');
  const [party, setParty] = useState<PartyType>('solo');
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [busy, setBusy] = useState(false);
  const L = t('en');
  const lead = avatarById(avatar);

  const finish = async () => {
    setBusy(true);
    await signUp({ nickname: nickname.trim() || 'Traveller', country, party, avatar });
    setBusy(false);
    onDone();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 18 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i <= step ? C.red : C.line }} />
          ))}
        </View>

        {step === 0 && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Kachi size={72} />
              <View style={{ flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: R.m, ...shadow }}>
                <P>Annyeong! I&apos;m Kachi, your magpie guide. What should I call you?</P>
              </View>
            </View>
            <H style={{ marginTop: 24 }}>{L.nickname}</H>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g. Aussie Kim"
              maxLength={20}
              style={{ marginTop: 8, backgroundColor: '#FFF', borderRadius: R.m, padding: 14, fontSize: 17, borderWidth: 2, borderColor: C.line }}
              returnKeyType="next"
            />
            <H style={{ marginTop: 22 }}>{L.country}</H>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {COUNTRIES.map(([code, label]) => (
                <Chip key={code} label={label} active={country === code} onPress={() => setCountry(code)} color={C.blue} />
              ))}
            </View>
            <Btn label={L.next} style={{ marginTop: 28 }} onPress={() => setStep(1)} />
          </View>
        )}

        {step === 1 && (
          <View>
            <H>{L.whoTravels}</H>
            <P dim style={{ marginTop: 4 }}>We&apos;ll recommend missions that fit your travel style.</P>
            <View style={{ gap: 12, marginTop: 16 }}>
              {PARTY_TYPES.map((pt) => {
                const active = party === pt.id;
                return (
                  <Pressable
                    key={pt.id}
                    onPress={() => setParty(pt.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: R.l, padding: 10, borderWidth: 3, borderColor: active ? C.red : 'transparent', ...shadow }}
                  >
                    <PartyArt party={pt.id} lead={lead} size={130} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <H size={18}>
                        {tr(pt.name, 'en')} <Text style={{ color: C.inkSoft, fontSize: 14 }}>· {tr(pt.name, 'ko')}</Text>
                      </H>
                      <P dim>{tr(pt.desc, 'en')}</P>
                      <Text style={{ color: C.inkSoft, fontWeight: '800', marginTop: 2 }}>👥 {pt.size}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
              <Btn label={L.back} kind="ghost" style={{ flex: 1 }} onPress={() => setStep(0)} />
              <Btn label={L.next} style={{ flex: 2 }} onPress={() => setStep(2)} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <H>{L.pickCharacter}</H>
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <Traveller a={lead} size={120} wave />
              <H size={20}>{lead.name}</H>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              {AVATARS.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setAvatar(a.id)}
                  accessibilityRole="button"
                  accessibilityLabel={a.name}
                  style={{ backgroundColor: '#FFF', borderRadius: R.m, padding: 4, borderWidth: 3, borderColor: avatar === a.id ? C.red : 'transparent', ...shadow }}
                >
                  <Traveller a={a} size={58} />
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
              <Btn label={L.back} kind="ghost" style={{ flex: 1 }} onPress={() => setStep(1)} />
              <Btn label={busy ? '…' : L.letsGo} style={{ flex: 2 }} onPress={finish} disabled={busy} />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
