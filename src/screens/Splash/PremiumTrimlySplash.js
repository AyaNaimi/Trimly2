// src/screens/Splash/PremiumTrimlySplash.js
// Inspiré par les animations Pinterest modernes - Élégant, fluide, cinématique
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function PremiumTrimlySplash({ onFinish }) {
  const { Colors, isDark } = useTheme();
  
  console.log('PremiumTrimlySplash: Component rendering, isDark:', isDark);
  
  // Animations principales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;
  
  // Animation des lettres individuelles
  const letterAnims = useRef(
    'trimly.'.split('').map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.5),
    }))
  ).current;
  
  // Glow et halo effects
  const glowAnim = useRef(new Animated.Value(0)).current;
  const haloAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-width)).current;
  
  useEffect(() => {
    console.log('PremiumTrimlySplash: Animation starting...');
    
    // Séquence d'animation cinématique
    const mainSequence = Animated.sequence([
      // 1. Background fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // 2. Particles explosion
      Animated.stagger(50, 
        particleAnims.map((anim, index) => 
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(anim.scale, {
              toValue: 1,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.timing(anim.y, {
              toValue: Math.sin(index * Math.PI / 6) * 120,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(anim.x, {
              toValue: Math.cos(index * Math.PI / 6) * 120,
              duration: 1200,
              useNativeDriver: true,
            }),
          ])
        )
      ),
      
      // 3. Lettres apparaissent une par une (stagger)
      Animated.stagger(50,
        letterAnims.map(anim =>
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(anim.translateY, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(anim.scale, {
              toValue: 1,
              tension: 120,
              friction: 10,
              useNativeDriver: true,
            }),
          ])
        )
      ),
      
      // 4. Glow et halo
      Animated.parallel([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(haloAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      
      // 5. Shine effect
      Animated.timing(shineAnim, {
        toValue: width * 2,
        duration: 1200,
        useNativeDriver: true,
      }),
      
      // 6. Petit delay
      Animated.delay(400),
      
      // 7. Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        // Particles disparaissent
        ...particleAnims.map(anim =>
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          })
        ),
      ]),
    ]);

    // Animation continue du glow (pulse)
    const glowPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.3,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Démarrer les animations
    mainSequence.start(() => {
      console.log('PremiumTrimlySplash: Animation completed, calling onFinish');
      if (onFinish) onFinish();
    });
    glowPulse.start();
    
    console.log('PremiumTrimlySplash: Animations started');
    
  }, [fadeAnim, scaleAnim, particleAnims, letterAnims, glowAnim, haloAnim, shineAnim, onFinish]);

  const styles = makeStyles(Colors, isDark);

  return (
    <View style={styles.container}>
      {/* Gradient background animé */}
      <LinearGradient
        colors={isDark 
          ? ['#000814', '#0A1128', '#1B263B']
          : ['#FFFFFF', '#F8FAFC', '#F1F5F9']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Orbes de fond */}
      <Animated.View 
        style={[
          styles.orb,
          styles.orb1,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, isDark ? 0.15 : 0.08],
            }),
          },
        ]}
      />
      <Animated.View 
        style={[
          styles.orb,
          styles.orb2,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, isDark ? 0.12 : 0.06],
            }),
          },
        ]}
      />
      
      {/* Particules circulaires */}
      {particleAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              opacity: anim.opacity,
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
                { scale: anim.scale },
              ],
            },
          ]}
        >
          <View style={[
            styles.particleDot,
            { 
              backgroundColor: index % 2 === 0 
                ? (isDark ? Colors.accent : Colors.accentSecondary)
                : (isDark ? Colors.accentSecondary : Colors.accent),
            },
          ]} />
        </Animated.View>
      ))}
      
      {/* Container principal du logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Halo effect derrière */}
        <Animated.View 
          style={[
            styles.halo,
            {
              opacity: haloAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, isDark ? 0.4 : 0.2],
              }),
              transform: [{
                scale: haloAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.3],
                }),
              }],
            },
          ]}
        >
          <LinearGradient
            colors={isDark 
              ? ['#5B3BF5', '#FF9100', '#F15BB5']
              : ['#1E293B', '#FF9100', '#5B3BF5']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.haloGradient}
          />
        </Animated.View>
        
        {/* Glow pulsant */}
        <Animated.View 
          style={[
            styles.glow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [0.3, 0.6],
              }),
              transform: [{
                scale: glowAnim,
              }],
            },
          ]}
        />
        
        {/* Texte "trimly." avec lettres animées individuellement */}
        <View style={styles.textContainer}>
          {'trimly.'.split('').map((letter, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.letter,
                {
                  color: isDark ? Colors.text : Colors.accent,
                  opacity: letterAnims[index].opacity,
                  transform: [
                    { translateY: letterAnims[index].translateY },
                    { scale: letterAnims[index].scale },
                  ],
                },
                // Point final en couleur accent
                index === 6 && { 
                  color: Colors.accentSecondary,
                  fontSize: 68,
                  fontWeight: '900',
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>
        
        {/* Shine effect */}
        <Animated.View
          style={[
            styles.shine,
            {
              transform: [{ translateX: shineAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shineGradient}
          />
        </Animated.View>
        
        {/* Tagline */}
        <Animated.Text 
          style={[
            styles.tagline,
            { 
              color: Colors.textSecondary,
              opacity: fadeAnim,
            },
          ]}
        >
          smart expense tracking
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

function makeStyles(Colors, isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    
    // Orbes de fond
    orb: {
      position: 'absolute',
      borderRadius: 9999,
    },
    orb1: {
      width: 600,
      height: 600,
      backgroundColor: isDark ? Colors.accent : Colors.accentSecondary,
      top: -200,
      left: -150,
    },
    orb2: {
      width: 500,
      height: 500,
      backgroundColor: isDark ? Colors.accentSecondary : Colors.accent,
      bottom: -150,
      right: -150,
    },
    
    // Particules
    particle: {
      position: 'absolute',
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    particleDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 5,
    },
    
    // Logo container
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    
    // Halo effect
    halo: {
      position: 'absolute',
      width: 400,
      height: 200,
      borderRadius: 100,
      overflow: 'hidden',
    },
    haloGradient: {
      flex: 1,
      opacity: 0.3,
    },
    
    // Glow
    glow: {
      position: 'absolute',
      width: 350,
      height: 150,
      backgroundColor: isDark ? Colors.accent : Colors.accentSecondary,
      borderRadius: 75,
      opacity: 0.2,
      shadowColor: isDark ? Colors.accent : Colors.accentSecondary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
    
    // Texte container
    textContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 16,
    },
    
    // Lettres individuelles
    letter: {
      fontSize: 64,
      fontWeight: '800',
      letterSpacing: -3,
      fontFamily: 'System',
    },
    
    // Shine effect
    shine: {
      position: 'absolute',
      width: 100,
      height: 200,
      overflow: 'hidden',
    },
    shineGradient: {
      flex: 1,
      transform: [{ skewX: '-20deg' }],
    },
    
    // Tagline
    tagline: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 3,
      textTransform: 'uppercase',
      opacity: 0.7,
    },
  });
}
