// src/screens/Auth/LockScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { 
  Fingerprint, 
  Delete, 
  ShieldCheck, 
  Lock
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { Fonts, Radius, Shadow } from '../../theme';
import { PremiumHaptics } from '../../utils/haptics';

const { width } = Dimensions.get('window');
const PIN_LENGTH = 4;

const LockScreen = () => {
  const { Colors } = useTheme();
  const { state, unlockApp } = useApp();
  const [pin, setPin] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const savedPin = state.features?.pin || '';
  const faceIdEnabled = !!state.features?.faceId;

  // Standard Animated Values (More stable)
  const shakeOffset = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    if (faceIdEnabled) {
      const timer = setTimeout(() => {
        handleBiometricAuth();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [faceIdEnabled]);

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        setIsAuthenticating(true);
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Accès sécurisé à Trimly',
          fallbackLabel: 'Utiliser le code PIN',
          disableDeviceFallback: false,
        });

        if (result.success) {
          PremiumHaptics.success();
          unlockApp();
        }
      }
    } catch (error) {
      console.error('Biometric Error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleKeyPress = useCallback((val) => {
    if (pin.length >= PIN_LENGTH) return;
    
    PremiumHaptics.selection();
    const newPin = pin + val;
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      setTimeout(() => validatePin(newPin), 200);
    }
  }, [pin]);

  const handleDelete = useCallback(() => {
    PremiumHaptics.impact();
    setPin(prev => prev.slice(0, -1));
  }, []);

  const validatePin = (finalPin) => {
    if (finalPin !== savedPin) {
      triggerError();
    } else {
      PremiumHaptics.success();
      unlockApp();
    }
  };

  const triggerError = () => {
    PremiumHaptics.error();
    
    // Shake animation with standard Animated
    Animated.sequence([
      Animated.timing(shakeOffset, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeOffset, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeOffset, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeOffset, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeOffset, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    setTimeout(() => setPin(''), 300);
  };

  const KeyButton = ({ value, icon: Icon, onPress, isSpecial = false }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.keyButton,
        { backgroundColor: Colors.surface, borderColor: Colors.border },
        isSpecial && styles.keyButtonSpecial
      ]}
    >
      {Icon ? (
        <Icon size={28} color={Colors.text} strokeWidth={1.5} />
      ) : (
        <Text style={[styles.keyText, { color: Colors.text }]}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: opacityValue }]}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={[styles.appName, { color: Colors.text }]}>TRIMLY</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: Colors.accent + '20', borderColor: Colors.accent + '40' }]}>
            <ShieldCheck size={12} color={Colors.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: Colors.accent }]}>SÉCURISÉ</Text>
          </View>
        </Animated.View>

        {/* PIN Indicators */}
        <Animated.View style={[styles.pinContainer, { transform: [{ translateX: shakeOffset }] }]}>
          {[...Array(PIN_LENGTH)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.pinDot,
                { borderColor: Colors.borderStrong },
                pin.length > i && [styles.pinDotFilled, { borderColor: Colors.accent, backgroundColor: Colors.accent }]
              ]} 
            />
          ))}
        </Animated.View>

        {/* Keypad */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            <KeyButton value="1" onPress={() => handleKeyPress('1')} />
            <KeyButton value="2" onPress={() => handleKeyPress('2')} />
            <KeyButton value="3" onPress={() => handleKeyPress('3')} />
          </View>
          <View style={styles.keypadRow}>
            <KeyButton value="4" onPress={() => handleKeyPress('4')} />
            <KeyButton value="5" onPress={() => handleKeyPress('5')} />
            <KeyButton value="6" onPress={() => handleKeyPress('6')} />
          </View>
          <View style={styles.keypadRow}>
            <KeyButton value="7" onPress={() => handleKeyPress('7')} />
            <KeyButton value="8" onPress={() => handleKeyPress('8')} />
            <KeyButton value="9" onPress={() => handleKeyPress('9')} />
          </View>
          <View style={styles.keypadRow}>
            <KeyButton 
              icon={faceIdEnabled ? Fingerprint : null} 
              onPress={faceIdEnabled ? handleBiometricAuth : null} 
              isSpecial 
            />
            <KeyButton value="0" onPress={() => handleKeyPress('0')} />
            <KeyButton 
              icon={Delete} 
              onPress={handleDelete} 
              isSpecial 
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.forgotBtn}
            onPress={() => PremiumHaptics.impact()}
          >
            <Text style={[styles.forgotText, { color: Colors.textSecondary }]}>Protection Biométrique Active</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 16,
    ...Shadow.medium,
  },
  logo: {
    width: 70,
    height: 70,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 8,
    ...Fonts.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    marginHorizontal: 12,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  keypadContainer: {
    width: width * 0.8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  keyButton: {
    width: (width * 0.8 - 40) / 3,
    aspectRatio: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyButtonSpecial: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '300',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  forgotBtn: {
    padding: 10,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '500',
  }
});

export default LockScreen;
