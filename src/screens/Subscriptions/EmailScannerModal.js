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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../utils/supabase';
import { Fonts, Radius, Shadow } from '../../theme';
import { PremiumHaptics } from '../../utils/haptics';
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

// SCAN_STAGES moved inside component for localization

export default function EmailScannerModal({
  visible,
  onClose,
  onImport,
  initialEmail = '',
  autoPrompt = false,
  existingSubscriptionNames = [],
}) {
  const { Colors } = useTheme();
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
  const [appPassword, setAppPassword] = useState('');
  const [found, setFound] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [logs, setLogs] = useState([]);
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
    setAppPassword('');
    setFound([]);
    setSelected(new Set());
    setLogs([]);
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

  const providerChoices = EmailService.getProviderChoices();

  const addLog = (message) => {
    console.log('[ScannerLog]', message);
    setLogs((prev) => [...prev, message]);
  };

  const resetAndClose = () => {
    setStep('choose');
    setProvider(null);
    setAppPassword('');
    setFound([]);
    setSelected(new Set());
    setLogs([]);
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
    if (item.reviewStatus === 'confirmed') return '#166534';
    if (item.reviewStatus === 'probable') return '#B45309';
    return '#B91C1C';
  };

  const getConfidenceBg = (item) => {
    if (item.reviewStatus === 'confirmed') return '#DCFCE7';
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
    setLogs([]);
    setStep('scanning');

    addLog(t('scanner.scanning.logs.start', { provider: selectedProvider }));

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
      addLog(t('scanner.scanning.logs.mailbox', { email: mailboxEmail }));
      addLog(t('scanner.scanning.logs.reading'));

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

      addLog(t('scanner.scanning.logs.foundEmails', { count: scanResult.raw?.matchedEmailCount || scanResult.emailCount || 0 }));
      addLog(t('scanner.scanning.logs.analyzed', { count: scanResult.emailCount || 0 }));
      if (scanResult.raw?.analyzedCandidateCount !== undefined) {
        addLog(`${scanResult.raw.analyzedCandidateCount} emails candidats analysés par IA`);
      }
      if (scanResult.subscriptions.length === 0 && scanResult.raw?.debug?.topScores?.length) {
        addLog(`Top candidat: ${scanResult.raw.debug.topScores[0].subject || scanResult.raw.debug.topScores[0].from}`);
      }
      if (scanResult.subscriptions.length === 0 && scanResult.raw?.debug?.groqConfigured === false) {
        addLog('Groq non configuré côté Supabase: fallback local utilisé');
      }
      addLog(t('scanner.scanning.logs.foundSubs', { count: scanResult.subscriptions.length }));

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
      addLog(t('scanner.scanning.logs.error', { message: scanError.message }));
      setStep('choose');
    } finally {
      setLoading(false);
    }
  };

  const startManualScan = async () => {
    const email = userEmail.trim().toLowerCase();
    const password = appPassword.replace(/\s/g, '');

    if (!email) {
      setError(t('scanner.errors.emailRequired'));
      PremiumHaptics.error();
      return;
    }

    if (!password) {
      setError(t('scanner.errors.passwordRequired'));
      PremiumHaptics.error();
      return;
    }

    setProvider('manual');
    setLoading(true);
    setError(null);
    setLogs([]);
    setStep('scanning');

    addLog(t('scanner.scanning.logs.mailbox', { email }));
    addLog(t('scanner.manual.startButton')); // Reuse start text or connecting log

    try {
      const scanResult = await EmailService.runManualScan({
        email,
        appPassword: password,
        existingNames: existingSubscriptionNames,
      });

      const persisted = await saveEmailScanResult({
        provider: 'manual',
        sourceEmail: email,
        connection: {
          provider: 'manual',
          email,
          status: 'connected',
        },
        emailsScanned: scanResult.emailCount,
        items: scanResult.subscriptions,
        metadata: { mode: 'local-imap' },
      });

      addLog(t('scanner.scanning.logs.analyzed', { count: scanResult.emailCount }));
      addLog(t('scanner.scanning.logs.foundSubs', { count: scanResult.subscriptions.length }));

      openReview(persisted?.detectedSubscriptions || scanResult.subscriptions);
    } catch (scanError) {
      console.error('Scan Error:', scanError);
      const friendlyError = buildFriendlyNetworkError(scanError);
      setError(friendlyError);
      addLog(t('scanner.scanning.logs.error', { message: friendlyError }));

      await saveEmailScanResult({
        provider: 'manual',
        sourceEmail: email,
        connection: {
          provider: 'manual',
          email,
          status: 'error',
        },
        emailsScanned: 0,
        items: [],
        errorMessage: friendlyError,
        metadata: { mode: 'local-imap' },
      });

      setStep('manual');
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
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{t('scanner.choose.subtitle')}</Text>
        <Text style={styles.heroTitle}>
          {autoPrompt ? t('scanner.choose.titleAuto') : t('scanner.choose.title')}
        </Text>
        <Text style={styles.heroText}>
          {t('scanner.choose.description')}
        </Text>
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

      <View style={styles.choiceList}>
        {providerChoices.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.choiceCard}
            activeOpacity={0.85}
            onPress={() => {
              PremiumHaptics.selection();
              if (item.key === 'manual') setStep('manual');
              else startOAuthScan(item.key);
            }}
          >
            <View style={[styles.choiceIconWrap, { backgroundColor: addAlpha(item.color, 0.12) }]}>
              <Text style={styles.choiceIcon}>{item.icon}</Text>
            </View>
            <View style={styles.choiceTextWrap}>
              <Text style={styles.choiceTitle}>{item.name}</Text>
              <Text style={styles.choiceText}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderManualStep = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{t('scanner.manual.subtitle')}</Text>
        <Text style={styles.heroTitle}>{t('scanner.manual.title')}</Text>
        <Text style={styles.heroText}>
          {t('scanner.manual.description')}
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>{t('scanner.manual.emailLabel')}</Text>
        <TextInput
          style={styles.input}
          value={userEmail}
          onChangeText={setUserEmail}
          placeholder="votre@email.com"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>{t('scanner.manual.passwordLabel')}</Text>
        <TextInput
          style={styles.input}
          value={appPassword}
          onChangeText={setAppPassword}
          placeholder="xxxx xxxx xxxx xxxx"
          placeholderTextColor={Colors.textMuted}
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? (
          <View style={[styles.errorBox, { marginTop: 16 }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={startManualScan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.pureWhite} />
          ) : (
            <Text style={styles.primaryButtonText}>{t('scanner.manual.startButton')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.secondaryButton, { marginTop: 12 }]} onPress={() => setStep('choose')}>
        <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderScanningStep = () => (
    <View style={styles.scanningContainer}>
      <View style={styles.scanPulse}>
        <ActivityIndicator size="small" color={Colors.text} />
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

      <View style={styles.logsCard}>
        <ScrollView>
          {logs.map((log, i) => (
            <Text key={i} style={styles.logLine}>
              • {log}
            </Text>
          ))}
        </ScrollView>
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

                    <View style={styles.resultIconWrap}>
                      <Text style={styles.resultIcon}>{item.emoji || item.icon || '💳'}</Text>
                    </View>

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

  const styles = makeStyles(Colors);

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
          {step === 'manual' && renderManualStep()}
          {step === 'scanning' && renderScanningStep()}
          {step === 'review' && renderReviewStep()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(Colors) {
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
      backgroundColor: Colors.white,
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
      fontSize: 12,
      color: Colors.accent,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    heroTitle: { ...Fonts.primary, ...Fonts.black, fontSize: 26, color: Colors.text, marginBottom: 8 },
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
    choiceList: { gap: 12 },
    choiceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white,
      borderRadius: Radius.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadow.soft,
    },
    choiceIconWrap: {
      width: 50,
      height: 50,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    choiceIcon: { fontSize: 24 },
    choiceTextWrap: { flex: 1 },
    choiceTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 15, color: Colors.text },
    choiceText: { ...Fonts.primary, fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginTop: 4 },
    formCard: {
      backgroundColor: Colors.white,
      borderRadius: Radius.lg,
      padding: 18,
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadow.soft,
    },
    label: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 11,
      color: Colors.textMuted,
      marginBottom: 8,
      marginTop: 10,
      textTransform: 'uppercase',
    },
    input: {
      minHeight: 52,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: Colors.borderStrong,
      backgroundColor: Colors.surface,
      paddingHorizontal: 16,
      ...Fonts.primary,
      fontSize: 14,
      color: Colors.text,
    },
    primaryButton: {
      height: 54,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.text,
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
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: Colors.borderStrong,
    },
    secondaryButtonText: { ...Fonts.primary, ...Fonts.bold, fontSize: 13, color: Colors.text },
    scanningContainer: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
    scanPulse: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadow.soft,
    },
    scanningTitle: { ...Fonts.primary, ...Fonts.black, fontSize: 22, color: Colors.text, marginTop: 20 },
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
      marginTop: 24,
      borderRadius: Radius.lg,
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: 14,
      gap: 12,
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
    logsCard: {
      width: '100%',
      height: 150,
      marginTop: 16,
      borderRadius: Radius.lg,
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: 16,
    },
    logLine: { ...Fonts.primary, fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
    errorBox: {
      backgroundColor: '#FFF1F1',
      borderWidth: 1,
      borderColor: '#FFE0E0',
      borderRadius: Radius.md,
      padding: 16,
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
      backgroundColor: Colors.text,
      borderRadius: Radius.xl,
      padding: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...Shadow.medium,
    },
    summaryValue: { ...Fonts.primary, ...Fonts.black, fontSize: 24, color: Colors.white },
    summaryLabel: { ...Fonts.primary, fontSize: 10, color: '#94A3B8', marginTop: 4, textTransform: 'uppercase' },
    summaryDivider: { width: 1, height: 40, backgroundColor: '#334155' },
    resultList: { gap: 12, paddingHorizontal: 24, paddingBottom: 16 },
    resultCard: {
      backgroundColor: Colors.white,
      borderRadius: Radius.md,
      padding: 14,
      borderWidth: 1.5,
      borderColor: Colors.border,
    },
    resultCardSelected: { borderColor: Colors.text, backgroundColor: Colors.surface },
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
    checkboxActive: { backgroundColor: Colors.text, borderColor: Colors.text },
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
      backgroundColor: Colors.white,
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
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: Colors.borderStrong,
    },
    inlineActionPrimary: { backgroundColor: Colors.text, borderColor: Colors.text },
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
      backgroundColor: Colors.white,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 38 : 20,
    },
    buttonDisabled: { opacity: 0.7 },
  });
}
