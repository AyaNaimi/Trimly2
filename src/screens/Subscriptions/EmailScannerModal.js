import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../utils/supabase';
import { Fonts, Radius, Shadow } from '../../theme';
import { PremiumHaptics } from '../../utils/haptics';
import { ServiceLogo } from '../../components';
import { EmailService } from '../../services/emailService';
import { getStoredGoogleProviderTokens } from '../../services/googleAuthService';

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

const SERVICE_LOGO_MAP = {
  netflix: 'https://logo.clearbit.com/netflix.com',
  spotify: 'https://logo.clearbit.com/spotify.com',
  disney: 'https://logo.clearbit.com/disneyplus.com',
  disneyplus: 'https://logo.clearbit.com/disneyplus.com',
  apple: 'https://logo.clearbit.com/apple.com',
  'apple tv': 'https://logo.clearbit.com/apple.com',
  youtube: 'https://logo.clearbit.com/youtube.com',
  amazon: 'https://logo.clearbit.com/amazon.com',
  adobe: 'https://logo.clearbit.com/adobe.com',
  microsoft: 'https://logo.clearbit.com/microsoft.com',
  icloud: 'https://logo.clearbit.com/icloud.com',
  google: 'https://logo.clearbit.com/google.com',
  deezer: 'https://logo.clearbit.com/deezer.com',
  canal: 'https://logo.clearbit.com/canal-plus.com',
  notion: 'https://logo.clearbit.com/notion.so',
  dropbox: 'https://logo.clearbit.com/dropbox.com',
  nordvpn: 'https://logo.clearbit.com/nordvpn.com',
  chatgpt: 'https://logo.clearbit.com/openai.com',
  openai: 'https://logo.clearbit.com/openai.com',
  twitch: 'https://logo.clearbit.com/twitch.tv',
  hulu: 'https://logo.clearbit.com/hulu.com',
  hbo: 'https://logo.clearbit.com/hbo.com',
  slack: 'https://logo.clearbit.com/slack.com',
  zoom: 'https://logo.clearbit.com/zoom.us',
  figma: 'https://logo.clearbit.com/figma.com',
  github: 'https://logo.clearbit.com/github.com',
};

