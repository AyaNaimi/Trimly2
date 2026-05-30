import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Fonts, Radius, Shadow, Spacing } from '../../theme';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { PremiumHaptics } from '../../utils/haptics';
import { ServiceLogo } from '../../components';
import {
  generateCancellationLetter,
  getCancellationGuide,
} from '../../services/cancellationService';
import { getSuggestedAlternatives } from '../../services/emailService';
import { triggerCancellationRequest, isN8nConfigured } from '../../services/n8nWebhookService';
import { getNextBilling } from '../../utils/dateUtils';

type CancellationStep = {
  order: number;
  title: string;
  description: string;
  url?: string;
  type: 'navigate' | 'click' | 'call' | 'email' | 'chat';
};

type CancellationGuide = {
  serviceName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  steps: CancellationStep[];
  directUrl?: string;
  emailTemplate?: string;
  phoneNumber?: string;
  importantNotes?: string[];
};

type CancellationModalProps = {
  visible: boolean;
  subscription: any;
  onClose: () => void;
  onConfirmCancel: () => void;
};

const DIFFICULTY_META = {
  easy: { label: 'Facile', color: '#16A34A', bg: '#DCFCE7' },
  medium: { label: 'Moyenne', color: '#B45309', bg: '#FEF3C7' },
  hard: { label: 'Difficile', color: '#B91C1C', bg: '#FEE2E2' },
};

const addAlpha = (hex: string, opacity: number) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((char) => char + char).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

const extractEmailAddress = (value?: string | null) => {
  const match = String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : null;
};

