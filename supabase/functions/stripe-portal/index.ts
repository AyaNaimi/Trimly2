import {
  CORS_HEADERS,
  getAuthenticatedUser,
  getOrCreateCustomer,
  getProfile,
  jsonResponse,
  stripeRequest,
} from "../_shared/stripe.ts";

interface PortalRequest {
  returnUrl?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const user = await getAuthenticatedUser(req);
    const body = (await req.json().catch(() => ({}))) as PortalRequest;
    const profile = await getProfile(user.id);
    const customerId = await getOrCreateCustomer(user, profile);

    const session = await stripeRequest<{ id: string; url: string }>("/billing_portal/sessions", {
      method: "POST",
      params: {
        customer: customerId,
        return_url: body.returnUrl || Deno.env.get("STRIPE_PORTAL_RETURN_URL") || "trimly://stripe-return?portal=1",
      },
    });

    return jsonResponse({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("stripe-portal error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Erreur portail Stripe." }, 400);
  }
});
