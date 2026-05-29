import {
  CORS_HEADERS,
  getAuthenticatedUser,
  getOrCreateCustomer,
  getPriceIdForPlan,
  getProfile,
  jsonResponse,
  stripeRequest,
} from "../_shared/stripe.ts";

interface CheckoutRequest {
  plan?: "monthly" | "annual";
  successUrl?: string;
  cancelUrl?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const user = await getAuthenticatedUser(req);
    const body = (await req.json().catch(() => ({}))) as CheckoutRequest;
    const plan = body.plan || "monthly";
    const priceId = getPriceIdForPlan(plan);
    const profile = await getProfile(user.id);
    const customerId = await getOrCreateCustomer(user, profile);

    const returnBase = body.successUrl || Deno.env.get("STRIPE_SUCCESS_URL") || "trimly://stripe-return";
    const cancelBase = body.cancelUrl || Deno.env.get("STRIPE_CANCEL_URL") || "trimly://stripe-return";
    const successUrl = appendQuery(returnBase, {
      checkout: "success",
      session_id: "{CHECKOUT_SESSION_ID}",
    });
    const cancelUrl = appendQuery(cancelBase, { checkout: "cancelled" });

    const session = await stripeRequest<{ id: string; url: string }>("/checkout/sessions", {
      method: "POST",
      params: {
        mode: "subscription",
        customer: customerId,
        client_reference_id: user.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        customer_update: {
          address: "auto",
          name: "auto",
        },
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          user_id: user.id,
          plan,
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan,
          },
        },
      },
    });

    return jsonResponse({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("stripe-checkout error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Erreur Stripe." }, 400);
  }
});

function appendQuery(baseUrl: string, params: Record<string, string>) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  const query = Object.entries(params)
    .map(([key, value]) => {
      const encodedValue = value === "{CHECKOUT_SESSION_ID}" ? value : encodeURIComponent(value);
      return `${encodeURIComponent(key)}=${encodedValue}`;
    })
    .join("&");
  return `${baseUrl}${separator}${query}`;
}
