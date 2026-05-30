-- Cancellation tracking for n8n automation

-- Add cancellation tracking to subscriptions
alter table public.subscriptions
  add column if not exists cancellation_status text check (cancellation_status in ('pending', 'processing', 'sent', 'delivered', 'confirmed', 'failed')),
  add column if not exists cancellation_method text check (cancellation_method in ('lre', 'email', 'web_guided', 'manual')),
  add column if not exists cancellation_tracking_number text,
  add column if not exists cancellation_requested_at timestamp with time zone,
  add column if not exists cancellation_letter text;

-- Add user postal address to profiles (required for LRE/LRAR)
alter table public.profiles
  add column if not exists name text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists postal_code text,
  add column if not exists city text,
  add column if not exists country text default 'FR';

-- Index for querying pending cancellations
create index if not exists idx_subscriptions_cancellation_status
  on public.subscriptions(cancellation_status)
  where cancellation_status is not null;

comment on column public.subscriptions.cancellation_status is
  'Status of automated cancellation: pending -> processing -> sent -> delivered -> confirmed. Null means no automated cancellation requested.';

notify pgrst, 'reload schema';
