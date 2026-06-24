import React, { useRef, useMemo, useState } from 'react';
import {
  View, Text, FlatList, Pressable,
  StyleSheet, SafeAreaView, Alert,
  Animated, PanResponder, useWindowDimensions
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { PremiumHaptics } from '../../utils/haptics';
import { Fonts, Shadow, Radius, Metrics, Spacing } from '../../theme';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import AddTransactionModal from '../Home/AddTransactionModal';

function fmtAmount(value) {
  return Math.abs(value)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
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

const SWIPE_THRESHOLD = 48;
const DELETE_WIDTH = 64;

const getSolidCategoryColor = (color, Colors) => color || Colors.accent;

function SwipeableRow({ children, onConfirmDelete, onDelete, styles, Colors, rowTravelDistance }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;
  const rowScale = useRef(new Animated.Value(1)).current;
  const swipedRef = useRef(false);
  const deletingRef = useRef(false);

  function setSwipedState(value) {
    swipedRef.current = value;
  }

  function setDeletingState(value) {
    deletingRef.current = value;
  }

  const iconScale = translateX.interpolate({
    inputRange: [-DELETE_WIDTH, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 1.08, 0.82],
    extrapolate: 'clamp',
  });

  const deleteOpacity = translateX.interpolate({
    inputRange: [-DELETE_WIDTH, -16, 0],
    outputRange: [1, 0.55, 0],
    extrapolate: 'clamp',
  });

  const deleteTranslateX = translateX.interpolate({
    inputRange: [-DELETE_WIDTH, 0],
    outputRange: [0, 12],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !deletingRef.current && Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const startX = swipedRef.current ? -DELETE_WIDTH : 0;
        const x = Math.min(0, Math.max(-DELETE_WIDTH - 12, startX + g.dx));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        const startX = swipedRef.current ? -DELETE_WIDTH : 0;
        const endX = startX + g.dx;
        const shouldOpen = endX < -SWIPE_THRESHOLD || g.vx < -0.45;

        if (shouldOpen) {
          Animated.spring(translateX, {
            toValue: -DELETE_WIDTH,
            useNativeDriver: true,
            tension: 95,
            friction: 12,
          }).start(() => setSwipedState(true));
          PremiumHaptics.selection();
        } else {
          close();
        }
      },
    })
  ).current;

  function close() {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 95,
      friction: 12,
    }).start(() => setSwipedState(false));
  }

  async function handleDelete() {
    if (deletingRef.current) return;

    setDeletingState(true);
    PremiumHaptics.selection();

    const confirmed = await onConfirmDelete();
    if (!confirmed) {
      setDeletingState(false);
      close();
      return;
    }

    Animated.parallel([
      Animated.timing(rowOpacity, {
        toValue: 0,
        duration: 190,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -rowTravelDistance,
        duration: 230,
        useNativeDriver: true,
      }),
      Animated.spring(rowScale, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 120,
        friction: 14,
      }),
    ]).start(async () => {
      const ok = await onDelete();
      if (!ok) {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 95,
            friction: 12,
          }),
          Animated.spring(rowScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 95,
            friction: 12,
          }),
          Animated.timing(rowOpacity, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setSwipedState(false);
          setDeletingState(false);
        });
      }
    });
  }

  return (
    <Animated.View style={[styles.swipeRowContainer, { opacity: rowOpacity, transform: [{ scale: rowScale }] }]}>
      <View style={styles.swipeDeleteZone}>
        <Pressable onPress={handleDelete} style={styles.swipeDeleteBtn}>
          <Animated.View style={{ opacity: deleteOpacity, transform: [{ translateX: deleteTranslateX }, { scale: iconScale }] }}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14M10 11v6M14 11v6" stroke={Colors.pureWhite} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        </Pressable>
      </View>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

export default function TransactionsScreen() {
  const { state, addTransaction, deleteTransaction, requireProAccess } = useApp();
  const { Colors, isDark } = useTheme();
  const { t, locale } = useLanguage();
  const [showAdd, setShowAdd] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  const styles = makeStyles(Colors, screenWidth);

  // Focus on last 30 days for dashboard card and calculations
  const { txs, totInc, totExp, linePath, areaPath, chartWidth } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const past30 = new Date(today);
    past30.setDate(today.getDate() - 29);
    past30.setHours(0, 0, 0, 0);

    const filtered = (state.transactions || []).filter(tx => {
      const d = new Date(tx.date);
      return d >= past30 && d <= today;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate dates ascending for the sparkline (past to present)
    const dates = [];
    const dailyNet = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      dates.push(iso);
      dailyNet[iso] = 0;
    }

    let totIncome = 0;
    let totExpense = 0;

    filtered.forEach(tx => {
      const iso = tx.date.split('T')[0];
      const amt = Number(tx.amount || 0);
      if (tx.type === 'income') {
        totIncome += amt;
        if (dailyNet[iso] !== undefined) dailyNet[iso] += amt;
      } else {
        totExpense += amt;
        if (dailyNet[iso] !== undefined) dailyNet[iso] -= amt;
      }
    });

    // Compute cumulative balance trend
    let running = 0;
    const balanceHistory = dates.map(date => {
      running += dailyNet[date];
      return running;
    });

    const minBal = Math.min(...balanceHistory);
    const maxBal = Math.max(...balanceHistory);

    // Generate SVG path for a chart that scales to card width
    const chartWidth = Math.max(220, screenWidth - 80);
    const chartHeight = 46;
    const points = balanceHistory.map((val, idx) => {
      const x = (idx / 29) * chartWidth;
      const range = maxBal - minBal;
      const y = chartHeight - 8 - (range > 0 ? ((val - minBal) / range) : 0.5) * (chartHeight - 16);
      return { x, y };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = linePath ? `${linePath} L ${chartWidth.toFixed(1)} ${chartHeight.toFixed(1)} L 0 ${chartHeight.toFixed(1)} Z` : '';

    return { 
      txs: filtered, 
      totInc: totIncome,
      totExp: totExpense,
      linePath,
      areaPath,
      chartWidth
    };
  }, [state.transactions, screenWidth]);

  // Flattened data grouping by date for FlatList
  const listData = useMemo(() => {
    const list = [];
    let lastDateLabel = '';
    txs.forEach(tx => {
      const d = new Date(tx.date);
      let dateLabel = '';
      const todayISOStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISOStr = yesterday.toISOString().split('T')[0];
      const txISOStr = tx.date.split('T')[0];

      if (txISOStr === todayISOStr) {
        dateLabel = locale === 'fr' ? "Aujourd'hui" : "Today";
      } else if (txISOStr === yesterdayISOStr) {
        dateLabel = locale === 'fr' ? "Hier" : "Yesterday";
      } else {
        const rawLabel = d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
          weekday: 'long', month: 'short', day: 'numeric'
        });
        dateLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      }

      if (dateLabel !== lastDateLabel) {
        list.push({ type: 'header', title: dateLabel, id: `header-${txISOStr}` });
        lastDateLabel = dateLabel;
      }
      list.push({ type: 'tx', data: tx, id: tx.id });
    });
    return list;
  }, [txs, locale]);

  function confirmDelete(tx) {
    return new Promise(resolve => {
      Alert.alert(
        t('transactions.deleteConfirm'),
        t('transactions.deleteMessage', { name: tx.note || tx.categoryName, amount: tx.amount, currency: state.currency }),
        [
          { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
          { text: t('common.delete'), style: 'destructive', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      );
    });
  }

  async function removeTransaction(tx) {
    const ok = await deleteTransaction(tx.id);
    if (ok) {
      PremiumHaptics.impact();
    } else {
      Alert.alert(t('common.error'), t('transactions.syncError'));
    }
    return ok;
  }

  const renderHeader = () => {
    const formattedOverallBalance = `${state.income.toLocaleString(locale)} ${state.currency || '€'}`;
    const formattedIncome = `+${totInc.toLocaleString(locale)} ${state.currency || '€'}`;
    const formattedExpensesStr = `-${totExp.toLocaleString(locale)} ${state.currency || '€'}`;

    return (
      <View style={styles.headerContainer}>
        {/* Dashboard Card */}
        <View style={styles.cardContainer}>
          {/* Card Gradient Background using SVG */}
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={isDark ? '#1C152F' : '#2C224B'} />
                <Stop offset="0.5" stopColor={isDark ? '#0F091E' : '#1D1334'} />
                <Stop offset="1" stopColor={isDark ? '#040108' : '#0E061B'} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" rx={24} fill="url(#cardGrad)" />
          </Svg>

          <View style={styles.cardContent}>
            {/* Top row: Balance Info */}
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardLabel}>{t('home.balanceTotal').toUpperCase()}</Text>
                <Text style={styles.cardBalanceText}>{formattedOverallBalance}</Text>
              </View>
            </View>

            {/* Middle section: Live SVG Sparkline Chart */}
            <View style={styles.chartWrapper}>
              {linePath ? (
                <Svg width={chartWidth} height={46}>
                  <Defs>
                    <LinearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#C084FC" stopOpacity={0.35} />
                      <Stop offset="1" stopColor="#C084FC" stopOpacity={0.0} />
                    </LinearGradient>
                  </Defs>
                  {/* Glowing Area Fill */}
                  <Path d={areaPath} fill="url(#sparklineGrad)" />
                  {/* Glowing Path Stroke */}
                  <Path d={linePath} fill="none" stroke="#D8B4FE" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              ) : null}
            </View>

            {/* Bottom Row: Cash Flow Stats (Income vs Expense) */}
            <View style={styles.cardStatsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>{t('reports.income').toUpperCase()}</Text>
                <Text style={styles.statValueIncome}>{formattedIncome}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>{t('home.expense').toUpperCase()}</Text>
                <Text style={styles.statValueExpense}>{formattedExpensesStr}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.historyTitle}>{t('transactions.allTransactions')}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLine} />
          <Text style={styles.sectionHeaderTxt}>{item.title}</Text>
          <View style={styles.sectionHeaderLine} />
        </View>
      );
    }

    const tx = item.data;
    const isIncome = tx.type === 'income';
    const linkedCategory = (state.categories || []).find(cat =>
      String(cat.id) === String(tx.categoryId || tx.category_id)
    );
    const txCategoryName = tx.categoryName || linkedCategory?.name || '';
    const txCategoryColor = tx.color || linkedCategory?.color || Colors.accent;
    const txCategoryIcon = tx.icon || linkedCategory?.icon || '💳';
    const fallbackName = locale === 'fr' ? 'Sans categorie' : 'Uncategorized';
    const hasCustomName = !!tx.note && tx.note !== txCategoryName;
    const displayName = hasCustomName ? tx.note : (txCategoryName || fallbackName);
    const shouldShowCategory = hasCustomName && !!txCategoryName;

    return (
      <SwipeableRow
        onConfirmDelete={() => confirmDelete(tx)}
        onDelete={() => removeTransaction(tx)}
        styles={styles}
        Colors={Colors}
        rowTravelDistance={screenWidth}
      >
        <Pressable style={({ pressed }) => [
          styles.ledgerRow, 
          pressed && styles.ledgerRowPressed,
        ]}>
          {/* Left: Icon + Info */}
          <View style={styles.rowLeft}>
            {/* Category Icon */}
            <View style={[
              styles.categoryIconWrap, 
              { 
                backgroundColor: isIncome 
                  ? (isDark ? Colors.incomeSoft : addAlpha(Colors.income, 0.18)) 
                  : (isDark ? Colors.expenseSoft : addAlpha(Colors.expense, 0.18)),
              }
            ]}>
              <Text style={[styles.categoryIconText, { color: isIncome ? Colors.income : Colors.expense }]}>
                {txCategoryIcon}
              </Text>
            </View>

            {/* Name + Category + Type Badge */}
            <View style={styles.txInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.txName} numberOfLines={1}>
                  {displayName}
                </Text>
                <View style={[
                  styles.txTypeBadge,
                  { backgroundColor: isIncome ? Colors.incomeSoft : Colors.expenseSoft }
                ]}>
                  <Text style={[
                    styles.txTypeBadgeText,
                    { color: isIncome ? Colors.income : Colors.expense }
                  ]}>
                    {isIncome ? (locale === 'fr' ? 'Entrée' : 'Income') : (locale === 'fr' ? 'Sortie' : 'Expense')}
                  </Text>
                </View>
              </View>
              {shouldShowCategory ? (
                <View style={styles.txMetaRow}>
                  <Text style={styles.txCategory} numberOfLines={1}>
                    {txCategoryName}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Right: Amount */}
          <View style={styles.amountContainer}>
            <Text style={[
              styles.ledgerAmount, 
              isIncome ? styles.ledgerAmountIncome : styles.ledgerAmountExpense,
            ]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
              {isIncome ? '+' : '−'}{fmtAmount(tx.amount)} {state.currency || '€'}
            </Text>
          </View>
        </Pressable>
      </SwipeableRow>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>{t('transactions.noTransactions') || 'No transactions yet'}</Text>
      <Text style={styles.emptySubtitle}>{t('transactions.addFirst') || 'Tap + to add your first one'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{t('transactions.title')}</Text>
      </View>
      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          PremiumHaptics.click();
          if (!requireProAccess('add_transaction')) return;
          setShowAdd(true);
        }}
      >
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>

      <AddTransactionModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        categories={state.categories}
        onSave={async tx => {
          if (!requireProAccess('add_transaction')) return false;
          const ok = await addTransaction(tx);
          if (ok) { setShowAdd(false); PremiumHaptics.success(); }
          else Alert.alert(t('common.error'), t('transactions.syncError'));
          return ok;
        }}
      />
    </SafeAreaView>
  );
}

function makeStyles(Colors, screenWidth) { 
  const paddingHorizontal = 20;
  const isCompact = screenWidth < 360;
  const fabSize = 56;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    listContent: {
      paddingHorizontal,
      paddingBottom: 120,
      paddingTop: 10,
    },
    headerContainer: {
      marginBottom: 16,
      marginTop: 10,
    },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Metrics.screenPadding,
      paddingBottom: Spacing.md,
      paddingTop: Metrics.headerTop,
    },
    screenTitle: {
      ...Fonts.sans,
      ...Fonts.black,
      fontSize: 22,
      color: Colors.text,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    cardContainer: {
      width: '100%',
      height: isCompact ? 156 : 166,
      borderRadius: Radius.xl,
      overflow: 'hidden',
      marginBottom: 22,
      elevation: 4,
      ...Shadow.md,
    },
    cardContent: {
      flex: 1,
      padding: isCompact ? 16 : 18,
      justifyContent: 'space-between',
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardLabel: {
      ...Fonts.sans,
      ...Fonts.bold,
      fontSize: 9,
      color: 'rgba(255, 255, 255, 0.45)',
      letterSpacing: 1.2,
    },
    cardBalanceText: {
      ...Fonts.sans,
      ...Fonts.black,
      fontSize: isCompact ? 21 : 23,
      color: '#FFFFFF',
      marginTop: 2,
    },
    chartWrapper: {
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.9,
    },
    cardStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statCol: {
      flex: 1,
    },
    statLabel: {
      ...Fonts.sans,
      ...Fonts.bold,
      fontSize: 8.5,
      color: 'rgba(255, 255, 255, 0.4)',
      letterSpacing: 1,
      marginBottom: 2,
    },
    statValueIncome: {
      ...Fonts.sans,
      ...Fonts.bold,
      fontSize: 13.5,
      color: Colors.income,
    },
    statValueExpense: {
      ...Fonts.sans,
      ...Fonts.bold,
      fontSize: 13.5,
      color: Colors.expense,
    },
    statDivider: {
      width: 1,
      height: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      marginHorizontal: 12,
    },
    historyTitle: {
      ...Fonts.sans,
      ...Fonts.black,
      fontSize: 16,
      color: Colors.text,
      letterSpacing: 0,
      marginBottom: 4,
    },

    // ── Date Group Header (centered line style) ──────────────
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 4,
      gap: 12,
    },
    sectionHeaderLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors.border,
    },
    sectionHeaderTxt: {
      ...Fonts.sans,
      ...Fonts.semiBold,
      fontSize: 11,
      color: Colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    // ── Transaction Row ──────────────────────────────────────
    ledgerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: isCompact ? 48 : 52,
      paddingVertical: isCompact ? 7 : 8,
      paddingHorizontal: 12,
      borderRadius: Radius.xl,
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: Colors.borderStrong,
      ...Shadow.soft,
    },
    ledgerRowPressed: {
      opacity: 0.7,
    },
    rowLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginRight: 8,
    },
    categoryIconWrap: {
      width: isCompact ? 30 : 32,
      height: isCompact ? 30 : 32,
      borderRadius: isCompact ? 15 : 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryIconText: {
      fontSize: isCompact ? 14 : 15,
    },
    txInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: 3,
    },
    txName: {
      ...Fonts.sans,
      ...Fonts.semiBold,
      fontSize: isCompact ? 12 : 13,
      color: Colors.text,
      letterSpacing: 0,
    },
    txMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    txCategory: {
      ...Fonts.sans,
      ...Fonts.medium,
      fontSize: 10,
      color: Colors.textMuted,
      flexShrink: 1,
    },
    txTypeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    txTypeBadgeText: {
      ...Fonts.sans,
      ...Fonts.bold,
      fontSize: 9,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    // ── Amount ───────────────────────────────────────────────
    amountContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      maxWidth: isCompact ? 102 : 114,
    },
    ledgerAmount: {
      ...Fonts.sans,
      ...Fonts.semiBold,
      fontSize: isCompact ? 12 : 13,
      letterSpacing: 0,
    },
    ledgerAmountIncome: {
      color: Colors.income,
    },
    ledgerAmountExpense: {
      color: Colors.expense,
    },

    // ── Swipe delete ─────────────────────────────────────────
    swipeRowContainer: {
      marginBottom: 5,
      borderRadius: Radius.xl,
      overflow: 'hidden',
      backgroundColor: Colors.expense,
    },
    swipeDeleteZone: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: DELETE_WIDTH,
      backgroundColor: Colors.expense,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.xl,
    },
    swipeDeleteBtn: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeDeleteTxt: {
      ...Fonts.sans,
      ...Fonts.bold,
      fontSize: 11,
      color: Colors.pureWhite,
      letterSpacing: 0.5,
    },
    trashIcon: {
      color: Colors.pureWhite,
    },

    // ── Empty State ──────────────────────────────────────────
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      ...Fonts.sans,
      ...Fonts.bold,
      fontSize: 17,
      color: Colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptySubtitle: {
      ...Fonts.sans,
      ...Fonts.regular,
      fontSize: 14,
      color: Colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },

    // ── FAB ──────────────────────────────────────────────────
    fab: {
      position: 'absolute',
    right: 16,
    bottom: 140,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981', // Vert émeraude
    ...Shadow.medium,
    },
    fabPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.95 }],
    },
    fabPlus: {
      color: Colors.pureWhite,
      fontSize: 32,
      fontWeight: '300',
      lineHeight: 34,
      marginTop: -2,
    },
  }); 
}
