// src/screens/Splash/AnimatedSplashScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../theme';

const FULL_TEXT = 'trimly.';

export default function AnimatedSplashScreen({ onFinish }) {
  const { Colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [displayedText, setDisplayedText] = useState('');
  const [showTagline, setShowTagline] = useState(false);
  const dotOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < FULL_TEXT.length) {
        setDisplayedText(FULL_TEXT.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowTagline(true);
        });
      }
    }, 150);

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 5000);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: Colors.bg }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: Colors.text }]}>
          {displayedText.slice(0, -1)}
          <Text style={[styles.titleDot, { color: Colors.accentSecondary }]}>
            {displayedText.slice(-1) === '.' ? '.' : ''}
          </Text>
        </Text>
        {showTagline && (
          <Animated.View style={{ opacity: dotOpacity }}>
            <Text style={[styles.tagline, { color: Colors.textMuted }]}>
              Sophistication Analytique
            </Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    ...Fonts.primary,
    ...Fonts.black,
    fontSize: 42,
    letterSpacing: -0.5,
  },
  titleDot: {},
  tagline: {
    ...Fonts.primary,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
