import { annualEquivalent, formatDateFull, monthlyEquivalent } from '../utils/dateUtils';

const CANCELLATION_WEBHOOK_URL = process.env.EXPO_PUBLIC_CANCELLATION_WEBHOOK_URL || '';

export const CANCELLATION_METHODS = [
  {
    key: 'direct',
    title: 'Compte du service',
    tag: 'Recommande',
    actionLabel: 'Ouvrir la recherche',
    description: "Connectez-vous au site officiel, puis cherchez Billing, Plan, Account ou Manage subscription.",
    steps: [
      'Ouvrir le compte officiel du service.',
      'Aller dans Billing, Plan, Account ou Manage subscription.',
      'Cliquer sur Cancel, End plan ou Turn off auto-renew.',
      'Garder la confirmation par email ou capture.',
    ],
  },
  {
    key: 'app_store',
    title: 'Apple App Store',
    tag: 'iPhone',
    actionLabel: 'Ouvrir Apple',
    url: 'https://support.apple.com/en-us/118428',
    description: 'Pour les abonnements factures par Apple ou achetes dans une app iOS.',
    steps: [
      'Ouvrir Reglages sur iPhone ou iPad.',
      'Toucher votre nom, puis Abonnements.',
      'Choisir le service, puis Annuler l abonnement.',
      'Si rien ne s affiche, chercher le recu Apple dans vos emails.',
    ],
  },
  {
    key: 'google_play',
    title: 'Google Play',
    tag: 'Android',
    actionLabel: 'Ouvrir Google Play',
    url: 'https://play.google.com/store/account/subscriptions',
    description: 'Pour les abonnements achetes via Android ou Google Play.',
    steps: [
      'Ouvrir Google Play avec le bon compte Google.',
      'Aller dans Payments and subscriptions, puis Subscriptions.',
      'Selectionner le service et toucher Cancel subscription.',
      'Ne pas se contenter de desinstaller l app.',
    ],
  },
  {
    key: 'amazon',
    title: 'Amazon',
    tag: 'Prime',
    actionLabel: 'Ouvrir Amazon',
    url: 'https://www.amazon.com/amazonprime',
    description: 'Pour Prime, Prime Video, Kindle, Audible ou abonnements geres par Amazon.',
    steps: [
      'Ouvrir Amazon, puis Prime Membership ou Memberships and Subscriptions.',
      'Choisir Manage Membership ou Manage Subscription.',
      'Selectionner End Membership, End Subscription ou turn off auto-renew.',
      'Verifier que les sous-abonnements Prime Video Channels sont aussi arretes.',
    ],
  },
  {
    key: 'roku',
    title: 'Roku',
    tag: 'TV',
    actionLabel: 'Ouvrir Roku',
    url: 'https://my.roku.com/subscriptions',
    description: 'Pour les services factures par Roku.',
    steps: [
      'Se connecter a my.roku.com.',
      'Ouvrir Manage your subscriptions.',
      'Selectionner le service, puis Turn off auto-renew.',
      "Si l option n existe pas, l abonnement est probablement facture par le fournisseur direct.",
    ],
  },
  {
    key: 'paypal',
    title: 'PayPal',
    tag: 'Paiement',
    actionLabel: 'Ouvrir PayPal',
    url: 'https://www.paypal.com/myaccount/autopay/',
    description: 'Pour couper un paiement automatique ou pre-approuve PayPal.',
    steps: [
      'Ouvrir PayPal, puis Automatic payments.',
      'Selectionner le marchand.',
      'Cliquer sur Cancel ou Remove PayPal as payment method.',
      'Resilier aussi le contrat chez le service si necessaire.',
    ],
  },
  {
    key: 'email_letter',
    title: 'Email ou lettre',
    tag: 'Preuve',
    actionLabel: 'Partager la lettre',
    description: 'Utile pour salles de sport, telecom, journaux, assurances et services B2B.',
    steps: [
      'Envoyer une demande ecrite avec nom, email, ID client et service.',
      'Demander la date effective et la confirmation de resiliation.',
      'Conserver la preuve d envoi et la reponse.',
      'Relancer apres 48 a 72h sans confirmation.',
    ],
  },
  {
    key: 'phone_chat',
    title: 'Telephone ou chat',
    tag: 'Support',
    actionLabel: 'Preparer le script',
    description: 'Souvent utilise quand le bouton de resiliation est cache ou absent.',
    steps: [
      'Dire clairement: je veux resilier et arreter les prelevements.',
      'Refuser les offres de retention si vous etes decide.',
      'Demander un numero de dossier ou une confirmation par email.',
      'Faire une capture du chat ou noter date, heure et agent.',
    ],
  },
  {
    key: 'bank_stop',
    title: 'Banque / carte',
    tag: 'Dernier recours',
    actionLabel: 'Preparer le dossier',
    description: 'A utiliser si le service continue de facturer apres votre demande.',
    steps: [
      'Envoyer d abord une demande de resiliation au service.',
      'Contacter la banque pour revoquer l autorisation ou contester la charge.',
      'Demander une opposition au prelevement recurrent si besoin.',
      'Continuer a conserver les preuves, car bloquer le paiement ne resilie pas toujours le contrat.',
    ],
  },
];

