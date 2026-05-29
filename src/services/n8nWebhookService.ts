const N8N_WEBHOOK_BASE = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL || '';

export async function triggerSubscriptionDetected(params: {
  userId: string;
  userEmail: string;
  subscription: {
    name: string;
    amount: number;
    cycle: string;
    nextChargeDate?: string | null;
  };
}): Promise<void> {
  if (!N8N_WEBHOOK_BASE) return;
  try {
    await fetch(`${N8N_WEBHOOK_BASE}/subscription-detected`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'subscription_detected',
        timestamp: new Date().toISOString(),
        ...params,
      }),
    });
  } catch (e) {
    console.warn('[N8N] triggerSubscriptionDetected failed:', e);
  }
}

export async function triggerUpcomingCharge(params: {
  userId: string;
  userEmail: string;
  subscription: {
    name: string;
    amount: number;
    nextChargeDate: string;
    daysUntil: number;
  };
}): Promise<void> {
  if (!N8N_WEBHOOK_BASE) return;
  try {
    await fetch(`${N8N_WEBHOOK_BASE}/upcoming-charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'upcoming_charge',
        timestamp: new Date().toISOString(),
        ...params,
      }),
    });
  } catch (e) {
    console.warn('[N8N] triggerUpcomingCharge failed:', e);
  }
}

export async function triggerSubscriptionCancelled(params: {
  userId: string;
  subscription: { name: string; amount: number; cycle: string };
}): Promise<void> {
  if (!N8N_WEBHOOK_BASE) return;
  try {
    await fetch(`${N8N_WEBHOOK_BASE}/subscription-cancelled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'subscription_cancelled',
        timestamp: new Date().toISOString(),
        ...params,
      }),
    });
  } catch (e) {
    console.warn('[N8N] triggerSubscriptionCancelled failed:', e);
  }
}

export const isN8nConfigured = (): boolean => !!N8N_WEBHOOK_BASE;
