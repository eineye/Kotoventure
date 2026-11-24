/**
 * In-app update for the test APK: on start the app reads version.json from the
 * "android-latest" GitHub release (published by CI). When that build is newer than
 * this one, a banner offers to download the new APK and opens Android's installer.
 * Installing over the old app keeps all progress (same package and signing key).
 */
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, Platform, Pressable, View } from "react-native";
import { Text } from "./ui/Text";
import { C, R } from "./ui/theme";

const RELEASE =
  "https://github.com/eineye/Kotoventure/releases/download/android-latest";
export const APK_URL = `${RELEASE}/kotoventure.apk`;
export const CURRENT_BUILD = Number(process.env.EXPO_PUBLIC_BUILD_NUMBER) || 0;

type Latest = { build: number; commit?: string; date?: string };
type State = { latest?: Latest; checking: boolean; error?: boolean };

/** Fetch the newest published build number (undefined when offline or not published yet). */
async function fetchLatest(): Promise<Latest | undefined> {
  const res = await fetch(`${RELEASE}/version.json?t=${Date.now()}`, {
    cache: "no-store",
  });
  if (!res.ok) return undefined;
  const j = (await res.json()) as Latest;
  return typeof j.build === "number" ? j : undefined;
}

export function useLatestBuild() {
  const [s, setS] = useState<State>({ checking: false });
  const check = useCallback(async () => {
    setS((p) => ({ ...p, checking: true, error: false }));
    try {
      const latest = await fetchLatest();
      setS({ latest, checking: false, error: !latest });
    } catch {
      setS((p) => ({ ...p, checking: false, error: true }));
    }
  }, []);
  useEffect(() => {
    if (Platform.OS !== "android" || !CURRENT_BUILD) return;
    const first = setTimeout(check, 0);
    // check again whenever the app comes back to the foreground
    const sub = AppState.addEventListener(
      "change",
      (st) => st === "active" && check(),
    );
    return () => {
      clearTimeout(first);
      sub.remove();
    };
  }, [check]);
  const hasUpdate =
    !!s.latest && CURRENT_BUILD > 0 && s.latest.build > CURRENT_BUILD;
  return { ...s, hasUpdate, check };
}

/** Download the APK into the cache and hand it to the Android package installer. */
export async function installLatest(
  onProgress: (p: number) => void,
): Promise<void> {
  try {
    const FS = await import("expo-file-system/legacy");
    const IL = await import("expo-intent-launcher");
    const target = `${FS.cacheDirectory}kotoventure-update.apk`;
    await FS.deleteAsync(target, { idempotent: true });
    const dl = FS.createDownloadResumable(APK_URL, target, {}, (e) => {
      if (e.totalBytesExpectedToWrite > 0)
        onProgress(e.totalBytesWritten / e.totalBytesExpectedToWrite);
    });
    const r = await dl.downloadAsync();
    if (!r || r.status !== 200) throw new Error("download failed");
    const uri = await FS.getContentUriAsync(r.uri);
    await IL.startActivityAsync("android.intent.action.VIEW", {
      data: uri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: "application/vnd.android.package-archive",
    });
  } catch {
    // fall back to the browser download
    await Linking.openURL(APK_URL);
  }
}

const TXT = {
  en: {
    title: "New version available",
    build: "Build",
    update: "Update",
    downloading: "Downloading…",
    hint: 'Tap "Update" on the install screen. Your progress is kept.',
  },
  ko: {
    title: "새 버전이 있어요",
    build: "빌드",
    update: "업데이트",
    downloading: "다운로드 중…",
    hint: '설치 화면에서 "업데이트"를 누르세요. 진행 기록은 그대로 남아요.',
  },
};
export const updateText = (lang?: string) => (lang === "ko" ? TXT.ko : TXT.en);

/** Banner shown at the top of the home screen when a newer test build exists. */
export function UpdateBanner({ lang }: { lang?: string }) {
  const { hasUpdate, latest } = useLatestBuild();
  const [progress, setProgress] = useState<number | null>(null);
  const T = updateText(lang);
  if (!hasUpdate || !latest) return null;
  const busy = progress !== null && progress < 1;
  return (
    <View
      style={{
        margin: 12,
        marginBottom: 0,
        padding: 12,
        borderRadius: R.m,
        backgroundColor: C.navy,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 24 }}>🆕</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 15 }}>
          {T.title}
        </Text>
        <Text style={{ color: "#FFFC", fontSize: 12, marginTop: 2 }}>
          {T.build} #{CURRENT_BUILD} → #{latest.build}
          {progress !== null ? ` · ${Math.round(progress * 100)}%` : ""}
        </Text>
        {progress !== null && (
          <Text style={{ color: "#FFFC", fontSize: 11, marginTop: 2 }}>
            {T.hint}
          </Text>
        )}
      </View>
      <Pressable
        testID="update-now"
        disabled={busy}
        onPress={async () => {
          setProgress(0);
          await installLatest(setProgress);
          setProgress(1);
        }}
        style={{
          backgroundColor: busy ? "#FFF6" : C.red,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: R.s,
        }}
      >
        <Text style={{ color: "#FFF", fontWeight: "900" }}>
          {busy ? T.downloading : T.update}
        </Text>
      </Pressable>
    </View>
  );
}

/** "Check for updates" row for the Me tab (Android test builds only). */
export function UpdateCheck({ lang }: { lang?: string }) {
  const { hasUpdate, latest, checking, error, check } = useLatestBuild();
  const [progress, setProgress] = useState<number | null>(null);
  if (Platform.OS !== "android" || !CURRENT_BUILD) return null;
  const ko = lang === "ko";
  const pct = progress !== null ? ` · ${Math.round(progress * 100)}%` : "";
  // label and numbers stay separate text children so the label can be translated on its own
  const label = checking
    ? ko
      ? "확인 중…"
      : "Checking…"
    : hasUpdate && latest
      ? ko
        ? "새 빌드"
        : "New build"
      : error
        ? ko
          ? "확인할 수 없어요 (인터넷 연결 확인)"
          : "Could not check (check your connection)"
        : ko
          ? "최신 버전이에요"
          : "You have the latest version";
  const suffix =
    !checking && hasUpdate && latest ? ` #${latest.build}${pct}` : "";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 12,
        borderRadius: R.m,
        borderWidth: 2,
        borderColor: C.line,
        backgroundColor: "#FFF",
      }}
    >
      <Text style={{ flex: 1, fontWeight: "800", color: C.ink }}>
        {label}
        {suffix}
      </Text>
      <Pressable
        testID="update-check"
        disabled={checking || (progress !== null && progress < 1)}
        onPress={async () => {
          if (hasUpdate) {
            setProgress(0);
            await installLatest(setProgress);
            setProgress(1);
          } else check();
        }}
        style={{
          backgroundColor: hasUpdate ? C.red : C.navy,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: R.s,
        }}
      >
        <Text style={{ color: "#FFF", fontWeight: "900" }}>
          {hasUpdate
            ? ko
              ? "업데이트"
              : "Update"
            : ko
              ? "업데이트 확인"
              : "Check for updates"}
        </Text>
      </Pressable>
    </View>
  );
}
