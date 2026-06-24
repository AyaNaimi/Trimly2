// src/screens/Splash/SimpleTrimlySplash.js
// Version améliorée avec couleurs innovantes et animations premium
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function SimpleTrimlySplash({ onFinish }) {
  console.log('SimpleTrimlySplash: Component rendering');
  
  try {
    const { Colors, isDark } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(-width)).current;
    
    // Animations pour chaque lettre
    const letterAnims = useRef(
      'trimly.'.split('').map(() => ({
        translateY: new Animated.Value(20),
        opacity: new Animated.Value(0),
      }))
    ).current;
    
    // Animation des particules flottantes
    const particleAnims = useRef(
      Array.from({ length: 6 }, () => ({
        y: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
      }))
    ).current;
    
    useEffect(() => {
      console.log('SimpleTrimlySplash: Starting animation sequence');
      
      const timer = setTimeout(() => {
        try {
          // Séquence principale
          Animated.sequence([
            // 1. Fade in du fond
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            
            // 2. Particules apparaissent
            Animated.stagger(80,
              particleAnims.map((anim, index) =>
                Animated.parallel([
                  Animated.timing(anim.opacity, {
                    toValue: 0.6,
                    duration: 500,
                    useNativeDriver: true,
                  }),
                  Animated.spring(anim.scale, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                  }),
                  Animated.timing(anim.y, {
                    toValue: Math.sin(index * Math.PI / 3) * 80,
                    duration: 800,
                    useNativeDriver: true,
                  }),
                ])
              )
            ),
            
            // 3. Lettres apparaissent une par une
            Animated.parallel([
              Animated.stagger(60,
                letterAnims.map(anim =>
                  Animated.parallel([
                    Animated.timing(anim.opacity, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: true,
                    }),
                    Animated.spring(anim.translateY, {
                      toValue: 0,
                      tension: 120,
                      friction: 8,
                      useNativeDriver: true,
                    }),
                  ])
                )
              ),
              // Scale du container
              Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
              }),
            ]),
            
            // 4. Glow pulse
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            
            // 5. Shimmer effect
            Animated.timing(shimmerAnim, {
              toValue: width * 2,
              duration: 1000,
              useNativeDriver: true,
            }),
            
            // 6. Hold
            Animated.delay(800),
            
            // 7. Fade out
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            console.log('SimpleTrimlySplash: Animation complete');
            if (onFinish) onFinish();
          });
          
          // Animation de glow en boucle
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1.5,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
              }),
            ])
          ).start();
        } catch (error) {
          console.error('SimpleTrimlySplash: Animation error:', error);
          if (onFinish) onFinish();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, glowAnim, shimmerAnim, letterAnims, particleAnims, onFinish]);

    return (
      <View style={styles.container}>
        {/* Gradient de fond animé */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={isDark 
              ? ['#000814', '#0D1B2A', '#1B263B', '#0D1B2A', '#000814']
              : ['#FFFFFF', '#F8FAFC', '#EEF2FF', '#F8FAFC', '#FFFFFF']
            }
            locations={[0, 0.25, 0.5, 0.75, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        
        {/* Orbes de couleur en arrière-plan */}
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
        >
          <LinearGradient
            colors={isDark ? ['#5B3BF5', '#7C3AED'] : ['#6366F1', '#818CF8']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        
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
        >
          <LinearGradient
            colors={isDark ? ['#FF9100', '#FB923C'] : ['#F97316', '#FB923C']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        
        {/* Particules flottantes */}
        {particleAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                opacity: anim.opacity,
                transform: [
                  { translateY: anim.y },
                  { scale: anim.scale },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.particleDot,
                {
                  backgroundColor: index % 2 === 0
                    ? (isDark ? '#5B3BF5' : '#6366F1')
                    : (isDark ? '#FF9100' : '#F97316'),
                },
              ]}
            />
          </Animated.View>
        ))}
        
        {/* Container du logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Glow effect pulsant */}
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1, 1.5],
                  outputRange: [0, 0.4, 0.7],
                }),
                transform: [{
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1, 1.5],
                    outputRange: [0.8, 1, 1.2],
                  }),
                }],
              },
            ]}
          >
            <LinearGradient
              colors={isDark 
                ? ['#5B3BF5', '#FF9100', '#F15BB5']
                : ['#6366F1', '#F97316', '#EC4899']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glowGradient}
            />
          </Animated.View>
          
          {/* Texte "trimly." avec lettres animées */}
          <View style={styles.textContainer}>
            {'trimly.'.split('').map((letter, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.letter,
                  {
                    color: isDark ? Colors.text : '#1E293B',
                    opacity: letterAnims[index].opacity,
                    transform: [{ translateY: letterAnims[index].translateY }],
                  },
                  // Point final en couleur accent
                  index === 6 && {
                    color: isDark ? Colors.accentSecondary : '#F97316',
                    fontSize: 70,
                    fontWeight: '900',
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>
          
          {/* Shimmer effect */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)',
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
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
  } catch (error) {
    console.error('SimpleTrimlySplash: Render error:', error);
    // Fallback simple si erreur
    return (
      <View style={[styles.container, { backgroundColor: '#000814' }]}>
        <Text style={{ color: '#FFF', fontSize: 48, fontWeight: '800' }}>trimly.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    overflow: 'hidden',
  },
  orb1: {
    width: 500,
    height: 500,
    top: -200,
    left: -150,
  },
  orb2: {
    width: 400,
    height: 400,
    bottom: -150,
    right: -100,
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
    shadowColor: '#5B3BF5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  
  // Logo container
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
  // Glow effect
  glow: {
    position: 'absolute',
    width: 350,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
    opacity: 0.3,
  },
  
  // Texte container
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  
  // Lettres
  letter: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -3,
    fontFamily: 'System',
  },
  
  // Shimmer effect
  shimmer: {
    position: 'absolute',
    width: 80,
    height: 200,
    overflow: 'hidden',
  },
  shimmerGradient: {
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
