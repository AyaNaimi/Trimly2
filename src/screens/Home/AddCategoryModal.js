import React, { useEffect, useState, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
} from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CATEGORY_COLORS } from '../../data/initialData';
import { Fonts, Radius, Spacing, Shadow } from '../../theme';
import { PremiumHaptics } from '../../utils/haptics';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

const EMOJI_CATEGORIES = [
  { id: 'recent', icon: '🕒', items: ['💰', '🛒', '🍽️', '☕'] },
  { id: 'smileys', icon: '😊', items: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'] },
  { id: 'finance', icon: '💳', items: ['💰', '💵', '💸', '💳', '🏦', '📈', '🪙', '📊', '📈', '📉', '🤑', '💎', '💼', '👜', '🛍️', '🛒', '📦', '🏷️', '🧾'] },
  { id: 'food', icon: '🍕', items: ['🍕', '🍔', '🍟', '🍎', '📒', '🍰', '🍺', '🥤', '🍦', '🍳', '🥐', '🥖', '🥨', '🧀', '🍗', '🍖', '🌮', '🍣', '🍱', '🍜', '🍝', '🍲', '🥗', '🍿', '🍩', '🍪', '🍫', '🍬', '🍭', '🍮', '🍯', '🥛', '☕', '🍵', '🍶', '🥂', '🥃', '🍸', '🍹'] },
  { id: 'transport', icon: '🚇', items: ['🚲', '🛵', '🚅', '✈️', '🚢', '🚀', '⛽', '🅿️', '🚧', '🗺️', '🚗', '🚕', '🚙', '🚌', '🚎', '🎏', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🏍️', '🚲', '🛴', '🛵', '🚠', '🚟', '🛶', '⛵', '🚁'] },
  { id: 'leisure', icon: '🎮', items: ['🎮', '🎨', '🎸', '📷', '📚', '⚽', '🎾', '🎳', '🎯', '🎡', '🎭', '🎬', '🎹', '🎷', '🎺', '🎻', '🎤', '🎧', '📻', '📺', '🎞️', '🎟️', '🛹', '🛶', '🏊', '🏄', '🏌️', '🧗', '🚵', '🧘'] },
  { id: 'home', icon: '🏠', items: ['🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🕍', '🕋', '⛲', '⛺', '💊', '🧴', '📱', '🌐', '💡', '👗', '🎉', '💪', '🛍️', '🧼', '🧺', '🧹', '🪣', '🚿', '🛁', '🚽', '🛋️', '🪑', '🛏️'] },
];
const DEFAULT_VALUES = {
  name: '',
  icon: '💰',
  color: '',
  type: 'expense',
  budget: '',
  cycle: 'monthly',
};

const normalizeHexColor = (value, fallback) => {
  if (!value || typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(normalized)
    ? normalized.toUpperCase()
    : fallback;
};

export default function AddCategoryModal({
  visible,
  onClose,
  onSave,
  initialValues = null,
  mode = 'create',
  onDelete,
}) {
  const { Colors, isDark } = useTheme();
  const { state } = useApp();
  const { t } = useLanguage();
  const [name, setName] = useState(DEFAULT_VALUES.name);
  const [icon, setIcon] = useState(DEFAULT_VALUES.icon);
  const [color, setColor] = useState(DEFAULT_VALUES.color);
  const [type, setType] = useState(DEFAULT_VALUES.type);
  const [amount, setAmount] = useState(DEFAULT_VALUES.budget);
  const [cycle, setCycle] = useState(DEFAULT_VALUES.cycle);

  const [emojiSearch, setEmojiSearch] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorWheel, setShowColorWheel] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!color && Colors?.accent) {
      setColor(normalizeHexColor(Colors.accent, '#5B3BF5'));
    }
  }, [Colors, color]);

  useEffect(() => {
    if (!visible) return;
    const values = { ...DEFAULT_VALUES, ...(initialValues || {}) };
    setName(values.name || '');
    setIcon(values.icon || DEFAULT_VALUES.icon);
    setColor(normalizeHexColor(values.color, normalizeHexColor(Colors.accent, '#5B3BF5')));
    setType(values.type || DEFAULT_VALUES.type);
    setAmount(typeof values.budget === 'number' ? String(values.budget) : (values.budget || ''));
    setCycle(values.cycle || DEFAULT_VALUES.cycle);
    setEmojiSearch('');
    setShowIconPicker(false);
  }, [visible, initialValues, Colors.accent]);

  function resetForm() {
    setName(DEFAULT_VALUES.name);
    setIcon(DEFAULT_VALUES.icon);
    setColor(normalizeHexColor(Colors.accent, '#5B3BF5'));
    setType(DEFAULT_VALUES.type);
    setAmount(DEFAULT_VALUES.budget);
    setCycle(DEFAULT_VALUES.cycle);
    setEmojiSearch('');
    setShowIconPicker(false);
    setShowColorWheel(false);
  }

  function save() {
    if (!name.trim()) {
      PremiumHaptics.error();
      return;
    }
    PremiumHaptics.success();
    onSave({
      ...(initialValues || {}),
      name: name.trim(),
      icon,
      color: normalizeHexColor(color, normalizeHexColor(Colors.accent, '#5B3BF5')),
      budget: parseFloat(amount) || 0,
      cycle,
      type,
    });
    resetForm();
  }

  function openIconPicker() {
    PremiumHaptics.selection();
    setShowIconPicker(true);
  }

  function closeIconPicker() {
    PremiumHaptics.selection();
    setShowIconPicker(false);
    setEmojiSearch('');
  }

  const allEmojis = [...new Set(EMOJI_CATEGORIES.flatMap(c => c.items))];
  const filteredEmojis = emojiSearch.length > 0
    ? allEmojis.filter(e => e.includes(emojiSearch))
    : allEmojis;

  const styles = makeStyles(Colors, isDark);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Pressable onPress={() => { PremiumHaptics.selection(); onClose(); }} style={styles.closeBtn}>
                <Text style={styles.closeTxt}>✕</Text>
              </Pressable>
              <Text style={styles.headerTitle}>{mode === 'edit' ? t('modals.addCategory.editTitle') : t('modals.addCategory.newTitle')}</Text>
              <Pressable onPress={save} style={styles.createBtnBox}>
                <Text style={styles.createTxt}>{mode === 'edit' ? t('modals.addCategory.save') : t('modals.addCategory.create')}</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} ref={scrollRef}>
              {/* --- Hero Preview --- */}
              <View style={styles.previewBox}>
                <View style={styles.iconPreviewWrap}>
                  <View style={[styles.iconLarge, { backgroundColor: color || Colors.accent }]}>
                    <Text style={{ fontSize: 48 }}>{icon}</Text>
                  </View>
                  <Pressable onPress={openIconPicker} style={styles.iconEditBadge}>
                    <MaterialCommunityIcons name="pen" size={17} color={Colors.text} />
                  </Pressable>
                </View>
                <View style={styles.previewTextWrapper}>
                  <TextInput
                    style={styles.previewInput}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('modals.addCategory.namePlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    autoFocus
                  />
                  <Text style={styles.previewSub}>{type === 'expense' ? t('modals.addCategory.expenseSub') : t('modals.addCategory.savingsSub')}</Text>
                </View>
              </View>

            {/* --- Config Section --- */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('modals.addCategory.config')}</Text>
              <View style={styles.typeToggle}>
                {['expense', 'savings'].map(item => (
                  <Pressable
                    key={item}
                    onPress={() => { PremiumHaptics.selection(); setType(item); }}
                    style={[styles.typeBtn, type === item && styles.typeBtnActive]}
                  >
                    <Text style={[styles.typeTxt, type === item && styles.typeTxtActive]}>
                      {item === 'expense' ? t('modals.addCategory.expense') : t('modals.addCategory.savings')}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.budgetRow}>
                <View style={styles.amountInputBox}>
                  <Text style={styles.currencySymbol}>{state.currency || '€'}</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.textMuted}
                    style={styles.mainAmountInput}
                  />
                </View>
                <Pressable
                  onPress={() => { PremiumHaptics.selection(); setCycle(c => c === 'weekly' ? 'monthly' : 'weekly'); }}
                  style={styles.cycleBadge}
                >
                  <Text style={styles.cycleBadgeTxt}>{cycle === 'weekly' ? t('modals.addCategory.perWeek') : t('modals.addCategory.perMonth')}</Text>
                </Pressable>
              </View>
            </View>

            {/* --- Color Palette --- */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>{t('modals.addCategory.colorHeader')}</Text>
                <Pressable onPress={() => { PremiumHaptics.selection(); setShowColorWheel(!showColorWheel); }}>
                  <Text style={styles.wheelToggleTxt}>{showColorWheel ? t('modals.addCategory.simplePalette') : t('modals.addCategory.colorWheel')}</Text>
                </Pressable>
              </View>

              {!showColorWheel ? (
                <View style={styles.colorPalette}>
                  {CATEGORY_COLORS.map(c => {
                    const normalizedOption = normalizeHexColor(c, c);
                    const selectedColor = normalizeHexColor(color, normalizeHexColor(Colors.accent, '#5B3BF5'));
                    const isSelected = selectedColor === normalizedOption;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => { PremiumHaptics.selection(); setColor(normalizedOption); }}
                        style={[styles.colorBubble, { backgroundColor: normalizedOption }, isSelected && styles.colorBubbleActive]}
                      />
                    );
                  })}
                  <Pressable
                    onPress={() => { PremiumHaptics.selection(); setShowColorWheel(true); }}
                    style={styles.plusColorBtn}
                  >
                    <Text style={{ fontSize: 18, color: Colors.textSecondary }}>🎨</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.wheelContainer}>
                  <ColorPicker
                    color={color || '#5B3BF5'}
                    onColorChange={setColor}
                    thumbSize={26}
                    sliderSize={26}
                    noSnap={true}
                    row={false}
                  />
                  <View style={styles.wheelFooter}>
                    <View style={styles.hexBox}>
                      <Text style={styles.hexHash}>#</Text>
                      <TextInput
                        style={styles.hexValue}
                        value={color?.replace('#', '').toUpperCase()}
                        onChangeText={(v) => setColor(`#${v.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)}`)}
                        maxLength={6}
                      />
                    </View>
                    <View style={[styles.colorPreview, { backgroundColor: color }]} />
                  </View>
                </View>
              )}
            </View>

            {mode === 'edit' && onDelete && (
              <Pressable onPress={onDelete} style={styles.dangerZone}>
                <Text style={styles.dangerText}>{t('modals.addCategory.delete')}</Text>
              </Pressable>
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
        </KeyboardAvoidingView>

        <Modal
          visible={showIconPicker}
          transparent
          animationType="fade"
          onRequestClose={closeIconPicker}
        >
          <View style={styles.emojiPopupOverlay}>
            <Pressable style={styles.emojiPopupBackdrop} onPress={closeIconPicker} />
            <View style={styles.emojiPopupCard}>
              <View style={styles.emojiPopupHeader}>
                <Text style={styles.emojiPopupTitle}>{t('modals.addCategory.iconHeader')}</Text>
                <Pressable onPress={closeIconPicker} style={styles.emojiPopupClose}>
                  <Text style={styles.closeTxt}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('modals.addCategory.searchEmoji')}
                  placeholderTextColor={Colors.textMuted}
                  value={emojiSearch}
                  onChangeText={setEmojiSearch}
                />
                {emojiSearch.length > 0 && (
                  <Pressable onPress={() => setEmojiSearch('')}>
                    <Text style={styles.clearSearch}>✕</Text>
                  </Pressable>
                )}
              </View>

              <ScrollView contentContainerStyle={styles.emojiPopupScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.emojiGrid}>
                  {filteredEmojis.map((item, idx) => {
                    const isSelected = icon === item;
                    return (
                      <Pressable
                        key={`${item}-${idx}`}
                        onPress={() => {
                          PremiumHaptics.selection();
                          setIcon(item);
                          setShowIconPicker(false);
                          setEmojiSearch('');
                        }}
                        style={[
                          styles.emojiCell,
                          isSelected && {
                            backgroundColor: addAlpha(color || Colors.accent, 0.45),
                            borderColor: color || Colors.accent,
                          }
                        ]}
                      >
                        <Text style={[styles.emojiText, isSelected && { transform: [{ scale: 1.1 }] }]}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    </Modal>
  );
}

function makeStyles(Colors, isDark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    headerTitle: { ...Fonts.sans, fontSize: 17, ...Fonts.bold, color: Colors.text },
    closeBtn: { padding: 8, marginLeft: -8 },
    closeTxt: { fontSize: 18, color: Colors.textMuted },
    createBtnBox: {
      backgroundColor: Colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    createTxt: { ...Fonts.sans, fontSize: 14, ...Fonts.bold, color: Colors.pureWhite },
    scroll: { padding: 20 },
    previewBox: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      backgroundColor: Colors.surface,
      padding: 20,
      borderRadius: 24,
      ...Shadow.soft,
    },
    iconPreviewWrap: {
      position: 'relative',
      marginRight: 20,
    },
    iconLarge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconEditBadge: {
      position: 'absolute',
      right: -6,
      bottom: -6,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: Colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadow.medium,
    },
    previewTextWrapper: { flex: 1 },
    previewInput: { ...Fonts.sans, fontSize: 22, ...Fonts.bold, color: Colors.text, padding: 0 },
    previewSub: { ...Fonts.sans, fontSize: 13, color: Colors.textMuted, marginTop: 4 },
    section: { marginBottom: 32 },
    sectionLabel: { ...Fonts.sans, fontSize: 12, ...Fonts.bold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    typeToggle: {
      flexDirection: 'row',
      backgroundColor: Colors.surface,
      borderRadius: 14,
      padding: 4,
      marginBottom: 16,
    },
    typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    typeBtnActive: { backgroundColor: isDark ? Colors.surfaceAlt : Colors.white, ...Shadow.sm },
    typeTxt: { ...Fonts.sans, fontSize: 14, color: Colors.textMuted },
    typeTxtActive: { color: Colors.text, ...Fonts.bold },
    budgetRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    amountInputBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    currencySymbol: { ...Fonts.sans, fontSize: 20, ...Fonts.bold, color: Colors.textMuted, marginRight: 8 },
    mainAmountInput: { ...Fonts.serif, fontSize: 24, color: Colors.text, flex: 1 },
    cycleBadge: {
      paddingHorizontal: 16,
      height: 44,
      backgroundColor: Colors.surface,
      borderRadius: 22,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    cycleBadgeTxt: { ...Fonts.sans, fontSize: 13, ...Fonts.bold, color: Colors.accent },
    emojiPickerContainer: {
      backgroundColor: Colors.surface,
      borderRadius: 24,
      padding: 12,
      ...Shadow.soft,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.bg,
      borderRadius: 14,
      paddingHorizontal: 12,
      height: 48,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    searchIcon: { fontSize: 16, marginRight: 8, opacity: 0.6 },
    searchInput: { flex: 1, ...Fonts.sans, fontSize: 15, color: Colors.text },
    clearSearch: { fontSize: 14, color: Colors.textMuted, padding: 4 },
    emojiGrid: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: 10, 
      justifyContent: 'flex-start',
      paddingHorizontal: 4,
    },
    emojiCell: {
      width: (SCREEN_WIDTH - 110) / 6,
      height: (SCREEN_WIDTH - 110) / 6,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.bg,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    emojiText: { fontSize: 22 },
    emojiPopupOverlay: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    emojiPopupBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.backdrop,
    },
    emojiPopupCard: {
      maxHeight: '72%',
      backgroundColor: Colors.white,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadow.lg,
    },
    emojiPopupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    emojiPopupTitle: {
      ...Fonts.sans,
      ...Fonts.bold,
      fontSize: 17,
      color: Colors.text,
    },
    emojiPopupClose: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surface,
    },
    emojiPopupScroll: {
      paddingBottom: 4,
    },
    colorPalette: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    colorBubble: { width: 36, height: 36, borderRadius: 18 },
    colorBubbleActive: { borderWidth: 3, borderColor: Colors.text, transform: [{ scale: 1.1 }] },
    plusColorBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    wheelToggleTxt: { ...Fonts.sans, fontSize: 12, color: Colors.accent, ...Fonts.bold },
    wheelContainer: {
      backgroundColor: Colors.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      minHeight: 300,
      ...Shadow.soft,
    },
    wheelFooter: {
      flexDirection: 'row',
      marginTop: 24,
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    hexBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
      flex: 1,
      marginRight: 16,
    },
    hexHash: { ...Fonts.sans, fontSize: 16, ...Fonts.bold, color: Colors.textMuted, marginRight: 4 },
    hexValue: { ...Fonts.sans, fontSize: 16, ...Fonts.bold, color: Colors.text, flex: 1, padding: 0 },
    colorPreview: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
    dangerZone: { marginTop: 8, paddingVertical: 16, alignItems: 'center' },
    dangerText: { ...Fonts.sans, fontSize: 14, color: Colors.error, ...Fonts.bold },
  });
}
