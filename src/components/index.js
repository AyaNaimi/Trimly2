// src/components/index.js
// Trimly-Minimal: Clean Professional components

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Pressable,
} from 'react-native';
import {
  LightColors, Fonts, Radius, Shadow, Spacing, Metrics,
} from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { PremiumHaptics } from '../utils/haptics';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const addAlpha = (hex, opacity) => {
  if (!hex) return 'transparent';
  // Handle 3-digit hex
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const op = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${normalized}${op}`;
};
import { usePressScale } from '../hooks/usePressScale';


export function AnimatedProgressBar({ pct, color, style }) {
  const { Colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(pct, 100),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[{ height: 6, backgroundColor: Colors.border, borderRadius: Radius.pill, overflow: 'hidden' }, style]}>
      <Animated.View style={[{ height: '100%', borderRadius: Radius.pill }, { width, backgroundColor: color || Colors.accent }]} />
    </View>
  );
}

export function CategoryRow({ category, onPress, simple }) {
  const { state } = useApp();
  const { Colors, isDark } = useTheme();
  const { locale, t } = useLanguage();
  const { name, icon, color, budget, spent } = category;
  const left = budget - spent;
  const isOver = left < 0;
  const { scale, onPressIn, onPressOut } = usePressScale();

  const handlePress = () => {
    PremiumHaptics.click();
    onPress && onPress();
  };

  const formattedBudget = `${budget.toFixed(0)} ${state.currency || '€'}`;
  const formattedLeft = `${left.toFixed(0)} ${state.currency || '€'}`;

  return (
    <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[{
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 8, 
        paddingHorizontal: 14,
        minHeight: 52,
      }, { transform: [{ scale }] }]}>
        
        {/* Left Side: Icon & Category Name */}
        <View style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 16, 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: color || Colors.accent,
            shadowColor: color || '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <Text style={{ fontSize: 15, color: '#FFFFFF' }}>{icon}</Text>
          </View>
          
          <Text 
            style={{ 
              ...Fonts.primary, 
              ...Fonts.semiBold, 
              fontSize: 14, 
              color: Colors.text, 
              marginLeft: 10,
              flexShrink: 1
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
        </View>
        
        {/* Middle: Budgeted */}
        <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 8 }}>
          <Text style={{ ...Fonts.primary, ...Fonts.medium, fontSize: 13, color: Colors.text }}>
            {formattedBudget}
          </Text>
        </View>
        
        {/* Far Right: Left amount */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text 
            style={[
              { 
                ...Fonts.primary, 
                ...Fonts.medium, 
                fontSize: 13, 
                color: Colors.text 
              }, 
              isOver && { color: Colors.error }
            ]}
            numberOfLines={1}
          >
            {formattedLeft}
          </Text>
        </View>
        
      </Animated.View>
    </Pressable>
  );
}

export function CategorySection({ label, daysLeft, budgeted, left, children }) {
  const { state } = useApp();
  const { Colors, isDark } = useTheme();
  const { locale, t } = useLanguage();
  
  // Format budget and left values
  const formattedBudget = `${budgeted.toFixed(0)} ${state.currency || '€'}`;
  const formattedLeft = `${left.toFixed(0)} ${state.currency || '€'}`;
  
  // Localized title & days remaining copy matching screenshot precisely
  const formattedLabel = label === t('common.week') 
    ? (locale === 'fr' ? 'Hebdomadaire' : 'Weekly') 
    : label === t('common.month') 
      ? (locale === 'fr' ? 'Mensuel' : 'Monthly') 
      : label;

  const getDaysRemainingText = (count) => {
    if (locale === 'fr') {
      return count === 1 ? '1 jour restant' : `${count} jours restants`;
    } else {
      return count === 1 ? '1 day left' : `${count} days left`;
    }
  };

  const budgetedLabel = locale === 'fr' ? 'Budgetisé' : 'Budgeted';
  const leftLabel = locale === 'fr' ? 'Restant' : 'Left';

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      {/* Premium Header Card */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: Colors.surface, 
        borderWidth: 1, 
        borderColor: Colors.border, 
        borderRadius: 12, 
        paddingVertical: 10, 
        paddingHorizontal: 14, 
        marginBottom: 6,
        ...Shadow.soft
      }}>
        {/* Left Column: Title & Remaining duration */}
        <View style={{ flex: 1.2 }}>
          <Text style={{ ...Fonts.primary, ...Fonts.medium, fontSize: 11, color: Colors.textMuted, marginBottom: 1 }}>
            {formattedLabel}
          </Text>
          <Text style={{ ...Fonts.primary, ...Fonts.bold, fontSize: 13, color: Colors.text }}>
            {getDaysRemainingText(daysLeft)}
          </Text>
        </View>
        
        {/* Middle Column: Budgeted header label & amount */}
        <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 8 }}>
          <Text style={{ ...Fonts.primary, ...Fonts.medium, fontSize: 11, color: Colors.textMuted, marginBottom: 1 }}>
            {budgetedLabel}
          </Text>
          <Text style={{ ...Fonts.primary, ...Fonts.bold, fontSize: 13, color: Colors.text }}>
            {formattedBudget}
          </Text>
        </View>
        
        {/* Right Column: Left header label & remaining amount */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ ...Fonts.primary, ...Fonts.medium, fontSize: 11, color: Colors.textMuted, marginBottom: 1 }}>
            {leftLabel}
          </Text>
          <Text style={[{ ...Fonts.primary, ...Fonts.bold, fontSize: 13, color: Colors.text }, left < 0 && { color: Colors.error }]}>
            {formattedLeft}
          </Text>
        </View>
      </View>
      
      {/* Category Rows listed cleanly beneath */}
      <View style={{ paddingTop: 1 }}>
        {children}
      </View>
    </View>
  );
}

export function PrimaryButton({ onPress, label, style }) {
  const { Colors } = useTheme();
  const { scale, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[{
        backgroundColor: Colors.accent, borderRadius: Radius.md,
        paddingVertical: 16, paddingHorizontal: 24,
        alignItems: 'center', justifyContent: 'center', minHeight: 52,
      }, style, { transform: [{ scale }] }]}>
        <Text style={{ color: Colors.pureWhite, ...Fonts.primary, ...Fonts.bold, fontSize: 15 }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function Toggle({ value, onChange }) {
  const { Colors } = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: value ? 1 : 0, useNativeDriver: false }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 18] });
  const bgColor = anim.interpolate({ inputRange: [0, 1], outputRange: [Colors.borderStrong, Colors.accent] });

  return (
    <Pressable onPress={() => onChange(!value)}>
      <Animated.View style={[{ width: 44, height: 24, borderRadius: 12, justifyContent: 'center' }, { backgroundColor: bgColor }]}>
        <Animated.View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.bg, ...Shadow.soft }, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

export function SubCard({ sub, billing, onPress, onLongPress, onDelete }) {
  const { state } = useApp();
  const { Colors, isDark } = useTheme();
  const [showInlineActions, setShowInlineActions] = useState(false);
  const isUrgent = billing.urgency === 'urgent' || billing.urgency === 'today';
  const { scale, onPressIn, onPressOut } = usePressScale();
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showInlineActions ? 0 : 100,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [showInlineActions]);

  const formattedAmount = `${sub.amount.toFixed(2)} ${state.currency || '€'}`;

  return (
    <Pressable 
      onPress={() => {
        if (showInlineActions) {
          setShowInlineActions(false);
        } else {
          onPress?.();
        }
      }} 
      onLongPress={() => {
        PremiumHaptics.selection();
        setShowInlineActions(true);
      }}
      onPressIn={onPressIn} 
      onPressOut={onPressOut}
      style={{ width: '100%' }}
    >
      <View style={{
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: 'transparent',
        minHeight: 52,
        width: '100%',
        overflow: 'hidden',
      }}>
        <Animated.View style={{ 
          width: '100%',
          flexDirection: 'row', 
          alignItems: 'center',
          transform: [
            { scale },
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 100],
                outputRange: [-90, 0]
              })
            }
          ] 
        }}>
          {/* Left Column: Icon & Subscription Name */}
          <View style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 16, 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: sub.color || Colors.accent,
              shadowColor: sub.color || '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <Text style={{ fontSize: 15, color: '#FFFFFF' }}>{sub.icon}</Text>
            </View>
            
            <Text 
              style={{ 
                ...Fonts.primary, 
                ...Fonts.semiBold, 
                fontSize: 14, 
                color: Colors.text, 
                marginLeft: 10,
                flexShrink: 1
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {sub.name}
            </Text>
          </View>
          
          {/* Middle Column: Frequency / Category */}
          <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 8 }}>
            <Text style={{ ...Fonts.primary, ...Fonts.medium, fontSize: 13, color: Colors.textSecondary }}>
              {billing.label}
            </Text>
          </View>
          
          {/* Right Column: Amount Badge Pill */}
          <Animated.View style={{ 
            flex: 1, 
            alignItems: 'flex-end',
            opacity: slideAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 1]
            })
          }}>
            <View style={{
              backgroundColor: sub.active 
                ? addAlpha(sub.color || Colors.accent, isDark ? 0.22 : 0.09)
                : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7'),
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 4,
              minWidth: 62,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: sub.active ? 1 : 0,
              borderColor: sub.active ? addAlpha(sub.color || Colors.accent, 0.2) : 'transparent',
            }}>
              <Text 
                style={[
                  { 
                    ...Fonts.primary, 
                    ...Fonts.semiBold, 
                    fontSize: 12, 
                    color: sub.active 
                      ? (sub.color || Colors.accent)
                      : (isDark ? Colors.textSecondary : '#555558') 
                  }, 
                  isUrgent && sub.active && { color: Colors.error }
                ]}
                numberOfLines={1}
              >
                {formattedAmount}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View 
          pointerEvents={showInlineActions ? "auto" : "none"}
          style={{ 
            flexDirection: 'row', 
            gap: 8, 
            paddingLeft: 8,
            position: 'absolute',
            right: 14,
            zIndex: showInlineActions ? 10 : -1,
            opacity: slideAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0]
            }),
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 180]
              })
            }]
          }}
        >
          <Pressable 
            onPress={() => {
              PremiumHaptics.impact('light');
              onLongPress?.();
              setShowInlineActions(false);
            }}
            style={{ 
              width: 36, height: 36, borderRadius: 18, 
              backgroundColor: addAlpha(sub.active ? Colors.warning : Colors.income, 0.12), 
              alignItems: 'center', justifyContent: 'center', 
              borderWidth: 1.5, borderColor: addAlpha(sub.active ? Colors.warning : Colors.income, 0.3) 
            }}
          >
            <Ionicons name={sub.active ? "archive-outline" : "refresh-outline"} size={18} color={sub.active ? Colors.warning : Colors.income} />
          </Pressable>
          <Pressable 
            onPress={() => {
              PremiumHaptics.impact('medium');
              if (onDelete) onDelete();
              setShowInlineActions(false);
            }}
            style={{ 
              width: 36, height: 36, borderRadius: 18, 
              backgroundColor: addAlpha(Colors.error, 0.12), 
              alignItems: 'center', justifyContent: 'center', 
              borderWidth: 1.5, borderColor: addAlpha(Colors.error, 0.3) 
            }}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </Pressable>
        </Animated.View>
      </View>
    </Pressable>
  );
}

export function SettingsRow({ title, value, onPress, children, danger, colors: colorsProp }) {
  const { Colors: themeColors } = useTheme();
  const Colors = colorsProp || themeColors;
  const { scale, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 4, paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
        backgroundColor: Colors.bg,
      }, { transform: [{ scale }] }]}>
        <Text style={[{ ...Fonts.primary, ...Fonts.medium, fontSize: 15, color: Colors.text }, danger && { color: Colors.error }]}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {value ? <Text style={{ ...Fonts.primary, fontSize: 13, color: Colors.textSecondary }}>{value}</Text> : null}
          {children}
          {onPress && !children ? <Text style={{ fontSize: 18, color: Colors.textMuted, marginLeft: 4 }}>›</Text> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function SecondaryButton({ onPress, label = '←', style }) {
  const { Colors } = useTheme();
  const { scale, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[{
        width: 48, height: 48, borderRadius: 24,
        borderWidth: 1.5, borderColor: Colors.borderStrong,
        backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
      }, style, { transform: [{ scale }] }]}>
        <Text style={{ fontSize: 18, color: Colors.text, ...Fonts.bold }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function PeriodPill({ label, onPress }) {
  const { Colors } = useTheme();
  const { scale, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable
      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accentMuted, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill, minHeight: Metrics.minTouch }}
      onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
    >
      <Animated.View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ scale }] }}>
        <Text style={{ ...Fonts.primary, ...Fonts.bold, fontSize: 13, color: Colors.accent }}>{label}</Text>
        <Text style={{ color: Colors.accent, marginLeft: 6, fontSize: 12 }}>▼</Text>
      </Animated.View>
    </Pressable>
  );
}

export function TrialBanner({ daysLeft, onSubscribe, onClose }) {
  const { Colors } = useTheme();
  const { t } = useLanguage();
  const { scale, onPressIn, onPressOut } = usePressScale();
  const urgencyCopy = daysLeft <= 3
    ? t('home.trial.endingSoonWarning')
    : t('home.trial.enjoyTrial');
  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderStrong, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.medium }}>
      <View style={{ alignSelf: 'flex-start', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 }}>
        <Text style={{ ...Fonts.primary, fontSize: 10, ...Fonts.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('home.trial.freeTrial')}</Text>
      </View>
      <Text style={{ ...Fonts.primary, ...Fonts.black, fontSize: 18, color: Colors.text, lineHeight: 23, marginBottom: 8 }}>{t('home.trial.daysLeftFull', { days: daysLeft })}</Text>
      <Text style={{ ...Fonts.primary, fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 14 }}>{urgencyCopy}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={() => { PremiumHaptics.success(); onSubscribe && onSubscribe(); }} onPressIn={onPressIn} onPressOut={onPressOut}>
          <Animated.View style={[{ backgroundColor: Colors.accent, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 9, minHeight: 36, justifyContent: 'center', alignItems: 'center' }, { transform: [{ scale }] }]}>
            <Text style={{ ...Fonts.primary, ...Fonts.bold, fontSize: 10, color: Colors.pureWhite, textTransform: 'uppercase', letterSpacing: 0.4 }}>{t('home.trial.discoverPro')}</Text>
          </Animated.View>
        </Pressable>
        <Pressable style={{ borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 9, minHeight: 36, justifyContent: 'center', backgroundColor: Colors.surface }} onPress={() => { PremiumHaptics.click(); onClose && onClose(); }}>
          <Text style={{ ...Fonts.primary, ...Fonts.bold, fontSize: 10, color: Colors.textSecondary }}>{t('common.later')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Static styles (non-color-dependent only)
const styles = StyleSheet.create({
  // kept for any future static layout needs
});

// Export WalletCard
export { default as WalletCard } from './WalletCard';

// Export Responsive components
export {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveMaxWidth,
  ResponsiveSpacer,
} from './ResponsiveContainer';
