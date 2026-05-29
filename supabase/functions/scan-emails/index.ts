const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Content-Type': 'application/json',
};

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';
const GLOBAL_TIMEOUT_MS = 45_000;
const GROQ_RETRY_DELAY_MS = 2_000;
const MAX_MESSAGES = 600;
const MAX_MESSAGES_PER_QUERY = 180;
const DETAIL_BATCH_SIZE = 20;
const MAX_AI_EMAILS = 120;
const AI_CHUNK_SIZE = 6;

const GMAIL_QUERIES = [
  'in:anywhere newer_than:14d -in:chats',
  'in:anywhere newer_than:90d -in:chats',
  'newer_than:3y (invoice OR receipt OR billing OR subscription OR abonnement OR facturation OR renouvellement OR renewal OR "free trial" OR essai)',
  'newer_than:3y (category:purchases OR label:^smartlabel_receipt)',
  'newer_than:3y from:(noreply@netflix.com OR noreply@spotify.com OR no-reply@amazon.com OR billing@openai.com OR noreply@apple.com OR noreply@google.com OR billing@adobe.com OR notify@paypal.com)',
  'newer_than:3y (amount OR montant OR charged OR preleve OR prélevé) (€ OR EUR OR $ OR MAD)',
];

const EXCLUDED_EMAIL_PATTERN =
  /sign.?in|login|connexion|password|mot.de.passe|security.alert|verify|verification|otp|code.de.verification|welcome|bienvenue|newsletter|digest|unsubscribe|se.desabonner|account.access|workspace.invite|new.device|nouvel.appareil/i;

const KNOWN_SERVICE_PATTERN =
  /netflix|spotify|disney|amazon|prime|openai|chatgpt|apple|icloud|google|youtube|adobe|microsoft|office|dropbox|notion|nordvpn|canal|deezer|slack|zoom|paypal|playstation|xbox|nintendo/i;

const SUBJECT_SIGNAL_PATTERN =
  /invoice|receipt|billing|subscription|facture|abonnement|renouvellement|renewal|prelevement|prélèvement|charged|payment/i;

const AMOUNT_PATTERN = /(?:[€$£]\s*\d{1,4}(?:[.,]\d{1,2})?|\b\d{1,4}[.,]\d{2}\s*(?:€|\$|£|eur|usd|gbp|mad|dhs|dh)\b)/i;
const CYCLE_PATTERN = /monthly|annual|mensuel|annuel|weekly|quarterly|par mois|par an|per month|per year/i;
const RECURRING_PATTERN = /subscription|abonnement|renewal|renouvellement|renews|next billing|next charge|prochain paiement|prochain prélèvement|facturation|billing cycle|free trial|essai/i;

const SYSTEM_PROMPT = `Tu es un analyseur d'emails de facturation. Extrait UNIQUEMENT les abonnements avec preuve réelle de paiement, facturation, essai en cours ou renouvellement.

IGNORE absolument : emails de connexion, sécurité, vérification, bienvenue,
newsletters, notifications sans montant.

Pour chaque abonnement trouvé, retourne CE FORMAT JSON EXACT sans aucun texte autour :
{
  "subscriptions": [
    {
      "serviceName": "Netflix",
      "amount": 15.99,
      "regularAmount": 15.99,
      "billingFrequency": "monthly",
      "category": "Streaming",
      "startDate": "2024-01-15",
      "trialDays": 0,
      "trialEndsAt": null,
      "nextChargeDate": "2025-02-15",
      "nextChargeAmount": 15.99,
      "status": "active",
      "confidence": 0.95,
      "sourceSubject": "Votre facture Netflix - Janvier 2025",
      "sourceFrom": "noreply@netflix.com",
      "reviewStatus": "confirmed",
      "confidenceLabel": "Confirmé"
    }
  ]
}

reviewStatus doit être : confirmed (preuve facture/receipt), probable (indice fort), uncertain (possible)
confidence entre 0.0 et 1.0
billingFrequency : weekly | monthly | quarterly | annual
status : active | trial | inactive

Si aucun abonnement trouvé : {"subscriptions": []}`;

interface AuthUser {
  id: string;
  email?: string;
}

interface ScanRequest {
  accessToken?: string | null;
  refreshToken?: string | null;
  providerAccessToken?: string | null;
  providerRefreshToken?: string | null;
}

