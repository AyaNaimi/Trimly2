-- Stripe billing fields for Trimly Pro subscriptions

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_subscription_status text,
  add column if not exists stripe_price_id text,
  add column if not exists subscription_current_period_end timestamp with time zone;

create unique index if not exists idx_profiles_stripe_customer_id
  on public.profiles(stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists idx_profiles_stripe_subscription_id
  on public.profiles(stripe_subscription_id)
  where stripe_subscription_id is not null;

comment on column public.profiles.subscription_plan is
  'Trimly app plan resolved from Stripe, for example monthly or annual. Null means no active paid app plan.';
comment on column public.profiles.stripe_subscription_status is
  'Latest Stripe subscription status mirrored from webhooks or billing status sync.';

notify pgrst, 'reload schema';
