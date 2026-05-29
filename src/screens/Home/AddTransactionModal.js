import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Modal, Pressable, TextInput, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Fonts, Radius, Spacing, Shadow } from '../../theme';
import { PremiumHaptics } from '../../utils/haptics';
import { formatDateFull, todayISO } from '../../utils/dateUtils';
import DatePickerModal from '../../components/DatePickerModal';

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AddTransactionModal({
  visible,
  onClose,
  categories,
  onSave,
  initialCategoryId: initial_category_id = '',
}) {
  const { Colors, isDark } = useTheme();
  const { state } = useApp();
  const { t, locale } = useLanguage();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category_id, setCategoryId] = useState(categories[0]?.id || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [categoryQuery, setCategoryQuery] = useState('');
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [renderSheet, setRenderSheet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const sheetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showCategorySheet) {
      setRenderSheet(true);
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setRenderSheet(false));
    }
  }, [showCategorySheet]);

  const backdropOpacity = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  useEffect(() => {
    if (!visible) return;
    if (initial_category_id && categories.find(c => c.id === initial_category_id)) {
      setCategoryId(initial_category_id);
      return;
    }
    if (!categories.find(c => c.id === category_id)) {
      setCategoryId(categories[0]?.id || '');
    }
  }, [visible, categories, category_id, initial_category_id]);

  useEffect(() => {
    if (!visible) return;
    setShowCategorySheet(false);
    setCategoryQuery('');
  }, [visible]);

  const sortedCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    return [...categories]
      .filter(cat => {
        if (!query) return true;
        return (
          cat.name.toLowerCase().includes(query)
          || String(cat.icon || '').includes(query)
          || String(cat.cycle || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.id === category_id) return -1;
        if (b.id === category_id) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [categories, category_id, categoryQuery]);

  const selectedCategory = categories.find(c => c.id === category_id) || sortedCategories[0];

  function selectCategory(id) {
    PremiumHaptics.selection();
    setCategoryId(id);
  }

  function save() {
    const amt = parseFloat(amount.replace(',', '.'));
    if (!amt || amt <= 0 || !selectedCategory) {
      PremiumHaptics.error();
      return;
    }

    PremiumHaptics.success();
    onSave({
      type,
      amount: amt,
      category_id: selectedCategory.id,
      categoryName: selectedCategory.name || '',
      icon: selectedCategory.icon || '💳',
      color: selectedCategory.color || Colors.accent,
      note: note || selectedCategory.name || '',
      date,
    });
    setAmount('');
    setNote('');
    setDate(todayISO());
    setCategoryQuery('');
  }

  const styles = makeStyles(Colors, isDark);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => { PremiumHaptics.selection(); onClose(); }} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </Pressable>
            <Text style={styles.headerTitle}>{t('transactions.addTransaction')}</Text>
            <Pressable onPress={save} style={styles.saveBtnBox}>
              <Text style={styles.saveTxt}>{t('common.save')}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.typeRow}>
              {['expense', 'income'].map(txType => (
                <Pressable
                  key={txType}
                  onPress={() => { PremiumHaptics.selection(); setType(txType); }}
                  style={[styles.typeBtn, type === txType && styles.typeBtnActive]}
                >
                  <Text style={[styles.typeTxt, type === txType && styles.typeTxtActive]}>
                    {txType === 'expense' ? t('transactions.expense') : t('transactions.income')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('transactions.amount')}</Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                borderBottomWidth: 2, 
                borderBottomColor: isAmountFocused ? Colors.accent : Colors.borderStrong,
                paddingBottom: 4,
                marginBottom: 8
              }}>
                <TextInput
                  style={[styles.amountInput, { ...Fonts.serif, fontSize: 24, height: 52, flex: 1 }]}
                  value={amount}
                  onChangeText={(v) => { PremiumHaptics.selection(); setAmount(v); }}
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  autoFocus
                />
                <Text style={{ ...Fonts.serif, fontSize: 18, color: Colors.textSecondary, marginLeft: 10 }}>{state.currency || '€'}</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('transactions.category')}</Text>
              <Pressable
                style={styles.categorySelector}
                onPress={() => {
                  PremiumHaptics.selection();
                  setShowCategorySheet(true);
                }}
              >
                <View style={styles.categorySelectorLeft}>
                  <View style={[styles.categorySelectorIcon, { backgroundColor: addAlpha(selectedCategory?.color || Colors.accent, 0.12) }]}>
                    <Text style={{ fontSize: 18 }}>{selectedCategory?.icon || '💳'}</Text>
                  </View>
                  <Text style={styles.categorySelectorName}>{selectedCategory?.name || t('transactions.selectCategory')}</Text>
                </View>
                <View style={styles.categorySelectorRight}>
                  <Text style={styles.categorySelectorChevron}>›</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('transactions.note')}</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder={t('modals.addTransaction.notePlaceholder')}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('transactions.date')}</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  PremiumHaptics.selection();
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateValue}>{formatDateFull(date, locale)}</Text>
                <Text style={styles.dateIcon}>🗓</Text>
              </Pressable>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <DatePickerModal
        visible={showDatePicker}
        value={date}
        onChange={setDate}
        onClose={() => setShowDatePicker(false)}
        title={t('modals.addTransaction.dateTitle')}
      />
      {renderSheet && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.sheetBackdropInline, { opacity: backdropOpacity }]}>
            <Pressable style={{ flex: 1 }} onPress={() => setShowCategorySheet(false)} />
          </Animated.View>
          <Animated.View style={[styles.sheetInline, { transform: [{ translateY: sheetTranslateY }] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('transactions.category')}</Text>

            {/* Search Input in Sheet */}
            <View style={styles.sheetSearchContainer}>
              <TextInput
                style={styles.sheetSearchInput}
                value={categoryQuery}
                onChangeText={setCategoryQuery}
                placeholder={t('transactions.searchCategories')}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <ScrollView contentContainerStyle={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.categoryGrid}>
                {sortedCategories.map(cat => {
                  const isActive = category_id === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => {
                        selectCategory(cat.id);
                        setShowCategorySheet(false);
                      }}
                      style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                    >
                      {isActive ? (
                        <View style={styles.categoryCheck}>
                          <Text style={styles.categoryCheckText}>✓</Text>
                        </View>
                      ) : null}
                      <View style={[styles.categoryIcon, { backgroundColor: addAlpha(cat.color || Colors.accent, 0.12) }]}>
                        <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                      </View>
                      <Text style={[styles.categoryName, isActive && styles.categoryNameActive]} numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

function makeStyles(Colors, isDark) { return StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: Colors.bg,
  },
  headerTitle: { ...Fonts.sans, fontSize: 20, ...Fonts.bold, color: Colors.text },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  closeTxt: { fontSize: 14, color: Colors.textSecondary },
  saveBtnBox: {
    backgroundColor: Colors.accent,
    minWidth: 98,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  saveTxt: { ...Fonts.sans, fontSize: 13, ...Fonts.bold, color: Colors.pureWhite },

  scroll: { padding: 16 },

  typeRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: 18, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: Colors.border,
  },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  typeBtnActive: { backgroundColor: isDark ? Colors.surfaceAlt : Colors.white, ...Shadow.sm },
  typeTxt: { ...Fonts.sans, fontSize: 14, ...Fonts.semiBold, color: Colors.textSecondary },
  typeTxtActive: { color: Colors.text, ...Fonts.bold },

  label: {
    ...Fonts.sans, fontSize: 11, ...Fonts.bold, color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  fieldGroup: { marginBottom: 24 },
  amountInput: { flex: 1, ...Fonts.serif, fontSize: 24, color: Colors.text },

  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
  },
  categorySelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categorySelectorIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySelectorName: {
    ...Fonts.sans,
    fontSize: 15,
    ...Fonts.medium,
    color: Colors.text,
  },
  categorySelectorChevron: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 76,
    marginBottom: 10,
    position: 'relative',
  },
  categoryCardActive: {
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: 'transparent',
  },
  categoryCheck: {
    position: 'absolute',
    top: 2,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCheckText: { ...Fonts.sans, fontSize: 10, ...Fonts.bold, color: Colors.pureWhite },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: { ...Fonts.sans, fontSize: 10, ...Fonts.bold, color: Colors.text, textAlign: 'center' },
  categoryNameActive: { color: Colors.text },
  sheetBackdropInline: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetInline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 34,
    maxHeight: '75%',
    ...Shadow.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.borderStrong,
    marginBottom: 16,
  },
  sheetTitle: {
    ...Fonts.sans,
    fontSize: 20,
    ...Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  sheetSearchContainer: {
    marginBottom: 16,
  },
  sheetSearchInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Fonts.sans,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetScroll: {
    paddingBottom: 20,
  },

  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16,
    ...Fonts.sans, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateValue: { ...Fonts.sans, fontSize: 15, ...Fonts.semiBold, color: Colors.text },
  dateIcon: { fontSize: 16, color: Colors.textSecondary },
}); }