interface GmailProfile {
  emailAddress?: string;
  messagesTotal?: number;
  threadsTotal?: number;
  historyId?: string;
}

interface EmailForAnalysis {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  score: number;
}

interface DetectedSubscription {
  serviceName: string;
  amount?: number;
  regularAmount?: number;
  billingFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  category?: string;
  startDate?: string | null;
  trialDays?: number;
  trialEndsAt?: string | null;
  nextChargeDate?: string | null;
  nextChargeAmount?: number;
  status?: 'active' | 'trial' | 'inactive';
  confidence?: number;
  sourceSubject?: string;
  sourceFrom?: string;
  reviewStatus?: 'confirmed' | 'probable' | 'uncertain';
  confidenceLabel?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GLOBAL_TIMEOUT_MS);

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const authHeader = req.headers.get('Authorization') || '';
    const user = await validateSupabaseSession(authHeader, controller.signal);
    const body = (await req.json()) as ScanRequest;
    const inputAccessToken = body.accessToken || body.providerAccessToken || null;
    const inputRefreshToken = body.refreshToken || body.providerRefreshToken || null;

    if (!inputAccessToken && !inputRefreshToken) {
      return jsonResponse({ error: 'Google accessToken ou refreshToken requis.' }, 400);
    }

    const googleAccess = await ensureGoogleAccess({
      accessToken: inputAccessToken,
      refreshToken: inputRefreshToken,
      signal: controller.signal,
    });

    const gmailProfile = googleAccess.profile;
    const messageIds = await listMatchingMessageIds(googleAccess.accessToken, controller.signal);
    const detailIds = Array.from(messageIds).slice(0, MAX_MESSAGES);
    const emails = await fetchEmailDetails(detailIds, googleAccess.accessToken, controller.signal);
    const scoredEmails = emails
      .filter((email) => !isExcludedEmail(email))
      .map((email) => ({ ...email, score: scoreEmail(email) }))
      .filter((email) => email.score >= 3)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_AI_EMAILS);

    const aiResults = await analyzeWithGroq(scoredEmails, controller.signal);
    const subscriptions = mergeSubscriptions(aiResults.length ? aiResults : buildHeuristicSubscriptions(scoredEmails));

    return jsonResponse({
      subscriptions,
      emailCount: emails.length,
      matchedEmailCount: messageIds.size,
      analyzedCandidateCount: scoredEmails.length,
      debug: {
        groqConfigured: !!Deno.env.get('GROQ_API_KEY'),
        topScores: scoredEmails.slice(0, 5).map((email) => ({
          score: email.score,
          from: email.from,
          subject: email.subject,
        })),
      },
      connection: {
        email: gmailProfile.emailAddress || user.email || null,
        providerUserId: gmailProfile.emailAddress || user.id,
        accessToken: googleAccess.accessToken,
        refreshToken: inputRefreshToken,
        scopes: [GMAIL_SCOPE],
        source: googleAccess.source,
      },
    });
  } catch (error) {
    console.error('scan-emails error:', error);
    const message = error instanceof Error ? error.message : 'Erreur interne.';
    const status = message.includes('aborted') || message.includes('AbortError') ? 504 : 500;
    return jsonResponse({ error: message }, status);
  } finally {
    clearTimeout(timeout);
  }
});

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: CORS_HEADERS });
}

async function validateSupabaseSession(authHeader: string, signal: AbortSignal): Promise<AuthUser> {
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    throw new Error('Session Supabase requise.');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Secrets Supabase manquants.');
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Session Supabase invalide.');
  }

  return (await response.json()) as AuthUser;
}

async function ensureGoogleAccess({
  accessToken,
  refreshToken,
  signal,
}: {
  accessToken: string | null;
  refreshToken: string | null;
  signal: AbortSignal;
}) {
  let activeAccessToken = accessToken;
  let source: 'google-provider-token' | 'refreshed-token' = 'google-provider-token';

  if (!activeAccessToken && refreshToken) {
    activeAccessToken = await refreshGoogleAccessToken(refreshToken, signal);
    source = 'refreshed-token';
  }

  if (!activeAccessToken) {
    throw new Error('Aucun access token Google disponible.');
  }

  let profileResponse = await gmailFetch('/profile', activeAccessToken, signal);
  if (profileResponse.status === 401 && refreshToken) {
    activeAccessToken = await refreshGoogleAccessToken(refreshToken, signal);
    source = 'refreshed-token';
    profileResponse = await gmailFetch('/profile', activeAccessToken, signal);
  }

  if (!profileResponse.ok) {
    throw new Error(`Gmail API profile impossible: ${await profileResponse.text()}`);
  }

  return {
    accessToken: activeAccessToken,
    profile: (await profileResponse.json()) as GmailProfile,
    source,
  };
}

