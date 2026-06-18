/**
 * mobile/src/components/TopNav.js
 * Premium Glassmorphic Header Navigation Bar for Mobile.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext.js';

export default function TopNav() {
  const { activePage, setActivePage, streak, currentUser, activeColors } = useApp();

  const getInitials = () => {
    if (!currentUser) return 'A';
    const name = currentUser.full_name || 'Learner';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={[styles.header, { backgroundColor: activeColors.bgSecondary, borderBottomColor: activeColors.borderLight }]}>
      <TouchableOpacity 
        style={styles.brand} 
        onPress={() => setActivePage('dashboard')}
      >
        <View style={[styles.brandIcon, { backgroundColor: activeColors.primary }]}>
          <Text style={styles.brandIconText}>V</Text>
        </View>
        <Text style={[styles.brandName, { color: activeColors.textPrimary }]}>VaaniAI</Text>
      </TouchableOpacity>

      <View style={styles.rightActions}>
        <View style={[styles.streakBadge, { backgroundColor: activeColors.bgTertiary }]}>
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.avatar, { backgroundColor: activeColors.primary }]}
          onPress={() => setActivePage('profile')}
        >
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
