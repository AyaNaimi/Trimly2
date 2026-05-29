import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const GOOGLE_PROVIDER_STORAGE_KEY = '@trimly_google_provider_tokens';
const NATIVE_AUTH_REDIRECT_URI = 'trimly://auth/callback';

export const GOOGLE_GMAIL_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export function getGoogleRedirectUri() {
  if (Platform.OS !== 'web') {
    console.log('Generated Redirect URI:', NATIVE_AUTH_REDIRECT_URI);
    return NATIVE_AUTH_REDIRECT_URI;
  }

  if (!__DEV__) {
    return window.location.origin;
  }

  const redirectUri = makeRedirectUri({
    scheme: 'trimly',
    path: 'auth/callback',
  });
  console.log('Generated Redirect URI:', redirectUri);
  return redirectUri;
}

export function getGoogleScopeString() {
  return GOOGLE_GMAIL_SCOPES.join(' ');
}

export function getGoogleQueryParams() {
  return {
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
  };
}

export function parseOAuthRedirectUrl(url) {
  if (!url) return {};

  const parsed = Linking.parse(url);
  const params = {
    ...parseParamsFromUrlPart(url, '?'),
    ...parseParamsFromUrlPart(url, '#'),
    ...(parsed.queryParams || {}),
  };

  return {
    code: params.code || null,
    type: params.type || null,
    accessToken: params.access_token || params.accessToken || null,
    refreshToken: params.refresh_token || params.refreshToken || null,
    providerAccessToken: params.provider_token || params.providerToken || null,
    providerRefreshToken: params.provider_refresh_token || params.providerRefreshToken || null,
    error: params.error || null,
    errorDescription: params.error_description || params.errorDescription || null,
  };
}

function parseParamsFromUrlPart(url, marker) {
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return {};

  const endMarkers = marker === '?' ? ['#'] : [];
  let paramsText = url.slice(markerIndex + 1);

  for (const endMarker of endMarkers) {
    const endIndex = paramsText.indexOf(endMarker);
    if (endIndex !== -1) {
      paramsText = paramsText.slice(0, endIndex);
    }
  }

  const queryStart = paramsText.indexOf('?');
  if (queryStart !== -1) {
    paramsText = paramsText.slice(queryStart + 1);
  }

  return paramsText.split('&').reduce((acc, part) => {
    if (!part) return acc;
    const [rawKey, ...rawValueParts] = part.split('=');
    const key = decodeUrlValue(rawKey);
    if (!key) return acc;
    acc[key] = decodeUrlValue(rawValueParts.join('='));
    return acc;
  }, {});
}

function decodeUrlValue(value = '') {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

export async function getStoredGoogleProviderTokens() {
  try {
    const raw = await AsyncStorage.getItem(GOOGLE_PROVIDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading stored Google tokens:', error);
    return null;
  }
}

export async function storeGoogleProviderTokens({
  userId,
  email,
  accessToken,
  refreshToken,
  scopes = GOOGLE_GMAIL_SCOPES,
}) {
  if (!accessToken && !refreshToken) {
    return null;
  }

  const existing = await getStoredGoogleProviderTokens();
  const nextValue = {
    userId: userId || existing?.userId || null,
    email: email || existing?.email || null,
    accessToken: accessToken || existing?.accessToken || null,
    refreshToken: refreshToken || existing?.refreshToken || null,
    scopes,
    updatedAt: new Date().toISOString(),
  };

  try {
    await AsyncStorage.setItem(GOOGLE_PROVIDER_STORAGE_KEY, JSON.stringify(nextValue));
    return nextValue;
  } catch (error) {
    console.error('Error storing Google tokens:', error);
    return nextValue;
  }
}

export async function clearGoogleProviderTokens() {
  try {
    await AsyncStorage.removeItem(GOOGLE_PROVIDER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing Google tokens:', error);
  }
}
