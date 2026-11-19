import { ScrollView, Text, View } from 'react-native';
import { BACKGROUND_IDS, PROP_IDS } from '@kotoventure/shared';
import { Background } from '../art/backgrounds';
import { AVATARS, Kachi, PartyArt, SpeakerPortrait, Traveller } from '../art/Characters';
import { Logo, LogoMark } from '../art/Logo';
import { Prop } from '../art/props';
import { Banknote, Coin } from '../art/Money';
import { TmoneyCard } from '../art/TmoneyCard';

/** Dev/design review page: every illustration id. Open the web build with ?gallery */
export function ArtGallery() {
  const speakers = ['guide', 'local', 'staff', 'driver', 'police', 'doctor', 'pharmacist', 'elder', 'monk', 'haenyeo'] as const;
  return (
    <ScrollView contentContainerStyle={{ padding: 12, backgroundColor: '#FFF' }}>
      <Logo width={340} />
      {[1000, 5000, 10000, 50000].map((v) => (
        <View key={v} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
          <Banknote value={v} width={(360 * [136, 142, 148, 154][[1000, 5000, 10000, 50000].indexOf(v)]) / 154} />
        </View>
      ))}
      {[1000, 5000, 10000, 50000].map((v) => (
        <View key={'b' + v} style={{ marginBottom: 6 }}>
          <Banknote value={v} side="back" width={(360 * [136, 142, 148, 154][[1000, 5000, 10000, 50000].indexOf(v)]) / 154} />
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
        {[10, 50, 100, 500].map((v) => <Coin key={v} value={v} pxPerMm={3.2} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 6 }}>
        {[10, 50, 100, 500].map((v) => <Coin key={v} value={v} side="back" pxPerMm={3.2} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        <TmoneyCard width={170} />
        <TmoneyCard width={170} side="back" balance={8450} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <LogoMark size={96} />
        <Kachi size={96} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {AVATARS.map((a) => <Traveller key={a.id} a={a} size={60} />)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['solo', 'couple', 'friends', 'group'] as const).map((p) => <PartyArt key={p} party={p} lead={AVATARS[0]} size={170} />)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {speakers.map((s) => <SpeakerPortrait key={s} speaker={s} size={60} />)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {PROP_IDS.map((id) => (
          <View key={id} style={{ width: 96, alignItems: 'center', marginBottom: 6 }}>
            <Prop id={id} size={88} />
            <Text style={{ fontSize: 10 }}>{id}</Text>
          </View>
        ))}
      </View>
      {BACKGROUND_IDS.map((id) => (
        <View key={id} style={{ marginTop: 6 }}>
          <Background id={id} width={360} height={216} />
          <Text style={{ fontSize: 11 }}>{id}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
