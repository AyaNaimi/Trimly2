import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { ArrowRight } from 'lucide-react-native';
import { Fonts, Metrics, Radius, Shadow, Spacing } from '../theme';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { PremiumHaptics } from '../utils/haptics';

const pawAnimation = require('../../assets/pate.json');
const darkPawColor = [1, 0.62, 0, 1];

function isBlackFillColor(value) {
  return Array.isArray(value)
    && value.length >= 3
    && value[0] === 0
    && value[1] === 0
    && value[2] === 0;
}

function recolorLottieFills(node) {
  if (Array.isArray(node)) {
    return node.map(recolorLottieFills);
  }

  if (!node || typeof node !== 'object') {
    return node;
  }

  const next = {};
  Object.keys(node).forEach((key) => {
    next[key] = recolorLottieFills(node[key]);
  });

  if (next.ty === 'fl' && next.c?.k && isBlackFillColor(next.c.k)) {
    next.c = { ...next.c, k: darkPawColor };
  }

  return next;
}

const copy = {
  fr: {
    eyebrow: 'Essai gratuit termine',
    activeEyebrow: 'Essai gratuit actif',
    title: 'Passez a Trimly Pro pour continuer',
    activeTitle: 'Passez a Trimly Pro sans attendre',
    subtitle:
      'Votre periode d essai est terminee. Pour garder l acces aux actions essentielles, choisissez un plan et continuez a gerer votre budget sans interruption.',
    activeSubtitle:
      'Il vous reste {{days}} jours d essai. Activez Pro maintenant pour garder le scan, les alertes et les imports sans coupure.',
    featuresTitle: 'Inclus dans Pro',
    features: [
      'Scan intelligent des emails et import des abonnements',
      'Ajout illimite de transactions, categories et abonnements',
      'Alertes de paiement, projections et suivi des economies',
      'Automatisation de resiliation avec lettre et suivi',
    ],
    annual: 'Plan annuel',
    annualPrice: 'Meilleure valeur',
    monthly: 'Plan mensuel',
    monthlyPrice: 'Flexible',
    loading: 'Redirection vers Stripe...',
    later: 'Plus tard',
    loginRequired: 'Connectez-vous pour choisir un plan.',
    success: 'Bienvenue sur Trimly Pro.',
    pending: 'Paiement en attente. Revenez dans quelques instants si le statut ne se met pas a jour.',
    error: 'Impossible d ouvrir le paiement pour le moment.',
  },
  en: {
    eyebrow: 'Free trial ended',
    activeEyebrow: 'Free trial active',
    title: 'Upgrade to Trimly Pro to continue',
    activeTitle: 'Upgrade to Trimly Pro anytime',
    subtitle:
      'Your trial period has ended. Choose a plan to keep using essential actions and manage your budget without interruption.',
    activeSubtitle:
      'You still have {{days}} trial days left. Activate Pro now to keep scans, alerts and imports running without interruption.',
    featuresTitle: 'Included in Pro',
    features: [
      'Smart email scan and subscription import',
      'Unlimited transactions, categories and subscriptions',
      'Payment alerts, projections and savings tracking',
      'Cancellation automation with letter and follow-up',
    ],
    annual: 'Annual plan',
    annualPrice: 'Best value',
    monthly: 'Monthly plan',
    monthlyPrice: 'Flexible',
    loading: 'Redirecting to Stripe...',
    later: 'Later',
    loginRequired: 'Please sign in before choosing a plan.',
    success: 'Welcome to Trimly Pro.',
    pending: 'Payment pending. Check again in a moment if the status does not update.',
    error: 'Unable to open checkout right now.',
  },
};