async function refreshGoogleAccessToken(refreshToken: string, signal: AbortSignal) {
  const clientId = Deno.env.get('GMAIL_CLIENT_ID') || Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

  if (!clientId) {
    throw new Error('GMAIL_CLIENT_ID requis pour rafraîchir le token Google.');
  }

  const tokenParams: Record<string, string> = {
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };

  if (clientSecret) {
    tokenParams.client_secret = clientSecret;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(tokenParams),
    signal,
  });

  const data = await response.json();
  if (!response.ok || !data?.access_token) {
    if (data?.error === 'invalid_request' && String(data?.error_description || '').includes('client_secret')) {
      throw new Error(
        "Google demande le GMAIL_CLIENT_SECRET du client OAuth Web utilisé par Supabase. Le client Android n'a pas de secret. Crée/ouvre un client OAuth 'Web application' dans Google Cloud, copie son Client Secret, puis configure Supabase avec: supabase secrets set GMAIL_CLIENT_SECRET=<secret>",
      );
    }

    throw new Error(data?.error_description || data?.error || 'Refresh token Google invalide.');
  }

  return String(data.access_token);
}

function gmailFetch(path: string, accessToken: string, signal: AbortSignal) {
  return fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });
}

async function listMatchingMessageIds(accessToken: string, signal: AbortSignal) {
  const responses = await Promise.all(GMAIL_QUERIES.map((query) => listMessageIdsForQuery(query, accessToken, signal)));

  const ids = new Set<string>();
  for (const messages of responses) {
    for (const message of messages) {
      if (message?.id) ids.add(String(message.id));
      if (ids.size >= MAX_MESSAGES) return ids;
    }
  }
  return ids;
}

async function listMessageIdsForQuery(query: string, accessToken: string, signal: AbortSignal) {
  const messages: any[] = [];
  let pageToken: string | undefined;

  while (messages.length < MAX_MESSAGES_PER_QUERY) {
    try {
      const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
      url.searchParams.set('q', query);
      url.searchParams.set('maxResults', String(Math.min(100, MAX_MESSAGES_PER_QUERY - messages.length)));
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      });

      if (!response.ok) {
        console.error('Gmail list failed:', query, await response.text());
        break;
      }

      const data = await response.json();
      const pageMessages = Array.isArray(data?.messages) ? data.messages : [];
      messages.push(...pageMessages);

      pageToken = data?.nextPageToken;
      if (!pageToken || pageMessages.length === 0) break;
    } catch (error) {
      console.error('Gmail query pagination failed:', query, error);
      break;
    }
  }

  return messages;
}

async function fetchEmailDetails(ids: string[], accessToken: string, signal: AbortSignal) {
  const emails: EmailForAnalysis[] = [];

  for (let index = 0; index < ids.length; index += DETAIL_BATCH_SIZE) {
    const batch = ids.slice(index, index + DETAIL_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((id) => fetchSingleEmailDetail(id, accessToken, signal)),
    );
    emails.push(...batchResults.filter(Boolean) as EmailForAnalysis[]);
  }

  return emails;
}