function getServiceLogo(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(SERVICE_LOGO_MAP)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

// SCAN_STAGES moved inside component for localization

export default function EmailScannerModal({
  visible,
  onClose,
  onImport,
  initialEmail = '',
  autoPrompt = false,
  existingSubscriptionNames = [],
}) {
  const { Colors, isDark } = useTheme();
  const {
    state,
    pendingDetectedSubscriptions,
    saveEmailScanResult,
    importDetectedSubscription,
    dismissDetectedSubscription,
  } = useApp();
  const { t, locale } = useLanguage();

  const SCAN_STAGES = useMemo(() => [
    t('scanner.stages.connecting'),
    t('scanner.stages.searching'),
    t('scanner.stages.analyzing'),
    t('scanner.stages.preparing'),
  ], [t]);

  const [step, setStep] = useState('choose');
  const [provider, setProvider] = useState(null);
  const [userEmail, setUserEmail] = useState(initialEmail);
  const [found, setFound] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [rowBusyIndex, setRowBusyIndex] = useState(null);
  const [scanStageIndex, setScanStageIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    setStep('choose');
    setProvider(null);
    setUserEmail(initialEmail || '');
    setFound([]);
    setSelected(new Set());
    setLoading(false);
    setError(null);
    setExpandedIndex(null);
    setRowBusyIndex(null);
    setScanStageIndex(0);
  }, [visible, initialEmail]);

  useEffect(() => {
    if (step !== 'scanning') {
      setScanStageIndex(0);
      return undefined;
    }

    const timer = setInterval(() => {
      setScanStageIndex((current) => (current + 1) % SCAN_STAGES.length);
    }, 1100);

    return () => clearInterval(timer);
  }, [step]);

  const pendingForReview = useMemo(
    () => (pendingDetectedSubscriptions || []).filter((item) => item && item.status === 'pending'),
    [pendingDetectedSubscriptions]
  );

  const total = useMemo(
    () =>
      found
        .filter((_, index) => selected.has(index))
        .reduce((sum, item) => sum + (Number(item.displayAmount ?? item.amount) || 0), 0),
    [found, selected]
  );

  const providerChoices = EmailService.getProviderChoices().filter(p => p.key !== 'manual');

  const resetAndClose = () => {
    setStep('choose');
    setProvider(null);
    setFound([]);
    setSelected(new Set());
    setLoading(false);
    setError(null);
    setExpandedIndex(null);
    setRowBusyIndex(null);
    setScanStageIndex(0);
    onClose();
  };

  const openReview = (items) => {
    setFound(items);
    setSelected(new Set(items.map((_, index) => index)));
    setExpandedIndex(items.length ? 0 : null);
    setStep('review');
  };

  const buildFriendlyNetworkError = (scanError) => {
    const message = scanError?.message || t('errors.generic');

    if (message.includes('Network request failed')) {
      return t('scanner.errors.networkReach');
    }

    if (message.includes('timed out')) {
      return t('scanner.errors.timeout');
    }

    return message;
  };

  const formatResultDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  const formatCycleLabel = (cycle) => ({
      weekly: t('subscriptions.cycles.weeklyFull').substring(0, 5).toLowerCase(),
      monthly: t('subscriptions.monthly').toLowerCase(),
      quarterly: t('subscriptions.cycles.quarterlyFull').toLowerCase(),
      annual: t('subscriptions.annual').toLowerCase(),
    }[cycle] || cycle || t('subscriptions.monthly').toLowerCase());

  const getResultPrimaryLine = (item) => {
    const statusText = item.statusLabel || (item.isTrialActive ? t('subscriptions.detail.trialActive') : t('subscriptions.active'));
    return [item.category || t('transactions.other'), formatCycleLabel(item.cycle), statusText].filter(Boolean).join(' • ');
  };

  const getResultSecondaryLine = (item) => {
    const parts = [];
    const source = item.sourceFrom || item.sourceEmail || userEmail;

    if (source) {
      parts.push(source);
    }

    if (item.nextChargeDate) {
      parts.push(`${item.isTrialActive ? t('modals.addSubscription.startDateTitle') : t('subscriptions.detail.nextCharge')} ${formatResultDate(item.nextChargeDate)}`);
    }

    if (Number(item.nextChargeAmount) > 0) {
      parts.push(`${Number(item.nextChargeAmount).toFixed(2)} ${state.currency || '€'}`);
    }

    return parts.join(' • ');
  };

  const getConfidenceColor = (item) => {
    if (isDark) {
      if (item.reviewStatus === 'confirmed') return '#6EE7B7';
      if (item.reviewStatus === 'probable') return '#FCD34D';
      return '#FDA4AF';
    }
    if (item.reviewStatus === 'confirmed') return '#047857';
    if (item.reviewStatus === 'probable') return '#B45309';
    return '#B91C1C';
  };

  const getConfidenceBg = (item) => {
    if (isDark) {
      if (item.reviewStatus === 'confirmed') return 'rgba(110, 231, 183, 0.12)';
      if (item.reviewStatus === 'probable') return 'rgba(252, 211, 77, 0.12)';
      return 'rgba(253, 164, 175, 0.12)';
    }
    if (item.reviewStatus === 'confirmed') return '#D1FAE5';
    if (item.reviewStatus === 'probable') return '#FEF3C7';
    return '#FEE2E2';
  };

  const getStoredConnectionForProvider = (selectedProvider, email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();

    return (state.emailConnections || []).find((item) => {
      if (!item || item.provider !== selectedProvider) return false;
      if (!normalizedEmail) return item.status === 'connected';
      return String(item.email || '').trim().toLowerCase() === normalizedEmail;
    });
  };

  const getGoogleTokensForScan = async (session) => {
    const liveTokens = {
      accessToken: session?.provider_token || null,
      refreshToken: session?.provider_refresh_token || null,
    };

    if (liveTokens.accessToken || liveTokens.refreshToken) {
      return liveTokens;
    }

    const storedTokens = await getStoredGoogleProviderTokens();
    if (storedTokens?.accessToken || storedTokens?.refreshToken) {
      return {
        accessToken: storedTokens.accessToken || null,
        refreshToken: storedTokens.refreshToken || null,
      };
    }

    const savedConnection = getStoredConnectionForProvider('gmail', session?.user?.email);
    if (savedConnection?.access_token || savedConnection?.refresh_token) {
      return {
        accessToken: savedConnection.access_token || null,
        refreshToken: savedConnection.refresh_token || null,
      };
    }

    return {
      accessToken: null,
      refreshToken: null,
    };
  };

  const startOAuthScan = async (selectedProvider) => {
    setProvider(selectedProvider);
    setLoading(true);
    setError(null);
    setStep('scanning');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error(t('scanner.errors.loginRequired'));
      }

      if (selectedProvider !== 'gmail') {
        throw new Error(t('scanner.errors.gmailOnly'));
      }

      const mailboxEmail = (session.user.email || '').trim().toLowerCase();
      const { accessToken, refreshToken } = await getGoogleTokensForScan(session);

      if (!accessToken && !refreshToken) {
        throw new Error(t('scanner.errors.noTokens'));
      }

      setUserEmail(mailboxEmail);

      let providerProfile = {
        email: mailboxEmail,
        providerUserId: null,
      };

      if (accessToken) {
        try {
          providerProfile = await EmailService.fetchProviderProfile('gmail', accessToken);
        } catch (profileError) {
          console.warn('Unable to fetch Gmail profile from provider token:', profileError);
        }
      }

      const scanResult = await EmailService.runProviderScan({
        provider: selectedProvider,
        email: providerProfile.email || mailboxEmail,
        accessToken,
        refreshToken,
        existingNames: existingSubscriptionNames,
      });

      const persisted = await saveEmailScanResult({
        provider: selectedProvider,
        sourceEmail: providerProfile.email || mailboxEmail,
        connection: {
          provider: selectedProvider,
          email: scanResult.raw?.connection?.email || providerProfile.email || mailboxEmail,
          providerUserId: scanResult.raw?.connection?.providerUserId || providerProfile.providerUserId,
          accessToken: scanResult.raw?.connection?.accessToken || accessToken,
          refreshToken: scanResult.raw?.connection?.refreshToken || refreshToken,
          scopes: scanResult.raw?.connection?.scopes || ['https://www.googleapis.com/auth/gmail.readonly'],
          status: 'connected',
        },
        emailsScanned: scanResult.emailCount || 0,
        items: scanResult.subscriptions,
        metadata: {
          mode: 'gmail-api',
          connectionSource: scanResult.raw?.connection?.source || 'google-oauth',
          matchedEmailCount: scanResult.raw?.matchedEmailCount || scanResult.emailCount || 0,
        },
      });

      openReview(persisted?.detectedSubscriptions || scanResult.subscriptions);
    } catch (scanError) {
      console.error('Scan Error:', scanError);
      setError(scanError.message || t('errors.generic'));
      setStep('choose');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index) => {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
    PremiumHaptics.selection();
  };

  const removeFoundAt = (indexToRemove) => {
    setFound((items) => items.filter((_, index) => index !== indexToRemove));
    setSelected((prev) => {
      const next = new Set();
      prev.forEach((index) => {
        if (index < indexToRemove) next.add(index);
        if (index > indexToRemove) next.add(index - 1);
      });
      return next;
    });
    setExpandedIndex((current) => {
      if (current === indexToRemove) return null;
      if (current > indexToRemove) return current - 1;
      return current;
    });
  };

  const handleSingleImport = async (item, index) => {
    setRowBusyIndex(index);
    setError(null);

    try {
      let success = false;

      if (item.id) {
        success = await importDetectedSubscription(item);
      } else if (onImport) {
        success = await onImport(item);
      }

      if (!success) {
        throw new Error(t('scanner.errors.importFailed'));
      }

      removeFoundAt(index);
      PremiumHaptics.success();
    } catch (importError) {
      console.error('Single import error:', importError);
      setError(importError.message || t('scanner.errors.importFailed'));
      PremiumHaptics.error();
    } finally {
      setRowBusyIndex(null);
    }
  };

  const handleSingleDismiss = async (item, index) => {
    setRowBusyIndex(index);
    setError(null);

    try {
      if (item.id) {
        const dismissed = await dismissDetectedSubscription(item.id);
        if (!dismissed) throw new Error(t('scanner.errors.dismissFailed'));
      }

      removeFoundAt(index);
      PremiumHaptics.selection();
    } catch (dismissError) {
      console.error('Dismiss error:', dismissError);
      setError(dismissError.message || t('scanner.errors.dismissFailed'));
      PremiumHaptics.error();
    } finally {
      setRowBusyIndex(null);
    }
  };

  const handleImport = async () => {
    const selectedItems = found.filter((_, index) => selected.has(index));
    const skippedItems = found.filter((_, index) => !selected.has(index));

    if (!selectedItems.length && !skippedItems.length) {
      resetAndClose();
      return;
    }

    setLoading(true);

    try {
      let importedCount = 0;

      for (const item of selectedItems) {
        let success = false;

        if (item.id) {
          success = await importDetectedSubscription(item);
        } else if (onImport) {
          success = await onImport(item);
        }

        if (success) importedCount += 1;
      }

      for (const item of skippedItems) {
        if (item.id) {
          await dismissDetectedSubscription(item.id);
        }
      }

      PremiumHaptics.success();
      Alert.alert(t('common.success'), t('scanner.review.successMessage', { count: importedCount }), [
        { text: t('common.close'), onPress: resetAndClose },
      ]);
    } catch (importError) {
      console.error('Import error:', importError);
      setError(importError.message || t('scanner.errors.importFailed'));
    } finally {
      setLoading(false);
    }
  };

  const renderChooseStep = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      {/* Lottie Cat Animation */}
      <View style={styles.lottieWrap}>
        <LottieView
          source={require('../../../assets/chat2.json')}
          autoPlay
          loop
          style={styles.lottieAnim}
        />
      </View>

      {/* Title */}
      <Text style={styles.heroTitle}>
        {t('scanner.choose.title')}
      </Text>
      <Text style={styles.heroSubtitle}>
        {t('scanner.choose.description')}
      </Text>

      {/* Feature Rows */}
      <View style={styles.featureList}>
        <View style={styles.featureRow}>
          <View style={styles.featureIconWrap}>
            <Text style={styles.featureIcon}>🔒</Text>
          </View>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>{t('scanner.choose.secureTitle') || 'Secure connection'}</Text>
            <Text style={styles.featureDesc}>{t('scanner.choose.secureDesc') || 'We only read your emails, never modify or delete anything'}</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIconWrap}>
            <Text style={styles.featureIcon}>🤖</Text>
          </View>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>{t('scanner.choose.aiTitle') || 'AI-powered detection'}</Text>
            <Text style={styles.featureDesc}>{t('scanner.choose.aiDesc') || 'Our AI finds subscription emails and extracts the details automatically'}</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIconWrap}>
            <Text style={styles.featureIcon}>⚡</Text>
          </View>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>{t('scanner.choose.quickTitle') || 'Quick import'}</Text>
            <Text style={styles.featureDesc}>{t('scanner.choose.quickDesc') || 'Review detected subscriptions and import them in one tap'}</Text>
          </View>
        </View>
      </View>

      {pendingForReview.length > 0 ? (
        <TouchableOpacity
          style={styles.pendingCard}
          onPress={() => openReview(pendingForReview)}
          activeOpacity={0.85}
        >
          <Text style={styles.pendingTitle}>{t('scanner.choose.pendingTitle')}</Text>
          <Text style={styles.pendingText}>
            {t('scanner.choose.pendingDescription', { count: pendingForReview.length })}
          </Text>
        </TouchableOpacity>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Scan Button */}
      {providerChoices.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.scanButton}
          activeOpacity={0.85}
          onPress={() => {
            PremiumHaptics.selection();
            startOAuthScan(item.key);
          }}
        >
          <Text style={styles.scanButtonText}>{item.name}</Text>
          <Text style={styles.scanButtonArrow}>→</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderScanningStep = () => (
    <View style={styles.scanningContainer}>
      <View style={styles.scanPulse}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
      <Text style={styles.scanningTitle}>{t('scanner.scanning.title')}</Text>
      <Text style={styles.scanningText}>
        {SCAN_STAGES[scanStageIndex]}
      </Text>

      <View style={styles.skeletonCard}>
        {[0, 1, 2].map((item) => (
          <View key={item} style={styles.skeletonRow}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonTextWrap}>
              <View style={[styles.skeletonLine, { width: item === 1 ? '64%' : '78%' }]} />
              <View style={[styles.skeletonLineSmall, { width: item === 2 ? '46%' : '58%' }]} />
            </View>
            <View style={styles.skeletonAmount} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryValue}>{found.length}</Text>
          <Text style={styles.summaryLabel}>{t('scanner.review.detected')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.summaryValue}>{total.toFixed(2)}{state.currency || '€'}</Text>
          <Text style={styles.summaryLabel}>{t('scanner.review.monthlyTotal')}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.reviewErrorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.content} contentContainerStyle={styles.resultList}>
        {found.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>{t('scanner.review.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('scanner.review.emptyDescription')}
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('choose')}>
              <Text style={styles.primaryButtonText}>{t('scanner.review.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {found.map((item, index) => {
              const isExpanded = expandedIndex === index;
              const isBusy = rowBusyIndex === index;
              const alternatives = item.alternatives || [];

              return (
                <TouchableOpacity
                  key={item.id || `${item.name}_${index}`}
                  style={[styles.resultCard, selected.has(index) && styles.resultCardSelected]}
                  onPress={() => setExpandedIndex(isExpanded ? null : index)}
                  activeOpacity={0.78}
                >
                  <View style={styles.resultTopRow}>
                    <TouchableOpacity
                      style={[styles.checkbox, selected.has(index) && styles.checkboxActive]}
                      onPress={() => toggleItem(index)}
                      activeOpacity={0.8}
                    >
                      {selected.has(index) && <Text style={styles.checkboxMark}>✓</Text>}
                    </TouchableOpacity>

                    <ServiceLogo
                      logo={item.logo || getServiceLogo(item.name)}
                      icon={item.emoji || item.icon || '💳'}
                      color={item.color}
                      size={42}
                      borderRadius={12}
                      style={{ marginRight: 12 }}
                    />

                    <View style={styles.resultTextWrap}>
                      <Text style={styles.resultTitle}>{item.name}</Text>
                      <View style={styles.resultBadgeRow}>
                        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceBg(item) }]}>
                          <Text style={[styles.confidenceBadgeText, { color: getConfidenceColor(item) }]}>
                            {item.confidenceLabel || t('subscriptions.filters.trial')}
                          </Text>
                        </View>
                        {item.confidence ? (
                          <Text style={styles.confidenceValue}>{Math.round(Number(item.confidence) * 100)}%</Text>
                        ) : null}
                      </View>
                      <Text style={styles.resultStatusText}>{getResultPrimaryLine(item)}</Text>
                      {item.sourceSubject ? <Text style={styles.resultSourceSubject}>{item.sourceSubject}</Text> : null}
                      <Text style={styles.resultMeta}>{getResultSecondaryLine(item)}</Text>
                    </View>

                    <View style={styles.resultAmountWrap}>
                      <Text style={styles.resultAmount}>{Number(item.displayAmount ?? item.amount).toFixed(2)} {state.currency || '€'}</Text>
                      <Text style={styles.expandHint}>{isExpanded ? t('scanner.review.close') : t('scanner.review.actions')}</Text>
                    </View>
                  </View>

                  {isExpanded ? (
                    <View style={styles.resultExpanded}>
                      <View style={styles.aiAltBox}>
                        <Text style={styles.aiAltTitle}>{t('scanner.review.aiAlternatives')}</Text>
                        {alternatives.length ? (
                          <View style={styles.altPillRow}>
                            {alternatives.map((alternative) => (
                              <Text key={alternative} style={styles.altPill}>{alternative}</Text>
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.resultAltText}>{t('scanner.review.noAlternatives')}</Text>
                        )}
                      </View>

                      <View style={styles.resultActionRow}>
                        <TouchableOpacity
                          style={[styles.inlineAction, styles.inlineActionPrimary, isBusy && styles.buttonDisabled]}
                          onPress={() => handleSingleImport(item, index)}
                          disabled={isBusy}
                        >
                          {isBusy ? (
                            <ActivityIndicator size="small" color={Colors.pureWhite} />
                          ) : (
                            <Text style={styles.inlineActionPrimaryText}>{t('scanner.review.import')}</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.inlineAction, isBusy && styles.buttonDisabled]}
                          onPress={() => handleSingleDismiss(item, index)}
                          disabled={isBusy}
                        >
                          <Text style={styles.inlineActionText}>{t('scanner.review.ignore')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {found.length > 0 ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleImport}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>Importer {selected.size} abonnements</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  const styles = makeStyles(Colors, isDark);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan intelligent</Text>
            <View style={{ width: 34 }} />
          </View>

          {step === 'choose' && renderChooseStep()}
          {step === 'scanning' && renderScanningStep()}
          {step === 'review' && renderReviewStep()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(Colors, isDark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      backgroundColor: Colors.surface,
    },
    headerTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 17, color: Colors.text },
    closeBtn: { padding: 8, marginLeft: -8 },
    closeTxt: { fontSize: 20, color: Colors.textSecondary },
    content: { flex: 1 },
    contentBody: { padding: 20 },
    heroCard: { marginBottom: 24 },
    heroEyebrow: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 11,
      color: Colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    heroTitle: {
      ...Fonts.primary,
      ...Fonts.black,
      fontSize: 28,
      color: Colors.text,
      marginBottom: 8,
      lineHeight: 34,
    },
    heroSubtitle: {
      ...Fonts.primary,
      fontSize: 15,
      color: Colors.textSecondary,
      lineHeight: 22,
      marginBottom: 28,
    },
    heroText: { ...Fonts.primary, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
    pendingCard: {
      backgroundColor: Colors.surface,
      padding: 16,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      marginBottom: 20,
      ...Shadow.soft,
    },
    pendingTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 14, color: Colors.text },
    pendingText: { ...Fonts.primary, fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 20 },
    lottieWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    lottieAnim: {
      width: 120,
      height: 120,
    },
    featureList: {
      gap: 20,
      marginBottom: 28,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
    },
    featureIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3F0FF',
    },
    featureIcon: {
      fontSize: 20,
    },
    featureTextWrap: {
      flex: 1,
    },
    featureTitle: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 15,
      color: Colors.income,
      marginBottom: 3,
    },
    featureDesc: {
      ...Fonts.primary,
      fontSize: 13,
      color: Colors.textSecondary,
      lineHeight: 19,
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.income,
      borderRadius: Radius.xl,
      paddingVertical: 18,
      paddingHorizontal: 22,
      marginBottom: 12,
    },
    scanButtonText: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 16,
      color: '#FFFFFF',
    },
    scanButtonArrow: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 18,
      color: '#FFFFFF',
    },
    primaryButton: {
      height: 54,
      borderRadius: Radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.income,
      marginTop: 18,
    },
    primaryButtonText: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 14,
      color: Colors.pureWhite,
      textTransform: 'uppercase',
    },
    secondaryButton: {
      height: 50,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.borderStrong,
    },
    secondaryButtonText: { ...Fonts.primary, ...Fonts.bold, fontSize: 13, color: Colors.text },
    scanningContainer: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
    scanPulse: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surfaceAlt,
      marginBottom: 8,
    },
    scanningTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 20, color: Colors.text, marginTop: 16 },
    scanningText: {
      ...Fonts.primary,
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
    skeletonCard: {
      width: '100%',
      marginTop: 28,
      borderRadius: Radius.xl,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.borderStrong,
      padding: 16,
      gap: 14,
    },
    skeletonRow: { flexDirection: 'row', alignItems: 'center' },
    skeletonIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: Colors.surfaceAlt,
      marginRight: 12,
    },
    skeletonTextWrap: { flex: 1, gap: 8 },
    skeletonLine: { height: 12, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
    skeletonLineSmall: { height: 9, borderRadius: 5, backgroundColor: Colors.surface },
    skeletonAmount: { width: 58, height: 16, borderRadius: 8, backgroundColor: Colors.surfaceAlt, marginLeft: 12 },
    errorBox: {
      backgroundColor: '#FFF1F1',
      borderWidth: 1,
      borderColor: '#FFE0E0',
      borderRadius: Radius.md,
      padding: 16,
      marginBottom: 16,
    },
    reviewErrorBox: {
      marginHorizontal: 24,
      marginBottom: 12,
      backgroundColor: '#FFF1F1',
      borderWidth: 1,
      borderColor: '#FFE0E0',
      borderRadius: Radius.md,
      padding: 14,
    },
    errorText: { ...Fonts.primary, fontSize: 13, color: Colors.error, lineHeight: 20 },
    summaryCard: {
      margin: 24,
      marginBottom: 14,
      backgroundColor: Colors.income,
      borderRadius: Radius.xl,
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...Shadow.medium,
    },
    summaryValue: { ...Fonts.primary, ...Fonts.black, fontSize: 26, color: Colors.pureWhite },
    summaryLabel: { ...Fonts.primary, fontSize: 10, color: isDark ? '#A7F3D0' : '#D1FAE5', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryDivider: { width: 1, height: 44, backgroundColor: isDark ? '#34D399' : '#6EE7B7' },
    resultList: { gap: 10, paddingHorizontal: 24, paddingBottom: 16 },
    resultCard: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.xl,
      padding: 14,
      borderWidth: 1.5,
      borderColor: Colors.borderStrong,
    },
    resultCardSelected: { borderColor: Colors.income, backgroundColor: Colors.surface },
    resultTopRow: { flexDirection: 'row', alignItems: 'center' },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: Colors.borderStrong,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: Colors.income, borderColor: Colors.income },
    checkboxMark: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
    resultIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: Colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    resultIcon: { fontSize: 20 },
    resultTextWrap: { flex: 1 },
    resultTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 15, color: Colors.text },
    resultBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    confidenceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    confidenceBadgeText: { ...Fonts.primary, ...Fonts.bold, fontSize: 10, textTransform: 'uppercase' },
    confidenceValue: { ...Fonts.primary, ...Fonts.bold, fontSize: 11, color: Colors.textSecondary },
    resultStatusText: { ...Fonts.primary, ...Fonts.medium, fontSize: 11, color: Colors.textSecondary, marginTop: 3 },
    resultSubtitle: { ...Fonts.primary, fontSize: 0, color: 'transparent', marginTop: 0, lineHeight: 0, height: 0 },
    resultSourceSubject: { ...Fonts.primary, fontSize: 11, color: Colors.textMuted, marginTop: 4 },
    resultMeta: { ...Fonts.primary, fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
    resultAltText: { ...Fonts.primary, fontSize: 11, color: Colors.accent, marginTop: 4 },
    resultAmountWrap: { alignItems: 'flex-end', marginLeft: 10, maxWidth: 88 },
    resultAmount: { ...Fonts.primary, ...Fonts.bold, fontSize: 14, color: Colors.text, textAlign: 'right' },
    expandHint: { ...Fonts.primary, ...Fonts.bold, fontSize: 10, color: Colors.textMuted, marginTop: 6, textTransform: 'uppercase' },
    resultExpanded: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      gap: 14,
    },
    aiAltBox: {
      backgroundColor: Colors.surfaceAlt,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: 12,
    },
    aiAltTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 12, color: Colors.text, marginBottom: 10 },
    altPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    altPill: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 11,
      color: Colors.text,
      backgroundColor: Colors.surfaceAlt,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      overflow: 'hidden',
    },
    resultActionRow: { flexDirection: 'row', gap: 10 },
    inlineAction: {
      flex: 1,
      minHeight: 44,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surfaceAlt,
      borderWidth: 1,
      borderColor: Colors.borderStrong,
    },
    inlineActionPrimary: { backgroundColor: Colors.income, borderColor: Colors.income },
    inlineActionText: { ...Fonts.primary, ...Fonts.bold, fontSize: 12, color: Colors.text, textTransform: 'uppercase' },
    inlineActionPrimaryText: { ...Fonts.primary, ...Fonts.bold, fontSize: 12, color: Colors.pureWhite, textTransform: 'uppercase' },
    emptyBox: { padding: 24, alignItems: 'center' },
    emptyTitle: { ...Fonts.primary, ...Fonts.black, fontSize: 18, color: Colors.text },
    emptyText: {
      ...Fonts.primary,
      fontSize: 14,
      color: Colors.textSecondary,
      marginTop: 10,
      lineHeight: 22,
      textAlign: 'center',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors.surface,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 38 : 20,
    },
    buttonDisabled: { opacity: 0.6 },
  });
}
