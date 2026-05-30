// src/screens/Auth/LoginScreen.js
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  AccessibilityInfo,
  FlatList,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Animated,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import rawPhoneCountries from '@realtril/react-native-country-picker-modal/src/assets/data/countries-emoji.json';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Bell,
  Phone,
  User,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native';

import { requestNotificationPermissions } from '../../utils/notifications';
import { supabase } from '../../utils/supabase';
import { Fonts, Radius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { PremiumHaptics } from '../../utils/haptics';
import {
  getGoogleQueryParams,
  getGoogleRedirectUri,
  getGoogleScopeString,
  parseOAuthRedirectUrl,
  storeGoogleProviderTokens,
} from '../../services/googleAuthService';

WebBrowser.maybeCompleteAuthSession();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RESET_REDIRECT_PATH = '/auth/reset-password';
const PASSWORD_RESET_REDIRECT_URL = 'trimly://auth/reset-password';

function countryCodeToEmoji(code = 'FR') {
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...code.split('').map(char => 127397 + char.charCodeAt(0)));
}

const PHONE_COUNTRIES = Object.entries(rawPhoneCountries)
  .map(([cca2, country]) => ({
    cca2,
    name: typeof country.name === 'string'
      ? country.name
      : country.name?.common || cca2,
    callingCode: Array.isArray(country.callingCode) ? country.callingCode : [],
    flag: countryCodeToEmoji(cca2),
  }))
  .filter(country => country.callingCode.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES.find(country => country.cca2 === 'FR') || PHONE_COUNTRIES[0];

function validateEmail(value) {
  return emailRegex.test(value.trim());
}

function normalizeExpoHostUri(value) {
  if (!value || typeof value !== 'string') return null;

  let hostUri = value.trim();
  if (!hostUri) return null;

  hostUri = hostUri
    .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
    .replace(/^\/+/, '')
    .split(/[?#]/)[0]
    .replace(/\/--\/?.*$/, '')
    .replace(/\/$/, '');

  return hostUri || null;
}

function getExpoGoPasswordResetRedirectUrl() {
  const hostUri = normalizeExpoHostUri(
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.linkingUri
  );

  if (hostUri) {
    return `exp://${hostUri}/--${PASSWORD_RESET_REDIRECT_PATH}`;
  }

  return Linking.createURL(PASSWORD_RESET_REDIRECT_PATH);
}

function getPasswordResetRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return getExpoGoPasswordResetRedirectUrl();
  }

  return PASSWORD_RESET_REDIRECT_URL;
}

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

const FINANCE_ASSETS = [
  { uri: 'https://cdn-icons-png.flaticon.com/512/732/732228.png', radius: 82, size: 42 }, // Netflix
  { uri: 'https://cdn-icons-png.flaticon.com/512/174/174872.png', radius: 98, size: 48 }, // Spotify (Large)
  { uri: 'https://cdn-icons-png.flaticon.com/512/5968/5968202.png', radius: 76, size: 36 }, // Amazon (Small)
  { uri: 'https://cdn-icons-png.flaticon.com/512/5977/5977590.png', radius: 105, size: 44 }, // Disney
  { uri: 'https://cdn-icons-png.flaticon.com/512/0/747.png', radius: 88, size: 40 }, // Apple
  { uri: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', radius: 65, size: 32 }, // YouTube (Small)
  { uri: 'https://cdn-icons-png.flaticon.com/512/5968/5968250.png', radius: 115, size: 38 }, // Dropbox
];

const CENTRAL_AVATAR = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop';

// Company logo cards for landing grid background
const COMPANY_CARDS_ROW_1 = [
  { name: 'Netflix', logo: 'https://cdn-icons-png.flaticon.com/512/732/732228.png' },
  { name: 'Google', logo: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' },
  { name: 'LinkedIn', logo: 'https://cdn-icons-png.flaticon.com/512/174/174857.png' },
  { name: 'Netflix', logo: 'https://cdn-icons-png.flaticon.com/512/732/732228.png' },
];

const COMPANY_CARDS_ROW_2 = [
  { name: 'Tesla', logo: 'https://cdn-icons-png.flaticon.com/512/825/825448.png' },
  { name: 'Microsoft', logo: 'https://cdn-icons-png.flaticon.com/512/732/732221.png' },
  { name: 'Airbnb', logo: 'https://cdn-icons-png.flaticon.com/512/2111/2111320.png' },
  { name: 'Tesla', logo: 'https://cdn-icons-png.flaticon.com/512/825/825448.png' },
];

const COMPANY_CARDS_ROW_3 = [
  { name: 'Uber', logo: 'https://cdn-icons-png.flaticon.com/512/5969/5969248.png' },
  { name: 'Apple', logo: 'https://cdn-icons-png.flaticon.com/512/0/747.png' },
  { name: 'Meta', logo: 'https://cdn-icons-png.flaticon.com/512/6033/6033716.png' },
  { name: 'Uber', logo: 'https://cdn-icons-png.flaticon.com/512/5969/5969248.png' },
];

const COMPANY_CARDS_ROW_4 = [
  { name: 'Tata', logo: 'https://cdn-icons-png.flaticon.com/512/5969/5969188.png' },
  { name: 'Amazon', logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968202.png' },
  { name: 'Spotify', logo: 'https://cdn-icons-png.flaticon.com/512/174/174872.png' },
  { name: 'Tata', logo: 'https://cdn-icons-png.flaticon.com/512/5969/5969188.png' },
];

const NOTIF_CARDS_ROW_1 = [
  { name: 'Netflix', logo: 'https://cdn-icons-png.flaticon.com/512/732/732228.png', time: '5m', msg: '🚨 Prélèvement de 15,99 € demain', isAlert: true },
  { name: 'Spotify', logo: 'https://cdn-icons-png.flaticon.com/512/174/174872.png', time: '2h', msg: '✅ Premium renouvelé avec succès', isAlert: false },
  { name: 'iCloud', logo: 'https://cdn-icons-png.flaticon.com/512/0/747.png', time: '1j', msg: 'Abonnement iCloud 2 To actif', isAlert: false },
];

const NOTIF_CARDS_ROW_2 = [
  { name: 'Prime', logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968202.png', time: '10m', msg: '⚠️ Prix en hausse le mois prochain', isAlert: true },
  { name: 'Disney+', logo: 'https://cdn-icons-png.flaticon.com/512/5977/5977590.png', time: '4h', msg: 'Essai gratuit expire dans 2j !', isAlert: true },
  { name: 'YouTube', logo: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', time: '2j', msg: '✅ Facture de 12,99 € payée', isAlert: false },
];

const NOTIF_CARDS_ROW_3 = [
  { name: 'Canva', logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968250.png', time: '1h', msg: '🚨 Erreur de paiement : carte rejetée', isAlert: true },
  { name: 'Dropbox', logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968250.png', time: '6h', msg: 'Espace de stockage mis à niveau', isAlert: false },
  { name: 'Adobe', logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968202.png', time: '3j', msg: '⚠️ Période d\'essai terminée', isAlert: true },
];

const NOTIF_CARDS_ROW_4 = [
  { name: 'Slack', logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968250.png', time: 'maintenant', msg: '✅ Facture Slack Pro payée', isAlert: false },
  { name: 'PS Plus', logo: 'https://cdn-icons-png.flaticon.com/512/5977/5977590.png', time: '3h', msg: '⚠️ Prochain prélèvement le 25/05', isAlert: false },
  { name: 'Canva', logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968250.png', time: '12h', msg: 'Abonnement modifié avec succès', isAlert: false },
];
const NOTIFICATION_ALERT_PREVIEW = [
  { name: 'Spotify', brand: 'spotify', time: '2h', msg: 'Premium renouvelé avec succès', color: '#1DB954' },
  { name: 'Disney+', brand: 'disney', time: '4h', msg: 'Essai gratuit expire dans 2j !', color: '#0B2D5C' },
  { name: 'Dropbox', brand: 'dropbox', time: '6h', msg: 'Espace de stockage mis à niveau', color: '#0061FF' },
  { name: 'PS Plus', brand: 'ps', time: '3h', msg: 'Prochain prélèvement le 25/05', color: '#111827' },
];

const FLOATING_ALERT_LOGOS = [
  { logo: 'https://cdn-icons-png.flaticon.com/512/174/174872.png', style: 'alertFloatSpotify', drift: 1 },
  { logo: 'https://cdn-icons-png.flaticon.com/512/5977/5977590.png', style: 'alertFloatDisney', drift: -0.8 },
  { logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968250.png', style: 'alertFloatDropbox', drift: 0.6 },
  { logo: 'https://cdn-icons-png.flaticon.com/512/588/588258.png', style: 'alertFloatPs', drift: -1 },
  { logo: 'https://cdn-icons-png.flaticon.com/512/5969/5969248.png', style: 'alertFloatYellow', drift: 0.45 },
];

function BrandLogo({ brand, color, size = 34, muted = false, styles }) {
  const BRAND_IMAGES = {
    spotify: { uri: 'https://cdn-icons-png.flaticon.com/512/174/174872.png' },
    disney: { uri: 'https://images.icon-icons.com/2657/PNG/256/disney_plus_icon_161064.png' },
    dropbox: { uri: 'https://cdn-icons-png.flaticon.com/512/2111/2111271.png' },
    ps: { uri: 'https://cdn-icons-png.flaticon.com/512/588/588258.png' },
  };
  return (
    <View style={[styles.brandLogo, muted && styles.brandLogoMuted, { width: size, height: size, backgroundColor: muted ? color : 'transparent' }]}>
      <Image source={BRAND_IMAGES[brand]} style={{ width: '100%', height: '100%', borderRadius: size * 0.25 }} />
    </View>
  );
}

function NotificationStepDesign({ styles }) {
  const { isDark, Colors } = useTheme();
  const notifAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(600),
      Animated.spring(notifAnim, {
        toValue: 1,
        tension: 25,
        friction: 6,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.notifDesignContainer}>
      <View style={styles.designStatusBar}>
        <Text style={styles.designStatusTime}>9:41</Text>
        <View style={styles.designIsland} />
        <View style={styles.designStatusRight}>
          <View style={styles.signalBars}>
            <View style={[styles.signalBar, styles.signalBarOne]} />
            <View style={[styles.signalBar, styles.signalBarTwo]} />
            <View style={[styles.signalBar, styles.signalBarThree]} />
          </View>
          <Text style={styles.wifiMark}>⌁</Text>
          <View style={styles.batteryPill}>
            <Text style={styles.batteryText}>80</Text>
          </View>
        </View>
      </View>

      <View style={styles.phonePoster}>
        {/* Curved elegant background lines */}
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Path
            d="M -60 220 C 60 180, 160 380, 360 320"
            fill="none"
            stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}
            strokeWidth={1.5}
          />
          <Path
            d="M -30 120 C 120 100, 220 340, 420 240"
            fill="none"
            stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'}
            strokeWidth={1}
          />
        </Svg>

        {/* Ambient Glow */}
        <View style={styles.ambientGlow} />

        {/* Rotated 3D cards behind the phone */}
        <View style={[styles.bgFloatingCard, styles.bgFloatingCardLeft]}>
          <Text style={styles.bgFloatingCardTitle}>Économies</Text>
          <Text style={styles.bgFloatingCardValue}>+120,50 €</Text>
          <Text style={styles.bgFloatingCardSub}>Ce mois-ci</Text>
        </View>

        <View style={[styles.bgFloatingCard, styles.bgFloatingCardRight]}>
          <Text style={styles.bgFloatingCardTitle}>Alerte Budget</Text>
          <Text style={styles.bgFloatingCardValue}>85%</Text>
          <Text style={styles.bgFloatingCardSub}>Shopping atteint</Text>
        </View>

        <View style={styles.phoneShell}>
          <View style={styles.phoneSideButtonLeft} />
          <View style={styles.phoneSideButtonRight} />
          <View style={styles.phoneGlass}>
            {/* Background Gradient Wash */}
            <View style={styles.phonePhotoWash} />
            
            {/* Dynamic Island */}
            <View style={styles.dynamicIslandLarge} />

            {/* Simulated Trimly App inspired by Screen 2 */}
            <View style={styles.dashboardContainer}>
              {/* Header */}
              <View style={styles.mockHeader}>
                <View>
                  <Text style={styles.mockGreeting}>Salut, Louise</Text>
                  <Text style={styles.mockSubtitle}>Prenez le contrôle ici.</Text>
                </View>
                <Image source={{ uri: CENTRAL_AVATAR }} style={styles.mockAvatar} />
              </View>

              {/* Search Bar */}
              <View style={styles.mockSearchBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Search size={11} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text style={styles.mockSearchText}>Rechercher...</Text>
                </View>
                <SlidersHorizontal size={11} color={isDark ? '#64748B' : '#94A3B8'} />
              </View>

              {/* Horizontal Category Pills */}
              <View style={styles.mockPillsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}>
                  <View style={[styles.mockPill, { backgroundColor: '#818CF8' }]}><Text style={styles.mockPillText}>Streaming</Text></View>
                  <View style={[styles.mockPill, { backgroundColor: '#F472B6' }]}><Text style={styles.mockPillText}>Loisirs</Text></View>
                  <View style={[styles.mockPill, { backgroundColor: '#2DD4BF' }]}><Text style={styles.mockPillText}>Musique</Text></View>
                  <View style={[styles.mockPill, { backgroundColor: '#FB923C' }]}><Text style={styles.mockPillText}>Cloud</Text></View>
                </ScrollView>
              </View>

              {/* Section Header */}
              <Text style={styles.mockSectionTitle}>Mes abonnements</Text>

              {/* Subscription List */}
              <View style={styles.mockList}>
                {/* Netflix Card */}
                <View style={styles.mockCard}>
                  <LinearGradient colors={['#E11D48', '#881337']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mockCardHeader}>
                    <View style={styles.mockLogoWrapper}>
                      <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/732/732228.png' }} style={styles.mockCardLogo} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.mockCardTitle}>Netflix Premium</Text>
                      <Text style={styles.mockCardCompany}>Streaming Inc.</Text>
                    </View>
                    <View style={styles.mockCardViewBtn}>
                      <Text style={styles.mockCardViewText}>Gérer</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.mockCardBody}>
                    <View style={styles.mockCardTagRow}>
                      <View style={styles.mockCardTag}><Text style={styles.mockCardTagText}>Mensuel</Text></View>
                      <View style={styles.mockCardTag}><Text style={styles.mockCardTagText}>UHD 4K</Text></View>
                      <View style={styles.mockCardTag}><Text style={styles.mockCardTagText}>4 Écrans</Text></View>
                    </View>
                    <Text style={styles.mockCardDescription} numberOfLines={2}>
                      Prélèvement automatique mensuel programmé. Recommandé de vérifier le solde avant l'échéance.
                    </Text>
                    <View style={styles.budgetProgressRow}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '85%', backgroundColor: '#EF4444' }]} />
                      </View>
                      <Text style={styles.budgetPercentText}>85% du budget</Text>
                    </View>
                    <View style={styles.mockCardFooter}>
                      <Text style={styles.mockCardFooterText}>Facturé le 22 Juin</Text>
                      <Text style={styles.mockCardPrice}>15,99 €</Text>
                    </View>
                  </View>
                </View>

                {/* Spotify Card */}
                <View style={styles.mockCard}>
                  <LinearGradient colors={['#10B981', '#064E3B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mockCardHeader}>
                    <View style={styles.mockLogoWrapper}>
                      <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174872.png' }} style={styles.mockCardLogo} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.mockCardTitle}>Spotify Family</Text>
                      <Text style={styles.mockCardCompany}>Spotify AB</Text>
                    </View>
                    <View style={styles.mockCardViewBtn}>
                      <Text style={styles.mockCardViewText}>Gérer</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.mockCardBody}>
                    <View style={styles.mockCardTagRow}>
                      <View style={styles.mockCardTag}><Text style={styles.mockCardTagText}>Mensuel</Text></View>
                      <View style={styles.mockCardTag}><Text style={styles.mockCardTagText}>Musique</Text></View>
                      <View style={styles.mockCardTag}><Text style={styles.mockCardTagText}>Partagé</Text></View>
                    </View>
                    <Text style={styles.mockCardDescription} numberOfLines={2}>
                      Abonnement partagé avec la famille. Paiement sécurisé via carte de crédit.
                    </Text>
                    <View style={styles.budgetProgressRow}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '40%', backgroundColor: '#10B981' }]} />
                      </View>
                      <Text style={styles.budgetPercentText}>40% du budget</Text>
                    </View>
                    <View style={styles.mockCardFooter}>
                      <Text style={styles.mockCardFooterText}>Facturé le 25 Juin</Text>
                      <Text style={styles.mockCardPrice}>10,99 €</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Floating Animated Notification Banner */}
            <Animated.View
              style={[
                styles.floatingNotifCard,
                {
                  transform: [
                    {
                      translateY: notifAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-120, 68],
                      })
                    }
                  ],
                  opacity: notifAnim,
                }
              ]}
            >
              <View style={styles.designNotifCardContent}>
                <Image source={require('../../../assets/icon.png')} style={styles.designNotifAvatar} />
                <View style={styles.designNotifCopy}>
                  <View style={styles.designNotifRow}>
                    <Text style={styles.designNotifName}>Trimly</Text>
                    <Text style={styles.designNotifTime}>maintenant</Text>
                  </View>
                  <Text style={styles.designNotifDesc} numberOfLines={2}>
                    Objectif atteint ! Vous avez économisé 50€ ce mois-ci.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>

      <Text style={styles.heroTitle}>Gardez le contrôle</Text>
      <Text style={styles.heroSubtitle}>Recevez des alertes avant chaque prélèvement et évitez les surprises.</Text>
    </View>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function AvatarOrbit({ styles }) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const { isDark, Colors } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 40000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.orbitContainer}>
      {/* Background Orbit Rings (Axe au dessous) */}
      <View style={[styles.orbitRing, { width: 140, height: 140, borderRadius: 70 }]} />
      <View style={[styles.orbitRing, { width: 195, height: 195, borderRadius: 97.5 }]} />
      <View style={[styles.orbitRing, { width: 250, height: 250, borderRadius: 125 }]} />

      <Animated.View
        style={[
          styles.orbitInner,
          {
            transform: [
              {
                rotate: spinValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        {FINANCE_ASSETS.map((asset, index) => {
          const angle = (index / FINANCE_ASSETS.length) * Math.PI * 2;
          const x = Math.cos(angle) * asset.radius;
          const y = Math.sin(angle) * asset.radius;

          return (
            <View
              key={index}
              style={[
                styles.orbitSquicleWrapper,
                {
                  left: 105 + x - asset.size / 2,
                  top: 105 + y - asset.size / 2,
                  width: asset.size,
                  height: asset.size,
                  borderRadius: asset.size * 0.3,
                },
              ]}
            >
              <Animated.View
                style={{
                  width: '100%',
                  height: '100%',
                  transform: [
                    {
                      rotate: spinValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '-360deg'],
                      }),
                    },
                  ],
                }}
              >
                <Image source={{ uri: asset.uri }} style={styles.orbitAssetImage} />
              </Animated.View>
            </View>
          );
        })}
      </Animated.View>
      <View style={styles.centerSquicleContainer}>
        <Image source={require('../../../assets/icon.png')} style={styles.centerAvatar} />
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const { state: appState, dispatch: appDispatch } = useApp();
  const { Colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('FR');
  const [callingCode, setCallingCode] = useState('33');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [step, setStep] = useState(0); // 0: Landing, 1: Notifications, 2: Login
  const [reduceMotion, setReduceMotion] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const step1NotifAnim = useRef(new Animated.Value(0)).current;

  // Parallax scroll anims for the company cards on the landing page background
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const foregroundFloatAnim = useRef(new Animated.Value(0)).current;
  const backgroundFloatAnim = useRef(new Animated.Value(0)).current;
  const parallaxX = useRef(new Animated.Value(0)).current;
  const parallaxY = useRef(new Animated.Value(0)).current;
  const ctaEntranceAnim = useRef(new Animated.Value(0)).current;
  const alertCardEntranceAnims = useRef(
    NOTIFICATION_ALERT_PREVIEW.map(() => new Animated.Value(0))
  ).current;

  const selectedPhoneCountry = useMemo(
    () => PHONE_COUNTRIES.find(country => country.cca2 === countryCode) || DEFAULT_PHONE_COUNTRY,
    [countryCode]
  );

  const filteredPhoneCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return PHONE_COUNTRIES;

    return PHONE_COUNTRIES.filter(country => (
      country.name.toLowerCase().includes(query) ||
      country.cca2.toLowerCase().includes(query) ||
      country.callingCode.some(code => `+${code}`.includes(query) || code.includes(query))
    ));
  }, [countrySearch]);

  // Premium Micro-animations values
  const capsulePulseAnim = useRef(new Animated.Value(1)).current;
  const arrowWiggleAnim = useRef(new Animated.Value(0)).current;
  const bellRingAnim = useRef(new Animated.Value(0)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduceMotion(Boolean(enabled));
    });

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', enabled => {
      setReduceMotion(Boolean(enabled));
    });

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  // Pulse animation for accent capsules
  useEffect(() => {
    if (reduceMotion) {
      capsulePulseAnim.setValue(1);
      arrowWiggleAnim.setValue(0);
      return undefined;
    }

    const capsuleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(capsulePulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(capsulePulseAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // CTA horizontal arrow bounce wiggle
    const arrowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowWiggleAnim, {
          toValue: 3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(arrowWiggleAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    capsuleLoop.start();
    arrowLoop.start();

    return () => {
      capsuleLoop.stop();
      arrowLoop.stop();
    };
  }, [reduceMotion]);

  // Bell ring notification animation
  useEffect(() => {
    if (step === 1 && !reduceMotion) {
      bellRingAnim.setValue(0);
      const bellLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bellRingAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bellRingAnim, {
            toValue: -1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bellRingAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.delay(1200),
        ])
      );

      bellLoop.start();
      return () => bellLoop.stop();
    }
    bellRingAnim.setValue(0);
    return undefined;
  }, [step, reduceMotion]);

  // Spring scale animation for focused input fields
  useEffect(() => {
    Animated.spring(inputFocusAnim, {
      toValue: focusedField ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [focusedField]);

  const focusedInputScale = inputFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });

  const bellRotation = bellRingAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-18deg', '18deg'],
  });

  useEffect(() => {
    let floatLoop1;
    let floatLoop2;

    if (!reduceMotion && (step === 0 || step === 1)) {
      // Floating animation for tilted rows
      floatLoop1 = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim1, {
            toValue: -40,
            duration: 9000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim1, {
            toValue: 0,
            duration: 9000,
            useNativeDriver: true,
          }),
        ])
      );

      floatLoop2 = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim2, {
            toValue: 40,
            duration: 9000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim2, {
            toValue: 0,
            duration: 9000,
            useNativeDriver: true,
          }),
        ])
      );

      floatLoop1.start();
      floatLoop2.start();
    }

    if (step === 1 && !reduceMotion) {
      step1NotifAnim.setValue(0);
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(step1NotifAnim, {
          toValue: 1,
          tension: 25,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (step === 1) {
      step1NotifAnim.setValue(1);
    }

    return () => {
      floatLoop1?.stop();
      floatLoop2?.stop();
    };
  }, [step, reduceMotion]);

  useEffect(() => {
    let foregroundLoop;
    let backgroundLoop;

    if (step !== 1) {
      return undefined;
    }

    if (reduceMotion) {
      foregroundFloatAnim.setValue(0.5);
      backgroundFloatAnim.setValue(0.5);
      parallaxX.setValue(0);
      parallaxY.setValue(0);
      ctaEntranceAnim.setValue(1);
      alertCardEntranceAnims.forEach(anim => anim.setValue(1));
      return undefined;
    }

    foregroundFloatAnim.setValue(0);
    backgroundFloatAnim.setValue(0);
    parallaxX.setValue(0);
    parallaxY.setValue(0);
    ctaEntranceAnim.setValue(0);
    alertCardEntranceAnims.forEach(anim => anim.setValue(0));

    foregroundLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(foregroundFloatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(foregroundFloatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    backgroundLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundFloatAnim, {
          toValue: 1,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundFloatAnim, {
          toValue: 0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    );

    foregroundLoop.start();
    backgroundLoop.start();

    Animated.stagger(
      70,
      alertCardEntranceAnims.map(anim => (
        Animated.timing(anim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        })
      ))
    ).start();

    Animated.sequence([
      Animated.delay(260),
      Animated.spring(ctaEntranceAnim, {
        toValue: 1,
        tension: 55,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      foregroundLoop?.stop();
      backgroundLoop?.stop();
    };
  }, [step, reduceMotion]);

  const deepLinkUrl = Linking.useURL();

  useEffect(() => {
    if (!appState.passwordRecoveryPending) return;

    setMode('reset');
    setStep(2);
    setPassword('');
    setFocusedField('password');
  }, [appState.passwordRecoveryPending]);

  function isPasswordResetUrl(url) {
    return url.includes('auth/reset-password') || url.includes('type=recovery');
  }

  async function completeAuthFromRedirectUrl(url, { saveGoogleTokens = false, resetPassword = false } = {}) {
    const {
      code,
      type,
      accessToken,
      refreshToken,
      providerAccessToken,
      providerRefreshToken,
      error: oauthError,
      errorDescription,
    } = parseOAuthRedirectUrl(url);

    if (oauthError) {
      const lowerError = `${oauthError} ${errorDescription || ''}`.toLowerCase();
      if (resetPassword && (lowerError.includes('otp_expired') || lowerError.includes('expired'))) {
        Alert.alert(
          'Lien expire',
          'Ce lien de reinitialisation a expire. Demandez un nouveau lien depuis l\'application.'
        );
        setMode('forgot');
        setStep(2);
        return null;
      }

      throw new Error(errorDescription || oauthError);
    }

    setLoading(true);

    let session = null;
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      session = data?.session || null;
    } else if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      session = currentSession;
    } else {
      return null;
    }

    if (saveGoogleTokens) {
      await storeGoogleProviderTokens({
        userId: session?.user?.id,
        email: session?.user?.email,
        accessToken: providerAccessToken || session?.provider_token,
        refreshToken: providerRefreshToken || session?.provider_refresh_token,
      });
    }

    if (resetPassword || type === 'recovery') {
      appDispatch({ type: 'SET_PASSWORD_RECOVERY_PENDING', payload: true });
      setMode('reset');
      setStep(2);
      setPassword('');
      setFocusedField('password');
      Alert.alert('Lien valide', 'Entrez votre nouveau mot de passe.');
    }

    return session;
  }

  useEffect(() => {
    const handleUrl = (url) => {
      if (!url) return;
      processDeepLink(url);
    };

    const processDeepLink = async (url) => {
      try {
        WebBrowser.dismissBrowser();
        const resetPassword = isPasswordResetUrl(url);
        const session = await completeAuthFromRedirectUrl(url, {
          resetPassword,
          saveGoogleTokens: !resetPassword,
        });
        if (session) console.log('Deep link traite avec succes');
      } catch (error) {
        console.error('Erreur lors du traitement du deep link:', error);
        Alert.alert('Lien invalide', error.message || 'Impossible de terminer la connexion.');
      } finally {
        setLoading(false);
      }
    };

    if (deepLinkUrl) handleUrl(deepLinkUrl);

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [deepLinkUrl]);

  function switchMode(nextMode) {
    PremiumHaptics.selection();
    setMode(nextMode);
    setResetSent(false);
    setFocusedField(null);
    if (nextMode === 'forgot') {
      setPassword('');
    }
    if (nextMode !== 'phone') {
      setPhone('');
      setOtp('');
      setOtpSent(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      PremiumHaptics.impact();
      Alert.alert('Email requis', 'Veuillez entrer votre adresse email.');
      return;
    }

    if (!validateEmail(email)) {
      PremiumHaptics.error();
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return;
    }

    setLoading(true);
    try {
      const redirectTo = getPasswordResetRedirectUrl();
      console.log('Password reset redirect URL:', redirectTo);
      console.log('Password reset redirect diagnostics:', {
        executionEnvironment: Constants.executionEnvironment,
        expoHostUri: Constants.expoConfig?.hostUri || null,
        linkingUri: Constants.linkingUri || null,
      });

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) throw error;

      PremiumHaptics.success();
      setResetSent(true);
      Alert.alert(
        'Lien envoye',
        'Si un compte existe avec cet email, vous recevrez un lien pour reinitialiser votre mot de passe.'
      );
    } catch (error) {
      PremiumHaptics.error();

      let errorMessage = error.message || "Impossible d'envoyer le lien de reinitialisation.";
      if (error.message?.toLowerCase().includes('network')) {
        errorMessage = 'Verifiez votre connexion internet et reessayez.';
      }

      Alert.alert('Reinitialisation impossible', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword() {
    if (!password || password.length < 6) {
      PremiumHaptics.impact();
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) throw error;

      PremiumHaptics.success();
      setPassword('');
      appDispatch({ type: 'SET_PASSWORD_RECOVERY_PENDING', payload: false });
      await supabase.auth.signOut();
      setMode('login');
      Alert.alert('Mot de passe modifie', 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.');
    } catch (error) {
      PremiumHaptics.error();
      Alert.alert('Modification impossible', error.message || 'Impossible de modifier le mot de passe.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth() {
    if (mode === 'reset') {
      handleUpdatePassword();
      return;
    }

    if (mode === 'forgot') {
      handleForgotPassword();
      return;
    }

    if (!email || !password) {
      PremiumHaptics.impact();
      Alert.alert('Champs requis', 'Veuillez remplir votre email et mot de passe.');
      return;
    }

    if (!validateEmail(email)) {
      PremiumHaptics.error();
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return;
    }

    if (password.length < 6) {
      PremiumHaptics.error();
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        PremiumHaptics.success();
        Alert.alert(
          'Compte cree avec succes',
          'Si la confirmation email est activee, verifiez votre boite mail puis reconnectez-vous.',
          [{ text: 'OK' }]
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        PremiumHaptics.success();
        appDispatch({ type: 'SET_PASSWORD_RECOVERY_PENDING', payload: false });
      }
    } catch (error) {
      PremiumHaptics.error();

      let errorTitle = 'Erreur de connexion';
      let errorMessage = error.message;

      if (error.message.includes('Invalid login credentials')) {
        errorTitle = 'Identifiants incorrects';
        errorMessage = "L'email ou le mot de passe est incorrect. Veuillez reessayer.";
      } else if (error.message.includes('Email not confirmed')) {
        errorTitle = 'Email non confirme';
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter.';
      } else if (error.message.includes('User not found')) {
        errorTitle = 'Compte introuvable';
        errorMessage = "Aucun compte n'existe avec cet email. Voulez-vous creer un compte ?";
      } else if (error.message.includes('User already registered')) {
        errorTitle = 'Compte existant';
        errorMessage = 'Un compte existe deja avec cet email. Essayez de vous connecter.';
      } else if (error.message.includes('Password')) {
        errorTitle = 'Mot de passe incorrect';
        errorMessage = 'Le mot de passe saisi est incorrect. Veuillez reessayer.';
      }

      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    if (!phone || phone.length < 8) {
      Alert.alert('Numéro invalide', 'Veuillez entrer un numéro valide.');
      return;
    }
    setLoading(true);
    try {
      PremiumHaptics.selection();
      const formattedPhone = `+${callingCode}${phone.trim().replace(/^0+/, '')}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
      setOtpSent(true);
      PremiumHaptics.success();
      Alert.alert('Code envoyé', 'Veuillez vérifier vos SMS.');
    } catch (error) {
      PremiumHaptics.error();
      const message = error.message || "Impossible d'envoyer le code.";
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('invalid from number') || lowerMessage.includes('caller id')) {
        Alert.alert(
          'SMS non configure',
          "Le numero expediteur Twilio configure dans Supabase est invalide. Verifiez Supabase > Authentication > Providers > Phone: le numero Twilio / Messaging Service doit etre valide et autorise."
        );
      } else {
        Alert.alert('Erreur', message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp || otp.length < 6) {
      Alert.alert('Code invalide', 'Veuillez entrer le code à 6 chiffres.');
      return;
    }
    setLoading(true);
    try {
      PremiumHaptics.selection();
      const formattedPhone = `+${callingCode}${phone.trim().replace(/^0+/, '')}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp.trim(),
        type: 'sms',
      });
      if (error) throw error;
      PremiumHaptics.success();
    } catch (error) {
      PremiumHaptics.error();
      Alert.alert('Erreur', error.message || 'Code incorrect.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider) {
    setLoading(true);

    try {
      PremiumHaptics.selection();

      const redirectUri = getGoogleRedirectUri();
      const isGoogle = provider === 'google';

      console.log('Tentative de connexion avec:', provider);
      console.log('Redirect URI:', redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          scopes: isGoogle ? getGoogleScopeString() : undefined,
          queryParams: isGoogle ? getGoogleQueryParams() : undefined,
        },
      });

      if (error) {
        console.error('Erreur OAuth Supabase:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('URL OAuth introuvable.');
      }

      console.log('Ouverture du navigateur OAuth...');
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri, {
        showInRecents: true,
      });

      console.log('Resultat du navigateur (type):', result.type);
      if (result.url) {
        console.log('URL de retour recue via le resultat:', result.url.substring(0, 50) + '...');
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log("Connexion annulee par l'utilisateur");
        setLoading(false);
        return;
      }

      if (result.type !== 'success' || !result.url) {
        throw new Error('Connexion OAuth interrompue.');
      }

      console.log('URL de retour recue');

      const session = await completeAuthFromRedirectUrl(result.url, {
        saveGoogleTokens: isGoogle,
      });

      if (!session) {
        throw new Error("Impossible de verifier l'authentification.");
      }

      if (isGoogle) {
        console.log('Sauvegarde des jetons Google...');
      }

      console.log('Connexion reussie !');
      PremiumHaptics.success();
    } catch (error) {
      console.error('Erreur complete:', error);
      PremiumHaptics.error();

      let errorTitle = "Erreur d'authentification";
      let errorMessage = error.message || "Impossible d'ouvrir la connexion.";

      if (error.message.includes('OAuth')) {
        errorTitle = 'Erreur de connexion ' + (provider === 'google' ? 'Google' : 'Apple');
        errorMessage = 'La connexion a echoue. Veuillez reessayer ou utiliser une autre methode.';
      } else if (error.message.includes('network')) {
        errorTitle = 'Erreur reseau';
        errorMessage = 'Verifiez votre connexion internet et reessayez.';
      }

      Alert.alert(errorTitle, errorMessage, [
        { text: 'OK', style: 'default' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const nextStep = async () => {
    if (step === 1) {
      // Intent: Request notifications
      PremiumHaptics.impact('light');
      await requestNotificationPermissions();
    }
    
    if (step < 2) {
      const next = step + 1;
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setStep(next);
      
      if (next === 2) {
        // Prepare login slide up
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const skipNotificationStep = () => {
    PremiumHaptics.selection();
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setStep(2);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const styles = makeStyles(Colors, isDark);
  const foregroundFloatTranslateY = foregroundFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3],
  });
  const backgroundDriftTranslateX = backgroundFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });
  const foregroundParallaxTranslateX = parallaxX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-6, 6],
  });
  const foregroundParallaxTranslateY = parallaxY.interpolate({
    inputRange: [-1, 1],
    outputRange: [-3, 3],
  });
  const backgroundParallaxTranslateX = parallaxX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-2, 2],
  });
  const backgroundParallaxTranslateY = parallaxY.interpolate({
    inputRange: [-1, 1],
    outputRange: [-1, 1],
  });
  const ctaScale = ctaEntranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  const resetAlertParallax = () => {
    if (reduceMotion) return;
    Animated.parallel([
      Animated.spring(parallaxX, {
        toValue: 0,
        tension: 45,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(parallaxY, {
        toValue: 0,
        tension: 45,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAlertTouchMove = (event) => {
    if (reduceMotion) return;
    const { locationX = SCREEN_WIDTH / 2, locationY = SCREEN_HEIGHT / 2 } = event.nativeEvent;
    const nextX = Math.max(-1, Math.min(1, ((locationX / SCREEN_WIDTH) - 0.5) * 2));
    const nextY = Math.max(-1, Math.min(1, ((locationY / SCREEN_HEIGHT) - 0.5) * 2));
    parallaxX.setValue(nextX);
    parallaxY.setValue(nextY);
  };

  const isForgotMode = mode === 'forgot';
  const isResetMode = mode === 'reset';
  const isSignupMode = mode === 'signup';
  const isPhoneMode = mode === 'phone';

  let title = isForgotMode
    ? 'Mot de passe oublié ?'
    : isPhoneMode
      ? 'Connexion par téléphone'
      : isSignupMode
        ? 'Créer un compte'
        : 'Bienvenue';
  let subtitle = isForgotMode
    ? 'Entrez votre email pour recevoir un lien de réinitialisation.'
    : isPhoneMode
      ? (otpSent ? 'Entrez le code reçu par SMS.' : 'Entrez votre numéro pour recevoir un code.')
      : isSignupMode
        ? 'Rejoignez-nous et prenez le contrôle de vos abonnements.'
        : 'Connectez-vous pour continuer.';
  let submitLabel = isForgotMode
    ? 'Envoyer le lien'
    : isPhoneMode
      ? (otpSent ? 'Vérifier le code' : 'Envoyer le SMS')
      : isSignupMode
        ? 'S\'inscrire'
        : 'Se connecter';

  if (isResetMode) {
    title = 'Nouveau mot de passe';
    subtitle = 'Choisissez un mot de passe securise pour votre compte.';
    submitLabel = 'Modifier le mot de passe';
  }

  const gradientColors = isDark ? [Colors.bg, Colors.surfaceAlt] : [Colors.bg, Colors.surface];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={gradientColors}
        style={styles.container}
      >
        {step === 0 && (
          <View style={styles.landingContainer}>
            {/* Background Tilted Grid of Cards */}
            <View style={styles.gridWrapper}>
              <Animated.View style={[styles.gridTiltedContainer, { transform: [{ rotate: '-12deg' }, { scale: 1.15 }] }]}>
                {/* Row 1 */}
                <Animated.View style={[styles.staggeredRow, { transform: [{ translateX: floatAnim1 }] }]}>
                  {COMPANY_CARDS_ROW_1.map((item, idx) => (
                    <View key={idx} style={styles.companyCard}>
                      <Image source={{ uri: item.logo }} style={styles.companyLogo} />
                      <Text style={styles.companyCardText}>{item.name}</Text>
                    </View>
                  ))}
                </Animated.View>
                {/* Row 2 */}
                <Animated.View style={[styles.staggeredRow, { marginLeft: -30, transform: [{ translateX: floatAnim2 }] }]}>
                  {COMPANY_CARDS_ROW_2.map((item, idx) => (
                    <View key={idx} style={styles.companyCard}>
                      <Image source={{ uri: item.logo }} style={styles.companyLogo} />
                      <Text style={styles.companyCardText}>{item.name}</Text>
                    </View>
                  ))}
                </Animated.View>
                {/* Row 3 */}
                <Animated.View style={[styles.staggeredRow, { marginLeft: 20, transform: [{ translateX: floatAnim1 }] }]}>
                  {COMPANY_CARDS_ROW_3.map((item, idx) => (
                    <View key={idx} style={styles.companyCard}>
                      <Image source={{ uri: item.logo }} style={styles.companyLogo} />
                      <Text style={styles.companyCardText}>{item.name}</Text>
                    </View>
                  ))}
                </Animated.View>
                {/* Row 4 */}
                <Animated.View style={[styles.staggeredRow, { marginLeft: -50, transform: [{ translateX: floatAnim2 }] }]}>
                  {COMPANY_CARDS_ROW_4.map((item, idx) => (
                    <View key={idx} style={styles.companyCard}>
                      <Image source={{ uri: item.logo }} style={styles.companyLogo} />
                      <Text style={styles.companyCardText}>{item.name}</Text>
                    </View>
                  ))}
                </Animated.View>
              </Animated.View>
            </View>

            {/* Foreground Content */}
            <SafeAreaView style={styles.landingForeground}>
              {/* Top Header Title */}
              <View style={styles.landingHeader}>
                <Text style={styles.landingTitlePart1}>Prenez le contrôle</Text>
                <View style={styles.landingTitleRow}>
                  <Text style={styles.landingTitlePart2}>de vos </Text>
                  <Animated.View style={[styles.dreamCapsule, { transform: [{ scale: capsulePulseAnim }] }]}>
                    <Text style={styles.dreamText}>Finances</Text>
                  </Animated.View>
                </View>
                <Text style={styles.landingTitlePart1}>dès aujourd'hui</Text>
                
                {/* Curved Arrow below title */}
                <View style={styles.arrowWrapper}>
                  <Svg width={46} height={46} viewBox="0 0 46 46" fill="none">
                    <Path
                      d="M38 6 C 24 14, 8 18, 14 36 M 14 36 L 8 28 M 14 36 L 22 32"
                      stroke={Colors.textSecondary}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>

              {/* Bottom CTA Button */}
              <View style={styles.landingFooter}>
                <TouchableOpacity
                  style={styles.startSearchingButton}
                  onPress={nextStep}
                  activeOpacity={0.9}
                >
                  <Text style={styles.startSearchingText}>Commencer</Text>
                  <View style={styles.arrowCircle}>
                    <Animated.View style={{ transform: [{ translateX: arrowWiggleAnim }] }}>
                      <ArrowRight size={20} color={Colors.accent} />
                    </Animated.View>
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        )}

        {step === 1 && (
          <Animated.View
            style={styles.alertScene}
            onTouchMove={handleAlertTouchMove}
            onTouchEnd={resetAlertParallax}
            onTouchCancel={resetAlertParallax}
          >
                      <View style={styles.alertPhoneFrame}>
              {FLOATING_ALERT_LOGOS.map(item => (
                <Animated.View
                  key={item.style}
                  style={[
                    styles.alertFloatingLogo,
                    styles[item.style],
                    {
                      transform: [
                        { translateX: Animated.add(Animated.multiply(backgroundDriftTranslateX, item.drift), backgroundParallaxTranslateX) },
                        { translateY: backgroundParallaxTranslateY },
                      ],
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.logo }}
                    style={styles.alertBackgroundLogoImage}
                  />
                </Animated.View>
              ))}

              <BlurView intensity={10} style={StyleSheet.absoluteFill} />

              <SafeAreaView style={styles.alertLandingForeground}>
                <View style={styles.alertLandingHeader}>
                  <Text style={styles.alertLandingTitle}>Gérez vos abonnements</Text>
                  <View style={styles.alertLandingTitleRow}>
                    <Text style={styles.alertLandingTitle}>sans aucune </Text>
                    <Animated.View style={[styles.alertDreamCapsule, { transform: [{ scale: capsulePulseAnim }] }]}>
                      <Text style={styles.alertDreamText}>Surprise</Text>
                    </Animated.View>
                  </View>
                  <Text style={styles.alertLandingTitle}>grâce aux alertes</Text>
                </View>

                <View style={styles.alertLandingFooter}>
                  <View style={styles.alertPreviewArea}>
                    <Animated.View
                      style={[
                        styles.alertCardsStack,
                        {
                          transform: [
                            { translateX: foregroundParallaxTranslateX },
                            { translateY: Animated.add(foregroundFloatTranslateY, foregroundParallaxTranslateY) },
                          ],
                        },
                      ]}
                    >
                      {NOTIFICATION_ALERT_PREVIEW.map((item, index) => (
                        <Animated.View
                          key={item.name}
                            style={[
                              styles.alertCard,
                              {
                                opacity: alertCardEntranceAnims[index],
                                transform: [
                                  {
                                    translateY: alertCardEntranceAnims[index].interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [16, 0],
                                    }),
                                  },
                                ],
                              },
                            ]}
                          >
                            <BrandLogo brand={item.brand} color={item.color} size={50} styles={styles} />
                          <View style={styles.alertCardCopy}>
                            <View style={styles.alertCardHeaderRow}>
                              <Text style={styles.alertCardName}>{item.name}</Text>
                              <Text style={styles.alertCardTime}>{item.time}</Text>
                            </View>
                            <Text style={styles.alertCardMessage} numberOfLines={2}>{item.msg}</Text>
                          </View>
                        </Animated.View>
                      ))}
                    </Animated.View>
                  </View>

                  <Animated.View
                    style={{
                      opacity: ctaEntranceAnim,
                      transform: [{ scale: ctaScale }],
                    }}
                  >
                    <TouchableOpacity
                      style={styles.alertStartButton}
                      onPress={nextStep}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.alertStartText}>Activer les notifications</Text>
                      <View style={styles.alertBellCircle}>
                        <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
                          <Bell size={20} color={'#10B981'} />
                        </Animated.View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                  
                  <TouchableOpacity 
                    onPress={skipNotificationStep} 
                    style={styles.alertLaterButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.alertLaterText}>
                      Plus tard
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.fullPageForm}
          >
            <ScrollView 
              contentContainerStyle={styles.formScroll}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => setStep(0)}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color={Colors.text} />
              </TouchableOpacity>

              <View style={styles.cardHeader}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              <View style={styles.inputGroup}>
                {isPhoneMode ? (
                  otpSent ? (
                    <Animated.View style={[
                      styles.inputWrapper, 
                      focusedField === 'otp' ? { borderColor: '#8B5CF6', backgroundColor: Colors.surface, ...Shadow.premium } : null, 
                      { transform: [{ scale: focusedField === 'otp' ? focusedInputScale : 1 }] }
                    ]}>
                      <View style={styles.inputIconWrapper}>
                        <LockKeyhole size={21} color={focusedField === 'otp' ? '#8B5CF6' : (isDark ? 'rgba(139, 92, 246, 0.65)' : 'rgba(139, 92, 246, 0.85)')} />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Code à 6 chiffres"
                        placeholderTextColor={Colors.textMuted}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        onFocus={() => setFocusedField('otp')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </Animated.View>
                  ) : (
                    <Animated.View style={[styles.inputWrapper, focusedField === 'phone' && styles.inputFocused, { paddingLeft: 8, transform: [{ scale: focusedField === 'phone' ? focusedInputScale : 1 }] }]}>
                      <View style={styles.countryPickerContainer}>
                        <TouchableOpacity
                          style={styles.countryPickerButton}
                          onPress={() => setCountryPickerVisible(true)}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Choisir le pays"
                        >
                          <Text style={styles.countryFlag}>{selectedPhoneCountry?.flag}</Text>
                          <Text style={styles.countryCallingCode}>+{callingCode}</Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={[styles.input, { flex: 1, paddingLeft: 8 }]}
                        placeholder="6 12 34 56 78"
                        placeholderTextColor={Colors.textMuted}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </Animated.View>
                  )
                ) : (
                  <>
                    {isSignupMode && (
                      <Animated.View style={[
                        styles.inputWrapper, 
                        focusedField === 'name' ? { borderColor: '#0EA5E9', backgroundColor: Colors.surface, ...Shadow.premium } : null, 
                        { transform: [{ scale: focusedField === 'name' ? focusedInputScale : 1 }] }
                      ]}>
                        <View style={styles.inputIconWrapper}>
                          <User size={21} color={focusedField === 'name' ? '#0EA5E9' : (isDark ? 'rgba(14, 165, 233, 0.65)' : 'rgba(14, 165, 233, 0.85)')} />
                        </View>
                        <TextInput
                          style={styles.input}
                          placeholder="Ayan Zayd"
                          placeholderTextColor={Colors.textMuted}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </Animated.View>
                    )}

                    {!isResetMode && (
                      <Animated.View style={[
                        styles.inputWrapper, 
                        focusedField === 'email' ? { borderColor: '#F59E0B', backgroundColor: Colors.surface, ...Shadow.premium } : null, 
                        { marginTop: isSignupMode ? 16 : 0, transform: [{ scale: focusedField === 'email' ? focusedInputScale : 1 }] }
                      ]}>
                        <View style={styles.inputIconWrapper}>
                          <Mail size={21} color={focusedField === 'email' ? '#F59E0B' : (isDark ? 'rgba(245, 158, 11, 0.65)' : 'rgba(245, 158, 11, 0.85)')} />
                        </View>
                        <TextInput
                          style={styles.input}
                          placeholder="email@gmail.com"
                          placeholderTextColor={Colors.textMuted}
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </Animated.View>
                    )}

                    {!isForgotMode && (
                      <Animated.View style={[
                        styles.inputWrapper, 
                        focusedField === 'password' ? { borderColor: '#10B981', backgroundColor: Colors.surface, ...Shadow.premium } : null, 
                        { marginTop: 16, transform: [{ scale: focusedField === 'password' ? focusedInputScale : 1 }] }
                      ]}>
                        <View style={styles.inputIconWrapper}>
                          <LockKeyhole size={21} color={focusedField === 'password' ? '#10B981' : (isDark ? 'rgba(16, 185, 129, 0.65)' : 'rgba(16, 185, 129, 0.85)')} />
                        </View>
                        <TextInput
                          style={styles.input}
                          placeholder="........"
                          placeholderTextColor={Colors.textMuted}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                          {showPassword ? <EyeOff size={18} color={Colors.textSecondary} /> : <Eye size={18} color={Colors.textSecondary} />}
                        </TouchableOpacity>
                      </Animated.View>
                    )}
                  </>
                )}
              </View>

              {mode === 'login' && (
                <TouchableOpacity onPress={() => switchMode('forgot')} style={{ alignSelf: 'flex-end', marginBottom: 25 }} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Forgot Password</Text>
                </TouchableOpacity>
              )}

              {isSignupMode && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
                  <View style={styles.checkboxActive}>
                    <ShieldCheck size={12} color={Colors.pureWhite} />
                  </View>
                  <Text style={styles.termsText}>I agree to the terms & conditions</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonLoading]}
                onPress={isPhoneMode ? (otpSent ? handleVerifyOtp : handleSendOtp) : handleAuth}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.pureWhite} />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>{submitLabel}</Text>
                    <View style={styles.submitButtonCircle}>
                      <Animated.View style={{ transform: [{ translateX: arrowWiggleAnim }] }}>
                      <ArrowRight size={20} color={'#10B981'} />
                      </Animated.View>
                    </View>
                  </>
                )}
              </TouchableOpacity>

              {!isForgotMode && !isPhoneMode && (
                <>
                  <View style={styles.socialDivider}>
                    <Text style={styles.socialDividerText}>Ou {isSignupMode ? 's\'inscrire' : 'se connecter'} avec</Text>
                  </View>

                  <View style={styles.socialCircleGroup}>
                    <TouchableOpacity style={styles.socialCircleBtn} onPress={() => handleSocialLogin('google')}>
                      <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.socialIconSmall} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialCircleBtn} onPress={() => switchMode('phone')}>
                      <Phone size={18} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {isPhoneMode && (
                <>
                  <View style={styles.socialDivider}>
                    <Text style={styles.socialDividerText}>Ou revenir à</Text>
                  </View>
                  <View style={styles.socialCircleGroup}>
                    <TouchableOpacity style={styles.socialCircleBtn} onPress={() => switchMode('login')}>
                      <Mail size={18} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity
                onPress={() => switchMode(isSignupMode ? 'login' : 'signup')}
                style={styles.bottomToggle}
              >
                <Text style={styles.toggleMuted}>
                  {isSignupMode ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.toggleAction}>{isSignupMode ? 'Sign In' : 'Sign Up'}</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </LinearGradient>

      <Modal
        visible={countryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <View style={styles.countryModalBackdrop}>
          <View style={styles.countryModalCard}>
            <View style={styles.countryModalHeader}>
              <Text style={styles.countryModalTitle}>Choisir le pays</Text>
              <TouchableOpacity
                style={styles.countryModalCloseButton}
                onPress={() => setCountryPickerVisible(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.countryModalCloseText}>x</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.countrySearchInput}
              placeholder="Rechercher un pays ou un code"
              placeholderTextColor={Colors.textMuted}
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoCapitalize="none"
            />

            <FlatList
              data={filteredPhoneCountries}
              keyExtractor={(item) => item.cca2}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.countryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryRow,
                    item.cca2 === countryCode && styles.countryRowActive,
                  ]}
                  onPress={() => {
                    setCountryCode(item.cca2);
                    setCallingCode(item.callingCode[0]);
                    setCountrySearch('');
                    setCountryPickerVisible(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.countryRowFlag}>{item.flag}</Text>
                  <Text style={styles.countryRowName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.countryRowCode}>+{item.callingCode[0]}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={(
                <Text style={styles.countryEmptyText}>Aucun pays trouve.</Text>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  ); 
}

function makeStyles(Colors, isDark) {
  const warm = isDark ? Colors.accentSecondary : '#F59E0B';
  const cardBg = Colors.surface;
  const pageBg = Colors.bg;
  const isShortScreen = SCREEN_HEIGHT < 740;
  const alertPreviewHeight = Math.min(610, Math.max(500, SCREEN_HEIGHT - 285));

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: pageBg },
    container: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 26,
      paddingTop: 30,
      paddingBottom: 34,
    },
    heroPanel: {
      minHeight: 380,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 20,
      paddingBottom: 20,
    },
    heroTitle: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.text,
      fontSize: 28,
      textAlign: 'center',
      marginTop: 24,
      maxWidth: 320,
      lineHeight: 34,
      letterSpacing: -0.8,
    },
    heroSubtitle: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: 12,
      maxWidth: 290,
      letterSpacing: -0.2,
    },
    fullPageForm: {
      flex: 1,
    },
    formScroll: {
      flexGrow: 1,
      paddingHorizontal: 26,
      paddingTop: 20,
      paddingBottom: 40,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 30,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    cardHeader: {
      marginBottom: 35,
    },
    title: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.text,
      fontSize: 32,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    subtitle: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      opacity: 0.7,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)',
      paddingHorizontal: 20,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    inputFocused: {
      borderColor: Colors.accent,
      backgroundColor: Colors.surface,
      ...Shadow.premium,
    },
    inputIconWrapper: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    countryPickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: Colors.border,
      paddingRight: 8,
      marginRight: 8,
    },
    countryPickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 74,
      minHeight: 36,
      gap: 6,
    },
    countryFlag: {
      fontSize: 20,
      lineHeight: 24,
    },
    countryCallingCode: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 14,
      color: Colors.text,
    },
    countryModalBackdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(15, 23, 42, 0.36)',
      justifyContent: 'flex-end',
    },
    countryModalCard: {
      maxHeight: '78%',
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: Platform.OS === 'ios' ? 30 : 18,
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadow.premium,
    },
    countryModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    countryModalTitle: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 18,
      color: Colors.text,
    },
    countryModalCloseButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surfaceAlt,
    },
    countryModalCloseText: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 18,
      lineHeight: 20,
      color: Colors.textSecondary,
    },
    countrySearchInput: {
      height: 48,
      borderRadius: 16,
      paddingHorizontal: 16,
      marginBottom: 12,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
      borderWidth: 1,
      borderColor: Colors.border,
      ...Fonts.primary,
      ...Fonts.semiBold,
      fontSize: 14,
      color: Colors.text,
    },
    countryList: {
      flexGrow: 0,
    },
    countryRow: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      borderRadius: 16,
      marginBottom: 6,
    },
    countryRowActive: {
      backgroundColor: addAlpha(Colors.accent, isDark ? 0.22 : 0.12),
    },
    countryRowFlag: {
      width: 34,
      fontSize: 22,
      lineHeight: 28,
      marginRight: 10,
    },
    countryRowName: {
      flex: 1,
      ...Fonts.primary,
      ...Fonts.semiBold,
      fontSize: 15,
      color: Colors.text,
    },
    countryRowCode: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 14,
      color: Colors.textSecondary,
      marginLeft: 12,
    },
    countryEmptyText: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textMuted,
      textAlign: 'center',
      paddingVertical: 28,
    },
    inputIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    input: {
      flex: 1,
      ...Fonts.primary,
      ...Fonts.semiBold,
      fontSize: 15,
      color: Colors.text,
    },
    forgotText: {
      ...Fonts.primary,
      ...Fonts.bold,
      color: Colors.text,
      fontSize: 14,
      textDecorationLine: 'underline',
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.accent,
      borderRadius: 32,
      height: 64,
      paddingLeft: 28,
      paddingRight: 8,
      marginBottom: 30,
      ...Shadow.premium,
    },
    submitButtonText: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.pureWhite,
      fontSize: 18,
    },
    submitButtonCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.pureWhite,
      justifyContent: 'center',
      alignItems: 'center',
    },
    socialDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 25,
    },
    socialDividerText: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textMuted,
      fontSize: 13,
    },
    socialCircleGroup: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginBottom: 35,
    },
    socialCircleBtn: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: Colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    socialIconSmall: {
      width: 22,
      height: 22,
    },
    bottomToggle: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    toggleMuted: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textMuted,
      fontSize: 14,
    },
    toggleAction: {
      color: Colors.accent,
      ...Fonts.bold,
    },
    checkboxActive: {
      width: 20,
      height: 20,
      borderRadius: 6,
      backgroundColor: Colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    termsText: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textSecondary,
      fontSize: 13,
      flex: 1,
    },
    mainCta: {
      height: 56,
      borderRadius: Radius.pill,
      paddingHorizontal: 28,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 24,
      minWidth: 230,
      flexDirection: 'row',
      ...Shadow.medium,
    },
    mainCtaText: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.pureWhite,
      fontSize: 15,
      letterSpacing: 0,
    },
    skipBtn: {
      marginTop: 16,
      padding: 10,
    },
    skipText: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textSecondary,
      fontSize: 14,
      opacity: 0.6,
    },
    notifStepContainer: {
      width: '100%',
      alignItems: 'center',
      paddingTop: 20,
    },
    notifDesignContainer: {
      width: '100%',
      alignItems: 'center',
      paddingTop: 0,
    },
    designStatusBar: {
      display: 'none',
      width: '100%',
      height: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 22,
      marginBottom: 0,
    },
    designStatusTime: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.text,
      fontSize: 16,
      letterSpacing: 0,
      width: 58,
    },
    designIsland: {
      width: 118,
      height: 38,
      borderRadius: 19,
      backgroundColor: '#000',
    },
    designStatusRight: {
      width: 74,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 6,
    },
    signalBars: {
      width: 18,
      height: 14,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 2,
    },
    signalBar: {
      width: 3,
      borderRadius: 2,
      backgroundColor: Colors.text,
    },
    signalBarOne: { height: 6 },
    signalBarTwo: { height: 10 },
    signalBarThree: { height: 14 },
    wifiMark: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.text,
      fontSize: 17,
      lineHeight: 18,
      transform: [{ rotate: '180deg' }],
    },
    batteryPill: {
      minWidth: 28,
      height: 17,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.text,
    },
    batteryText: {
      ...Fonts.primary,
      ...Fonts.black,
      color: pageBg,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 0,
    },
    phonePoster: {
      width: '100%',
      maxWidth: 360,
      height: 410,
      alignItems: 'center',
      overflow: 'visible',
      marginBottom: 0,
    },
    ambientGlow: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.06)',
      top: 130,
      left: '50%',
      marginLeft: -70,
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 50,
    },
    bgFloatingCard: {
      position: 'absolute',
      padding: 10,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(25, 25, 30, 0.92)' : 'rgba(255, 255, 255, 0.96)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      ...Shadow.premium,
      zIndex: 1,
    },
    bgFloatingCardLeft: {
      left: -20,
      top: 110,
      transform: [{ rotate: '-12deg' }],
    },
    bgFloatingCardRight: {
      right: -25,
      top: 220,
      transform: [{ rotate: '12deg' }],
    },
    bgFloatingCardTitle: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 9,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    bgFloatingCardValue: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 13,
      color: isDark ? '#FFF' : '#0F172A',
      marginTop: 2,
    },
    bgFloatingCardSub: {
      ...Fonts.primary,
      ...Fonts.medium,
      fontSize: 8,
      color: '#10B981',
      marginTop: 1,
    },
    phoneShell: {
      position: 'absolute',
      top: 4,
      width: 260,
      height: 460,
      borderRadius: 44,
      backgroundColor: '#0D0D0F',
      padding: 6,
      borderWidth: 2,
      borderColor: '#2A2A2E',
      ...Shadow.premium,
      zIndex: 2,
    },
    phoneSideButtonLeft: {
      position: 'absolute',
      left: -3,
      top: 96,
      width: 3,
      height: 58,
      borderRadius: 2,
      backgroundColor: '#111',
    },
    phoneSideButtonRight: {
      position: 'absolute',
      right: -3,
      top: 130,
      width: 3,
      height: 78,
      borderRadius: 2,
      backgroundColor: '#111',
    },
    phoneGlass: {
      flex: 1,
      width: '100%',
      height: '100%',
      borderRadius: 38,
      alignItems: 'center',
      paddingTop: 15,
      overflow: 'hidden',
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    phonePhoto: {
      borderRadius: 38,
    },
    phoneBackground: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    phonePhotoWash: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(255, 255, 255, 0.68)',
    },
    dynamicIslandLarge: {
      position: 'absolute',
      top: 12,
      width: 74,
      height: 21,
      borderRadius: 11,
      backgroundColor: '#050505',
    },
    dashboardContainer: {
      flex: 1,
      width: '100%',
      paddingTop: 36,
    },
    mockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      marginTop: 4,
    },
    mockGreeting: {
      ...Fonts.primary,
      ...Fonts.medium,
      fontSize: 10,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    mockSubtitle: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 13,
      color: isDark ? '#FFF' : '#0F172A',
      marginTop: 1,
    },
    mockAvatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
    },
    mockSearchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 30,
      marginTop: 10,
      marginHorizontal: 12,
    },
    mockSearchText: {
      ...Fonts.primary,
      ...Fonts.medium,
      fontSize: 10,
      color: isDark ? '#64748B' : '#94A3B8',
    },
    mockPillsContainer: {
      marginTop: 10,
      height: 22,
    },
    mockPill: {
      paddingHorizontal: 10,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      height: 20,
    },
    mockPillText: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 8.5,
      color: '#FFF',
    },
    mockSectionTitle: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 11.5,
      color: isDark ? '#FFF' : '#000',
      marginHorizontal: 12,
      marginTop: 14,
      letterSpacing: -0.2,
    },
    mockList: {
      flex: 1,
      marginTop: 4,
      paddingHorizontal: 12,
      gap: 8,
    },
    mockCard: {
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(30, 30, 35, 0.6)' : '#F8FAFC',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      paddingBottom: 6,
      ...Shadow.soft,
    },
    mockCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      height: 38,
    },
    mockLogoWrapper: {
      width: 22,
      height: 22,
      borderRadius: 6,
      backgroundColor: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadow.soft,
    },
    mockCardLogo: {
      width: 14,
      height: 14,
      borderRadius: 4,
      backgroundColor: '#FFF',
    },
    mockCardTitle: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 10,
      color: '#FFF',
      marginLeft: 0,
    },
    mockCardCompany: {
      ...Fonts.primary,
      ...Fonts.medium,
      fontSize: 7.5,
      color: 'rgba(255, 255, 255, 0.7)',
      marginTop: 0.5,
    },
    mockCardViewBtn: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    mockCardViewText: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 8,
      color: '#FFF',
    },
    mockCardBody: {
      paddingHorizontal: 8,
      paddingTop: 6,
    },
    mockCardTagRow: {
      flexDirection: 'row',
      gap: 4,
    },
    mockCardTag: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    mockCardTagText: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 8,
      color: isDark ? '#94A3B8' : '#475569',
    },
    mockCardDescription: {
      ...Fonts.primary,
      ...Fonts.medium,
      fontSize: 8,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 5,
      lineHeight: 11,
    },
    budgetProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    progressBarBg: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      marginRight: 6,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 2,
    },
    budgetPercentText: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 7.5,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    mockCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
      borderTopWidth: 0.5,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      paddingTop: 4,
    },
    mockCardFooterText: {
      ...Fonts.primary,
      ...Fonts.medium,
      fontSize: 8,
      color: isDark ? '#64748B' : '#94A3B8',
    },
    mockCardPrice: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 9,
      color: isDark ? '#FFF' : '#000',
    },
    floatingNotifCard: {
      position: 'absolute',
      left: 12,
      right: 12,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      ...Shadow.premium,
      zIndex: 9999,
    },
    designNotifCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    designNotifCard: {
      height: 58,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      ...Shadow.soft,
    },
    designNotifAvatar: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    designNotifBadge: {
      position: 'absolute',
      left: 40,
      top: 35,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF4C6A',
      borderWidth: 2,
      borderColor: Colors.pureWhite,
    },
    designNotifBadgeGreen: {
      backgroundColor: '#70D96B',
    },
    designNotifBadgeText: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.pureWhite,
      fontSize: 10,
      lineHeight: 12,
    },
    designNotifCopy: {
      flex: 1,
      marginLeft: 12,
      minWidth: 0,
    },
    designNotifRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    designNotifName: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.text,
      fontSize: 13,
      letterSpacing: -0.2,
    },
    designNotifTime: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textMuted,
      fontSize: 11,
    },
    designNotifDesc: {
      ...Fonts.primary,
      ...Fonts.medium,
      color: Colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    notifStackLine1: {
      height: 5,
      width: '86%',
      backgroundColor: Colors.surfaceAlt,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      marginTop: -2,
      zIndex: -1,
      borderWidth: 0.4,
      borderColor: Colors.border,
    },
    notifStackLine2: {
      height: 5,
      width: '80%',
      backgroundColor: Colors.surfaceAlt,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      marginTop: -2,
      zIndex: -2,
      borderWidth: 0.4,
      borderColor: Colors.border,
    },

    notifGradient: {
      position: 'absolute',
      top: -100,
      left: -100,
      right: -100,
      bottom: -100,
      opacity: 0.4,
    },
    phoneMockup: {
      width: 260,
      height: 480,
      borderRadius: 48,
      backgroundColor: '#000',
      padding: 10,
      borderWidth: 2,
      borderColor: '#333',
      marginBottom: 30,
      ...Shadow.premium,
      overflow: 'hidden',
    },
    phoneScreen: {
      flex: 1,
      backgroundColor: Colors.bg,
      borderRadius: 40,
      padding: 15,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    dynamicIsland: {
      width: 80,
      height: 24,
      backgroundColor: isDark ? '#000' : '#1A1A1A',
      borderRadius: 12,
      marginTop: 5,
      marginBottom: 30,
    },
    phoneDate: {
      ...Fonts.primary,
      ...Fonts.bold,
      color: Colors.textSecondary,
      fontSize: 14,
      opacity: 0.7,
    },
    phoneTime: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.text,
      fontSize: 64,
      marginVertical: 5,
      letterSpacing: -2,
    },
    notifCard: {
      width: '108%',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
      borderRadius: 22,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    notifHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    notifIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
    },
    notifContent: {
      flex: 1,
      marginLeft: 12,
    },
    notifRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notifTitle: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 14,
      color: Colors.text,
    },
    notifDesc: {
      ...Fonts.primary,
      fontSize: 12,
      color: Colors.textSecondary,
      marginTop: 1,
    },
    notifTime: {
      fontSize: 11,
      color: Colors.textMuted,
    },
    emojiWrap: {
      position: 'absolute',
      zIndex: 10,
    },
    emoji: {
      fontSize: 28,
    },
    orbitRing: {
      position: 'absolute',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
      borderStyle: 'dashed',
    },
    orbitContainer: {
      width: 210,
      height: 210,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    orbitInner: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    orbitAvatarWrapper: {
      position: 'absolute',
      width: 44,
      height: 44,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: isDark ? Colors.borderStrong : '#FFF',
      ...Shadow.soft,
    },
    orbitSquicleWrapper: {
      position: 'absolute',
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: Colors.surface,
      padding: 8,
      ...Shadow.soft,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    orbitAssetImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    centerSquicleContainer: {
      position: 'absolute',
      width: 84,
      height: 84,
      borderRadius: 24,
      backgroundColor: Colors.surface,
      padding: 0,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadow.premium,
    },
    centerAvatar: {
      width: '100%',
      height: '100%',
    },
    landingContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      position: 'relative',
      overflow: 'hidden',
    },
    alertScene: {
      flex: 1,
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: isDark ? '#050B18' : '#FFFFFF',
    },
    alertPhoneFrame: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: 0,
      borderWidth: 0,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      position: 'relative',
    },
    gridWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.9,
      zIndex: 1,
    },
    alertGridWrapper: {
      opacity: 0.12,
      transform: [{ scale: 0.95 }],
    },
    gridTiltedContainer: {
      width: '140%',
      height: '140%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    staggeredRow: {
      flexDirection: 'row',
      marginVertical: 12,
      alignSelf: 'stretch',
    },
    companyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 18,
      marginHorizontal: 10,
      height: 54,
    },
    companyLogo: {
      width: 24,
      height: 24,
      marginRight: 10,
      resizeMode: 'contain',
    },
    companyCardText: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 15,
      color: Colors.text,
      letterSpacing: -0.2,
    },
    landingForeground: {
      flex: 1,
      justifyContent: 'space-between',
      zIndex: 10,
      paddingTop: Platform.OS === 'ios' ? 50 : 25,
      paddingBottom: 25,
    },
    alertLandingForeground: {
      flex: 1,
      justifyContent: 'space-between',
      zIndex: 10,
      paddingTop: Platform.OS === 'ios' ? (isShortScreen ? 30 : 48) : 24,
      paddingBottom: isShortScreen ? 16 : 22,
    },
    alertLandingHeader: {
      alignItems: 'center',
      marginTop: isShortScreen ? 22 : 46,
      paddingHorizontal: 22,
    },
    alertLandingTitle: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: isShortScreen ? 27 : 30,
      lineHeight: isShortScreen ? 34 : 39,
      color: Colors.text,
      textAlign: 'center',
      letterSpacing: 0,
    },
    alertLandingTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 1,
      flexWrap: 'wrap',
    },
    alertDreamCapsule: {
      backgroundColor: Colors.accent,
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertDreamText: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: isShortScreen ? 25 : 28,
      lineHeight: isShortScreen ? 30 : 34,
      color: Colors.pureWhite,
      letterSpacing: 0,
    },
    landingHeader: {
      alignItems: 'center',
      marginTop: 50,
      paddingHorizontal: 20,
    },
    landingTitlePart1: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 38,
      lineHeight: 48,
      color: Colors.text,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    landingTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 2,
    },
    landingTitlePart2: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 38,
      lineHeight: 48,
      color: Colors.text,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    dreamCapsule: {
      backgroundColor: Colors.accent,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 2,
      borderWidth: 1.5,
      borderColor: Colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dreamText: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 34,
      lineHeight: 40,
      color: Colors.pureWhite,
      letterSpacing: -0.5,
    },
    arrowWrapper: {
      marginTop: 15,
      marginLeft: -50,
    },
    landingFooter: {
      paddingHorizontal: 24,
      marginBottom: Platform.OS === 'ios' ? 24 : 34,
    },
    alertLandingFooter: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 24,
    },
    startSearchingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#10B981',
      borderRadius: 32,
      height: 64,
      paddingLeft: 28,
      paddingRight: 8,
      ...Shadow.premium,
    },
    startSearchingText: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 18,
      color: Colors.pureWhite,
    },
    arrowCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.pureWhite,
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertPreviewArea: {
      height: alertPreviewHeight,
      marginTop: isShortScreen ? 8 : 14,
      marginBottom: isShortScreen ? 10 : 18,
      justifyContent: 'center',
      position: 'relative',
    },
    alertCardsStack: {
      width: '88%',
      alignSelf: 'center',
      gap: isShortScreen ? 13 : 20,
      zIndex: 2,
    },
    alertCard: {
      minHeight: isShortScreen ? 72 : 82,
      borderRadius: 17,
      backgroundColor: isDark ? 'rgba(5, 11, 24, 0.96)' : 'rgba(255, 255, 255, 0.96)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isShortScreen ? 14 : 16,
      paddingVertical: isShortScreen ? 10 : 13,
      ...Shadow.premium,
    },
    brandLogo: {
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      overflow: 'hidden',
    },
    brandLogoMuted: {
      marginRight: 0,
      transform: [{ scale: 1.08 }],
      shadowColor: Colors.text,
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
    },
    brandMarkText: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.pureWhite,
      letterSpacing: 0,
    },
    dropboxGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    dropboxTile: {
      borderRadius: 1.5,
      transform: [{ rotate: '45deg' }],
    },
    alertLogoWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    alertLogo: {
      width: 34,
      height: 34,
      borderRadius: 17,
      resizeMode: 'contain',
    },
    alertCardCopy: {
      flex: 1,
      minWidth: 0,
    },
    alertCardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    alertCardName: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: isShortScreen ? 14 : 16,
      color: Colors.text,
      letterSpacing: 0,
    },
    alertCardMessage: {
      ...Fonts.primary,
      ...Fonts.semiBold,
      fontSize: isShortScreen ? 12.5 : 14,
      lineHeight: isShortScreen ? 17 : 19,
      color: Colors.textSecondary,
    },
    alertCardTime: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: isShortScreen ? 12 : 14,
      color: Colors.textSecondary,
    },
    alertFloatingLogo: {
      position: 'absolute',
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    alertBackgroundLogoImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      resizeMode: 'contain',
    },
    alertFloatSpotify: {
      left: -52,
      top: 50,
    },
    alertFloatDisney: {
      right: -54,
      top: 24,
    },
    alertFloatDropbox: {
      left: -58,
      top: 146,
    },
    alertFloatPs: {
      right: 20,
      bottom: 92,
    },
    alertFloatYellow: {
      left: -58,
      bottom: 36,
    },
    alertStartButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '84%',
      alignSelf: 'center',
      backgroundColor: '#10B981',
      borderRadius: 32,
      height: 66,
      paddingLeft: 28,
      paddingRight: 8,
      ...Shadow.premium,
    },
    alertStartText: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 18,
      color: Colors.pureWhite,
      letterSpacing: 0,
    },
    alertBellCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.pureWhite,
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertLaterButton: {
      marginTop: 16,
      alignItems: 'center',
    },
    alertLaterText: {
      ...Fonts.primary,
      ...Fonts.medium,
      fontSize: 15,
      color: Colors.textSecondary,
      textDecorationLine: 'underline',
    },
    miniBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginLeft: 10,
    },
    miniBadgeText: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 11,
      color: '#FFF',
    },
    notifStackContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 110,
      width: '100%',
      marginTop: Platform.OS === 'ios' ? 20 : 10,
      marginBottom: 10,
      zIndex: 100,
    },
    notifCardBase: {
      position: 'absolute',
      width: '90%',
      borderRadius: 20,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      ...Shadow.premium,
    },
    notifCardFront: {
      zIndex: 2,
    },
    notifCardBack: {
      zIndex: 1,
    },
    notifCardAvatar: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    notifCardCopy: {
      flex: 1,
      marginLeft: 12,
    },
    notifCardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    notifCardAppName: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 13.5,
      letterSpacing: -0.2,
    },
    notifCardTime: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 11,
    },
    notifCardBodyText: {
      ...Fonts.primary,
      ...Fonts.medium,
      fontSize: 11.5,
      letterSpacing: -0.1,
    },
    bgNotifCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginHorizontal: 8,
      width: 220,
      height: 52,
      ...Shadow.soft,
    },
    bgNotifLogo: {
      width: 22,
      height: 22,
      borderRadius: 6,
      marginRight: 10,
      resizeMode: 'contain',
    },
    bgNotifContent: {
      flex: 1,
    },
    bgNotifHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    bgNotifAppName: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 11.5,
      color: Colors.text,
    },
    bgNotifTime: {
      ...Fonts.primary,
      fontSize: 9,
      color: Colors.textMuted,
    },
    bgNotifMsg: {
      ...Fonts.primary,
      fontSize: 9.5,
      color: Colors.textSecondary,
    },
  });
}
