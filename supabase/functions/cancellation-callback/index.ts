import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-n8n-secret",
  "Content-Type": "application/json",
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: CORS_HEADERS });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    // Authenticate via shared secret
    const secret = req.headers.get("x-n8n-secret");
    const expectedSecret = Deno.env.get("N8N_CALLBACK_SECRET");
    if (!expectedSecret || secret !== expectedSecret) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const { subscriptionId, userId, status, trackingNumber, message } = body as {
      subscriptionId?: string;
      userId?: string;
      status?: string;
      trackingNumber?: string;
      message?: string;
    };

    if (!subscriptionId || !userId) {
      return jsonResponse({ error: "subscriptionId and userId are required." }, 400);
    }

    const validStatuses = ["pending", "processing", "sent", "delivered", "confirmed", "failed"];
    if (status && !validStatuses.includes(status)) {
      return jsonResponse({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const updates: Record<string, unknown> = {};
    if (status) updates.cancellation_status = status;
    if (trackingNumber) updates.cancellation_tracking_number = trackingNumber;

    const { error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("id", subscriptionId)
      .eq("user_id", userId);

    if (error) {
      console.error("cancellation-callback update error:", error);
      return jsonResponse({ error: error.message }, 500);
    }

    console.log(`[cancellation-callback] Updated subscription ${subscriptionId} to status=${status}, tracking=${trackingNumber || "none"}`);

    return jsonResponse({ ok: true, subscriptionId, status });
  } catch (err) {
    console.error("cancellation-callback error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Internal error." }, 500);
  }
});
