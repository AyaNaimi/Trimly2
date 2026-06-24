import {
  CORS_HEADERS,
  getAuthenticatedUser,
  getLatestSubscriptionForCustomer,
  getProfile,
  getSubscriptionBillingPayload,
  jsonResponse,
  updateProfile,
} from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const user = await getAuthenticatedUser(req);
    const profile = await getProfile(user.id);

    if (!profile?.stripe_customer_id) {
      return jsonResponse({
      plan: null,
      status: "none",
      currentPeriodEnd: null,
      proStartedAt: null,
      proCurrentPeriodStart: null,
      proCurrentPeriodEnd: null,
      trialEndDate: profile?.trial_end_date || null,
      stripeCustomerId: null,
    });
    }

    const subscription = await getLatestSubscriptionForCustomer(profile.stripe_customer_id);
    const updates = getSubscriptionBillingPayload(subscription, profile.stripe_customer_id);
    const updatedProfile = await updateProfile(user.id, updates);

    return jsonResponse({
      plan: updatedProfile.subscription_plan || null,
      status: updatedProfile.stripe_subscription_status || "none",
      currentPeriodEnd: updatedProfile.subscription_current_period_end || null,
      proStartedAt: updatedProfile.pro_started_at || null,
      proCurrentPeriodStart: updatedProfile.pro_current_period_start || null,
      proCurrentPeriodEnd: updatedProfile.pro_current_period_end || null,
      trialEndDate: updatedProfile.trial_end_date || null,
      stripeCustomerId: updatedProfile.stripe_customer_id || null,
      stripeSubscriptionId: updatedProfile.stripe_subscription_id || null,
      stripePriceId: updatedProfile.stripe_price_id || null,
    });
  } catch (error) {
    console.error("stripe-billing-status error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Erreur statut Stripe." }, 400);
  }
});
