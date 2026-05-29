import {
  CORS_HEADERS,
  findProfileByStripeCustomer,
  getPlanForPriceId,
  getSubscriptionBillingPayload,
  jsonResponse,
  normalizeBillingProfile,
  updateProfile,
  verifyStripeSignature,
  type StripeSubscription,
} from "../_shared/stripe.ts";

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  const payload = await req.text();

  try {
    await verifyStripeSignature(payload, req.headers.get("Stripe-Signature"));
  } catch (error) {
    console.error("stripe-webhook signature error:", error);
    return jsonResponse({ error: "Invalid Stripe signature." }, 400);
  }

  try {
    const event = JSON.parse(payload) as StripeEvent;

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChanged(event.data.object as unknown as StripeSubscription);
        break;
      default:
        break;
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error("stripe-webhook handler error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Webhook handler error." }, 500);
  }
});

async function handleCheckoutCompleted(session: Record<string, unknown>) {
  const metadata = (session.metadata || {}) as Record<string, string>;
  const userId = metadata.user_id || String(session.client_reference_id || "");
  const customerId = typeof session.customer === "string" ? session.customer : null;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
  const plan = metadata.plan || null;

  if (!userId) return;

  await updateProfile(userId, {
    ...normalizeBillingProfile({
      plan,
      status: session.payment_status === "paid" || subscriptionId ? "active" : "incomplete",
      customerId,
      subscriptionId,
    }),
  });
}

async function handleSubscriptionChanged(subscription: StripeSubscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
  const profile = customerId ? await findProfileByStripeCustomer(customerId) : null;
  const userId = subscription.metadata?.user_id || profile?.id;

  if (!userId) return;

  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const plan = getPlanForPriceId(priceId) || subscription.metadata?.plan || null;

  await updateProfile(userId, {
    ...getSubscriptionBillingPayload(
      {
        ...subscription,
        items: {
          data: [
            {
              price: { id: priceId || undefined },
            },
          ],
        },
        metadata: {
          ...subscription.metadata,
          plan: plan || "",
        },
      },
      customerId,
    ),
  });
}
