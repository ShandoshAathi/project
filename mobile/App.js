/**
 * mobile/App.js
 * Root of the VaaniAI React Native/Expo app.
 * Manages the active "page" via simple state routing (no react-navigation needed).
 */

import React from 'react';
import {
  StyleSheet, View, StatusBar, Text, Animated
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext.js';

// Screens
import AuthScreen       from './src/screens/AuthScreen.js';
import DashboardScreen  from './src/screens/DashboardScreen.js';
import SyllabusScreen   from './src/screens/SyllabusScreen.js';
import StudyScreen      from './src/screens/StudyScreen.js';
import PracticeScreen   from './src/screens/PracticeScreen.js';
import QuizScreen       from './src/screens/QuizScreen.js';
import FlashcardsScreen from './src/screens/FlashcardsScreen.js';
import ResultsScreen    from './src/screens/ResultsScreen.js';
import ProfileScreen    from './src/screens/ProfileScreen.js';

// Shared Components
import Splash         from './src/components/Splash.js';
import Onboarding     from './src/components/Onboarding.js';
import TopNav         from './src/components/TopNav.js';
import BottomNav      from './src/components/BottomNav.js';
import AICoachDrawer  from './src/components/AICoachDrawer.js';

// Screens that need the navigation chrome (top bar + bottom tabs)
const NAV_SCREENS = ['dashboard', 'syllabus', 'study', 'practice', 'quiz', 'flashcards', 'results', 'profile'];

// Screen resolver
function ActiveScreen() {
  const { activePage } = useApp();
  switch (activePage) {
    case 'dashboard':  return <DashboardScreen />;
    case 'syllabus':   return <SyllabusScreen />;
    case 'study':      return <StudyScreen />;
    case 'practice':   return <PracticeScreen />;
    case 'quiz':       return <QuizScreen />;
    case 'flashcards': return <FlashcardsScreen />;
    case 'results':    return <ResultsScreen />;
    case 'profile':    return <ProfileScreen />;
    default:           return <DashboardScreen />;
  }
}

// Main navigator — knows which chrome to show
function AppNavigator() {
  const {
    activePage,
    loading,
    activeColors,
    toastXP,
    isChatOpen, setIsChatOpen
  } = useApp();

  const c = activeColors;

  // Show splash while loading initial state
  if (loading) return <Splash />;

  // Onboarding overlay
  if (activePage === 'onboarding') return <Onboarding />;

  // Auth screen — no chrome
  if (activePage === 'auth') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bgPrimary }}>
        <StatusBar
          barStyle={c.bgPrimary === '#0f0f1a' ? 'light-content' : 'dark-content'}
          backgroundColor={c.bgPrimary}
        />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  // Main navigation chrome
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bgPrimary }}>
      <StatusBar
        barStyle={c.bgPrimary === '#0f0f1a' ? 'light-content' : 'dark-content'}
        backgroundColor={c.bgPrimary}
      />
      
      {/* Top Navigation Bar */}
      <TopNav />

      {/* Active Screen Content */}
      <View style={{ flex: 1 }}>
        <ActiveScreen />
      </View>

      {/* Bottom Tab Navigation */}
      <BottomNav />

      {/* AI Coach Drawer (overlay) */}
      <AICoachDrawer visible={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* XP Toast Notification */}
      {toastXP && (
        <View style={[styles.xpToast, { backgroundColor: c.primary }]}>
          <Text style={styles.xpToastText}>+{toastXP} XP ✨</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  xpToast: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 20,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
  xpToastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
