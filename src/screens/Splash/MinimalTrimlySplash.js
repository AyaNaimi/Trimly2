// src/screens/Splash/MinimalTrimlySplash.js
// Version minimaliste avec effet typing
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function MinimalTrimlySplash({ onFinish }) {
  const { Colors, isDark } = useTheme();
  const [displayedText, setDisplayedText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
  const fullText = 'trimly.';
  
  useEffect(() => {
    console.log('MinimalTrimlySplash: Starting');
    
    // Fade in du fond
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    // Cursor blink animation
    const cursorAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 530,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 530,
          useNativeDriver: true,
        }),
      ])
    );
    cursorAnimation.start();
    
    // Typing effect
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        
        // Arrêter le curseur
        cursorAnimation.stop();
        
        // Attendre un peu puis fade out
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            console.log('MinimalTrimlySplash: Finished, calling onFinish');
            if (onFinish) {
              onFinish();
            }
          });
        }, 800);
      }
    }, 100); // Vitesse de typing: 100ms par caractère
    
    return () => {
      clearInterval(typingInterval);
      cursorAnimation.stop();
    };
  }, [fadeAnim, cursorOpacity, onFinish]);
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Background gradient minimaliste */}
      <LinearGradient
        colors={isDark 
          ? ['#000814', '#0A1128', '#1B263B']
          : ['#FFFFFF', '#F8FAFC', '#EEF2FF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Texte avec typing effect et point coloré */}
      <View style={styles.textContainer}>
        <Text style={[
          styles.text,
          { color: isDark ? Colors.text : '#1E293B' }
        ]}>
          {displayedText === fullText ? (
            // Afficher avec le point coloré une fois complet
            <>
              {'trimly'}
              <Text style={[
                styles.text,
                { color: isDark ? Colors.accentSecondary : '#F97316' }
              ]}>
                .
              </Text>
            </>
          ) : (
            // Pendant le typing
            displayedText
          )}
          {displayedText.length < fullText.length && (
            <Animated.Text style={[
              styles.cursor,
              { 
                opacity: cursorOpacity,
                color: isDark ? Colors.accentSecondary : '#F97316',
              }
            ]}>
              |
            </Animated.Text>
          )}
        </Text>
      </View>
      
      {/* Tagline subtile */}
      <Text style={[
        styles.tagline,
        { color: Colors.textSecondary }
      ]}>
        smart expense tracking
      </Text>
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
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  text: {
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -3,
    fontFamily: 'System',
  },
  cursor: {
    fontSize: 72,
    fontWeight: '300',
    marginLeft: 2,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
});
