// src/screens/Splash/TrimlySplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TrimlySplashScreen({ onFinish }) {
  const { Colors } = useTheme();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const letterSpacing = useRef(new Animated.Value(-5)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Séquence d'animations
    Animated.sequence([
      // 1. Apparition du texte avec scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(letterSpacing, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
      
      // 2. Petit delay
      Animated.delay(200),
      
      // 3. Apparition du point avec bounce
      Animated.parallel([
        Animated.spring(dotOpacity, {
          toValue: 1,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(dotScale, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      
      // 4. Effet glow pulsant
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Durée totale du splash (2.5 secondes)
    const timer = setTimeout(() => {
      // Fade out avant de finir
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onFinish) onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const styles = makeStyles(Colors);
  
  // Interpolation pour le glow
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <View style={styles.gradientBg}>
        {/* Orbes de fond animés */}
        <Animated.View 
          style={[
            styles.orb,
            styles.orb1,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.2],
              })}],
            },
          ]} 
        />
        <Animated.View 
          style={[
            styles.orb,
            styles.orb2,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.5],
              }),
              transform: [{ scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.15],
              })}],
            },
          ]} 
        />
      </View>

      {/* Logo Text */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Glow effect derrière le texte */}
        <Animated.View 
          style={[
            styles.textGlow,
            { opacity: glowOpacity }
          ]}
        />
        
        {/* Texte "trimly" */}
        <View style={styles.textContainer}>
          <Animated.Text 
            style={[
              styles.logoText,
              { 
                color: Colors.accent,
              }
            ]}
          >
            trimly
          </Animated.Text>
          
          {/* Point animé */}
          <Animated.View
            style={[
              styles.dotContainer,
              {
                opacity: dotOpacity,
                transform: [{ scale: dotScale }],
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: Colors.accentSecondary }]} />
            {/* Glow du point */}
            <Animated.View 
              style={[
                styles.dotGlow,
                { 
                  backgroundColor: Colors.accentSecondary,
                  opacity: glowOpacity 
                }
              ]} 
            />
          </Animated.View>
        </View>
        
        {/* Sous-titre élégant */}
        <Animated.Text 
          style={[
            styles.tagline,
            { 
              color: Colors.textSecondary,
              opacity: fadeAnim 
            }
          ]}
        >
          smart expense tracking
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

function makeStyles(Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Gradient background
    gradientBg: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden',
    },
    
    // Orbes de fond
    orb: {
      position: 'absolute',
      borderRadius: 9999,
    },
    orb1: {
      width: 400,
      height: 400,
      backgroundColor: Colors.accent,
      top: -100,
      left: -100,
      opacity: 0.1,
    },
    orb2: {
      width: 300,
      height: 300,
      backgroundColor: Colors.accentSecondary,
      bottom: -80,
      right: -80,
      opacity: 0.08,
    },
    
    // Logo container
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Glow effect derrière le texte
    textGlow: {
      position: 'absolute',
      width: 300,
      height: 100,
      backgroundColor: Colors.accent,
      borderRadius: 50,
      opacity: 0.15,
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 40,
    },
    
    // Container du texte + point
    textContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 12,
    },
    
    // Texte logo
    logoText: {
      fontSize: 58,
      fontWeight: '700',
      letterSpacing: -2,
      fontFamily: 'System', // iOS: SF Pro Display, Android: Roboto
    },
    
    // Container du point
    dotContainer: {
      position: 'relative',
      marginLeft: 2,
      marginBottom: 4,
    },
    
    // Point
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    
    // Glow du point
    dotGlow: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      top: -6,
      left: -6,
      opacity: 0.4,
      shadowColor: Colors.accentSecondary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 20,
    },
    
    // Tagline
    tagline: {
      fontSize: 13,
      fontWeight: '500',
      letterSpacing: 2,
      textTransform: 'uppercase',
      opacity: 0.6,
    },
  });
}
