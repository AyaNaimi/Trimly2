-- Contact metadata captured from subscription detection emails.

alter table public.subscriptions
  add column if not exists provider text,
  add column if not exists source_email text,
  add column if not exists source_from text,
  add column if not exists support_email text;

comment on column public.subscriptions.source_email is
  'Mailbox scanned to detect this subscription.';

comment on column public.subscriptions.source_from is
  'Original From header of the email that detected this subscription.';

comment on column public.subscriptions.support_email is
  'Best extracted recipient email for cancellation requests.';

notify pgrst, 'reload schema';
