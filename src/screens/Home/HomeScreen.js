import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  CategoryRow,
  CategorySection,
  PeriodPill,
} from '../../components';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Fonts, Metrics, Radius, Shadow, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { getPeriodLabel, daysLeftInPeriod, getWeeksInMonth, getPeriodRange } from '../../utils/dateUtils';
import { PremiumHaptics } from '../../utils/haptics';
import AddTransactionModal from './AddTransactionModal';
import CategoryDetailModal from './CategoryDetailModal';
import CategoryManagerModal from './CategoryManagerModal';

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

const INSIGHT_AUTO_DISMISS_MS = 35000;
const TRIAL_AUTO_DISMISS_MS = 35000;

function usePressScale() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 26,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  return { scale, onPressIn, onPressOut };
}

export default function HomeScreen({ navigation }) {
  const { 
    state, 
    trialDaysLeft, 
    dispatch, 
    addTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    requireProAccess
  } = useApp();
  const { Colors } = useTheme();
  const { t, locale } = useLanguage();

  const [period, setPeriod] = useState('monthly');
  const [showAddTx, setShowAddTx] = useState(false);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [showCategoryDetail, setShowCategoryDetail] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showTrial, setShowTrial] = useState(true);
  const [showInsight, setShowInsight] = useState(true);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const settingsPress = usePressScale();
  const addPress = usePressScale();
  const fabPress = usePressScale();
  const insightTranslateY = useRef(new Animated.Value(-60)).current;
  const insightOpacity = useRef(new Animated.Value(0)).current;
  const insightHeight = useRef(new Animated.Value(0)).current;
  const trialTranslate = useRef(new Animated.Value(0)).current;
  const trialOpacity = useRef(new Animated.Value(1)).current;
  const insightTimerRef = useRef(null);
  const trialTimerRef = useRef(null);
  const lottieRef = useRef(null);

  // ── Lottie Animation Setup ──
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  // ── Dynamic Period Filtering ──
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const [y, m, d] = String(dateStr).split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const periodRange = getPeriodRange(period);
  const periodTxs = state.transactions.filter(tx => {
    const d = parseLocalDate(tx.date);
    return d >= periodRange.start && d <= periodRange.end;
  });

  const getSpentForCategory = (catId) => {
    return periodTxs
      .filter(tx => 
        String(tx.categoryId || tx.category_id) === String(catId) && 
        tx.type !== 'income' // On ne compte que les dépenses dans le budget
      )
      .reduce((a, c) => a + Number(c.amount || 0), 0);
  };

  const isWeekly = period.startsWith('w') || period === 'weekly';

  const weeklyCats = state.categories
    .filter(c => c.cycle === 'weekly')
    .map(c => ({ 
      ...c, 
      spent: getSpentForCategory(c.id),
      budget: Number((isWeekly ? c.budget : c.budget * 4.33).toFixed(2))
    }));
    
  const monthlyCats = state.categories
    .filter(c => c.cycle === 'monthly')
    .map(c => ({ 
      ...c, 
      spent: getSpentForCategory(c.id),
      budget: Number((isWeekly ? c.budget / 4.33 : c.budget).toFixed(2))
    }));

  const rawSelectedCategory = state.categories.find(cat => cat.id === selectedCategoryId) || null;
  const syncCategory = [...weeklyCats, ...monthlyCats].find(cat => cat.id === selectedCategoryId) || rawSelectedCategory;

  const weeklyBudget = weeklyCats.reduce((a, c) => a + c.budget, 0);
  const weeklySpent = weeklyCats.reduce((a, c) => a + c.spent, 0);
  const monthlyBudget = monthlyCats.reduce((a, c) => a + c.budget, 0);
  const monthlySpent = monthlyCats.reduce((a, c) => a + c.spent, 0);
  
  // Totals
  const activeBudget = weeklyBudget + monthlyBudget;
  const activeSpent = weeklySpent + monthlySpent; 
  const activeRemaining = activeBudget - activeSpent;
  const activeUsage = activeBudget > 0 ? Math.round((activeSpent / activeBudget) * 100) : 0;
  const currencyLabel = state.currency || '€';
  const periodLabel = isWeekly ? t('home.thisWeek') : t('home.thisMonth');
  const formatAmount = (value) => `${Math.abs(Math.round(value)).toLocaleString(locale)} ${currencyLabel}`;

  let insightLabel = t('home.insight.overview');
  let insightMessage = t('home.insight.spentMessage', { 
    spent: formatAmount(activeSpent), 
    budget: formatAmount(activeBudget), 
    period: periodLabel 
  });

  if (activeBudget <= 0) {
    insightLabel = t('home.insight.start');
    insightMessage = t('home.insight.noBudgetMessage');
  } else if (activeSpent <= 0) {
    insightLabel = t('home.insight.tracking');
    insightMessage = t('home.insight.noSpendingMessage', { 
      period: periodLabel, 
      budget: formatAmount(activeBudget) 
    });
  } else if (activeRemaining < 0) {
    insightLabel = t('home.insight.alert');
    insightMessage = t('home.insight.overBudgetMessage', { 
      amount: formatAmount(activeRemaining) 
    });
  } else if (activeUsage >= 85) {
    insightLabel = t('home.insight.warning');
    insightMessage = t('home.insight.highUsageMessage', { 
      remaining: formatAmount(activeRemaining), 
      usage: activeUsage 
    });
  } else if (activeUsage <= 45) {
    insightLabel = t('home.insight.goodPace');
    insightMessage = t('home.insight.lowUsageMessage', { 
      remaining: formatAmount(activeRemaining), 
      budget: formatAmount(activeBudget) 
    });
  }

  const togglePeriod = () => {
    PremiumHaptics.selection();
    setShowPeriodMenu(true);
  };

  const selectPeriod = (p) => {
    PremiumHaptics.impact('light');
    setPeriod(p);
    setShowPeriodMenu(false);
  };

  const openCategoryPanel = () => {
    PremiumHaptics.selection();
    if (!requireProAccess('manage_categories')) return;
    setShowCategoryPanel(true);
  };

  const openAddTransaction = () => {
    PremiumHaptics.click();
    if (!requireProAccess('add_transaction')) return;
    setShowAddTx(true);
  };

  const openCategoryDetail = (categoryId) => {
    PremiumHaptics.selection();
    setSelectedCategoryId(categoryId);
    setShowCategoryDetail(true);
  };

  const closeInsight = ({ withHaptic = false } = {}) => {
    if (insightTimerRef.current) {
      clearTimeout(insightTimerRef.current);
      insightTimerRef.current = null;
    }
    if (withHaptic) PremiumHaptics.selection();

    Animated.parallel([
      Animated.timing(insightTranslateY, { toValue: -60, duration: 200, useNativeDriver: true }),
      Animated.timing(insightOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(insightHeight, { toValue: 0, duration: 240, useNativeDriver: false }),
    ]).start(() => setShowInsight(false));
  };

  const closeTrial = ({ withHaptic = false } = {}) => {
    if (trialTimerRef.current) {
      clearTimeout(trialTimerRef.current);
      trialTimerRef.current = null;
    }
    if (withHaptic) PremiumHaptics.selection();

    Animated.parallel([
      Animated.timing(trialTranslate, { toValue: -12, duration: 180, useNativeDriver: true }),
      Animated.timing(trialOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setShowTrial(false));
  };

  useEffect(() => {
    if (!showInsight) return undefined;

    insightTranslateY.setValue(-60);
    insightOpacity.setValue(0);
    insightHeight.setValue(0);

    Animated.parallel([
      Animated.timing(insightHeight, { toValue: 60, duration: 220, useNativeDriver: false }),
      Animated.spring(insightTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 16,
        bounciness: 5,
      }),
      Animated.timing(insightOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    insightTimerRef.current = setTimeout(() => closeInsight(), INSIGHT_AUTO_DISMISS_MS);

    return () => {
      if (insightTimerRef.current) {
        clearTimeout(insightTimerRef.current);
        insightTimerRef.current = null;
      }
    };
  }, [showInsight, insightLabel, insightMessage]);

  useEffect(() => {
    if (!showTrial || !(state.trial?.active && trialDaysLeft > 0)) return undefined;

    trialTranslate.setValue(0);
    trialOpacity.setValue(1);
    trialTimerRef.current = setTimeout(() => closeTrial(), TRIAL_AUTO_DISMISS_MS);

    return () => {
      if (trialTimerRef.current) {
        clearTimeout(trialTimerRef.current);
        trialTimerRef.current = null;
      }
    };
  }, [showTrial, state.trial?.active, trialDaysLeft]);

  const insightPanResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_, gesture) => {
      if (gesture.dy < 0) {
        insightTranslateY.setValue(Math.max(gesture.dy, -60));
        insightOpacity.setValue(Math.max(0, 1 + gesture.dy / 60));
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy < -30) {
        closeInsight({ withHaptic: true });
      } else {
        Animated.parallel([
          Animated.spring(insightTranslateY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }),
          Animated.timing(insightOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
      }
    },
  })).current;

  const styles = makeStyles(Colors);

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          {/* Animated Lottie Cat Playing - remplace le logo */}
          <View style={styles.headerMascotContainer}>
            <LottieView
              ref={lottieRef}
              source={require('../../../assets/cat-playing.json')}
              autoPlay
              loop
              style={styles.headerLottieAnimation}
            />
          </View>
          <Text style={styles.logoTitle}>
            trimly
            <Text style={styles.logoDot}>.</Text>
          </Text>
        </View>
        <View style={styles.headerActions}>
          <PeriodPill label={getPeriodLabel(period, locale, t)} onPress={togglePeriod} />
          <Pressable
            onPress={openCategoryPanel}
            onPressIn={settingsPress.onPressIn}
            onPressOut={settingsPress.onPressOut}
          >
            <Animated.View style={[styles.settingsBtn, { transform: [{ scale: settingsPress.scale }] }]}>
              <Ionicons name="create-outline" size={20} color={Colors.text} />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {/* ── Insight banner (in-flow, between header and scroll) ── */}
      {showInsight && (() => {
        const isAlert   = insightLabel === t('home.insight.alert');
        const isWarning = insightLabel === t('home.insight.warning');
        const isGood    = insightLabel === t('home.insight.goodPace');
        const iconName  = isAlert ? 'flame-outline' : isWarning ? 'trending-up-outline' : isGood ? 'leaf-outline' : 'pulse-outline';
        const iconColor = isAlert ? Colors.expense : isWarning ? Colors.warning : isGood ? Colors.income : Colors.accent;
        const iconBg    = isAlert ? addAlpha(Colors.expense, 0.12) : isWarning ? addAlpha(Colors.warning, 0.12) : isGood ? addAlpha(Colors.income, 0.12) : addAlpha(Colors.accent, 0.08);
        return (
          // height only — JS driver (useNativeDriver:false)
          <Animated.View style={[styles.insightBannerWrap, { height: insightHeight }]}>
            {/* opacity + translateY — native driver (useNativeDriver:true) */}
            <Animated.View style={{ opacity: insightOpacity, flex: 1 }}>
              <Animated.View
                style={[
                  styles.insightBanner,
                  isAlert   && styles.insightBoxAlert,
                  isWarning && styles.insightBoxWarning,
                  isGood    && styles.insightBoxGood,
                  { transform: [{ translateY: insightTranslateY }] },
                ]}
                {...insightPanResponder.panHandlers}
              >
                {/* Icon in tinted circle */}
                <View style={[styles.insightIconWrap, { backgroundColor: iconBg }]}>
                  <Ionicons name={iconName} size={15} color={iconColor} />
                </View>

                {/* Message */}
                <Text
                  style={[
                    styles.insightBannerText,
                    isAlert   && styles.insightBannerTextAlert,
                    isWarning && styles.insightBannerTextWarning,
                    isGood    && styles.insightBannerTextGood,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {insightMessage}
                </Text>

                {/* Close */}
                <Pressable onPress={() => closeInsight({ withHaptic: true })} hitSlop={14}>
                  <Ionicons name="close-outline" size={18} color={addAlpha(Colors.textMuted, 0.6)} />
                </Pressable>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        );
      })()}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Balance hero ── */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>{t('home.balanceTotal')}</Text>
          <View style={styles.balanceAmtRow}>
            <Text style={styles.balanceAmt}>
              {state.income > 0 ? state.income.toLocaleString(locale) : '0'}
            </Text>
            <Text style={styles.balanceCurrency}>{state.currency || '€'}</Text>
          </View>
          <View style={styles.balanceMeta}>
            <View style={styles.dotLive} />
            <Text style={styles.balanceStatus}>{t('home.syncedStatus')}</Text>
          </View>
        </View>

        {/* ── Trial card ── */}
        {state.trial?.active && trialDaysLeft > 0 && showTrial && (
          <Animated.View
            style={[
              styles.trialCard,
              { opacity: trialOpacity, transform: [{ translateY: trialTranslate }] },
            ]}
          >
            <Svg style={styles.trialGradient} width="100%" height="100%" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="trialPlanGradient" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#2B0638" />
                  <Stop offset="0.56" stopColor="#4B0A60" />
                  <Stop offset="1" stopColor="#8D5BC6" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#trialPlanGradient)" />
            </Svg>

            <View style={styles.trialCardInner}>
              <View style={styles.trialCardBody}>
                <Text style={styles.trialCardTitle}>Free plan</Text>
                <Text style={styles.trialCardSub}>{t('home.trial.daysLeftFull', { days: trialDaysLeft })}</Text>
              </View>
              <Pressable
                style={styles.trialCtaBtn}
                onPress={() => { PremiumHaptics.selection(); navigation.navigate('Settings'); }}
              >
                <Text style={styles.trialCtaTxt}>{t('common.activate')}</Text>
                <Ionicons name="chevron-forward" size={15} color={Colors.pureWhite} />
              </Pressable>
              <Pressable
                style={styles.trialDismissBtn}
                onPress={() => closeTrial({ withHaptic: true })}
                hitSlop={12}
              >
                <Ionicons name="close" size={13} color="rgba(255,255,255,0.68)" />
              </Pressable>
            </View>
            <View style={styles.trialProgressTrack}>
              <View style={[styles.trialProgressFill, {
                width: `${Math.min(100, Math.round((trialDaysLeft / 14) * 100))}%`,
              }]} />
            </View>
          </Animated.View>
        )}

        {/* ── Budget sections ── */}
        {weeklyCats.length > 0 && (
          <CategorySection
            label={t('common.week')}
            daysLeft={daysLeftInPeriod('weekly')}
            budgeted={weeklyBudget}
            left={weeklyBudget - weeklySpent}
          >
            {weeklyCats.map(cat => (
              <CategoryRow key={cat.id} category={cat} simple onPress={() => openCategoryDetail(cat.id)} />
            ))}
          </CategorySection>
        )}

        {monthlyCats.length > 0 && (
          <CategorySection
            label={t('common.month')}
            daysLeft={daysLeftInPeriod('monthly')}
            budgeted={monthlyBudget}
            left={monthlyBudget - monthlySpent}
          >
            {monthlyCats.map(cat => (
              <CategoryRow key={cat.id} category={cat} simple onPress={() => openCategoryDetail(cat.id)} />
            ))}
          </CategorySection>
        )}

        {/* ── Add category button ── */}
        <Pressable
          onPress={openCategoryPanel}
          onPressIn={addPress.onPressIn}
          onPressOut={addPress.onPressOut}
        >
          <Animated.View style={[styles.addBtn, { transform: [{ scale: addPress.scale }] }]}>
            <Text style={styles.addBtnText}>{t('categoryManager.title')}</Text>
            <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
          </Animated.View>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Period Dropdown Menu ── */}
      {showPeriodMenu && (
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => setShowPeriodMenu(false)}
        >
          <View style={styles.menuBackdrop} />
          <View style={styles.periodMenuContainer}>
            <View style={styles.menuArrow} />
            <View style={styles.periodMenu}>
              <Text style={styles.menuTitle}>{new Date().toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</Text>
              
              <View style={styles.calendarGrid}>
                <View style={styles.dayHeaders}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(2024, 0, 1 + i);
                    return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(d);
                  }).map((d, idx) => <Text key={`h-${idx}`} style={styles.dayHeaderTxt}>{d}</Text>)}
                </View>
                
                {getWeeksInMonth().map((w) => (
                  <Pressable 
                    key={w.id}
                    style={[styles.weekRow, period === w.id && styles.weekRowActive]} 
                    onPress={() => selectPeriod(w.id)}
                  >
                    {w.days.map((d, idx) => (
                      <View key={idx} style={styles.dayCell}>
                        <Text style={[
                          styles.dayText, 
                          !d.isCurrentMonth && styles.dayTextEmpty,
                          period === w.id && styles.dayTextActive
                        ]}>
                          {d.day || ''}
                        </Text>
                      </View>
                    ))}
                    {period === w.id && <View style={styles.weekIndicator} />}
                  </Pressable>
                ))}
              </View>

              <View style={styles.menuDivider} />
              
              <Pressable 
                style={[styles.menuItem, period === 'monthly' && styles.menuItemActive]} 
                onPress={() => selectPeriod('monthly')}
              >
                <View style={[styles.menuItemIcon, period === 'monthly' && styles.menuItemIconActive]}>
                  <Ionicons name="apps-outline" size={16} color={period === 'monthly' ? Colors.pureWhite : Colors.textMuted} />
                </View>
                <Text style={[styles.menuItemText, period === 'monthly' && styles.menuItemTextActive]}>
                  {t('home.fullMonth')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}

      <Pressable
        onPress={openAddTransaction}
        onPressIn={fabPress.onPressIn}
        onPressOut={fabPress.onPressOut}
      >
        <Animated.View style={[styles.fab, { transform: [{ scale: fabPress.scale }] }]}>
          <Text style={styles.fabPlus}>+</Text>
        </Animated.View>
      </Pressable>

      <AddTransactionModal
        visible={showAddTx}
        onClose={() => setShowAddTx(false)}
        categories={state.categories}
        onSave={async (tx) => {
          if (!requireProAccess('add_transaction')) return false;
          const ok = await addTransaction(tx);
          if (ok) {
            setShowAddTx(false);
            PremiumHaptics.success();
          } else {
            Alert.alert(t('common.error'), t('transactions.syncError'));
          }
        }}
      />

      <CategoryManagerModal
        visible={showCategoryPanel}
        onClose={() => setShowCategoryPanel(false)}
        categories={state.categories}
        onDeleteCategory={async (categoryId) => {
          const ok = await deleteCategory(categoryId);
          if (ok) PremiumHaptics.success();
        }}
        onOpenCategory={(categoryId) => {
          setShowCategoryPanel(false);
          openCategoryDetail(categoryId);
        }}
        onCreateCategory={async (cat) => {
          if (!requireProAccess('add_category')) return false;
          const ok = await addCategory({ ...cat, spent: 0 });
          if (ok) PremiumHaptics.success();
          return ok;
        }}
        onUpdateCategory={async (cat) => {
          if (!requireProAccess('update_category')) return false;
          const ok = await updateCategory(cat.id, cat);
          if (ok) PremiumHaptics.success();
          return ok;
        }}
      />

      <CategoryDetailModal
        visible={showCategoryDetail}
        category={syncCategory}
        transactions={state.transactions}
        categories={state.categories}
        currency={state.currency || '€'}
        periodRange={periodRange}
        onClose={() => setShowCategoryDetail(false)}
        onRequestUpdateCategory={() => requireProAccess('update_category')}
        onRequestAddTransaction={() => requireProAccess('add_transaction')}
        onUpdateCategory={async (cat) => {
          if (!requireProAccess('update_category')) return false;
          const ok = await updateCategory(cat.id, cat);
          if (ok) {
            setSelectedCategoryId(cat.id);
            PremiumHaptics.success();
          }
          return ok;
        }}
        onDeleteCategory={async (categoryId) => {
          const ok = await deleteCategory(categoryId);
          if (ok) {
            setShowCategoryDetail(false);
            PremiumHaptics.success();
          }
        }}
        onAddTransaction={async (tx) => {
          if (!requireProAccess('add_transaction')) return false;
          const ok = await addTransaction(tx);
          if (ok) PremiumHaptics.success();
          return ok;
        }}
      />

    </SafeAreaView>
  );
}

function makeStyles(Colors) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  // ── Header ───────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Metrics.screenPadding,
    paddingBottom: Spacing.md,
    paddingTop: Metrics.headerTop,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 34,
    height: 34,
  },
  logoTitle: {
    ...Fonts.primary,
    ...Fonts.black,
    fontSize: 22,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  logoDot: {
    color: '#FF9100', // Premium Logo Orange
  },
  headerMascotContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLottieAnimation: {
    width: 50,
    height: 50,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsIcon: { ...Fonts.primary, fontSize: 15, color: Colors.text },

  // ── Scroll ───────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Metrics.screenPadding, paddingBottom: Metrics.fabBottomElevated },

  // ── Insight banner (in-flow, compact single-row) ──────────
  insightBannerWrap: {
    overflow: 'hidden',
    marginHorizontal: Metrics.screenPadding,
    marginBottom: 0,
    paddingBottom: 8,
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 0,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  insightIconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightBannerText: {
    ...Fonts.primary,
    ...Fonts.medium,
    fontSize: 12.5,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  insightBannerTextAlert:   { color: Colors.expense },
  insightBannerTextWarning: { color: Colors.warning },
  insightBannerTextGood:    { color: Colors.income },
  // kept for compatibility
  insightBox: {},
  insightBoxAlert: {
    backgroundColor: addAlpha(Colors.expense, 0.07),
    borderColor: addAlpha(Colors.expense, 0.25),
  },
  insightBoxGood: {
    backgroundColor: addAlpha(Colors.income, 0.07),
    borderColor: addAlpha(Colors.income, 0.25),
  },
  insightBoxWarning: {
    backgroundColor: addAlpha(Colors.warning, 0.07),
    borderColor: addAlpha(Colors.warning, 0.25),
  },
  insightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightChip: {
    backgroundColor: addAlpha(Colors.text, 0.08),
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: addAlpha(Colors.text, 0.1),
    flexShrink: 0,
  },
  insightChipAlert:   { backgroundColor: addAlpha(Colors.expense, 0.15), borderColor: addAlpha(Colors.expense, 0.3) },
  insightChipWarning: { backgroundColor: addAlpha(Colors.warning, 0.15), borderColor: addAlpha(Colors.warning, 0.3) },
  insightChipGood:    { backgroundColor: addAlpha(Colors.income,  0.15), borderColor: addAlpha(Colors.income,  0.3) },
  insightChipText: {
    ...Fonts.primary,
    ...Fonts.bold,
    fontSize: 9,
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  insightChipTextAlert:   { color: Colors.expense },
  insightChipTextWarning: { color: Colors.warning },
  insightChipTextGood:    { color: Colors.income },
  insightHint:   { ...Fonts.primary, fontSize: 12, color: Colors.textMuted },
  insightText:   { ...Fonts.primary, fontSize: 12, color: Colors.text, lineHeight: 17 },
  insightStrong: { ...Fonts.bold },

  // ── Balance hero ─────────────────────────────────────────
  balanceSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  balanceLabel: {
    ...Fonts.primary,
    ...Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  balanceAmtRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 10,
  },
  balanceAmt: {
    ...Fonts.primary,
    ...Fonts.black,
    fontSize: 46,
    color: Colors.text,
    letterSpacing: -2,
    lineHeight: 50,
  },
  balanceCurrency: {
    ...Fonts.primary,
    ...Fonts.medium,
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  balanceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  dotLive: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.income,
  },
  balanceStatus: {
    ...Fonts.primary,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.1,
  },

  // ── Trial card ───────────────────────────────────────────
  trialBannerWrap: { marginTop: Spacing.sm },
  trialCard: {
    marginBottom: Spacing.lg,
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: '#2B0638',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Shadow.medium,
  },
  trialGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  trialCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 86,
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 13,
    gap: 9,
  },
  trialCrown: { fontSize: 15, lineHeight: 19, color: Colors.accentSecondary },
  trialCardBody: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
    gap: 4,
  },
  trialCardTitle: {
    ...Fonts.primary,
    ...Fonts.black,
    fontSize: 19,
    color: Colors.pureWhite,
    letterSpacing: 0,
    lineHeight: 23,
  },
  trialCardSub: {
    ...Fonts.primary,
    ...Fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.74)',
    lineHeight: 17,
  },
  trialCtaBtn: {
    minWidth: 88,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(22,12,30,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 10,
  },
  trialCtaTxt: {
    ...Fonts.primary,
    ...Fonts.bold,
    fontSize: 12,
    color: Colors.pureWhite,
    letterSpacing: 0,
  },
  trialDismissBtn: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.14)',
  },
  trialDismiss: {
    ...Fonts.primary,
    fontSize: 12,
    color: 'rgba(255,255,255,0.28)',
  },
  trialProgressTrack: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 9,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  trialProgressFill: {
    height: 2,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.78,
  },
  // legacy stubs
  trialStrip: { marginBottom: Spacing.lg },
  trialStripDivider: { height: 1, backgroundColor: Colors.border },
  trialStripRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  trialStripLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, ...Fonts.primary, fontSize: 12, color: Colors.textMuted },
  trialBadge: { backgroundColor: Colors.accentSoft, borderRadius: Radius.pill, paddingHorizontal: 6, paddingVertical: 2 },
  trialBadgeTxt: { ...Fonts.primary, ...Fonts.bold, fontSize: 9, color: Colors.accent, letterSpacing: 0.8 },
  trialStripDays: { ...Fonts.primary, ...Fonts.semiBold, color: Colors.text },
  trialStripCta: { ...Fonts.primary, ...Fonts.semiBold, fontSize: 12, color: Colors.accent },
  trialCardTop: {}, trialCardLeft: {}, trialCardDays: {},
  trialHero: {}, trialHeadline: {}, trialSubline: {},
  trialCounterRow: {}, trialCounterBox: {}, trialCounterNum: {}, trialCounterLabel: {},
  trialCounterDivider: {}, trialCounterDesc: {}, trialProgressLabels: {},
  trialProgressStart: {}, trialProgressEnd: {}, trialFeatures: {},
  trialFeatureRow: {}, trialFeatureCheck: {}, trialFeatureTxt: {},
  trialCta: {}, trialCtaArrow: {}, trialFootnote: {},

  // ── Add category button ──────────────────────────────────
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    marginTop: Spacing.sm,
  },
  addBtnIcon: {
    ...Fonts.primary,
    ...Fonts.light,
    fontSize: 18,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  addBtnText: {
    ...Fonts.primary,
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // ── FAB ──────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 108,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981', // Vert émeraude
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
  fabText: { ...Fonts.primary, ...Fonts.light, color: Colors.pureWhite, fontSize: 30, marginTop: -2 },

  // ── Period Menu ──
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  periodMenuContainer: {
    position: 'absolute',
    top: Metrics.headerTop + 100, 
    right: Metrics.screenPadding - 10, 
    alignItems: 'flex-end',
  },
  menuArrow: {
    width: 12,
    height: 12,
    backgroundColor: Colors.surface,
    transform: [{ rotate: '45deg' }],
    marginBottom: -6,
    marginRight: 85, // Aligned with PeriodPill center
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: Colors.borderStrong,
    zIndex: 1,
  },
  periodMenu: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 8,
    ...Shadow.premium,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  menuTitle: {
    ...Fonts.primary,
    ...Fonts.bold,
    fontSize: 11,
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  calendarGrid: {
    padding: 4,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeaderTxt: {
    flex: 1,
    textAlign: 'center',
    ...Fonts.primary,
    ...Fonts.bold,
    fontSize: 9,
    color: Colors.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginVertical: 1,
  },
  weekRowActive: {
    backgroundColor: Colors.accentSoft,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  dayText: {
    ...Fonts.primary,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  dayTextActive: {
    color: Colors.accent,
    ...Fonts.bold,
  },
  dayTextEmpty: {
    opacity: 0,
  },
  weekIndicator: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    width: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
  },
  menuItemActive: {
    backgroundColor: Colors.accentSoft,
  },
  menuItemIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemIconActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  menuItemText: {
    ...Fonts.primary,
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menuItemTextActive: {
    color: Colors.accent,
    ...Fonts.bold,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
    marginHorizontal: 4,
  },
}); }
