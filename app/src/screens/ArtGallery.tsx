import { ScrollView, View } from 'react-native';
import { Text } from '../ui/Text';
import { BACKGROUND_IDS, PROP_IDS } from '@kotoventure/shared';
import { Background } from '../art/backgrounds';
import { AVATARS, Kachi, PartyArt, SpeakerPortrait, Traveller } from '../art/Characters';
import { Logo, LogoMark } from '../art/Logo';
import { Prop } from '../art/props';
import { Banknote, Coin } from '../art/Money';
import { TmoneyCard } from '../art/TmoneyCard';
import { SubwayMap } from '../sim/SubwayMap';
import { BusMap } from '../sim/BusMap';

/** Dev/design review page: every illustration id. Open the web build with ?gallery */
export function ArtGallery() {
  const speakers = ['guide', 'local', 'staff', 'driver', 'police', 'doctor', 'pharmacist', 'elder', 'monk', 'haenyeo'] as const;
  return (
    <ScrollView contentContainerStyle={{ padding: 12, backgroundColor: '#FFF' }}>
      {(
        [
          ['01A', 'yellow', ['명동역 Myeongdong Stn.', '남산케이블카 Cable Car', '국립극장 National Theater', '남산서울타워 N Seoul Tower']],
          ['2016', 'green', ['성수역 Seongsu Stn.', '뚝섬역 Ttukseom Stn.', '서울숲 Seoul Forest']],
          ['사하1-1', 'green', ['토성역 Toseong Stn.', '부산대병원 PNU Hospital', '감정초등학교 Gamjeong Elem.', '감천문화마을 Gamcheon Village']],
          ['12', 'green', ['불국사 Bulguksa', '불국사 주차장 Bulguksa Parking', '토함산 고개 Tohamsan Pass', '석굴암 Seokguram']],
          ['7', 'green', ['속초 시내 Sokcho', '물치 Mulchi', '설악동 Seorak-dong', '설악산 소공원 Seoraksan Park']],
          ['246', 'blue', ['안동역 Andong Stn.', '병산 Byeongsan', '하회 입구 Hahoe Gate', '하회마을 Hahoe Village']],
        ] as const
      ).map(([no, c, st], i) => (
        <View key={no} testID={`gal-bus-${i}`} style={{ marginBottom: 10, alignSelf: 'flex-start' }}>
          <BusMap stops={[...st]} color={c} busNo={no} target={st[st.length - 1]} pos={i % 2 ? 1 : undefined} width={360} />
        </View>
      ))}
      {(['seoul', 'busan', 'incheon'] as const).map((n) => (
        <View key={n} testID={`gal-subway-${n}`} style={{ marginBottom: 10, alignSelf: 'flex-start' }}>
          <SubwayMap net={n} width={360} state={{ path: [], cur: '', goal: '', near: new Set() }} />
        </View>
      ))}
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
