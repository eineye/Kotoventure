-- ═══════════════════════════════════════════════════════════════════
-- TEST ACCOUNTS – for LOCAL development / a free test project only.
-- Never run this on production.
--   admin@example.com   / Admin1234!   (role = admin, for the admin web)
--   player@example.com  / Player1234!  (normal player, owns the base app)
-- ═══════════════════════════════════════════════════════════════════
create extension if not exists pgcrypto;

do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('11111111-1111-1111-1111-111111111111'::uuid, 'admin@example.com',  'Admin1234!',  '{"nickname":"Admin","country":"KR"}'),
      ('22222222-2222-2222-2222-222222222222'::uuid, 'player@example.com', 'Player1234!', '{"nickname":"TestPlayer","country":"AU","party_type":"couple"}')
    ) as t(id, email, pw, meta)
  loop
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                            confirmation_token, email_change, email_change_token_new, recovery_token)
    values ('00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
            crypt(u.pw, gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}', u.meta::jsonb, now(), now(), '', '', '', '')
    on conflict (id) do nothing;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now())
    on conflict do nothing;
  end loop;
end $$;

update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111';

insert into public.entitlements (user_id, product_id, source)
values ('22222222-2222-2222-2222-222222222222', 'app_base', 'test')
on conflict do nothing;
