-- Explicit access dates for Trimly trial and Pro billing.
-- Keeps trial/pro state readable from Supabase instead of relying only on local app calculations.

alter table public.profiles
  add column if not exists trial_end_date timestamp with time zone,
  add column if not exists pro_started_at timestamp with time zone,
  add column if not exists pro_current_period_start timestamp with time zone,
  add column if not exists pro_current_period_end timestamp with time zone;

update public.profiles
set trial_end_date = coalesce(
  trial_end_date,
  trial_start_date + make_interval(days => coalesce(trial_duration_days, 14))
)
where trial_start_date is not null;

update public.profiles
set
  pro_current_period_end = coalesce(pro_current_period_end, subscription_current_period_end),
  pro_started_at = coalesce(
    pro_started_at,
    case when subscription_plan is not null then updated_at else null end
  ),
  pro_current_period_start = coalesce(
    pro_current_period_start,
    case when subscription_plan is not null then updated_at else null end
  )
where subscription_plan is not null
   or subscription_current_period_end is not null;

create or replace function public.set_profile_access_dates()
returns trigger as $$
begin
  if new.trial_start_date is not null and new.trial_duration_days is not null then
    if TG_OP = 'INSERT' and new.trial_end_date is null then
      new.trial_end_date := new.trial_start_date + make_interval(days => new.trial_duration_days);
    elsif TG_OP = 'UPDATE' and (
      new.trial_end_date is null
      or new.trial_start_date is distinct from old.trial_start_date
      or new.trial_duration_days is distinct from old.trial_duration_days
    ) then
      new.trial_end_date := new.trial_start_date + make_interval(days => new.trial_duration_days);
    end if;
  end if;

  if new.subscription_current_period_end is not null and new.pro_current_period_end is null then
    new.pro_current_period_end := new.subscription_current_period_end;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profile_access_dates_before_write on public.profiles;
create trigger set_profile_access_dates_before_write
  before insert or update on public.profiles
  for each row execute procedure public.set_profile_access_dates();

create index if not exists idx_profiles_trial_end_date
  on public.profiles(trial_end_date)
  where trial_end_date is not null;

create index if not exists idx_profiles_pro_current_period_end
  on public.profiles(pro_current_period_end)
  where pro_current_period_end is not null;

comment on column public.profiles.trial_end_date is
  'Explicit Trimly trial end timestamp. Defaults to trial_start_date + trial_duration_days.';
comment on column public.profiles.pro_started_at is
  'First known timestamp when the user obtained Trimly Pro access.';
comment on column public.profiles.pro_current_period_start is
  'Current Stripe billing period start mirrored for Trimly Pro.';
comment on column public.profiles.pro_current_period_end is
  'Current Stripe billing period end mirrored for Trimly Pro.';

notify pgrst, 'reload schema';
