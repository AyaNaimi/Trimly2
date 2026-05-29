export interface CancellationStep {
  order: number;
  title: string;
  description: string;
  url?: string;
  type: 'navigate' | 'click' | 'call' | 'email' | 'chat';
}

export interface CancellationGuide {
  serviceName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  steps: CancellationStep[];
  directUrl?: string;
  emailTemplate?: string;
  phoneNumber?: string;
  importantNotes?: string[];
}

export const CANCELLATION_GUIDES: Record<string, CancellationGuide> = {
  Netflix: {
    serviceName: 'Netflix',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    directUrl: 'https://www.netflix.com/cancelplan',
    steps: [
      {
        order: 1,
        title: 'Aller dans Mon Compte',
        description: 'Connectez-vous sur netflix.com et cliquez sur votre profil en haut à droite',
        url: 'https://www.netflix.com/YourAccount',
        type: 'navigate',
      },
      {
        order: 2,
        title: "Annuler l'abonnement",
        description: "Cliquez sur 'Annuler l'abonnement' dans la section Abonnement et paiements",
        type: 'click',
      },
      {
        order: 3,
        title: 'Confirmer',
        description: "Cliquez sur 'Terminer l'annulation'. Vous gardez l'accès jusqu'à la fin de la période payée.",
        type: 'click',
      },
    ],
    importantNotes: [
      "L'annulation prend effet à la fin de la période de facturation en cours",
      'Vos préférences et historique sont conservés pendant 10 mois',
    ],
  },

  Spotify: {
    serviceName: 'Spotify Premium',
    difficulty: 'easy',
    estimatedTime: '3 minutes',
    directUrl: 'https://www.spotify.com/account/subscription/',
    steps: [
      {
        order: 1,
        title: 'Aller dans ton compte',
        description: 'Va sur spotify.com/account et connecte-toi',
        url: 'https://www.spotify.com/account/subscription/',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Gérer ton abonnement Premium',
        description: "Clique sur 'Modifier ou annuler les abonnements'",
        type: 'click',
      },
      {
        order: 3,
        title: 'Annuler Premium',
        description: "Clique 'Annuler Premium' et confirme. Tu restes Premium jusqu'à la fin du mois payé.",
        type: 'click',
      },
    ],
    importantNotes: [
      'Tu repasses en compte gratuit avec publicités après la période payée',
      'Tes playlists sont conservées',
    ],
  },

  'Disney+': {
    serviceName: 'Disney+',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    directUrl: 'https://www.disneyplus.com/account',
    steps: [
      {
        order: 1,
        title: 'Accéder à ton compte',
        description: 'Va sur disneyplus.com et connecte-toi avec ton compte',
        url: 'https://www.disneyplus.com/account',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Abonnement',
        description: "Dans 'Détails du compte', clique sur 'Abonnement'",
        type: 'click',
      },
      {
        order: 3,
        title: "Annuler l'abonnement",
        description: "Clique sur 'Annuler l'abonnement' et confirme.",
        type: 'click',
      },
    ],
  },

  'Amazon Prime': {
    serviceName: 'Amazon Prime',
    difficulty: 'medium',
    estimatedTime: '5 minutes',
    directUrl: 'https://www.amazon.fr/mc/pipelines/primestatus',
    steps: [
      {
        order: 1,
        title: 'Gérer ton abonnement Prime',
        description: "Va sur amazon.fr, Compte > Prime > Gérer l'abonnement",
        url: 'https://www.amazon.fr/mc/pipelines/primestatus',
        type: 'navigate',
      },
      {
        order: 2,
        title: "Mettre fin à l'abonnement",
        description: "Clique sur 'Mettre fin à l'abonnement'",
        type: 'click',
      },
      {
        order: 3,
        title: 'Choisir la fin',
        description: "Choisis 'Mettre fin à l'abonnement le [date]' pour arrêter à la fin de la période",
        type: 'click',
      },
      {
        order: 4,
        title: 'Confirmer',
        description: 'Confirme l’annulation. Attention : Amazon peut proposer une pause.',
        type: 'click',
      },
    ],
    importantNotes: [
      'Amazon peut proposer une pause de 3 mois au lieu d’annuler',
      'Le remboursement partiel est possible si peu utilisé (contacter support)',
    ],
  },

  'ChatGPT Plus': {
    serviceName: 'ChatGPT Plus',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    directUrl: 'https://chat.openai.com/#settings/Subscription',
    steps: [
      {
        order: 1,
        title: 'Ouvrir les paramètres',
        description: 'Sur chat.openai.com, clique sur ton nom en bas à gauche > Mon plan',
        url: 'https://chat.openai.com/#settings/Subscription',
        type: 'navigate',
      },
      {
        order: 2,
        title: "Gérer l'abonnement",
        description: "Clique sur 'Gérer mon abonnement'",
        type: 'click',
      },
      {
        order: 3,
        title: 'Annuler le plan',
        description: "Dans le portail Stripe, clique 'Annuler le plan' et confirme.",
        type: 'click',
      },
    ],
  },

  'Adobe Creative Cloud': {
    serviceName: 'Adobe Creative Cloud',
    difficulty: 'hard',
    estimatedTime: '10 minutes',
    directUrl: 'https://account.adobe.com/plans',
    steps: [
      {
        order: 1,
        title: 'Aller dans ton compte Adobe',
        description: 'Va sur account.adobe.com/plans',
        url: 'https://account.adobe.com/plans',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Gérer le plan',
        description: "Clique sur 'Gérer le plan' à côté de Creative Cloud",
        type: 'click',
      },
      {
        order: 3,
        title: 'Annuler le plan',
        description: "Clique 'Annuler le plan'. Adobe va proposer des offres de rétention - refuse-les toutes.",
        type: 'click',
      },
      {
        order: 4,
        title: 'Confirmer les frais éventuels',
        description:
          "Si tu es dans les 14 premiers jours de l'année : annulation gratuite. Sinon : frais de 50% du reste du contrat.",
        type: 'click',
      },
    ],
    importantNotes: [
      'ATTENTION : Si contrat annuel, des frais de résiliation anticipée s’appliquent',
      'Essaie d’annuler dans les 14 jours suivant le renouvellement pour éviter les frais',
      'Le chat support peut parfois offrir 2 mois gratuits pour garder l’abonnement',
    ],
  },

  'Microsoft 365': {
    serviceName: 'Microsoft 365',
    difficulty: 'medium',
    estimatedTime: '5 minutes',
    directUrl: 'https://account.microsoft.com/services',
    steps: [
      {
        order: 1,
        title: 'Aller dans les services Microsoft',
        description: 'Va sur account.microsoft.com/services et connecte-toi',
        url: 'https://account.microsoft.com/services',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Gérer Microsoft 365',
        description: "Clique sur 'Gérer' à côté de Microsoft 365",
        type: 'click',
      },
      {
        order: 3,
        title: "Annuler l'abonnement",
        description: "Sélectionne 'Annuler l'abonnement' et suis les instructions",
        type: 'click',
      },
    ],
  },

  'iCloud+': {
    serviceName: 'iCloud+',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    steps: [
      {
        order: 1,
        title: 'Ouvrir Réglages iOS',
        description: 'Sur ton iPhone, va dans Réglages > [Ton nom] > iCloud > Gérer le stockage',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Changer de forfait',
        description: "Appuie sur 'Changer de forfait d'espace' puis 'Option bas de gamme' ou 'Déclasser'",
        type: 'click',
      },
      {
        order: 3,
        title: 'Confirmer',
        description: 'Confirme le déclassement. Tu repasses en 5 Go gratuit.',
        type: 'click',
      },
    ],
    importantNotes: [
      'Tu risques de perdre des données si tu dépasses 5 Go. Sauvegarde d’abord.',
      'La modification prend effet au prochain cycle de facturation',
    ],
  },

  NordVPN: {
    serviceName: 'NordVPN',
    difficulty: 'medium',
    estimatedTime: '5 minutes',
    directUrl: 'https://my.nordaccount.com/subscriptions/',
    emailTemplate: 'cancel',
    steps: [
      {
        order: 1,
        title: 'Aller dans ton compte Nord',
        description: 'Va sur my.nordaccount.com et connecte-toi',
        url: 'https://my.nordaccount.com/subscriptions/',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Désactiver le renouvellement automatique',
        description:
          "Dans 'Mes abonnements', trouve NordVPN et clique 'Désactiver le renouvellement auto'",
        type: 'click',
      },
      {
        order: 3,
        title: 'Confirmer',
        description: 'Confirme la désactivation. Tu gardes l’accès jusqu’à expiration.',
        type: 'click',
      },
    ],
    importantNotes: [
      'NordVPN offre une garantie remboursement 30 jours - contacte le support pour remboursement',
      'L’abonnement continue jusqu’à la date d’expiration',
    ],
  },

  Notion: {
    serviceName: 'Notion',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    directUrl: 'https://www.notion.so/my-account',
    steps: [
      {
        order: 1,
        title: 'Paramètres du compte',
        description: 'Dans Notion, va dans Paramètres > Abonnement',
        url: 'https://www.notion.so/my-account',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Rétrograder le plan',
        description: "Clique sur 'Rétrograder le plan' ou 'Annuler l'abonnement'",
        type: 'click',
      },
    ],
  },

  Dropbox: {
    serviceName: 'Dropbox',
    difficulty: 'easy',
    estimatedTime: '3 minutes',
    directUrl: 'https://www.dropbox.com/account/plan',
    steps: [
      {
        order: 1,
        title: 'Accéder au plan',
        description: 'Va sur dropbox.com/account/plan',
        url: 'https://www.dropbox.com/account/plan',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Résilier',
        description: "Clique sur 'Annuler l'abonnement Dropbox Plus'",
        type: 'click',
      },
    ],
  },

  'YouTube Premium': {
    serviceName: 'YouTube Premium',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    directUrl: 'https://www.youtube.com/paid_memberships',
    steps: [
      {
        order: 1,
        title: 'Gérer les abonnements',
        description: 'Va sur youtube.com/paid_memberships',
        url: 'https://www.youtube.com/paid_memberships',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Désactiver',
        description: "Clique sur 'Désactiver' à côté de YouTube Premium et confirme",
        type: 'click',
      },
    ],
  },

  'Canal+': {
    serviceName: 'Canal+',
    difficulty: 'hard',
    estimatedTime: '15 minutes',
    phoneNumber: '3460',
    emailTemplate: 'cancellation_formal',
    steps: [
      {
        order: 1,
        title: 'Option 1 : Appel téléphonique',
        description:
          'Appelle le 3460 (service client Canal+). Demande explicitement la résiliation. Ils vont faire des offres de rétention.',
        type: 'call',
      },
      {
        order: 2,
        title: 'Option 2 : Lettre recommandée',
        description:
          'Envoie une lettre recommandée avec AR à : Canal+ Service Résiliation, TSA 20001, 92130 ISSY-LES-MOULINEAUX',
        type: 'email',
      },
      {
        order: 3,
        title: 'Option 3 : Espace client en ligne',
        description: 'Sur canalplus.com > Mon compte > Mon abonnement > Résilier (uniquement certaines offres)',
        url: 'https://www.canalplus.com/espace-client/',
        type: 'navigate',
      },
    ],
    importantNotes: [
      'Canal+ peut exiger un préavis de 30 jours selon votre contrat',
      'Gardez une copie de votre courrier avec le numéro de tracking',
      'Si engagement, des frais peuvent s’appliquer',
    ],
  },

  Deezer: {
    serviceName: 'Deezer',
    difficulty: 'easy',
    estimatedTime: '3 minutes',
    directUrl: 'https://www.deezer.com/account/subscription',
    steps: [
      {
        order: 1,
        title: 'Compte Deezer',
        description: 'Va sur deezer.com/account/subscription',
        url: 'https://www.deezer.com/account/subscription',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Résilier',
        description: "Clique sur 'Résilier l'abonnement' et confirme",
        type: 'click',
      },
    ],
  },

  'Google One': {
    serviceName: 'Google One',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    directUrl: 'https://one.google.com/storage',
    steps: [
      {
        order: 1,
        title: 'Ouvrir Google One',
        description: "Va sur one.google.com ou ouvre l'app Google One",
        url: 'https://one.google.com/storage',
        type: 'navigate',
      },
      {
        order: 2,
        title: "Gérer l'abonnement",
        description: "Va dans Paramètres > Annuler l'abonnement Google One",
        type: 'click',
      },
    ],
    importantNotes: ['Tu repasses à 15 Go gratuit. Vérifie que tu ne dépasses pas cette limite.'],
  },

  'PlayStation Plus': {
    serviceName: 'PlayStation Plus',
    difficulty: 'medium',
    estimatedTime: '5 minutes',
    directUrl: 'https://store.playstation.com/subscriptions',
    steps: [
      {
        order: 1,
        title: 'PlayStation Store',
        description: 'Va sur store.playstation.com ou Settings sur ta PS5/PS4',
        url: 'https://store.playstation.com/subscriptions',
        type: 'navigate',
      },
      {
        order: 2,
        title: "Gérer l'abonnement",
        description: 'Compte > Abonnement > PlayStation Plus > Désactiver le renouvellement automatique',
        type: 'click',
      },
    ],
  },

  Slack: {
    serviceName: 'Slack',
    difficulty: 'medium',
    estimatedTime: '5 minutes',
    directUrl: 'https://slack.com/account/billing',
    steps: [
      {
        order: 1,
        title: 'Paramètres de facturation',
        description: 'Va sur slack.com/account/billing (admin requis)',
        url: 'https://slack.com/account/billing',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Rétrograder en gratuit',
        description: "Clique sur 'Rétrograder en Gratuit'",
        type: 'click',
      },
    ],
    importantNotes: [
      "Seulement l'administrateur de l'espace de travail peut faire ça",
      "L'historique des messages sera limité à 90 jours sur le plan gratuit",
    ],
  },

  Zoom: {
    serviceName: 'Zoom',
    difficulty: 'easy',
    estimatedTime: '3 minutes',
    directUrl: 'https://zoom.us/billing',
    steps: [
      {
        order: 1,
        title: 'Portail Zoom',
        description: 'Va sur zoom.us/billing',
        url: 'https://zoom.us/billing',
        type: 'navigate',
      },
      {
        order: 2,
        title: 'Annuler',
        description: "Dans 'Plans courants', clique sur 'Annuler'",
        type: 'click',
      },
    ],
  },
};