export default function TrialExpiredModal() {
  const {
    state,
    trialDaysLeft,
    startStripeCheckout,
    refreshBillingStatus,
    closeTrialExpiredPaywall,
  } = useApp();
  const { Colors, isDark } = useTheme();
  const { locale, t } = useLanguage();
  const [billingLoading, setBillingLoading] = useState(false);

  const strings = locale === 'fr' ? copy.fr : copy.en;
  const visible = !!state.paywallPrompt;
  const trialDays = Number(state.paywallPrompt?.trialDaysLeft ?? trialDaysLeft ?? 0);
  const isActiveTrial = trialDays > 0;
  const premiumColor = isDark ? Colors.accentSecondary : Colors.accent;
  const animationSource = useMemo(
    () => (isDark ? recolorLottieFills(pawAnimation) : pawAnimation),
    [isDark]
  );
  const styles = makeStyles(Colors, isDark, premiumColor);
  const subtitle = isActiveTrial
    ? strings.activeSubtitle.replace('{{days}}', trialDays || '')
    : strings.subtitle;

  async function subscribe(plan) {
    if (!state.session) {
      Alert.alert('Trimly Pro', strings.loginRequired);
      return;
    }

    setBillingLoading(true);
    try {
      const billing = await startStripeCheckout(plan);
      if (billing?.cancelled) return;
      await refreshBillingStatus();
      if (billing?.plan) {
        PremiumHaptics.success();
        closeTrialExpiredPaywall();
        Alert.alert('Trimly Pro', strings.success);
      } else {
        Alert.alert('Trimly Pro', strings.pending);
      }
    } catch (error) {
      Alert.alert(t('common.error') || 'Error', error?.message || strings.error);
    } finally {
      setBillingLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeTrialExpiredPaywall}
    >
      <View style={styles.wrap}>
        <View style={styles.handle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.animationWrap}>
            <LottieView
              source={animationSource}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          <Text style={styles.eyebrow}>{isActiveTrial ? strings.activeEyebrow : strings.eyebrow}</Text>
          <Text style={styles.title}>{isActiveTrial ? strings.activeTitle : strings.title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.featurePanel}>
            <Text style={styles.featureTitle}>{strings.featuresTitle}</Text>
            {strings.features.map((item) => (
              <View key={item} style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.planStack}>
            <Pressable
              style={[styles.planButton, billingLoading && styles.disabled]}
              onPress={() => subscribe('annual')}
              disabled={billingLoading}
            >
              <View>
                <Text style={styles.planTitle}>{strings.annual}</Text>
                <Text style={styles.planMeta}>{strings.annualPrice}</Text>
              </View>
              <View style={styles.planCircle}>
                {billingLoading ? <ActivityIndicator color={premiumColor} /> : <ArrowRight size={20} color={premiumColor} />}
              </View>
            </Pressable>

            <Pressable
              style={[styles.planButtonSecondary, billingLoading && styles.disabled]}
              onPress={() => subscribe('monthly')}
              disabled={billingLoading}
            >
              <View>
                <Text style={styles.planTitleSecondary}>{strings.monthly}</Text>
                <Text style={styles.planMetaSecondary}>{strings.monthlyPrice}</Text>
              </View>
              <View style={styles.planCircleSecondary}>
                {billingLoading ? <ActivityIndicator color="#FFFFFF" /> : <ArrowRight size={20} color="#FFFFFF" />}
              </View>
            </Pressable>
          </View>

          {billingLoading ? <Text style={styles.loadingText}>{strings.loading}</Text> : null}

          <Pressable
            style={styles.laterButton}
            onPress={() => {
              PremiumHaptics.click();
              closeTrialExpiredPaywall();
            }}
            disabled={billingLoading}
          >
            <Text style={styles.laterText}>{strings.later}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(Colors, isDark, premiumColor) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: Colors.bg,
      paddingHorizontal: Metrics.screenPadding,
    },
    handle: {
      alignSelf: 'center',
      width: 46,
      height: 5,
      borderRadius: 999,
      backgroundColor: Colors.borderStrong,
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    content: {
      paddingBottom: 60,
      alignItems: 'stretch',
    },
    animationWrap: {
      width: 148,
      height: 148,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    animation: {
      width: 148,
      height: 148,
    },
    eyebrow: {
      ...Fonts.primary,
      ...Fonts.bold,
      color: premiumColor,
      fontSize: 12,
      textAlign: 'center',
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    title: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.text,
      fontSize: 28,
      lineHeight: 34,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      ...Fonts.primary,
      color: Colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      marginBottom: 28,
    },
    featurePanel: {
      borderRadius: Radius.lg,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing.md,
      gap: 12,
      ...Shadow.soft,
    },
    featureTitle: {
      ...Fonts.primary,
      ...Fonts.bold,
      color: Colors.text,
      fontSize: 15,
      marginBottom: 2,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: premiumColor,
      marginTop: 7,
    },
    featureText: {
      ...Fonts.primary,
      color: Colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
    },
    planStack: {
      gap: 12,
      marginTop: 28,
    },
    planButton: {
      height: 64,
      borderRadius: 32,
      backgroundColor: premiumColor,
      paddingLeft: 28,
      paddingRight: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...Shadow.premium,
    },
    planButtonSecondary: {
      height: 64,
      borderRadius: 32,
      backgroundColor: isDark ? 'rgba(255, 145, 0, 0.10)' : Colors.surface,
      borderWidth: 1.5,
      borderColor: isDark ? premiumColor : Colors.borderStrong,
      paddingLeft: 28,
      paddingRight: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    disabled: {
      opacity: 0.65,
    },
    planTitle: {
      ...Fonts.primary,
      ...Fonts.black,
      color: '#FFFFFF',
      fontSize: 18,
    },
    planMeta: {
      ...Fonts.primary,
      color: 'rgba(255,255,255,0.78)',
      fontSize: 13,
      marginTop: 4,
    },
    planTitleSecondary: {
      ...Fonts.primary,
      ...Fonts.black,
      color: Colors.text,
      fontSize: 18,
    },
    planMetaSecondary: {
      ...Fonts.primary,
      color: Colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
    },
    planCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    planCircleSecondary: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: premiumColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      ...Fonts.primary,
      color: Colors.textSecondary,
      textAlign: 'center',
      fontSize: 13,
      marginTop: 14,
    },
    laterButton: {
      alignSelf: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      marginTop: 12,
    },
    laterText: {
      ...Fonts.primary,
      ...Fonts.bold,
      color: Colors.textSecondary,
      fontSize: 14,
    },
  });
}
