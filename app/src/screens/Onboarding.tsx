import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { LangContext, Text } from "../ui/Text";
import {
  MONTH_NAMES,
  PARTY_TYPES,
  tr,
  type PartyType,
} from "@kotoventure/shared";
import {
  AVATARS,
  Kachi,
  PartyArt,
  Traveller,
  avatarById,
} from "../art/Characters";
import { useStore } from "../data/store";
import { t } from "../i18n";
import { Btn, Chip, H, P } from "../ui/kit";
import { C, R, shadow } from "../ui/theme";

/** Countries in A–Z order of their English name ("Other" last). */
const COUNTRIES: [code: string, flag: string, name: string][] = [
  ["AU", "🇦🇺", "Australia"],
  ["BR", "🇧🇷", "Brazil"],
  ["CA", "🇨🇦", "Canada"],
  ["CN", "🇨🇳", "China"],
  ["FR", "🇫🇷", "France"],
  ["DE", "🇩🇪", "Germany"],
  ["HK", "🇭🇰", "Hong Kong"],
  ["IN", "🇮🇳", "India"],
  ["ID", "🇮🇩", "Indonesia"],
  ["JP", "🇯🇵", "Japan"],
  ["MY", "🇲🇾", "Malaysia"],
  ["MN", "🇲🇳", "Mongolia"],
  ["NZ", "🇳🇿", "New Zealand"],
  ["PH", "🇵🇭", "Philippines"],
  ["RU", "🇷🇺", "Russia"],
  ["SG", "🇸🇬", "Singapore"],
  ["ES", "🇪🇸", "Spain"],
  ["TW", "🇹🇼", "Taiwan"],
  ["TH", "🇹🇭", "Thailand"],
  ["GB", "🇬🇧", "UK"],
  ["US", "🇺🇸", "USA"],
  ["VN", "🇻🇳", "Vietnam"],
];
COUNTRIES.sort((a, b) => a[2].localeCompare(b[2]));
COUNTRIES.push(["OT", "🌍", "Other"]);

/** Languages offered at the start. Only fully translated ones can be chosen; others are announced. */
const LANGUAGES: { id: string; label: string; sub: string; ready: boolean }[] =
  [
    { id: "en", label: "English", sub: "English", ready: true },
    { id: "ko", label: "한국어", sub: "Korean", ready: true },
    { id: "ja", label: "日本語", sub: "Japanese", ready: true },
    { id: "zh", label: "简体中文", sub: "Chinese (Simplified)", ready: true },
    {
      id: "zh-TW",
      label: "繁體中文",
      sub: "Chinese (Traditional)",
      ready: false,
    },
    { id: "vi", label: "Tiếng Việt", sub: "Vietnamese", ready: false },
    { id: "th", label: "ภาษาไทย", sub: "Thai", ready: false },
    { id: "id", label: "Bahasa Indonesia", sub: "Indonesian", ready: false },
    { id: "es", label: "Español", sub: "Spanish", ready: true },
    { id: "fr", label: "Français", sub: "French", ready: false },
    { id: "de", label: "Deutsch", sub: "German", ready: false },
  ];

