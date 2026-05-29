# Configuration des secrets Supabase Edge Functions

## Commandes à exécuter dans le terminal :

```bash
supabase secrets set GMAIL_CLIENT_ID=<ton-google-client-id>
supabase secrets set GROQ_API_KEY=<ta-groq-api-key>
```

Si tu utilises seulement un client OAuth Android, il n'y a pas de `Client Secret`. C'est normal.
Mais si Google renvoie `client_secret is missing` pendant le scan, le refresh token vient d'un
flux OAuth Supabase/Web et il faut utiliser le client OAuth **Web application** associé.

```bash
# Requis si Google renvoie "client_secret is missing" :
supabase secrets set GMAIL_CLIENT_SECRET=<ton-google-client-secret>
```

## Variable d'environnement app mobile (.env) :

```env
EXPO_PUBLIC_N8N_WEBHOOK_URL=https://ton-instance-n8n.com/webhook
```

(laisser vide si N8N non utilisé - les webhooks sont silencieux si non configuré)

## Pour obtenir GROQ_API_KEY gratuit :

1. Va sur console.groq.com
2. Crée un compte (gratuit)
3. API Keys > Create API Key

## Pour Google OAuth (GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET optionnel) :

1. console.cloud.google.com
2. Sélectionne ton projet (trimly-59589)
3. APIs & Services > Credentials
4. OAuth 2.0 Client IDs > ton client Android ou ton client web
5. Copie le Client ID
6. Si c'est un client web uniquement, copie aussi le Client Secret

### Si tu ne vois aucun secret

Tu es probablement dans un client `Android` comme sur la capture. Va dans :

1. APIs & Services > Credentials
2. Create Credentials > OAuth client ID
3. Application type : Web application
4. Authorized redirect URI :
   `https://xsxgfdmmtqojuduwrwlq.supabase.co/auth/v1/callback`
5. Copie le `Client ID` et le `Client Secret`
6. Utilise ce client Web aussi dans Supabase Auth > Providers > Google

## Déploiement de la fonction Edge :

```bash
supabase functions deploy scan-emails --no-verify-jwt
```
