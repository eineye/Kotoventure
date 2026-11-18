// Supabase Edge Function (Deno): grants entitlements when RevenueCat reports a purchase.
// Deploy:  supabase functions deploy revenuecat-webhook --no-verify-jwt
// Secrets: supabase secrets set REVENUECAT_WEBHOOK_SECRET=...   (same value as in RevenueCat → Integrations → Webhooks → Authorization header)
// The app must call Purchases.logIn(<supabase user id>) so app_user_id == profiles.id.
import { createClient } from 'npm:@supabase/supabase-js@2';

const GRANT = new Set(['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION']);
const REVOKE = new Set(['EXPIRATION', 'REFUND']);

Deno.serve(async (req) => {
  if (req.headers.get('Authorization') !== `Bearer ${Deno.env.get('REVENUECAT_WEBHOOK_SECRET')}`) {
    return new Response('unauthorized', { status: 401 });
  }
  const { event } = await req.json();
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const storeId: string = event.product_id;
  const { data: product } = await db
    .from('products')
    .select('id')
    .or(`ios_product_id.eq.${storeId},android_product_id.eq.${storeId}`)
    .maybeSingle();
  if (!product) return new Response(`unknown product ${storeId}`, { status: 200 });

  const userId: string = event.app_user_id;
  const source = event.environment === 'SANDBOX' ? 'test' : 'store';

  if (GRANT.has(event.type)) {
    await db.from('entitlements').upsert(
      { user_id: userId, product_id: product.id, source, store_tx_id: event.transaction_id },
      { onConflict: 'user_id,product_id' },
    );
  } else if (REVOKE.has(event.type)) {
    await db.from('entitlements').delete().eq('user_id', userId).eq('product_id', product.id);
  }
  return new Response('ok');
});
