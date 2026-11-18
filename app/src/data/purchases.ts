import { Alert, Platform } from 'react-native';
import type { Product } from '@kotoventure/shared';

/**
 * In-app purchase gateway.
 *
 * - The base game is a PAID APP ($0.99): no IAP needed, the price is set in App Store Connect / Play Console.
 * - Future mission packs are sold as IAP (non-consumable). Production integration:
 *     npx expo install react-native-purchases   (RevenueCat, free tier; needs an EAS dev build)
 *     Purchases.configure({ apiKey }); Purchases.logIn(supabaseUserId); Purchases.purchaseStoreProduct(...)
 *   The RevenueCat webhook (supabase/functions/revenuecat-webhook) then writes the entitlement to the DB.
 * - In development / demo mode this MOCK store is used: it asks for confirmation and grants locally,
 *   like an App Store sandbox / Google Play license-tester account would.
 */
export async function buyProduct(p: Product): Promise<boolean> {
  const storeId = Platform.OS === 'ios' ? p.iosProductId : p.androidProductId;
  const msg = `[TEST STORE] Buy "${p.title.en}" for $${p.priceUsd.toFixed(2)}?\n(${storeId})`;
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.confirm(msg) : false;
  }
  return new Promise((resolve) =>
    Alert.alert('Test purchase', msg, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Buy (sandbox)', onPress: () => resolve(true) },
    ]),
  );
}
