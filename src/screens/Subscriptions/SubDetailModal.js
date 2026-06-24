// src/screens/Subscriptions/SubDetailModal.js
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Fonts, Radius, Spacing, Shadow } from '../../theme';
import { PremiumHaptics } from '../../utils/haptics';
import { annualEquivalent, getNextBilling, monthlyEquivalent } from '../../utils/dateUtils';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ServiceLogo } from '../../components';
import CancellationModal from './CancellationModal';
import { getCancellationGuide } from '../../services/cancellationService';

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((char) => char + char).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

const DIFFICULTY_META = {
  easy: { label: 'Résiliation : Facile', color: '#166534', bg: '#DCFCE7' },
  medium: { label: 'Résiliation : Moyenne', color: '#B45309', bg: '#FEF3C7' },
  hard: { label: 'Résiliation : Difficile', color: '#B91C1C', bg: '#FEE2E2' },
};

const formatMoney = (amount, currency = 'EUR') => {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch (error) {
    return `${value.toFixed(value % 1 === 0 ? 0 : 2)} ${currency}`;
  }
};

const formatSafeDate = (date) => {
  if (!date) return 'Non défini';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Non défini';
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function SubDetailModal({
  visible,
  sub,
  billing: billingProp,
  onClose,
  onCancel,
}) {
  const { Colors } = useTheme();
  const { state, cancelSubscription } = useApp();
  const { t } = useLanguage();
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const s = useMemo(() => makeStyles(Colors), [Colors]);

  const currency = state.currency || sub?.currency || 'EUR';
  const cycle = sub?.cycle || sub?.frequency || 'monthly';
  const guide = useMemo(() => getCancellationGuide(sub?.name || ''), [sub?.name]);
  const difficultyMeta = guide ? DIFFICULTY_META[guide.difficulty] : null;
  const billing = useMemo(() => {
    if (billingProp) return billingProp;
    if (!sub) return {};
    return getNextBilling({ ...sub, cycle, startDate: sub.startDate || sub.start_date || new Date() });
  }, [billingProp, sub, cycle]);

  if (!sub) return null;

  const amount = Number(sub.amount || 0);
  const annual = annualEquivalent(amount, cycle);
  const monthly = monthlyEquivalent(amount, cycle);
  const nextBilling = sub.nextBilling || sub.next_billing || billing.nextChargeDate;
  const isCancelled = sub.status === 'cancelled' || sub.active === false;
  const statusText = isCancelled ? 'Résilié' : sub.status === 'paused' ? 'En pause' : 'Actif';

  const handleClose = () => {
    PremiumHaptics.selection();
    onClose?.();
  };

  const openCancellationFlow = () => {
    if (isCancelled) return;
    PremiumHaptics.selection();
    setShowCancellationModal(true);
  };

  const handleConfirmCancel = async () => {
    if (onCancel) {
      onCancel();
      return;
    }

    await cancelSubscription(sub.id);
    onClose?.();
  };

  return (
    <Modal
      visible={visible ?? !!sub}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={s.container}>
        <View style={s.header}>
          <Pressable onPress={handleClose} style={s.closeBtn}>
            <Text style={s.closeTxt}>x</Text>
          </Pressable>
          <Text style={s.headerTitle}>{t('subscriptions.detail.details')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
            <View style={s.hero}>
            <ServiceLogo
              logo={sub.logo}
              icon={sub.icon || 'S'}
              color={sub.color || Colors.accent}
              size={100}
              borderRadius={Radius.lg}
              style={{ marginBottom: 20, ...Shadow.soft }}
              senderPhotoUrl={sub.senderPhotoUrl}
            />
            <Text style={s.subName}>{sub.name}</Text>
            <Text style={s.subCat}>{sub.category || 'Abonnement'}</Text>

            <View style={s.badgeRow}>
              <View style={s.statusBadge}>
                <Text style={s.statusBadgeText}>{statusText}</Text>
              </View>
              {difficultyMeta ? (
                <View style={[s.difficultyBadge, { backgroundColor: difficultyMeta.bg }]}>
                  <Text style={[s.difficultyBadgeText, { color: difficultyMeta.color }]}>
                    {difficultyMeta.label}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {billing.isTrial ? (
            <View style={[s.noticeCard, { borderColor: Colors.accent }]}>
              <Text style={s.noticeTitle}>Essai gratuit actif</Text>
              <Text style={s.noticeBody}>
                Fin estimée le {formatSafeDate(billing.trialEndsAt)}. Ensuite, {formatMoney(amount, currency)} par {cycle}.
              </Text>
            </View>
          ) : null}

          <View style={s.statsGrid}>
            <View style={[s.statItem, { backgroundColor: Colors.surface }]}>
              <Text style={s.statLabel}>Par cycle</Text>
              <Text style={s.statValue}>{billing.isTrial ? formatMoney(0, currency) : formatMoney(amount, currency)}</Text>
            </View>
            <View style={[s.statItem, { backgroundColor: Colors.surface }]}>
              <Text style={s.statLabel}>Moyenne mensuelle</Text>
              <Text style={s.statValue}>{formatMoney(monthly, currency)}</Text>
            </View>
          </View>

          <View style={s.infoCard}>
            <DetailRow label="Prochain paiement" value={formatSafeDate(nextBilling)} styles={s} highlight={billing.urgency === 'urgent' || billing.urgency === 'today'} />
            <DetailRow label="Date d'abonnement" value={formatSafeDate(sub.startDate || sub.start_date)} styles={s} />
            <DetailRow label="Fréquence" value={cycle} styles={s} />
            <DetailRow label="Équivalent annuel" value={formatMoney(annual, currency)} styles={s} />
            <DetailRow label="Statut" value={statusText} styles={s} danger={isCancelled} />
            {sub.provider ? <DetailRow label="Fournisseur" value={sub.provider} styles={s} /> : null}
          </View>

          {guide ? (
            <View style={s.infoCard}>
              <View style={s.guideHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>Guide de résiliation</Text>
                  <Text style={s.cardSub}>{guide.estimatedTime} estimées</Text>
                </View>
                <Pressable style={s.tagButton} onPress={openCancellationFlow}>
                  <Text style={s.tagText}>Ouvrir</Text>
                </Pressable>
              </View>
              <Text style={s.bodyText}>
                Trimly te guide étape par étape, prépare une lettre si nécessaire et garde la confirmation séparée de ton suivi budgétaire.
              </Text>
            </View>
          ) : null}

          <View style={s.actions}>
            <Pressable style={[s.actionBtnDanger, isCancelled && s.disabled]} onPress={openCancellationFlow}>
              <Text style={s.actionTxtDanger}>{isCancelled ? 'Déjà résilié' : "Résilier l'abonnement"}</Text>
            </Pressable>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        <CancellationModal
          visible={showCancellationModal}
          subscription={sub}
          onClose={() => setShowCancellationModal(false)}
          onConfirmCancel={() => {
            setShowCancellationModal(false);
            handleConfirmCancel();
          }}
        />
      </View>
    </Modal>
  );
}

function DetailRow({ label, value, highlight, danger, styles }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, (highlight || danger) && styles.detailDanger]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function makeStyles(Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingVertical: 20,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    headerTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 18, color: Colors.text },
    closeBtn: { padding: 4, width: 32, alignItems: 'flex-start' },
    closeTxt: { fontSize: 20, color: Colors.textSecondary },
    scroll: { padding: Spacing.xl },
    hero: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
    iconCircle: {
      width: 100,
      height: 100,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      ...Shadow.soft,
    },
    iconText: { fontSize: 44 },
    subName: { ...Fonts.primary, ...Fonts.black, fontSize: 28, color: Colors.text, letterSpacing: 0, textAlign: 'center' },
    subCat: { ...Fonts.primary, fontSize: 16, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
    statusBadge: {
      backgroundColor: Colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    statusBadgeText: { ...Fonts.primary, ...Fonts.bold, fontSize: 12, color: Colors.textSecondary },
    difficultyBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radius.pill,
    },
    difficultyBadgeText: { ...Fonts.primary, ...Fonts.bold, fontSize: 12 },
    noticeCard: {
      padding: 16,
      marginBottom: 24,
      borderRadius: Radius.lg,
      backgroundColor: Colors.surface,
      borderWidth: 1,
    },
    noticeTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 14, color: Colors.accent, marginBottom: 4 },
    noticeBody: { ...Fonts.primary, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statItem: {
      flex: 1,
      padding: 16,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    statLabel: {
      ...Fonts.primary,
      ...Fonts.bold,
      fontSize: 11,
      color: Colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0,
    },
    statValue: { ...Fonts.primary, ...Fonts.black, fontSize: 20, color: Colors.text, marginTop: 8, letterSpacing: 0 },
    infoCard: {
      marginBottom: 24,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      backgroundColor: Colors.surface,
      gap: 12,
    },
    detailLabel: { ...Fonts.primary, fontSize: 14, color: Colors.textSecondary, flex: 1 },
    detailValue: { ...Fonts.primary, ...Fonts.bold, fontSize: 14, color: Colors.text, flex: 1.15, textAlign: 'right' },
    detailDanger: { color: Colors.error },
    guideHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      gap: 12,
    },
    cardTitle: { ...Fonts.primary, ...Fonts.bold, fontSize: 15, color: Colors.text },
    cardSub: { ...Fonts.primary, fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
    bodyText: { ...Fonts.primary, fontSize: 13, color: Colors.textSecondary, lineHeight: 20, padding: 14 },
    tagButton: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.bg,
    },
    tagText: { ...Fonts.primary, ...Fonts.bold, fontSize: 11, color: Colors.textSecondary },
    actions: { gap: 12 },
    actionBtnDanger: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.md,
      padding: 18,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    actionTxtDanger: { ...Fonts.primary, ...Fonts.bold, fontSize: 15, color: Colors.error },
    disabled: { opacity: 0.55 },
  });
}