async function fetchSingleEmailDetail(id: string, accessToken: string, signal: AbortSignal) {
  try {
    const metadataUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`;
    const fullUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
    const [metadataResponse, fullResponse] = await Promise.all([
      fetch(metadataUrl, { headers: { Authorization: `Bearer ${accessToken}` }, signal }),
      fetch(fullUrl, { headers: { Authorization: `Bearer ${accessToken}` }, signal }),
    ]);

    if (!metadataResponse.ok || !fullResponse.ok) {
      console.error('Gmail detail failed:', id, metadataResponse.status, fullResponse.status);
      return null;
    }

    const metadata = await metadataResponse.json();
    const full = await fullResponse.json();
    const headers = metadata?.payload?.headers || full?.payload?.headers || [];

    return {
      id,
      from: getHeader(headers, 'From'),
      subject: getHeader(headers, 'Subject'),
      date: getHeader(headers, 'Date'),
      snippet: String(full?.snippet || '').slice(0, 700),
      body: sanitizeText(extractBody(full?.payload)).slice(0, 3000),
      score: 0,
    };
  } catch (error) {
    console.error('fetchSingleEmailDetail error:', id, error);
    return null;
  }
}

function getHeader(headers: any[], name: string) {
  return headers.find((header) => String(header?.name || '').toLowerCase() === name.toLowerCase())?.value || '';
}

function extractBody(node: any): string {
  if (!node) return '';
  if (node.body?.data && isReadableMime(node.mimeType)) {
    return decodeBase64Url(node.body.data);
  }
  if (Array.isArray(node.parts)) {
    return node.parts.map((part) => extractBody(part)).join(' ');
  }
  return '';
}

function isReadableMime(mimeType?: string) {
  if (!mimeType) return true;
  return mimeType.includes('text/plain') || mimeType.includes('text/html');
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return atob(normalized);
  } catch {
    return '';
  }
}

function sanitizeText(text: string) {
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function isExcludedEmail(email: EmailForAnalysis) {
  return EXCLUDED_EMAIL_PATTERN.test(`${email.from} ${email.subject} ${email.snippet} ${email.body}`);
}

function scoreEmail(email: EmailForAnalysis) {
  const subject = email.subject || '';
  const body = `${email.snippet} ${email.body}`;
  const allText = `${email.from} ${subject} ${body}`;
  let score = 0;

  if (SUBJECT_SIGNAL_PATTERN.test(subject)) score += 3;
  if (AMOUNT_PATTERN.test(body)) score += 2;
  if (containsFutureBillingDate(body)) score += 2;
  if (KNOWN_SERVICE_PATTERN.test(`${email.from} ${subject}`)) score += 2;
  if (CYCLE_PATTERN.test(allText)) score += 1;
  if (RECURRING_PATTERN.test(allText)) score += 1;

  return Math.min(10, score);
}

function containsFutureBillingDate(text: string) {
  const now = new Date();
  const isoMatches = text.match(/\b20\d{2}-\d{1,2}-\d{1,2}\b/g) || [];
  const slashMatches = text.match(/\b\d{1,2}[\/.-]\d{1,2}[\/.-]20\d{2}\b/g) || [];
  const keywordWindow = /(next charge|next billing|renewal|renouvellement|prochain paiement|facture le|charged on)[^.\n]{0,80}/gi;
  const keywordMatches = text.match(keywordWindow) || [];
  const candidates = [...isoMatches, ...slashMatches, ...keywordMatches.flatMap((item) => item.match(/\b(?:20\d{2}-\d{1,2}-\d{1,2}|\d{1,2}[\/.-]\d{1,2}[\/.-]20\d{2})\b/g) || [])];

  return candidates.some((candidate) => {
    const parsed = parseLooseDate(candidate);
    return parsed ? parsed > now : false;
  });
}

function parseLooseDate(value: string) {
  if (/^\d{4}-/.test(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = value.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2})/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

async function analyzeWithGroq(emails: EmailForAnalysis[], signal: AbortSignal) {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey || emails.length === 0) {
    if (!apiKey) console.error('GROQ_API_KEY missing; using heuristic fallback.');
    return [];
  }

  const subscriptions: DetectedSubscription[] = [];
  for (let index = 0; index < emails.length; index += AI_CHUNK_SIZE) {
    const chunk = emails.slice(index, index + AI_CHUNK_SIZE);
    const result = await callGroqChunk(chunk, apiKey, signal);
    subscriptions.push(...result);
  }
  return subscriptions;
}

function buildHeuristicSubscriptions(emails: EmailForAnalysis[]): DetectedSubscription[] {
  return emails
    .filter((email) => email.score >= 4 && AMOUNT_PATTERN.test(`${email.snippet} ${email.body}`))
    .map((email) => {
      const text = `${email.from} ${email.subject} ${email.snippet} ${email.body}`;
      const serviceName = inferKnownServiceName(text) || inferGenericServiceName(email);
      if (!serviceName || !RECURRING_PATTERN.test(text)) return null;

      const amount = extractAmount(text);
      if (!amount) return null;

      return {
        serviceName,
        amount,
        regularAmount: amount,
        billingFrequency: inferBillingFrequency(text),
        category: inferCategory(serviceName),
        startDate: normalizeDate(email.date) || new Date().toISOString().slice(0, 10),
        trialDays: /trial|essai/i.test(text) ? 7 : 0,
        trialEndsAt: null,
        nextChargeDate: null,
        nextChargeAmount: amount,
        status: /trial|essai/i.test(text) ? 'trial' : 'active',
        confidence: Math.min(0.78, 0.4 + email.score / 20),
        sourceSubject: email.subject,
        sourceFrom: email.from,
        reviewStatus: email.score >= 7 ? 'probable' : 'uncertain',
        confidenceLabel: email.score >= 7 ? 'Probable' : 'À vérifier',
      } as DetectedSubscription;
    })
    .filter(Boolean) as DetectedSubscription[];
}

function inferKnownServiceName(text: string) {
  const services = [
    ['Netflix', /netflix/i],
    ['Spotify', /spotify/i],
    ['Disney+', /disney/i],
    ['Amazon Prime', /amazon\s*prime|prime video/i],
    ['ChatGPT Plus', /chatgpt|openai/i],
    ['Apple iCloud+', /icloud|apple/i],
    ['Google One', /google one/i],
    ['YouTube Premium', /youtube premium/i],
    ['Adobe Creative Cloud', /adobe|creative cloud/i],
    ['Microsoft 365', /microsoft 365|office 365/i],
    ['Dropbox', /dropbox/i],
    ['Notion', /notion/i],
    ['NordVPN', /nordvpn/i],
    ['Canal+', /canal\+/i],
    ['Deezer', /deezer/i],
    ['Slack', /slack/i],
    ['Zoom', /zoom/i],
    ['PlayStation Plus', /playstation/i],
  ] as const;

  return services.find(([, pattern]) => pattern.test(text))?.[0] || '';
}

function inferGenericServiceName(email: EmailForAnalysis) {
  const subject = cleanServiceName(email.subject);
  const body = `${email.snippet} ${email.body}`;
  const bodyMatch =
    body.match(/(?:abonnement|subscription|facturation|billing|renewal|renouvellement)\s+(?:à|a|for|de|du|chez)?\s*([A-Z][A-Za-z0-9+&'. -]{2,40})/i) ||
    body.match(/([A-Z][A-Za-z0-9+&'. -]{2,40})\s+(?:premium|pro|plus|subscription|abonnement)/i);

  const fromMatch = email.from.match(/@([A-Za-z0-9-]{3,40})\./);
  const candidates = [
    subject,
    bodyMatch?.[1],
    fromMatch?.[1],
  ]
    .map((value) => cleanServiceName(value || ''))
    .filter(Boolean);

  return candidates.find((candidate) => !isWeakServiceName(candidate)) || '';
}

function cleanServiceName(value: string) {
  return String(value || '')
    .replace(/^(re|fw|fwd)\s*:\s*/i, '')
    .replace(/(votre|your|facture|invoice|receipt|recu|reçu|abonnement|subscription|payment|paiement|billing|facturation|renewal|renouvellement|confirmation|test)/gi, ' ')
    .replace(/[^A-Za-z0-9+&'. -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
}

function isWeakServiceName(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length < 3 ||
    /^(gmail|google|mail|email|support|team|account|compte|noreply|no reply|notification|notifications|client|service)$/i.test(normalized) ||
    /^\d/.test(normalized)
  );
}

function extractAmount(text: string) {
  const patterns = [
    /[€$£]\s*(\d{1,4}(?:[.,]\d{1,2})?)/i,
    /\b(\d{1,4}[.,]\d{2})\s*(?:€|\$|£|eur|usd|gbp|mad|dhs|dh)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const amount = Number.parseFloat(String(match[1]).replace(',', '.'));
    if (Number.isFinite(amount) && amount > 0 && amount < 5000) return amount;
  }

  return 0;
}

function inferBillingFrequency(text: string): 'weekly' | 'monthly' | 'quarterly' | 'annual' {
  if (/weekly|hebdo|per week|par semaine/i.test(text)) return 'weekly';
  if (/quarterly|trimestre/i.test(text)) return 'quarterly';
  if (/annual|annuel|yearly|per year|par an/i.test(text)) return 'annual';
  return 'monthly';
}

function inferCategory(serviceName: string) {
  if (/netflix|disney|youtube|canal|prime video/i.test(serviceName)) return 'Streaming';
  if (/spotify|deezer/i.test(serviceName)) return 'Musique';
  if (/chatgpt|openai/i.test(serviceName)) return 'IA';
  if (/icloud|google one|dropbox/i.test(serviceName)) return 'Cloud';
  if (/adobe|microsoft|notion|slack|zoom/i.test(serviceName)) return 'Productivite';
  if (/nordvpn/i.test(serviceName)) return 'Securite';
  return 'Autre';
}

async function callGroqChunk(chunk: EmailForAnalysis[], apiKey: string, signal: AbortSignal) {
  const userPrompt = chunk
    .map((email, index) => [
      `Email ${index + 1}`,
      `Score: ${email.score}`,
      `From: ${email.from}`,
      `Subject: ${email.subject}`,
      `Date: ${email.date}`,
      `Snippet: ${email.snippet}`,
      `Body: ${email.body}`,
    ].join('\n'))
    .join('\n\n---\n\n');

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.1,
        max_tokens: 1800,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal,
    });

    if (response.status === 429 && attempt === 0) {
      await delay(GROQ_RETRY_DELAY_MS);
      continue;
    }

    if (!response.ok) {
      console.error('Groq chunk failed:', response.status, await response.text());
      return [];
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return parseGroqSubscriptions(content);
  }

  return [];
}

function parseGroqSubscriptions(content: string) {
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed?.subscriptions) ? parsed.subscriptions : [];
  } catch (error) {
    console.error('Groq JSON parse failed:', error, content);
    return [];
  }
}

function mergeSubscriptions(items: DetectedSubscription[]) {
  const merged = new Map<string, DetectedSubscription>();

  for (const item of items) {
    const key = String(item?.serviceName || '').trim().toLowerCase();
    if (!key) continue;

    const normalized = normalizeSubscription(item);
    const existing = merged.get(key);
    if (!existing || Number(normalized.confidence || 0) > Number(existing.confidence || 0)) {
      merged.set(key, normalized);
    }
  }

  return Array.from(merged.values()).sort((left, right) => Number(right.confidence || 0) - Number(left.confidence || 0));
}

function normalizeSubscription(item: DetectedSubscription): DetectedSubscription {
  const amount = toAmount(item.amount);
  const confidence = Number(item.confidence);
  const reviewStatus = ['confirmed', 'probable', 'uncertain'].includes(String(item.reviewStatus))
    ? item.reviewStatus
    : confidence >= 0.85
      ? 'confirmed'
      : confidence >= 0.65
        ? 'probable'
        : 'uncertain';

  return {
    serviceName: String(item.serviceName || '').trim(),
    amount,
    regularAmount: toAmount(item.regularAmount ?? amount),
    billingFrequency: normalizeFrequency(item.billingFrequency),
    category: item.category || 'Autre',
    startDate: normalizeDate(item.startDate),
    trialDays: Number.isFinite(Number(item.trialDays)) ? Number(item.trialDays) : 0,
    trialEndsAt: normalizeDate(item.trialEndsAt),
    nextChargeDate: normalizeDate(item.nextChargeDate),
    nextChargeAmount: toAmount(item.nextChargeAmount ?? item.regularAmount ?? amount),
    status: normalizeStatus(item.status),
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0.5,
    sourceSubject: item.sourceSubject || '',
    sourceFrom: item.sourceFrom || '',
    reviewStatus,
    confidenceLabel: item.confidenceLabel || (reviewStatus === 'confirmed' ? 'Confirmé' : reviewStatus === 'probable' ? 'Probable' : 'À vérifier'),
  };
}

function normalizeFrequency(value: unknown): 'weekly' | 'monthly' | 'quarterly' | 'annual' {
  const lower = String(value || '').toLowerCase();
  if (lower === 'weekly') return 'weekly';
  if (lower === 'quarterly') return 'quarterly';
  if (lower === 'annual' || lower === 'yearly') return 'annual';
  return 'monthly';
}

function normalizeStatus(value: unknown): 'active' | 'trial' | 'inactive' {
  const lower = String(value || '').toLowerCase();
  if (lower === 'trial') return 'trial';
  if (lower === 'inactive') return 'inactive';
  return 'active';
}

function normalizeDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function toAmount(value: unknown) {
  const parsed = Number.parseFloat(String(value ?? 0).replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