/** Simplest signup: nickname + country → party type → character. No email or password. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { signUp } = useStore();
  const [step, setStep] = useState(-1);
  const [lang, setLang] = useState<"en" | "ko" | "ja" | "zh" | "es">("en");
  const [nickname, setNickname] = useState("");
  const [country, setCountry] = useState("AU");
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [party, setParty] = useState<PartyType>("solo");
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [busy, setBusy] = useState(false);
  const L = t(lang);
  const ko = lang === "ko";
  const lead = avatarById(avatar);

  const finish = async () => {
    setBusy(true);
    await signUp({
      nickname: nickname.trim() || (ko ? "여행자" : "Traveller"),
      country,
      party,
      avatar,
      lang,
      month,
    });
    setBusy(false);
    onDone();
  };

  return (
    <LangContext.Provider value={lang}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: C.paper }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 18 }}>
            {[-1, 0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i <= step ? C.red : C.line,
                }}
              />
            ))}
          </View>

          {step === -1 && (
            <View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Kachi size={72} />
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFF",
                    padding: 12,
                    borderRadius: R.m,
                    ...shadow,
                  }}
                >
                  <P>🌐 Choose your language · 언어를 선택하세요</P>
                </View>
              </View>
              <View style={{ gap: 8, marginTop: 18 }}>
                {LANGUAGES.map((l) => {
                  const active = l.ready && lang === l.id;
                  return (
                    <Pressable
                      key={l.id}
                      testID={`lang-${l.id}`}
                      disabled={!l.ready}
                      onPress={() =>
                        setLang(l.id as "en" | "ko" | "ja" | "zh" | "es")
                      }
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: active,
                        disabled: !l.ready,
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#FFF",
                        borderRadius: R.m,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderWidth: 3,
                        borderColor: active ? C.red : "transparent",
                        opacity: l.ready ? 1 : 0.45,
                        ...shadow,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontWeight: "900",
                            fontSize: 17,
                            color: C.ink,
                          }}
                        >
                          {l.label}
                        </Text>
                        <Text style={{ color: C.inkSoft, fontSize: 12 }}>
                          {l.sub}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontWeight: "900",
                          color: active ? C.red : C.inkSoft,
                        }}
                      >
                        {l.ready
                          ? active
                            ? "✓"
                            : ""
                          : "Coming soon · 준비 중"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <P dim style={{ fontSize: 12, marginTop: 10 }}>
                You can change the language later in the ‘Me’ tab. · 언어는
                나중에 ‘내 정보’ 탭에서 바꿀 수 있어요.
              </P>
              <Btn
                testID="lang-next"
                label={L.next}
                style={{ marginTop: 20 }}
                onPress={() => setStep(0)}
              />
            </View>
          )}

          {step === 0 && (
            <View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Kachi size={72} />
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFF",
                    padding: 12,
                    borderRadius: R.m,
                    ...shadow,
                  }}
                >
                  <P>
                    {ko
                      ? "안녕하세요! 저는 까치예요. 여행 가이드를 맡을게요. 어떻게 불러 드릴까요?"
                      : "Annyeong! I'm Kachi, your magpie guide. What should I call you?"}
                  </P>
                </View>
              </View>
              <H style={{ marginTop: 24 }}>{L.nickname}</H>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder={ko ? "예: 김여행" : "e.g. Aussie Kim"}
                maxLength={20}
                style={{
                  marginTop: 8,
                  backgroundColor: "#FFF",
                  borderRadius: R.m,
                  padding: 14,
                  fontSize: 17,
                  fontFamily: 'Pretendard-Regular',
                  borderWidth: 2,
                  borderColor: C.line,
                }}
                returnKeyType="next"
              />
              <H style={{ marginTop: 22 }}>{L.country}</H>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {COUNTRIES.map(([code, flag, name]) => (
                  <Chip
                    key={code}
                    testID={`country-${code}`}
                    label={`${flag} ${name}`}
                    active={country === code}
                    onPress={() => setCountry(code)}
                    color={C.blue}
                  />
                ))}
              </View>
              <H style={{ marginTop: 22 }}>
                {ko ? "언제 한국에 가나요?" : "When are you visiting Korea?"}
              </H>
              <P dim style={{ fontSize: 13, marginTop: 2 }}>
                {ko
                  ? "여행하는 달의 날씨·명절 카드를 미션에서 알려 드려요."
                  : "Missions will show the weather and holiday cards for your travel month."}
              </P>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {MONTH_NAMES.map((m, i) => (
                  <Chip
                    key={m.en}
                    testID={`month-${i + 1}`}
                    label={`${m.icon} ${ko ? m.ko : m.en.slice(0, 3)}`}
                    active={month === i + 1}
                    onPress={() => setMonth(i + 1)}
                    color={C.green}
                  />
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 28 }}>
                <Btn
                  label={L.back}
                  kind="ghost"
                  style={{ flex: 1 }}
                  onPress={() => setStep(-1)}
                />
                <Btn
                  label={L.next}
                  style={{ flex: 2 }}
                  onPress={() => setStep(1)}
                />
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <H>{L.whoTravels}</H>
              <P dim style={{ marginTop: 4 }}>
                {ko
                  ? "여행 스타일에 맞는 미션을 추천해 드려요."
                  : "We'll recommend missions that fit your travel style."}
              </P>
              <View style={{ gap: 12, marginTop: 16 }}>
                {PARTY_TYPES.map((pt) => {
                  const active = party === pt.id;
                  return (
                    <Pressable
                      key={pt.id}
                      onPress={() => setParty(pt.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#FFF",
                        borderRadius: R.l,
                        padding: 10,
                        borderWidth: 3,
                        borderColor: active ? C.red : "transparent",
                        ...shadow,
                      }}
                    >
                      <PartyArt party={pt.id} lead={lead} size={130} />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <H size={18}>
                          {tr(pt.name, lang)}{" "}
                          <Text style={{ color: C.inkSoft, fontSize: 14 }}>
                            · {tr(pt.name, ko ? "en" : "ko")}
                          </Text>
                        </H>
                        <P dim>{tr(pt.desc, lang)}</P>
                        <Text
                          style={{
                            color: C.inkSoft,
                            fontWeight: "800",
                            marginTop: 2,
                          }}
                        >
                          👥 {pt.size}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
                <Btn
                  label={L.back}
                  kind="ghost"
                  style={{ flex: 1 }}
                  onPress={() => setStep(0)}
                />
                <Btn
                  label={L.next}
                  style={{ flex: 2 }}
                  onPress={() => setStep(2)}
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <H>{L.pickCharacter}</H>
              <View style={{ alignItems: "center", marginVertical: 10 }}>
                <Traveller a={lead} size={120} wave />
                <H size={20}>{lead.name}</H>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {AVATARS.map((a) => (
                  <Pressable
                    key={a.id}
                    onPress={() => setAvatar(a.id)}
                    accessibilityRole="button"
                    accessibilityLabel={a.name}
                    style={{
                      backgroundColor: "#FFF",
                      borderRadius: R.m,
                      padding: 4,
                      borderWidth: 3,
                      borderColor: avatar === a.id ? C.red : "transparent",
                      ...shadow,
                    }}
                  >
                    <Traveller a={a} size={58} />
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
                <Btn
                  label={L.back}
                  kind="ghost"
                  style={{ flex: 1 }}
                  onPress={() => setStep(1)}
                />
                <Btn
                  label={busy ? "…" : L.letsGo}
                  style={{ flex: 2 }}
                  onPress={finish}
                  disabled={busy}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LangContext.Provider>
  );
}
