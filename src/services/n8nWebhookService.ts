const N8N_WEBHOOK_BASE = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL || '';

function buildWebhookUrl(path: string): string {
  if (!N8N_WEBHOOK_BASE) return '';

  const normalizedBase = N8N_WEBHOOK_BASE.replace(/\/$/, '');
  const normalizedPath = path.replace(/^\//, '');

  if (normalizedBase.endsWith(`/${normalizedPath}`)) {
    return normalizedBase;
  }

  return `${normalizedBase}/${normalizedPath}`;
}

async function postToWebhook(path: string, payload: Record<string, unknown>) {
  const url = buildWebhookUrl(path);
  if (!url) return null;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

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
    await postToWebhook('subscription-detected', {
      event: 'subscription_detected',
      timestamp: new Date().toISOString(),
      ...params,
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
    await postToWebhook('upcoming-charge', {
      event: 'upcoming_charge',
      timestamp: new Date().toISOString(),
      ...params,
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
    await postToWebhook('subscription-cancelled', {
      event: 'subscription_cancelled',
      timestamp: new Date().toISOString(),
      ...params,
    });
  } catch (e) {
    console.warn('[N8N] triggerSubscriptionCancelled failed:', e);
  }
}

export async function triggerCancellationRequest(params: {
  userId: string;
  userEmail: string;
  userName: string;
  userAddress?: {
    line1?: string;
    line2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  cancellationType: 'lre' | 'email' | 'web_guided';
  subscription: {
    id: string;
    name: string;
    amount: number;
    cycle: string;
    category?: string;
    provider?: string | null;
    sourceEmail?: string | null;
    sourceFrom?: string | null;
    supportEmail?: string | null;
    nextChargeDate?: string | null;
  };
  billing?: {
    nextChargeDate?: string | null;
    trialEndsAt?: string | null;
    daysUntilCharge?: number | null;
  };
  method?: {
    key?: string;
    title?: string;
    description?: string;
  };
  letterContent: string;
  callbackUrl?: string;
}): Promise<{ ok: boolean; message: string; data?: unknown }> {
  if (!N8N_WEBHOOK_BASE) {
    return { ok: false, message: 'N8N webhook URL not configured.' };
  }

  const callbackUrl =
    params.callbackUrl ||
    (process.env.EXPO_PUBLIC_SUPABASE_URL
      ? `${process.env.EXPO_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/functions/v1/cancellation-callback`
      : undefined);

  try {
    const response = await postToWebhook('subscription-cancellation', {
      event: 'cancellation_request',
      timestamp: new Date().toISOString(),
      ...params,
      callbackUrl,
    });

    if (!response) {
      return { ok: false, message: 'N8N webhook URL not configured.' };
    }

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return { ok: false, message: `Webhook returned ${response.status}`, data };
    }

    if (data && typeof data === 'object' && 'success' in data && (data as { success?: boolean }).success === false) {
      const message =
        typeof (data as { message?: unknown }).message === 'string'
          ? (data as { message: string }).message
          : 'Workflow returned an error.';
      return { ok: false, message, data };
    }

    return { ok: true, message: 'Cancellation request sent to n8n.', data };
  } catch (e) {
    console.warn('[N8N] triggerCancellationRequest failed:', e);
    return { ok: false, message: 'Network error reaching n8n.' };
  }
}

export const isN8nConfigured = (): boolean => !!N8N_WEBHOOK_BASE;
