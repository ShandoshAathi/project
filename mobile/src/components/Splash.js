/**
 * mobile/src/components/Splash.js
 * Splash Screen with animated entry and dismiss skip triggers.
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useApp } from '../context/AppContext.js';

export default function Splash({ onDismiss }) {
  const { activeColors } = useApp();
  const [showSkip, setShowSkip] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animate in logo
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Auto-show skip button after 2.5s
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 2500);

    // Auto-dismiss after 4.5s
    const dismissTimer = setTimeout(() => {
      dismissSplash();
    }, 4500);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const dismissSplash = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: activeColors.bgPrimary, opacity: fadeAnim }]}>
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.logoContainer, { backgroundColor: activeColors.primary }]}>
          <Text style={styles.logoText}>V</Text>
        </View>
        <Text style={[styles.title, { color: activeColors.textPrimary }]}>VaaniAI</Text>
        <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>Your AI Learning Tutor</Text>
        
        {showSkip && (
          <TouchableOpacity 
            style={[styles.skipButton, { borderColor: activeColors.borderLight }]} 
            onPress={dismissSplash}
          >
            <Text style={[styles.skipText, { color: activeColors.primary }]}>Skip Intro</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
