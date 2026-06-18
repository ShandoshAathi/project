/**
 * mobile/src/components/BottomNav.js
 * Floating glassmorphic bottom navigation bar for a premium native look.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useApp } from '../context/AppContext.js';

export default function BottomNav() {
  const { activePage, setActivePage, activeColors } = useApp();

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'study', label: 'Study', icon: '📖' },
    { id: 'practice', label: 'Practice', icon: '🎙️' },
    { id: 'flashcards', label: 'Cards', icon: '🗂️' },
    { id: 'results', label: 'Stats', icon: '📊' }
  ];

  return (
    <View style={[styles.outerContainer, { backgroundColor: 'transparent' }]}>
      <View style={[
        styles.navContainer, 
        { 
          backgroundColor: activeColors.glassBg, 
          borderColor: activeColors.glassBorder,
          shadowColor: activeColors.glassShadow
        }
      ]}>
        {tabs.map((tab) => {
          const isActive = activePage === tab.id || (tab.id === 'study' && activePage === 'syllabus');
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActivePage(tab.id)}
            >
              <Text style={[styles.tabIcon, isActive && { transform: [{ scale: 1.15 }] }]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel, 
                { color: activeColors.textSecondary },
                isActive && { color: activeColors.primary, fontWeight: '700' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  navContainer: {
    width: '100%',
    maxWidth: 500,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    // iOS shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    // Android shadow
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
