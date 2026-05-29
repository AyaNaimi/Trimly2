# Stripe subscription setup

Trimly uses Stripe Checkout for new app subscriptions, Stripe Billing Portal for plan management, and a Supabase Edge Function webhook to mirror billing state into `public.profiles`.

## 1. Create Stripe prices

Create two recurring prices in Stripe:

- monthly Trimly Pro price
- annual Trimly Pro price

Keep the price IDs, for example `price_...`.

## 2. Apply the Supabase migration

Run the migration in `supabase/migrations/03_stripe_billing.sql` so `profiles` can store Stripe billing fields.

## 3. Configure Supabase Edge Function secrets

Set these secrets in Supabase:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_or_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_MONTHLY_PRICE_ID=price_...
supabase secrets set STRIPE_ANNUAL_PRICE_ID=price_...
```

Supabase also needs its usual function secrets:

```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Optional redirect overrides:

```bash
supabase secrets set STRIPE_SUCCESS_URL=trimly://stripe-return
supabase secrets set STRIPE_CANCEL_URL=trimly://stripe-return
supabase secrets set STRIPE_PORTAL_RETURN_URL=trimly://stripe-return?portal=1
```

## 4. Deploy functions

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-portal
supabase functions deploy stripe-billing-status
supabase functions deploy stripe-webhook
```

## 5. Configure the Stripe webhook

Create a Stripe webhook endpoint pointing to:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

Subscribe to these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`.

## 6. App redirect

The app uses `trimly://stripe-return` by default. To override it at build time:

```bash
EXPO_PUBLIC_STRIPE_RETURN_URL=trimly://stripe-return
```