export function getCancellationWorkflow(sub = {}) {
  const lower = `${sub.name || ''} ${sub.category || ''} ${sub.provider || ''}`.toLowerCase();
  const preferred = [];

  if (/apple|icloud|app store|ios/.test(lower)) preferred.push('app_store');
  if (/google|android|play/.test(lower)) preferred.push('google_play');
  if (/amazon|prime|audible|kindle/.test(lower)) preferred.push('amazon');
  if (/roku/.test(lower)) preferred.push('roku');
  if (/paypal/.test(lower)) preferred.push('paypal');

  if (!preferred.length) preferred.push('direct');

  const orderedKeys = [
    ...preferred,
    'direct',
    'app_store',
    'google_play',
    'amazon',
    'roku',
    'paypal',
    'email_letter',
    'phone_chat',
    'bank_stop',
  ];

  const seen = new Set();
  return orderedKeys
    .filter((key) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((key, index) => ({
      ...CANCELLATION_METHODS.find((method) => method.key === key),
      recommended: index === 0,
    }))
    .filter(Boolean);
}

export function getMethodOpenUrl(method, sub = {}) {
  if (method.url) return method.url;

  if (method.key === 'direct') {
    return `https://www.google.com/search?q=${encodeURIComponent(`${sub.name || 'subscription'} cancel subscription official`)}`;
  }

  return null;
}

export function buildCancellationLetter({ sub, billing, currency, userName }) {
  if (!sub) return '';

  const name = userName || 'Client Trimly';
  const today = formatSafeDate(new Date());
  const nextDate = formatSafeDate(billing?.isTrial ? billing.trialEndsAt : billing?.nextChargeDate);
  const amount = formatMoney(sub.amount, currency);
  const cycle = cycleLabel(sub.cycle);

  return [
    `${name}`,
    '',
    `Objet : Demande de résiliation de l'abonnement ${sub.name}`,
    '',
    'Madame, Monsieur,',
    '',
    `Je vous demande de résilier mon abonnement ${sub.name} à compter de la réception de cette demande.`,
    `Cet abonnement est actuellement facturé ${amount} selon une fréquence ${cycle}. La prochaine échéance estimée est le ${nextDate}.`,
    '',
    "Merci de me confirmer par retour écrit la date effective de résiliation et l'arrêt de tout prélèvement futur.",
    '',
    `Fait le ${today}.`,
    '',
    'Cordialement,',
    name,
  ].join('\n');
}

export function buildSupportScript({ sub, billing, currency }) {
  const nextDate = formatSafeDate(billing?.isTrial ? billing.trialEndsAt : billing?.nextChargeDate);
  return [
    `Bonjour, je souhaite résilier mon abonnement ${sub.name}.`,
    `Merci d'arrêter le renouvellement automatique et tout prélèvement futur.`,
    `La prochaine échéance estimée est le ${nextDate}, pour ${formatMoney(sub.amount, currency)}.`,
    'Pouvez-vous me confirmer la date effective de résiliation et me donner un numéro de dossier ?',
  ].join('\n');
}

export function buildBankDisputeNote({ sub, billing, currency }) {
  const nextDate = formatSafeDate(billing?.isTrial ? billing.trialEndsAt : billing?.nextChargeDate);
  return [
    `Marchand : ${sub.name}`,
    `Montant habituel : ${formatMoney(sub.amount, currency)}`,
    `Prochaine échéance estimée : ${nextDate}`,
    "Action demandée : révocation de l'autorisation de prélèvement / contestation si le marchand continue de facturer après demande de résiliation.",
    'Preuves à joindre : email ou lettre de résiliation, captures du compte, confirmation ou absence de réponse.',
  ].join('\n');
}

export function getCancellationMethodMessage({ method, sub, billing, currency, userName }) {
  if (method.key === 'email_letter') {
    return buildCancellationLetter({ sub, billing, currency, userName });
  }
  if (method.key === 'phone_chat') {
    return buildSupportScript({ sub, billing, currency });
  }
  if (method.key === 'bank_stop') {
    return buildBankDisputeNote({ sub, billing, currency });
  }

  return [
    `${method.title} - ${sub.name}`,
    method.description,
    '',
    ...method.steps.map((step, index) => `${index + 1}. ${step}`),
  ].join('\n');
}

export function getCancellationMailtoUrl({ sub, billing, currency, userName }) {
  const subject = `Résiliation ${sub?.name || 'abonnement'}`;
  const body = buildCancellationLetter({ sub, billing, currency, userName });
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function requestCancellationAutomation({ method, sub, billing, currency, userName }) {
  if (!CANCELLATION_WEBHOOK_URL) {
    return {
      ok: false,
      reason: 'missing_webhook',
      message: "Ajoutez EXPO_PUBLIC_CANCELLATION_WEBHOOK_URL pour connecter un workflow n8n, Make ou Zapier.",
    };
  }

  const payload = {
    type: 'subscription_cancellation_request',
    requestedAt: new Date().toISOString(),
    methodKey: method?.key,
    methodTitle: method?.title,
    subscription: {
      id: sub?.id || null,
      name: sub?.name || null,
      category: sub?.category || null,
      amount: Number(sub?.amount) || 0,
      cycle: sub?.cycle || 'monthly',
      provider: sub?.provider || null,
    },
    billing: {
      nextChargeDate: billing?.nextChargeDate || null,
      trialEndsAt: billing?.trialEndsAt || null,
      daysUntilCharge: billing?.daysUntilCharge ?? null,
    },
    currency,
    userName: userName || null,
    message: getCancellationMethodMessage({ method, sub, billing, currency, userName }),
  };

  try {
    const response = await fetch(CANCELLATION_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, reason: 'webhook_error', message: 'Le workflow a refusé la demande.' };
    }

    return { ok: true, message: 'Demande envoyée au workflow automatique.' };
  } catch (error) {
    return { ok: false, reason: 'network_error', message: "Impossible de joindre le workflow d'automatisation." };
  }
}

export function getCancellationAutomationPlan(sub = {}, billing = {}) {
  const nextDate = billing?.nextChargeDate ? new Date(billing.nextChargeDate) : null;
  const plan = [
    { key: 'follow_up_2d', label: 'Relance 48h', daysFromNow: 2 },
    { key: 'proof_5d', label: 'Verifier confirmation', daysFromNow: 5 },
  ];

  if (nextDate && !Number.isNaN(nextDate.getTime())) {
    const beforeCharge = new Date(nextDate);
    beforeCharge.setDate(beforeCharge.getDate() - 2);
    beforeCharge.setHours(10, 0, 0, 0);
    if (beforeCharge > new Date()) {
      plan.push({ key: 'before_charge', label: 'Avant prochain débit', date: beforeCharge });
    }
  }

  return plan.map((item) => ({
    ...item,
    title: item.label,
    body: `${sub.name || 'Abonnement'}: vérifiez que la résiliation est confirmée et gardez une preuve.`,
  }));
}

function formatSafeDate(value) {
  if (!value) return 'non définie';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'non définie';
  return formatDateFull(date);
}

function formatMoney(value, currency = 'EUR') {
  return `${(Number(value) || 0).toFixed(2)} ${currency}`;
}

function cycleLabel(cycle) {
  return {
    weekly: 'hebdomadaire',
    monthly: 'mensuelle',
    quarterly: 'trimestrielle',
    annual: 'annuelle',
  }[cycle] || 'mensuelle';
}

export function getCancellationSavings(sub = {}) {
  const amount = Number(sub.amount) || 0;
  const monthly = monthlyEquivalent(amount, sub.cycle);
  const annual = annualEquivalent(amount, sub.cycle);
  return { monthly, annual };
}