export default function CancellationModal({
  visible,
  subscription,
  onClose,
  onConfirmCancel,
}: CancellationModalProps) {
  const { Colors } = useTheme();
  const { state, updateSubscription } = useApp();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const guide = useMemo<CancellationGuide | null>(
    () => getCancellationGuide(subscription?.name || ''),
    [subscription?.name],
  );
  const billing = useMemo(
    () => (subscription ? getNextBilling(subscription, 'fr') : null),
    [subscription],
  );
  const alternatives = useMemo(
    () => getSuggestedAlternatives(subscription?.name || ''),
    [subscription?.name],
  );
  const userEmail = state.session?.user?.email || '';
  const userName = state.profile?.name || userEmail.split('@')[0] || 'Client';
  const letter = useMemo(
    () =>
      generateCancellationLetter({
        serviceName: subscription?.name || guide?.serviceName || 'abonnement',
        userName,
        userEmail,
        subscriptionId: subscription?.id,
      }),
    [guide?.serviceName, subscription?.id, subscription?.name, userEmail, userName],
  );
  const difficulty = guide?.difficulty || 'medium';
  const difficultyMeta = DIFFICULTY_META[difficulty];
  const [automationLoading, setAutomationLoading] = React.useState(false);
  const n8nAvailable = isN8nConfigured();
  const supportEmail =
    subscription?.supportEmail ||
    subscription?.support_email ||
    extractEmailAddress(subscription?.sourceFrom || subscription?.source_from);

  const handleAutomatedCancellation = async (type: 'lre' | 'email') => {
    if (!state.session?.user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour utiliser la résiliation automatisée.');
      return;
    }

    setAutomationLoading(true);
    try {
      const result = await triggerCancellationRequest({
        userId: state.session.user.id,
        userEmail: state.session.user.email || '',
        userName: state.profile?.name || 'Client Trimly',
        userAddress: {
          line1: state.profile?.address_line1,
          line2: state.profile?.address_line2,
          postalCode: state.profile?.postal_code,
          city: state.profile?.city,
          country: state.profile?.country || 'FR',
        },
        cancellationType: type,
        subscription: {
          id: subscription.id,
          name: subscription.name,
          amount: Number(subscription.amount) || 0,
          cycle: subscription.cycle || 'monthly',
          category: subscription.category,
          provider: subscription.provider || null,
          sourceEmail: subscription.sourceEmail || subscription.source_email || null,
          sourceFrom: subscription.sourceFrom || subscription.source_from || null,
          supportEmail,
          nextChargeDate: billing?.nextChargeDate ? new Date(billing.nextChargeDate).toISOString() : null,
        },
        billing: {
          nextChargeDate: billing?.nextChargeDate ? new Date(billing.nextChargeDate).toISOString() : null,
          trialEndsAt: billing?.trialEndsAt ? new Date(billing.trialEndsAt).toISOString() : null,
          daysUntilCharge: billing?.daysUntilCharge ?? null,
        },
        method: {
          key: 'email_letter',
          title: type === 'lre' ? 'Lettre recommandee electronique' : 'Email de resiliation',
          description: type === 'lre'
            ? 'Demande formelle preparee pour un envoi recommande electronique.'
            : 'Demande formelle preparee pour un envoi email.',
        },
        letterContent: letter,
      });

      if (result.ok) {
        const responseData = result.data as { data?: { emailTo?: string; copyTo?: string } } | null;
        const emailTo = responseData?.data?.emailTo;
        const copyTo = responseData?.data?.copyTo;

        await updateSubscription?.(subscription.id, {
          cancellation_status: 'pending',
          cancellation_method: type,
          cancellation_requested_at: new Date().toISOString(),
          cancellation_letter: letter,
        });

        Alert.alert(
          'Demande envoyee',
          emailTo
            ? `n8n indique que l'email a ete envoye a ${emailTo}${copyTo ? `, copie ${copyTo}` : ''}.`
            : type === 'lre'
              ? "La demande LRE a ete transmise au workflow. Gardez l'abonnement actif dans Trimly jusqu'a confirmation."
              : "La demande email a ete transmise au workflow. Gardez l'abonnement actif dans Trimly jusqu'a confirmation.",
        );
        onClose();
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de lancer la résiliation automatisée.');
      }
    } catch (error) {
      Alert.alert('Erreur', "Une erreur est survenue lors de l'envoi.");
    } finally {
      setAutomationLoading(false);
    }
  };

  if (!subscription) return null;

  const openUrl = async (url?: string) => {
    if (!url) return;
    try {
      PremiumHaptics.selection();
      await Linking.openURL(url);
    } catch (error) {
      console.warn('[CancellationModal] openUrl failed:', error);
    }
  };

  const shareLetter = async () => {
    try {
      PremiumHaptics.selection();
      await Share.share({
        title: `Résiliation ${subscription.name}`,
        message: letter,
      });
    } catch (error) {
      console.warn('[CancellationModal] Share failed:', error);
    }
  };

  const handleStepAction = async (step: CancellationStep) => {
    if (step.url) {
      await openUrl(step.url);
      return;
    }

    if (step.type === 'call' && guide?.phoneNumber) {
      await openUrl(`tel:${guide.phoneNumber}`);
      return;
    }

    if (step.type === 'email') {
      await shareLetter();
    }
  };

  const confirmCancel = () => {
    PremiumHaptics.notification?.(true);
    onConfirmCancel();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>x</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <ServiceLogo
              logo={(subscription as any).logo}
              icon={subscription.icon || 'S'}
              color={subscription.color || Colors.accent}
              size={48}
              style={{ marginRight: 12 }}
            />
            <View style={styles.headerTextWrap}>
              <Text style={styles.title} numberOfLines={1}>{subscription.name}</Text>
              <Text style={styles.subtitle}>{guide?.estimatedTime || '5-10 minutes'}</Text>
            </View>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyMeta.bg }]}>
            <Text style={[styles.difficultyText, { color: difficultyMeta.color }]}>{difficultyMeta.label}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {guide ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Guide étape par étape</Text>
                {guide.directUrl ? (
                  <Pressable style={styles.smallButton} onPress={() => openUrl(guide.directUrl)}>
                    <Text style={styles.smallButtonText}>Ouvrir →</Text>
                  </Pressable>
                ) : null}
              </View>

              {guide.steps.map((step) => (
                <View key={`${step.order}-${step.title}`} style={styles.stepCard}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.order}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                    {(step.url || step.type === 'call' || step.type === 'email') ? (
                      <Pressable style={styles.inlineButton} onPress={() => handleStepAction(step)}>
                        <Text style={styles.inlineButtonText}>
                          {step.type === 'call' ? 'Appeler' : step.type === 'email' ? 'Partager la lettre' : 'Ouvrir →'}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Guide générique</Text>
              <Text style={styles.paragraph}>
                Aucun guide spécifique n’est disponible pour ce service. Cherche la page de compte, facturation ou
                abonnement, puis garde une preuve de confirmation.
              </Text>
            </View>
          )}

          {guide?.importantNotes?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes importantes</Text>
              {guide.importantNotes.map((note) => (
                <View key={note} style={styles.noteRow}>
                  <Text style={styles.noteBullet}>!</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alternatives recommandées</Text>
            {alternatives.length ? (
              <View style={styles.pillRow}>
                {alternatives.map((alternative) => (
                  <Text key={alternative} style={styles.pill}>{alternative}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.paragraph}>Compare les plans concurrents ou passe temporairement au plan gratuit.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lettre de résiliation</Text>
            <Text style={styles.paragraph}>
              Génère un texte prêt à envoyer au support ou à joindre dans un formulaire de résiliation.
            </Text>
            <Pressable style={styles.secondaryButton} onPress={shareLetter}>
              <Text style={styles.secondaryButtonText}>Générer lettre de résiliation</Text>
            </Pressable>
          </View>

          {n8nAvailable ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Résiliation automatisée</Text>
              <Text style={styles.paragraph}>
                {supportEmail
                  ? `Trimly enverra la demande a ${supportEmail} et gardera une copie pour vous.`
                  : "Trimly peut preparer la demande, mais aucune adresse de support n'a ete detectee pour ce service."}
              </Text>
              {automationLoading ? (
                <ActivityIndicator style={{ marginTop: 16 }} color={Colors.accent} />
              ) : (
                <View style={{ gap: 10, marginTop: 14 }}>
                  <Pressable
                    style={[styles.secondaryButton, { borderColor: Colors.accent, backgroundColor: addAlpha(Colors.accent || '#06b6d4', 0.08) }]}
                    onPress={() => handleAutomatedCancellation('lre')}
                  >
                    <Text style={[styles.secondaryButtonText, { color: Colors.accent }]}>📮 Envoyer une LRE (recommandé électronique)</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => handleAutomatedCancellation('email')}
                  >
                    <Text style={styles.secondaryButtonText}>✉️ Envoyer par email automatique</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.dangerButton} onPress={confirmCancel}>
            <Text style={styles.dangerButtonText}>Confirmer la résiliation dans Trimly</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(Colors: any) {
  return StyleSheet.create<Record<string, any>>({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      gap: Spacing.sm,
    },
    closeButton: { width: 32, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    closeText: { ...Fonts.primary, ...Fonts.bold, color: Colors.textSecondary, fontSize: 18 },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.smd },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: { fontSize: 24 },
    headerTextWrap: { flex: 1 },
    title: { ...Fonts.primary, ...Fonts.black, fontSize: 18, color: Colors.text },
    subtitle: { ...Fonts.primary, fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
    difficultyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: Radius.pill,
      minWidth: 70,
      alignItems: 'center',
    },
    difficultyText: { ...Fonts.primary, ...Fonts.bold, fontSize: 11, textTransform: 'uppercase' },
    content: { flex: 1 },
    body: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    section: {
      backgroundColor: Colors.white,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      ...Shadow.soft,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.sm,
      marginBottom: Spacing.smd,
    },
    sectionTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 15, color: Colors.text, marginBottom: Spacing.smd },
    smallButton: {
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: Colors.borderStrong,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: Spacing.smd,
    },
    smallButtonText: { ...Fonts.primary, ...Fonts.bold, fontSize: 12, color: Colors.text },
    stepCard: { flexDirection: 'row', gap: Spacing.smd, paddingVertical: Spacing.smd },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    stepNumberText: { ...Fonts.primary, ...Fonts.bold, fontSize: 12, color: Colors.textSecondary },
    stepContent: { flex: 1 },
    stepTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 14, color: Colors.text },
    stepDescription: { ...Fonts.primary, fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginTop: 4 },
    inlineButton: {
      alignSelf: 'flex-start',
      marginTop: Spacing.sm,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: Radius.md,
      backgroundColor: Colors.text,
    },
    inlineButtonText: { ...Fonts.primary, ...Fonts.bold, fontSize: 12, color: Colors.pureWhite },
    paragraph: { ...Fonts.primary, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
    noteRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
    noteBullet: { ...Fonts.primary, ...Fonts.bold, color: Colors.warning, width: 16 },
    noteText: { ...Fonts.primary, flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    pill: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 12,
      color: Colors.text,
      backgroundColor: Colors.surface,
      borderRadius: Radius.pill,
      paddingHorizontal: 12,
      paddingVertical: 8,
      overflow: 'hidden',
    },
    secondaryButton: {
      marginTop: Spacing.md,
      minHeight: 48,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.borderStrong,
      backgroundColor: Colors.surface,
    },
    secondaryButtonText: { ...Fonts.primary, ...Fonts.bold, fontSize: 13, color: Colors.text },
    footer: {
      padding: Spacing.md,
      paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
      backgroundColor: Colors.white,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    dangerButton: {
      minHeight: 52,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.error,
    },
    dangerButtonText: { ...Fonts.primary, ...Fonts.bold, fontSize: 13, color: Colors.pureWhite, textTransform: 'uppercase' },
  });
}
