import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Content-Type": "application/json",
};

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const ACTIVE_STRIPE_STATUSES = new Set(["active", "trialing", "past_due"]);

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface Profile {
  id: string;
  subscription_plan?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status?: string | null;
  stripe_price_id?: string | null;
  subscription_current_period_end?: string | null;
}

export function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: CORS_HEADERS });
}

export function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function getSupabaseAdmin() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

export async function getAuthenticatedUser(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Session utilisateur requise.");

  const supabase = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("Session Supabase invalide.");

  return data.user as AuthUser;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function findProfileByStripeCustomer(customerId: string): Promise<Profile | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export function getPriceIdForPlan(plan: string) {
  if (plan === "annual") return requireEnv("STRIPE_ANNUAL_PRICE_ID");
  if (plan === "monthly") return requireEnv("STRIPE_MONTHLY_PRICE_ID");
  throw new Error("Plan Stripe invalide.");
}

export function getPlanForPriceId(priceId: string | null | undefined) {
  if (!priceId) return null;
  if (priceId === Deno.env.get("STRIPE_MONTHLY_PRICE_ID")) return "monthly";
  if (priceId === Deno.env.get("STRIPE_ANNUAL_PRICE_ID")) return "annual";
  return null;
}

export function isActiveStripeStatus(status: string | null | undefined) {
  return ACTIVE_STRIPE_STATUSES.has(String(status || ""));
}

export function normalizeBillingProfile(input: {
  plan?: string | null;
  status?: string | null;
  priceId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  currentPeriodEnd?: number | string | null;
}) {
  const status = input.status || null;
  const activePlan = isActiveStripeStatus(status) ? input.plan || null : null;
  const currentPeriodEnd =
    typeof input.currentPeriodEnd === "number"
      ? new Date(input.currentPeriodEnd * 1000).toISOString()
      : input.currentPeriodEnd || null;

  return {
    subscription_plan: activePlan,
    stripe_customer_id: input.customerId || null,
    stripe_subscription_id: input.subscriptionId || null,
    stripe_subscription_status: status,
    stripe_price_id: input.priceId || null,
    subscription_current_period_end: currentPeriodEnd,
  };
}

export async function stripeRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    params?: Record<string, unknown>;
  } = {},
): Promise<T> {
  const method = options.method || "GET";
  const url = new URL(`${STRIPE_API_BASE}${path}`);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${requireEnv("STRIPE_SECRET_KEY")}`,
  };

  const init: RequestInit = { method, headers };

  if (method === "GET") {
    for (const [key, value] of Object.entries(flattenStripeParams(options.params || {}))) {
      url.searchParams.append(key, String(value));
    }
  } else {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = toFormBody(options.params || {});
  }

  const response = await fetch(url.toString(), init);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || `Stripe API error (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export async function getOrCreateCustomer(user: AuthUser, profile: Profile | null) {
  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const customer = await stripeRequest<{ id: string }>("/customers", {
    method: "POST",
    params: {
      email: user.email || undefined,
      name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
      metadata: { user_id: user.id },
    },
  });

  await updateProfile(user.id, { stripe_customer_id: customer.id });
  return customer.id;
}

export async function getLatestSubscriptionForCustomer(customerId: string) {
  const result = await stripeRequest<{ data: StripeSubscription[] }>("/subscriptions", {
    method: "GET",
    params: {
      customer: customerId,
      status: "all",
      limit: 10,
      expand: ["data.items.data.price"],
    },
  });

  return (result.data || []).sort((left, right) => {
    const leftActive = isActiveStripeStatus(left.status) ? 1 : 0;
    const rightActive = isActiveStripeStatus(right.status) ? 1 : 0;
    if (leftActive !== rightActive) return rightActive - leftActive;
    return (right.current_period_end || right.created || 0) - (left.current_period_end || left.created || 0);
  })[0] || null;
}

export function getSubscriptionBillingPayload(subscription: StripeSubscription | null, customerId?: string | null) {
  if (!subscription) {
    return normalizeBillingProfile({
      customerId: customerId || null,
      status: "none",
    });
  }

  const priceId = subscription.items?.data?.[0]?.price?.id || null;

  return normalizeBillingProfile({
    plan: getPlanForPriceId(priceId),
    status: subscription.status,
    priceId,
    customerId: typeof subscription.customer === "string" ? subscription.customer : customerId || null,
    subscriptionId: subscription.id,
    currentPeriodEnd: subscription.current_period_end,
  });
}

export async function verifyStripeSignature(payload: string, signatureHeader: string | null) {
  const secret = requireEnv("STRIPE_WEBHOOK_SECRET");
  if (!signatureHeader) throw new Error("Stripe-Signature header missing.");

  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, item) => {
    const [key, value] = item.split("=");
    if (!key || !value) return acc;
    acc[key] = acc[key] || [];
    acc[key].push(value);
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];
  if (!timestamp || !signatures.length) throw new Error("Invalid Stripe signature header.");

  const toleranceSeconds = Number(Deno.env.get("STRIPE_WEBHOOK_TOLERANCE_SECONDS") || 300);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > toleranceSeconds) {
    throw new Error("Stripe webhook timestamp outside tolerance.");
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const expected = bytesToHex(new Uint8Array(digest));

  if (!signatures.some((signature) => timingSafeEqual(expected, signature))) {
    throw new Error("Stripe signature verification failed.");
  }
}

function toFormBody(params: Record<string, unknown>) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(flattenStripeParams(params))) {
    if (value !== undefined && value !== null) body.append(key, String(value));
  }
  return body.toString();
}

function flattenStripeParams(params: Record<string, unknown>, prefix?: string) {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    const formKey = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          Object.assign(result, flattenStripeParams(item as Record<string, unknown>, `${formKey}[${index}]`));
        } else if (item !== undefined && item !== null) {
          result[`${formKey}[${index}]`] = item as string | number | boolean;
        }
      });
    } else if (typeof value === "object") {
      Object.assign(result, flattenStripeParams(value as Record<string, unknown>, formKey));
    } else {
      result[formKey] = value as string | number | boolean;
    }
  }

  return result;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_end?: number;
  created?: number;
  metadata?: Record<string, string>;
  items?: {
    data?: Array<{
      price?: {
        id?: string;
      };
    }>;
  };
}