export function getCancellationGuide(serviceName: string): CancellationGuide | null {
  if (CANCELLATION_GUIDES[serviceName]) {
    return CANCELLATION_GUIDES[serviceName];
  }

  const lower = serviceName.toLowerCase();
  for (const [key, guide] of Object.entries(CANCELLATION_GUIDES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return guide;
    }
  }

  return {
    serviceName,
    difficulty: 'medium',
    estimatedTime: '5-10 minutes',
    steps: [
      {
        order: 1,
        title: "Rechercher la page d'annulation",
        description: `Cherche sur Google : "${serviceName} cancel subscription" ou "${serviceName} résilier abonnement"`,
        type: 'navigate',
      },
      {
        order: 2,
        title: "Vérifier l'email de facturation",
        description: "Regarde tes emails de facturation du service pour trouver un lien 'Gérer l'abonnement'",
        type: 'navigate',
      },
      {
        order: 3,
        title: 'Contacter le support',
        description: `Contacte le support de ${serviceName} et demande l'annulation de l'abonnement. Garde une trace écrite.`,
        type: 'chat',
      },
    ],
    importantNotes: [
      'Vérifie si tu as un engagement (annuel vs mensuel)',
      "Prends une capture d'écran de la confirmation d'annulation",
    ],
  };
}

export function generateCancellationLetter(params: {
  serviceName: string;
  userName: string;
  userEmail: string;
  subscriptionId?: string;
  cancelDate?: string;
}): string {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `${params.userName}
${params.userEmail}

Le ${today}

Objet : Résiliation d'abonnement ${params.serviceName}
${params.subscriptionId ? `Référence abonnement : ${params.subscriptionId}` : ''}

Madame, Monsieur,

Je vous informe par la présente de ma décision de résilier mon abonnement ${params.serviceName}.

Je vous demande de bien vouloir prendre en compte cette demande de résiliation et de confirmer la prise en compte de celle-ci par retour d'email.

Conformément à la réglementation en vigueur, je vous demande de cesser tout prélèvement automatique sur mon moyen de paiement à compter de la date de fin de la période en cours.

Dans l'attente de votre confirmation, veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${params.userName}`;
}
