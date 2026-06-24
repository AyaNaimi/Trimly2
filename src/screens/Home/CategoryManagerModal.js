import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AddCategoryModal from './AddCategoryModal';
import { Fonts, Shadow } from '../../theme';
import { PremiumHaptics } from '../../utils/haptics';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};

function formatBudget(amount, currency = '€') {
  return `${Number(amount || 0).toFixed(0)} ${currency}`;
}

function buildSalaryPlan(salary) {
  if (!salary || salary <= 0) return null;
  return {
    needs: Math.round(salary * 0.5),
    wants: Math.round(salary * 0.3),
    savings: Math.round(salary * 0.2),
  };
}

function ExpandableCategoryRow({
  category,
  isEditing,
  isExpanded,
  budgetDraft,
  onBeginEditBudget,
  onBudgetDraftChange,
  onCommitBudget,
  onDelete,
  onOpenCategory,
  onOpenEditor,
  onToggleExpanded,
  onUpdateField,
  currency = '€',
  t,
}) {
  const { Colors } = useTheme();
  const styles = makeStyles(Colors);
  return (
    <View style={[styles.categoryCard, isExpanded && styles.categoryCardExpanded]}>
      <View style={styles.row}>
        <View style={styles.leftPart}>
          <View style={styles.iconWrap}>
            <View style={[styles.iconCircle, { backgroundColor: category.color || Colors.accent }]}>
              <Text style={styles.iconText}>{category.icon}</Text>
            </View>
            <Pressable style={styles.editBadge} onPress={() => onOpenEditor(category)}>
              <Text style={styles.editBadgeText}>{t('common.edit').substring(0, 2)}</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.rowTitleWrap}
            onPress={() => {
              PremiumHaptics.selection();
              onOpenCategory(category.id);
            }}
          >
            <Text style={styles.rowTitle}>{category.name}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.amountBox} onPress={() => onBeginEditBudget(category)}>
          {isEditing ? (
            <TextInput
              value={budgetDraft}
              onChangeText={onBudgetDraftChange}
              keyboardType="decimal-pad"
              autoFocus
              onBlur={() => onCommitBudget(category)}
              onSubmitEditing={() => onCommitBudget(category)}
              style={styles.amountInput}
            />
          ) : (
            <Text style={styles.amountLabel}>{formatBudget(category.budget, currency)}</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.chevronWrap, isExpanded && styles.chevronWrapActive]}
          onPress={() => {
            PremiumHaptics.selection();
            onToggleExpanded(category.id);
          }}
        >
          <Text style={[styles.chevronText, isExpanded && styles.chevronTextActive]}>
            {isExpanded ? '−' : '+'}
          </Text>
        </Pressable>
      </View>

      {isExpanded ? (
        <View style={styles.inlinePanel}>
          <View style={styles.inlineFields}>
            <View style={styles.fieldBlock}>
              <Text style={styles.inlineLabel}>{t('categoryManager.categoryType')}</Text>
              <Pressable
                style={styles.inlineSelect}
                onPress={() => {
                  PremiumHaptics.selection();
                  onUpdateField(category, {
                    type: category.type === 'savings' ? 'expense' : 'savings',
                  });
                }}
              >
                <Text style={styles.inlineSelectText}>
                  {category.type === 'savings' ? t('reports.savings') : t('home.expense')}
                </Text>
                <Text style={styles.inlineSelectArrow}>⌄</Text>
              </Pressable>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.inlineLabel}>{t('subscriptions.frequency')}</Text>
              <Pressable
                style={styles.inlineSelect}
                onPress={() => {
                  PremiumHaptics.selection();
                  onUpdateField(category, {
                    cycle: category.cycle === 'weekly' ? 'monthly' : 'weekly',
                  });
                }}
              >
                <Text style={styles.inlineSelectText}>
                  {category.cycle === 'weekly' ? t('subscriptions.weekly') : t('subscriptions.monthly')}
                </Text>
                <Text style={styles.inlineSelectArrow}>⌄</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.deleteAction}
            onPress={() => {
              PremiumHaptics.selection();
              onDelete(category.id);
            }}
          >
            <View style={styles.trashIcon}>
              <View style={styles.trashLid} />
              <View style={styles.trashBody} />
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function CategoryManagerModal({
  visible,
  onClose,
  categories,
  onCreateCategory,
  onDeleteCategory,
  onUpdateCategory,
  onOpenCategory,
}) {
  const { Colors } = useTheme();
  const { state } = useApp();
  const { t, locale } = useLanguage();
  const currency = state.currency || '€';
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [budgetDraft, setBudgetDraft] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showSalarySheet, setShowSalarySheet] = useState(false);
  const [salary, setSalary] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  const salaryPlan = useMemo(() => buildSalaryPlan(parseFloat(salary)), [salary]);

  const sections = useMemo(() => {
    const weekly = categories.filter(cat => cat.type !== 'savings' && cat.cycle === 'weekly');
    const monthly = categories.filter(cat => cat.type !== 'savings' && cat.cycle !== 'weekly');
    const savings = categories.filter(cat => cat.type === 'savings');
    return [
      {
        key: 'weekly',
        title: t('categoryManager.weeklyTitle'),
        total: `${weekly.reduce((sum, cat) => sum + (cat.budget || 0), 0).toLocaleString(locale)} ${currency} / ${t('common.week').toLowerCase()}`,
        items: weekly,
      },
      {
        key: 'monthly',
        title: t('categoryManager.monthlyTitle'),
        total: `${monthly.reduce((sum, cat) => sum + (cat.budget || 0), 0).toLocaleString(locale)} ${currency} / ${t('common.month').toLowerCase()}`,
        items: monthly,
      },
      {
        key: 'savings',
        title: t('categoryManager.savingsTitle'),
        total: `${savings.reduce((sum, cat) => sum + (cat.budget || 0), 0).toLocaleString(locale)} ${currency} / ${t('common.month').toLowerCase()}`,
        items: savings,
      },
    ];
  }, [categories]);

  function beginEditBudget(category) {
    setEditingBudgetId(category.id);
    setBudgetDraft(String(category.budget || 0));
  }

  function commitBudget(category) {
    const nextBudget = parseFloat(budgetDraft);
    onUpdateCategory({
      ...category,
      budget: Number.isFinite(nextBudget) ? nextBudget : 0,
    });
    setEditingBudgetId(null);
    setBudgetDraft('');
  }

  function openCategoryEditor(category) {
    setActiveCategory(category);
    setShowEditModal(true);
  }

  function updateCategoryField(category, patch) {
    onUpdateCategory({
      ...category,
      ...patch,
    });
  }

  const styles = makeStyles(Colors);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          <View style={styles.header}>
            <Text style={styles.title}>{t('categoryManager.title')}</Text>
            <Pressable
              style={styles.doneButton}
              onPress={() => {
                PremiumHaptics.success();
                onClose();
              }}
            >
              <Text style={styles.doneIcon}>✓</Text>
              <Text style={styles.doneText}>{t('common.done')}</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                {t('categoryManager.banner')}
              </Text>
              <Pressable
                onPress={() => {
                  PremiumHaptics.selection();
                  setShowSalarySheet(true);
                }}
              >
                <Text style={styles.bannerLink}>{t('categoryManager.suggestLink')}</Text>
              </Pressable>
            </View>

            {sections.map(section => (
              <View key={section.key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.sectionSummary}>
                    <Text style={styles.sectionSummaryLabel}>{t('common.total')}</Text>
                    <Text style={styles.sectionSummaryValue}>{section.total}</Text>
                  </View>
                </View>

                {section.items.map(category => (
                  <ExpandableCategoryRow
                    key={category.id}
                    category={category}
                    isEditing={editingBudgetId === category.id}
                    isExpanded={expandedCategoryId === category.id}
                    budgetDraft={budgetDraft}
                    onBeginEditBudget={beginEditBudget}
                    onBudgetDraftChange={setBudgetDraft}
                    onCommitBudget={commitBudget}
                    onDelete={(categoryId) => {
                      setExpandedCategoryId(null);
                      onDeleteCategory?.(categoryId);
                    }}
                    onOpenCategory={onOpenCategory}
                    onOpenEditor={openCategoryEditor}
                    onToggleExpanded={(categoryId) => {
                      setExpandedCategoryId(current => (current === categoryId ? null : categoryId));
                    }}
                    onUpdateField={updateCategoryField}
                    currency={currency}
                    t={t}
                  />
                ))}

                <Pressable
                  onPress={() => {
                    PremiumHaptics.selection();
                    setShowCreateModal(true);
                  }}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>{t('categoryManager.addNew')}</Text>
                </Pressable>
              </View>
            ))}
            <View style={styles.bottomSpace} />
          </ScrollView>

          <Modal visible={showSalarySheet} transparent animationType="slide" onRequestClose={() => setShowSalarySheet(false)}>
            <View style={styles.sheetBackdrop}>
              <Pressable style={styles.sheetBackdropTouch} onPress={() => setShowSalarySheet(false)} />
              <View style={styles.sheet}>
                <KeyboardAvoidingView behavior="padding">
                  <View style={styles.sheetHandle} />
                  <Text style={styles.sheetEmoji}>{t('reports.budget')}</Text>
                  <Text style={styles.sheetTitle}>{t('categoryManager.salarySheet.title')}</Text>
                  <Text style={styles.sheetBody}>
                    {t('categoryManager.salarySheet.description')}
                  </Text>
                  <Text style={styles.sheetBody}>
                    {t('categoryManager.salarySheet.rule')}
                  </Text>
                  <Text style={styles.sheetLabel}>{t('categoryManager.salarySheet.incomeLabel')}</Text>
                  <TextInput
                    value={salary}
                    onChangeText={setSalary}
                    keyboardType="decimal-pad"
                    placeholder={`${currency} 0`}
                    placeholderTextColor={Colors.textMuted}
                    style={styles.sheetInput}
                  />
                  {salaryPlan ? (
                    <View style={styles.sheetResults}>
                      <Text style={styles.sheetResult}>{t('categoryManager.salarySheet.results.needs', { amount: formatBudget(salaryPlan.needs, currency) })}</Text>
                      <Text style={styles.sheetResult}>{t('categoryManager.salarySheet.results.wants', { amount: formatBudget(salaryPlan.wants, currency) })}</Text>
                      <Text style={styles.sheetResult}>{t('categoryManager.salarySheet.results.savings', { amount: formatBudget(salaryPlan.savings, currency) })}</Text>
                    </View>
                  ) : null}
                  <Pressable
                    onPress={() => {
                      PremiumHaptics.success();
                      setShowSalarySheet(false);
                    }}
                    style={styles.sheetCta}
                  >
                    <Text style={styles.sheetCtaText}>{t('categoryManager.salarySheet.cta')}</Text>
                  </Pressable>
                </KeyboardAvoidingView>
              </View>
            </View>
          </Modal>

          <AddCategoryModal
            visible={showCreateModal}
            mode="create"
            onClose={() => setShowCreateModal(false)}
            onSave={async (category) => {
              const ok = await onCreateCategory(category);
              if (ok !== false) setShowCreateModal(false);
            }}
          />

          <AddCategoryModal
            visible={showEditModal}
            mode="edit"
            initialValues={activeCategory}
            onClose={() => setShowEditModal(false)}
            onSave={async (category) => {
              const ok = await onUpdateCategory(category);
              if (ok !== false) setShowEditModal(false);
            }}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function makeStyles(Colors) { return StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...Fonts.sans, fontSize: 20, ...Fonts.bold, color: Colors.text },
  doneButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: addAlpha(Colors.income, 0.12),
    borderWidth: 1,
    borderColor: addAlpha(Colors.income, 0.2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doneIcon: { ...Fonts.sans, fontSize: 14, ...Fonts.bold, color: Colors.income },
  doneText: { ...Fonts.sans, fontSize: 15, ...Fonts.bold, color: Colors.income },
  scroll: { paddingHorizontal: 12, paddingBottom: 20 },
  banner: {
    paddingVertical: 14,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bannerText: { ...Fonts.sans, fontSize: 14, lineHeight: 20, color: Colors.text, marginBottom: 8 },
  bannerLink: { ...Fonts.sans, fontSize: 15, ...Fonts.bold, color: Colors.accent },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { ...Fonts.sans, fontSize: 16, ...Fonts.bold, color: Colors.text },
  sectionSummary: { alignItems: 'flex-end' },
  sectionSummaryLabel: { ...Fonts.sans, fontSize: 11, color: Colors.textSecondary },
  sectionSummaryValue: { ...Fonts.sans, fontSize: 13, ...Fonts.bold, color: Colors.text },
  categoryCard: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    marginBottom: 4,
    paddingVertical: 8,
  },
  categoryCardExpanded: {
    backgroundColor: addAlpha(Colors.accent, 0.03),
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    borderRadius: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leftPart: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  rowTitleWrap: { flex: 1 },
  iconWrap: { width: 42, height: 42, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16 },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  editBadgeText: { ...Fonts.sans, fontSize: 7, ...Fonts.bold, color: Colors.text },
  rowTitle: { 
    ...Fonts.sans, 
    fontSize: 16, 
    ...Fonts.medium, 
    color: Colors.text, 
    flex: 1,
    lineHeight: 42, // Aligné sur la hauteur du iconWrap
  },
  amountBox: {
    minWidth: 92,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  amountLabel: { ...Fonts.sans, fontSize: 16, color: Colors.text },
  amountInput: { ...Fonts.sans, fontSize: 16, color: Colors.text, padding: 0, margin: 0 },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronWrapActive: {
    backgroundColor: addAlpha(Colors.accent, 0.1),
  },
  chevronText: {
    ...Fonts.sans,
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: '300',
  },
  chevronTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  inlinePanel: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inlineFields: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  fieldBlock: { flex: 1 },
  inlineLabel: {
    ...Fonts.sans,
    fontSize: 13,
    ...Fonts.medium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inlineSelect: {
    minHeight: 42,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inlineSelectText: {
    ...Fonts.sans,
    fontSize: 14,
    ...Fonts.semiBold,
    color: Colors.text,
  },
  inlineSelectArrow: {
    ...Fonts.sans,
    fontSize: 12,
    ...Fonts.bold,
    color: Colors.textSecondary,
  },
  deleteAction: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: addAlpha(Colors.expense, 0.08),
  },
  trashIcon: {
    width: 16,
    height: 18,
    alignItems: 'center',
  },
  trashLid: {
    width: 12,
    height: 2,
    backgroundColor: Colors.expense,
    borderRadius: 1,
    marginBottom: 1,
  },
  trashBody: {
    width: 10,
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.expense,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  addButton: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  addButtonText: { ...Fonts.sans, fontSize: 15, color: Colors.textMuted },
  bottomSpace: { height: 32 },
  sheetBackdrop: { flex: 1, backgroundColor: Colors.backdrop, justifyContent: 'flex-end' },
  sheetBackdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    minHeight: '78%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.borderStrong,
    marginBottom: 14,
  },
  sheetEmoji: {
    ...Fonts.sans,
    fontSize: 28,
    ...Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  sheetTitle: { ...Fonts.sans, fontSize: 22, ...Fonts.bold, color: Colors.text, textAlign: 'center', marginBottom: 14 },
  sheetBody: { ...Fonts.sans, fontSize: 16, lineHeight: 23, color: Colors.text, marginBottom: 14 },
  sheetLabel: { ...Fonts.sans, fontSize: 16, ...Fonts.bold, color: Colors.text, marginBottom: 10 },
  sheetInput: {
    width: 122,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Fonts.sans,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  sheetResults: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  sheetResult: { ...Fonts.sans, fontSize: 15, ...Fonts.medium, color: Colors.text, marginBottom: 8 },
  sheetCta: {
    marginTop: 'auto',
    backgroundColor: Colors.warning,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetCtaText: { ...Fonts.sans, fontSize: 17, ...Fonts.bold, color: Colors.pureWhite },
}); }
