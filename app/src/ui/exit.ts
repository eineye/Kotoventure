import { Alert, BackHandler } from 'react-native';
import { translateText } from '@kotoventure/shared';

/** Ask before leaving the app (Android back button on the first screen, or "Exit app" in the Me tab). */
export function confirmExit(lang?: string) {
  const t = (en: string, ko: string) => (lang === 'ko' ? ko : lang && lang !== 'en' ? translateText(en, lang) : en);
  Alert.alert(t('Exit app', '앱 종료'), t('Do you want to close the app?', '앱을 종료할까요?'), [
    { text: t('No', '아니오'), style: 'cancel' },
    { text: t('Yes', '예'), onPress: () => BackHandler.exitApp() },
  ]);
}
