/**
 * mobile/src/screens/ResultsScreen.js
 * Results and statistics screen for VaaniAI mobile.
 */

import React from 'react';
import {
  StyleSheet, View, Text, ScrollView, Dimensions
} from 'react-native';
import { useApp } from '../context/AppContext.js';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
  const { resultsHistory, xp, level, xpProgress, streak, activeColors } = useApp();
  const c = activeColors;

  const totalSessions = resultsHistory.length;
  const avgScore = totalSessions > 0
    ? Math.round(resultsHistory.reduce((a, r) => a + (r.score || 0), 0) / totalSessions)
    : 0;

  const quizzes = resultsHistory.filter(r => r.activity_type === 'quiz').length;
  const practices = resultsHistory.filter(r => r.activity_type === 'practice').length;

  const typeIcons = {
    quiz: '🧠',
    practice: '🎙️',
    challenge: '✨',
  };

  const typeColors = {
    quiz: c.primary,
    practice: '#10b981',
    challenge: '#f59e0b',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bgPrimary }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: c.bgSecondary, borderBottomColor: c.borderLight }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>📊 Your Results</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>Track your progress over time</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsGrid}>
        {[
          { icon: '✨', label: 'Total XP', value: xp.toLocaleString(), color: c.primary },
          { icon: '🏆', label: 'Level', value: `Lvl ${level}`, color: '#f59e0b' },
          { icon: '🔥', label: 'Streak', value: `${streak} Days`, color: '#ef4444' },
          { icon: '🎯', label: 'Avg Score', value: `${avgScore}%`, color: '#10b981' },
          { icon: '🧠', label: 'Quizzes', value: String(quizzes), color: c.primary },
          { icon: '🎙️', label: 'Practice', value: String(practices), color: '#3b82f6' },
        ].map(stat => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: c.textTertiary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* XP Progress */}
      <View style={[styles.card, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: c.textPrimary }]}>Level Progress</Text>
          <Text style={[styles.cardSub, { color: c.primary }]}>{Math.round(xpProgress)}%</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: c.bgTertiary }]}>
          <View style={[styles.progressFill, { width: `${xpProgress}%`, backgroundColor: c.primary }]} />
        </View>
        <Text style={[styles.xpNote, { color: c.textTertiary }]}>{xp % 1000} / 1000 XP to next level</Text>
      </View>

      {/* Skill Bars */}
      <View style={[styles.card, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
        <Text style={[styles.cardTitle, { color: c.textPrimary }]}>Skill Levels</Text>
        {[
          { label: 'Reading', pct: Math.min(100, avgScore), color: c.primary },
          { label: 'Pronunciation', pct: Math.max(40, avgScore - 5), color: '#3b82f6' },
          { label: 'Comprehension', pct: Math.min(100, avgScore + 3), color: '#10b981' },
          { label: 'Fluency', pct: Math.max(35, avgScore - 12), color: '#f59e0b' },
        ].map(skill => (
          <View key={skill.label} style={styles.skillItem}>
            <View style={styles.skillHeader}>
              <Text style={[styles.skillLabel, { color: c.textSecondary }]}>{skill.label}</Text>
              <Text style={[styles.skillPct, { color: skill.color }]}>{skill.pct}%</Text>
            </View>
            <View style={[styles.skillBar, { backgroundColor: c.bgTertiary }]}>
              <View style={[styles.skillFill, { width: `${skill.pct}%`, backgroundColor: skill.color }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Session History */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Recent Sessions</Text>
      </View>

      {resultsHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>No sessions yet</Text>
          <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>Complete quizzes, practice sessions, or daily challenges to see your results here!</Text>
        </View>
      ) : (
        resultsHistory.slice(0, 20).map((r, idx) => {
          const type = r.activity_type || 'practice';
          const date = new Date(r.created_at);
          const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

          return (
            <View key={idx} style={[styles.sessionCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
              <View style={[styles.sessionIcon, { backgroundColor: `${typeColors[type]}22` }]}>
                <Text style={{ fontSize: 22 }}>{typeIcons[type] || '🎯'}</Text>
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionType, { color: c.textPrimary }]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Session
                </Text>
                <Text style={[styles.sessionDate, { color: c.textTertiary }]}>{dateStr} at {timeStr}</Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: (r.score || 0) >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' }]}>
                <Text style={[styles.scoreText, { color: (r.score || 0) >= 70 ? '#10b981' : '#f59e0b' }]}>
                  {r.score}%
                </Text>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  statCard: { width: (width - 44) / 3, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center' },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, marginTop: 3 },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSub: { fontSize: 14, fontWeight: '700' },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 5 },
  xpNote: { fontSize: 11 },
  skillItem: { marginBottom: 12 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  skillLabel: { fontSize: 13, fontWeight: '600' },
  skillPct: { fontSize: 13, fontWeight: '700' },
  skillBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 3 },
  sectionHeader: { paddingHorizontal: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  sessionCard: { marginHorizontal: 16, marginBottom: 10, borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
  sessionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sessionInfo: { flex: 1 },
  sessionType: { fontSize: 14, fontWeight: '700' },
  sessionDate: { fontSize: 12, marginTop: 2 },
  scoreBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  scoreText: { fontSize: 15, fontWeight: '900' },
});
