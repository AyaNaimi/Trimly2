// src/screens/Subscriptions/SubscriptionsScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Alert, TextInput, Modal } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { PremiumHaptics } from '../../utils/haptics';
import { Shadow, Fonts, Radius, Spacing, Metrics } from '../../theme';
import { SubCard } from '../../components';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getNextBilling, generate12MonthProjection, monthlyEquivalent } from '../../utils/dateUtils';
import AddSubscriptionModal from './AddSubscriptionModal';
import SubDetailModal from './SubDetailModal';
import EmailScannerModal from './EmailScannerModal';

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

const emptyIllustrationAsset = require('../../../assets/68749257952.mp4');

export default function SubscriptionsScreen() {
  const { 
    state, 
    dispatch, 
    activeSubscriptions,
    addSubscription,
    updateSubscription,
    cancelSubscription
  } = useApp();
  const { Colors } = useTheme();
  const { t, locale } = useLanguage();

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [longPressedSub, setLongPressedSub] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const allSubs = state.subscriptions;
  const existingSubscriptionNames = (allSubs || []).map(sub => sub?.name).filter(Boolean);

  const filtered = (allSubs || []).filter(s => {
    if (!s) return false;
    
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (filter === 'active') return s.active && !getNextBilling(s, locale, t).isTrial;
    if (filter === 'trial') return s.active && getNextBilling(s, locale, t).isTrial;
    if (filter === 'cancelled') return !s.active;
    return s.active; // 'all' filter now only shows active subs
  });

  const projection = generate12MonthProjection(activeSubscriptions, locale, t);
  const total12 = projection.reduce((a, v) => a + v.total, 0);
  const totalMonthly = activeSubscriptions.reduce((a, s) => a + monthlyEquivalent(s.amount, s.cycle), 0);

  const filters = [
    { key: 'all', label: t('subscriptions.filters.all') },
    { key: 'active', label: t('subscriptions.filters.active') },
    { key: 'cancelled', label: t('subscriptions.filters.cancelled') },
  ];

  const styles = makeStyles(Colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('subscriptions.plans')}</Text>
        <Pressable
          style={styles.scanBtnHeader}
          onPress={() => { PremiumHaptics.click(); setShowScanner(true); }}
        >
          <Text style={styles.scanBtnTextHeader}>{t('subscriptions.scan')}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.projectionCard}>
          <Text style={styles.projectionLabel}>{t('subscriptions.impact12Months')}</Text>
          <Text style={styles.projectionAmt}>{total12.toLocaleString()} {state.currency}</Text>

          <View style={styles.chartWrap}>
            {projection.map((m, i) => {
              const maxVal = Math.max(...projection.map(p => p.total), 1);
              const h = Math.max((m.total / maxVal) * 60, 4);
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={[styles.bar, { height: h, backgroundColor: m.total > 0 ? Colors.accent : Colors.border }]} />
                  <Text style={styles.barLbl}>{m.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.statsGrid}>
            <View>
              <Text style={styles.statLbl}>{t('subscriptions.monthlyTotal')}</Text>
              <Text style={styles.statVal}>{totalMonthly.toFixed(0)} {state.currency}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLbl}>{t('subscriptions.activeCount')}</Text>
              <Text style={styles.statVal}>{activeSubscriptions.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchBarWrap}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.search')}
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterWrap}>
          {filters.map(f => (
            <Pressable
              key={f.key}
              onPress={() => { PremiumHaptics.selection(); setFilter(f.key); }}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            >
              <Text style={[styles.filterTxt, filter === f.key && styles.filterTxtActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ gap: 12 }}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <Video
                  source={emptyIllustrationAsset}
                  style={styles.emptyVideo}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  isLooping
                  isMuted
                  useNativeControls={false}
                />
              </View>
              <Text style={styles.emptyTxt}>{t('subscriptions.empty.message')}</Text>
              <Pressable 
                style={styles.emptyScanBtn}
                onPress={() => setShowScanner(true)}
              >
                <Text style={styles.emptyScanBtnTxt}>{t('subscriptions.empty.scanButton')}</Text>
              </Pressable>
            </View>
          ) : (
            filtered.map(sub => (
              <SubCard
                key={sub.id}
                sub={sub}
                billing={getNextBilling(sub, locale, t)}
                onPress={() => {
                  PremiumHaptics.open();
                  setSelectedSub(sub);
                }}
                onLongPress={async () => {
                  const newActiveStatus = !sub.active;
                  await updateSubscription(sub.id, { 
                    active: newActiveStatus,
                    cancelledAt: newActiveStatus ? null : new Date().toISOString() 
                  });
                  PremiumHaptics.success();
                }}
                onDelete={() => {
                  Alert.alert(
                    t('common.delete'),
                    t('subscriptions.cancel.message', { name: sub.name }),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      { 
                        text: t('common.delete'), 
                        style: 'destructive',
                        onPress: () => dispatch({ type: 'DELETE_SUBSCRIPTION', payload: sub.id })
                      }
                    ]
                  );
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {state.subscriptions?.length > 0 && (
        <Pressable
          style={styles.fab}
          onPress={() => setShowAdd(true)}
        >
          <Text style={styles.fabPlus}>+</Text>
        </Pressable>
      )}

      <AddSubscriptionModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={async (sub) => {
          const ok = await addSubscription({ ...sub, active: true });
          if (ok) {
            setShowAdd(false);
            PremiumHaptics.success();
          } else {
            Alert.alert(t('common.error'), t('subscriptions.errors.syncError'));
          }
        }}
      />

      {selectedSub && (
        <SubDetailModal
          sub={selectedSub}
          billing={getNextBilling(selectedSub, locale, t)}
          onClose={() => setSelectedSub(null)}
          onCancel={() => {
            Alert.alert(
              t('subscriptions.cancel.title'),
              t('subscriptions.cancel.message', { name: selectedSub.name }),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('subscriptions.cancel.confirm'), style: 'destructive',
                  onPress: async () => {
                    const ok = await cancelSubscription(selectedSub.id);
                    if (ok) {
                      setSelectedSub(null);
                      PremiumHaptics.selection();
                    } else {
                      Alert.alert(t('common.error'), t('subscriptions.errors.syncError'));
                    }
                  },
                },
              ]
            );
          }}
          onGenerateLetter={() => {
            PremiumHaptics.click();
          }}
        />
      )}

      <EmailScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        initialEmail={state.session?.user?.email || ''}
        existingSubscriptionNames={existingSubscriptionNames}
        onImport={async (sub) => {
          return await addSubscription(sub);
        }}
      />

    </SafeAreaView>
  );
}

function makeStyles(Colors) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Metrics.screenPadding,
    paddingBottom: Spacing.md,
    paddingTop: Metrics.headerTop,
  },
  title: { 
    ...Fonts.primary, 
    ...Fonts.black, 
    fontSize: 22, 
    color: Colors.text, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5 
  },
  addBtn: { backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, minHeight: Metrics.minTouch },
  addBtnText: { color: Colors.textSecondary, ...Fonts.primary, ...Fonts.bold, fontSize: 11, textTransform: 'uppercase' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Metrics.screenPadding, paddingBottom: Metrics.fabBottomElevated },

  projectionCard: {
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xl,
    padding: Spacing.lg, 
    marginBottom: Spacing.lg, 
    marginTop: Spacing.sm, 
    borderWidth: 1, 
    borderColor: Colors.borderStrong,
    ...Shadow.soft,
  },
  projectionLabel: { 
    ...Fonts.primary, 
    fontSize: 10, 
    ...Fonts.bold, 
    color: Colors.textMuted, 
    textTransform: 'uppercase', 
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  projectionAmt: { 
    ...Fonts.primary, 
    ...Fonts.black, 
    fontSize: 32, 
    color: Colors.text, 
    marginTop: 2,
    letterSpacing: -0.5,
  },
  chartWrap: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    height: 70, 
    marginVertical: Spacing.md, 
    gap: 3,
  },
  chartCol: { flex: 1, alignItems: 'center' },
  bar: { width: '80%', borderRadius: Radius.pill },
  barLbl: { ...Fonts.primary, fontSize: 8, color: Colors.textMuted, marginTop: 6, textTransform: 'uppercase' },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingTop: Spacing.md, 
    borderTopWidth: 1, 
    borderTopColor: Colors.border,
  },
  statLbl: { 
    ...Fonts.primary, 
    fontSize: 9, 
    color: Colors.textMuted, 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statVal: { 
    ...Fonts.primary, 
    ...Fonts.bold, 
    fontSize: 18, 
    color: Colors.text,
    letterSpacing: -0.3,
  },

  filterWrap: { gap: 8, marginBottom: Spacing.md, paddingBottom: 4 },
  searchBarWrap: { marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 14, marginRight: 8, opacity: 0.6 },
  searchInput: {
    flex: 1,
    ...Fonts.primary,
    fontSize: 15,
    color: Colors.text,
  },

  filterBtn: {
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: Radius.pill, 
    minHeight: 36,
    backgroundColor: Colors.surface, 
    borderWidth: 1, 
    borderColor: Colors.borderStrong,
  },
  filterBtnActive: { 
    backgroundColor: Colors.accent, 
    borderColor: Colors.accent,
  },
  filterTxt: { 
    ...Fonts.primary, 
    fontSize: 12, 
    ...Fonts.semiBold, 
    color: Colors.textSecondary,
  },
  filterTxtActive: { 
    color: '#FFFFFF',
  },

  emptyState: { alignItems: 'center', paddingTop: 28, paddingBottom: 8 },
  emptyIllustration: {
    width: 178,
    height: 212,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyVideo: { width: 164, height: 200, borderRadius: 42 },
  emptyTxt: { ...Fonts.primary, fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 0, maxWidth: 260, lineHeight: 18 },
   fab: {
    position: 'absolute',
    right: Metrics.screenPadding,
    bottom: Metrics.fabBottom,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    ...Shadow.medium,
  },
  fabPlus: {
    ...Fonts.primary,
    ...Fonts.light,
    fontSize: 32,
    color: Colors.pureWhite,
    lineHeight: 34,
    marginTop: -2,
  },
  
  scanBtnHeader: { 
    backgroundColor: Colors.bg, paddingHorizontal: 12, paddingVertical: 10, 
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, minHeight: Metrics.minTouch,
    alignItems: 'center', justifyContent: 'center'
  },
  scanBtnTextHeader: { color: Colors.text, ...Fonts.primary, ...Fonts.bold, fontSize: 11, textTransform: 'uppercase' },

  emptyScanBtn: {
    marginTop: 20, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: Radius.pill, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyScanBtnTxt: { ...Fonts.primary, fontSize: 12, ...Fonts.bold, color: Colors.text },

  actionMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  iosMenuContainer: {
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
  },
  iosMenuWrapper: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.medium,
  },
  iosMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iosMenuText: {
    ...Fonts.primary,
    fontSize: 17,
    color: Colors.text,
  },
  iosMenuIcon: {
    fontSize: 18,
    color: Colors.text,
  },
  iosSeparator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  iosCancelBtn: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iosCancelTxt: {
    ...Fonts.primary,
    ...Fonts.bold,
    fontSize: 17,
    color: Colors.accent,
  },
}); }
