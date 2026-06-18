/**
 * mobile/src/screens/DashboardScreen.js
 * Main dashboard for VaaniAI mobile — premium glassmorphic design.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, Dimensions
} from 'react-native';
import { useApp } from '../context/AppContext.js';
import { generateDailyChallenge, evaluateChallengeResponse, generateCustomSyllabus } from '../services/ai.js';

const { width } = Dimensions.get('window');

const SUBJECT_CARDS = [
  { id: 'English', label: 'English Master', desc: 'Fluency & Communication', gradient: ['#8b5cf6', '#ec4899'], emoji: '🗣️' },
  { id: 'Python',  label: 'Python Mentor',  desc: 'Programming & Logic',   gradient: ['#3b82f6', '#06b6d4'], emoji: '🐍' },
  { id: 'Java',    label: 'Java Expert',    desc: 'OOP & Architecture',     gradient: ['#f59e0b', '#ef4444'], emoji: '☕' },
  { id: 'C++',     label: 'C++ Master',     desc: 'Systems & Performance',  gradient: ['#10b981', '#3b82f6'], emoji: '⚙️' },
];

export default function DashboardScreen() {
  const {
    currentUser, xp, level, xpProgress,
    addXPPoints, streak, currentSubject,
    switchSubject, customSubjects,
    addCustomSubject, deleteCustomSubject,
    setActivePage, setIsChatOpen,
    resultsHistory, activeColors
  } = useApp();

  const c = activeColors;

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [generatingCustom, setGeneratingCustom] = useState(false);
  const [customStatus, setCustomStatus] = useState('Analyzing...');

  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengeResponse, setChallengeResponse] = useState('');
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeResult, setChallengeResult] = useState(null);
  const [challengeLoadingInit, setChallengeLoadingInit] = useState(false);

  const dashboardStats = {
    lessonsDone: resultsHistory.length,
    accuracy: resultsHistory.length > 0
      ? Math.round(resultsHistory.reduce((a, r) => a + (r.score || 0), 0) / resultsHistory.length)
      : 75,
    timeSpent: Math.max(1, Math.round(resultsHistory.length * 15 / 60))
  };

  const fetchChallenge = async () => {
    if (dailyChallenge) return;
    setChallengeLoadingInit(true);
    try {
      const challenge = await generateDailyChallenge(currentUser);
      setDailyChallenge(challenge);
    } catch (err) {
      setDailyChallenge({ title: 'The Elevator Pitch', scenario: 'You bump into a potential investor!', task: 'What do you say in 30 seconds?' });
    } finally {
      setChallengeLoadingInit(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const handleSubmitChallenge = async () => {
    if (!challengeResponse.trim()) { Alert.alert("Required", "Please enter your response."); return; }
    setChallengeLoading(true);
    try {
      const result = await evaluateChallengeResponse(dailyChallenge?.task, challengeResponse);
      setChallengeResult(result);
      await addXPPoints(100);
    } catch (err) {
      Alert.alert("Error", "Could not evaluate response. Try again.");
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleGenerateCustomPath = async () => {
    if (!customTitle.trim()) { Alert.alert("Required", "Please enter a topic title."); return; }
    setGeneratingCustom(true);
    setCustomStatus("AI is designing your modules...");
    try {
      const syllabus = await generateCustomSyllabus(customTitle);
      setCustomStatus("Finalizing course structure...");
      await addCustomSubject(customTitle, syllabus);
      setShowCustomModal(false);
      setCustomTitle('');
      await switchSubject(customTitle);
    } catch (err) {
      Alert.alert("Error", "Failed to generate custom syllabus. Please try again.");
    } finally {
      setGeneratingCustom(false);
    }
  };

  const weeklyData = [60, 80, 45, 90, 70, 55, 85];
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bgPrimary }]} showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      <View style={[styles.hero, { backgroundColor: c.bgSecondary, borderBottomColor: c.borderLight }]}>
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: c.textPrimary }]}>
            Welcome back to{' '}
            <Text style={{ color: c.primary }}>{currentSubject}</Text>!
          </Text>
          <Text style={[styles.heroSubtitle, { color: c.textSecondary }]}>
            Pick your focus area and crush your goals today.
          </Text>
        </View>

        {/* XP Progress Bar */}
        <View style={styles.xpRow}>
          <Text style={[styles.xpLabel, { color: c.textTertiary }]}>Level {level}</Text>
          <Text style={[styles.xpLabel, { color: c.textTertiary }]}>{xp.toLocaleString()} XP</Text>
        </View>
        <View style={[styles.xpBar, { backgroundColor: c.bgTertiary }]}>
          <View style={[styles.xpFill, { width: `${xpProgress}%`, backgroundColor: c.primary }]} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { icon: '📖', label: 'Lessons', value: String(dashboardStats.lessonsDone) },
          { icon: '🎯', label: 'Accuracy', value: `${dashboardStats.accuracy}%` },
          { icon: '⏱️', label: 'Hours', value: `${dashboardStats.timeSpent}h` },
          { icon: '🔥', label: 'Streak', value: `${streak}d` },
        ].map(stat => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: c.textPrimary }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: c.textTertiary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Subject Path Cards */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Your Learning Paths</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll} contentContainerStyle={styles.subjectScrollContent}>
        {SUBJECT_CARDS.map(sub => (
          <TouchableOpacity
            key={sub.id}
            style={[
              styles.subjectCard,
              { backgroundColor: c.bgSecondary, borderColor: c.borderLight },
              currentSubject === sub.id && { borderColor: c.primary, borderWidth: 2 }
            ]}
            onPress={() => switchSubject(sub.id)}
          >
            <Text style={styles.subjectEmoji}>{sub.emoji}</Text>
            <Text style={[styles.subjectName, { color: c.textPrimary }]}>{sub.label}</Text>
            <Text style={[styles.subjectDesc, { color: c.textSecondary }]}>{sub.desc}</Text>
            <View style={[styles.resumeTag, { backgroundColor: currentSubject === sub.id ? c.primary : c.bgTertiary }]}>
              <Text style={[styles.resumeTagText, { color: currentSubject === sub.id ? '#fff' : c.textTertiary }]}>
                {currentSubject === sub.id ? '● Active' : 'Resume →'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Custom subject cards */}
        {Object.keys(customSubjects).map(subKey => (
          <TouchableOpacity
            key={subKey}
            style={[
              styles.subjectCard,
              { backgroundColor: c.bgSecondary, borderColor: c.borderLight },
              currentSubject === subKey && { borderColor: c.primary, borderWidth: 2 }
            ]}
            onPress={() => switchSubject(subKey)}
          >
            <Text style={styles.subjectEmoji}>✨</Text>
            <Text style={[styles.subjectName, { color: c.textPrimary }]}>{subKey}</Text>
            <Text style={[styles.subjectDesc, { color: c.textSecondary }]}>Custom AI Course</Text>
            <TouchableOpacity
              style={[styles.deleteSubjectBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
              onPress={() => {
                Alert.alert('Delete Course', `Delete "${subKey}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteCustomSubject(subKey) }
                ]);
              }}
            >
              <Text style={{ color: '#ef4444', fontSize: 13 }}>🗑 Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Create Custom Path */}
        <TouchableOpacity
          style={[styles.subjectCard, styles.createCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}
          onPress={() => setShowCustomModal(true)}
        >
          <Text style={styles.createIcon}>➕</Text>
          <Text style={[styles.subjectName, { color: c.textPrimary }]}>Create Custom</Text>
          <Text style={[styles.subjectDesc, { color: c.textSecondary }]}>AI-powered course</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Weekly Progress Chart */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Weekly Progress</Text>
      </View>
      <View style={[styles.card, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
        <View style={styles.barChart}>
          {weeklyData.map((h, i) => (
            <View key={i} style={styles.barGroup}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, {
                  height: `${h}%`,
                  backgroundColor: i === 6 ? c.primary : c.bgTertiary
                }]} />
              </View>
              <Text style={[styles.barLabel, { color: c.textTertiary }]}>{days[i]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Daily Mission Card */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Daily Mission</Text>
      </View>
      <TouchableOpacity
        style={[styles.card, styles.missionCard, { backgroundColor: c.bgSecondary, borderColor: c.primary }]}
        onPress={() => { setChallengeResult(null); setChallengeResponse(''); setShowChallengeModal(true); }}
        disabled={challengeLoadingInit}
      >
        <View style={styles.missionTop}>
          <Text style={styles.missionEmoji}>✨</Text>
          <View style={[styles.xpBadge, { backgroundColor: c.primary }]}>
            <Text style={styles.xpBadgeText}>+100 XP</Text>
          </View>
        </View>
        <Text style={[styles.missionTitle, { color: c.textPrimary }]}>
          {challengeLoadingInit ? 'Loading today\'s mission...' : (dailyChallenge?.title || 'Flash-Chat Mission')}
        </Text>
        <Text style={[styles.missionDesc, { color: c.textSecondary }]}>
          {challengeLoadingInit ? '...' : (dailyChallenge?.scenario || 'Tap to start your daily mission')}
        </Text>
        <View style={[styles.startMissionBtn, { backgroundColor: c.primary }]}>
          <Text style={styles.startMissionText}>Start Mission →</Text>
        </View>
      </TouchableOpacity>

      {/* AI Coach Banner */}
      <TouchableOpacity
        style={[styles.card, styles.aiCoachBanner, { backgroundColor: c.bgSecondary, borderColor: c.primary }]}
        onPress={() => setIsChatOpen(true)}
      >
        <View style={styles.aiCoachRow}>
          <View style={[styles.aiCoachAvatar, { backgroundColor: c.primary }]}>
            <Text style={{ fontSize: 26 }}>🤖</Text>
          </View>
          <View style={styles.aiCoachInfo}>
            <Text style={[styles.aiCoachTitle, { color: c.textPrimary }]}>AI Smart Coach</Text>
            <Text style={[styles.aiCoachDesc, { color: c.textSecondary }]}>Your personalized learning mentor</Text>
          </View>
        </View>
        <Text style={[styles.coachQuote, { color: c.textSecondary }]}>
          "You're doing great! Ready for a quick practice session to solidify your progress?"
        </Text>
        <View style={[styles.chatCoachBtn, { backgroundColor: c.primary }]}>
          <Text style={styles.chatCoachBtnText}>Chat with AI Coach →</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Quick Access</Text>
      </View>
      <View style={styles.quickGrid}>
        {[
          { label: 'Study', icon: '📖', page: 'study' },
          { label: 'Practice', icon: '🎙️', page: 'practice' },
          { label: 'Quiz', icon: '🧠', page: 'quiz' },
          { label: 'Flashcards', icon: '🗂️', page: 'flashcards' },
          { label: 'Syllabus', icon: '📚', page: 'syllabus' },
          { label: 'Results', icon: '📊', page: 'results' },
        ].map(item => (
          <TouchableOpacity
            key={item.page}
            style={[styles.quickBtn, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}
            onPress={() => setActivePage(item.page)}
          >
            <Text style={styles.quickBtnIcon}>{item.icon}</Text>
            <Text style={[styles.quickBtnLabel, { color: c.textSecondary }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 120 }} />

      {/* Custom Path Modal */}
      <Modal visible={showCustomModal} animationType="slide" transparent onRequestClose={() => setShowCustomModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.bgSecondary }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary }]}>✨ Create Custom Path</Text>
            <Text style={[styles.modalSubtitle, { color: c.textSecondary }]}>Generate a complete AI course from a book or topic</Text>
            {!generatingCustom ? (
              <>
                <Text style={[styles.label, { color: c.textSecondary, marginTop: 16, marginBottom: 6 }]}>Topic or Book Title *</Text>
                <TextInput
                  style={[styles.input, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgTertiary }]}
                  placeholder="e.g. Advanced React Patterns"
                  placeholderTextColor={c.textTertiary}
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.outlineBtn, { borderColor: c.borderLight }]} onPress={() => setShowCustomModal(false)}>
                    <Text style={[styles.outlineBtnText, { color: c.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: c.primary }]} onPress={handleGenerateCustomPath}>
                    <Text style={styles.primaryBtnText}>Generate Path</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={c.primary} />
                <Text style={[styles.loadingText, { color: c.textPrimary }]}>{customStatus}</Text>
                <Text style={[styles.loadingSubtext, { color: c.textSecondary }]}>AI is reading your details and building a custom syllabus…</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Challenge Modal */}
      <Modal visible={showChallengeModal} animationType="slide" transparent onRequestClose={() => setShowChallengeModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalCard, { backgroundColor: c.bgSecondary }]} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => setShowChallengeModal(false)} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: c.textSecondary }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: c.textPrimary }]}>✨ {dailyChallenge?.title || 'Daily Mission'}</Text>
            <Text style={[styles.modalSubtitle, { color: c.textSecondary }]}>{dailyChallenge?.scenario}</Text>
            <View style={[styles.taskBox, { backgroundColor: c.bgTertiary, borderColor: c.borderLight }]}>
              <Text style={[styles.taskLabel, { color: c.textSecondary }]}>Your Task:</Text>
              <Text style={[styles.taskText, { color: c.textPrimary }]}>{dailyChallenge?.task}</Text>
            </View>
            <Text style={[styles.label, { color: c.textSecondary, marginTop: 16, marginBottom: 6 }]}>Your Response</Text>
            <TextInput
              style={[styles.textarea, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgTertiary }]}
              placeholder="Type or speak your response here..."
              placeholderTextColor={c.textTertiary}
              multiline
              numberOfLines={4}
              value={challengeResponse}
              onChangeText={setChallengeResponse}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: c.primary, marginTop: 16 }]}
              onPress={handleSubmitChallenge}
              disabled={challengeLoading}
            >
              {challengeLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Submit Mission</Text>}
            </TouchableOpacity>
            {challengeResult && (
              <View style={[styles.resultBox, { backgroundColor: c.bgTertiary, borderColor: c.primary }]}>
                <Text style={[styles.resultScore, { color: c.primary }]}>Score: {challengeResult.score}%</Text>
                <Text style={[styles.resultFeedback, { color: c.textPrimary }]}>{challengeResult.feedback}</Text>
                <View style={[styles.suggestionBox, { backgroundColor: c.bgSecondary }]}>
                  <Text style={[styles.taskLabel, { color: c.textSecondary }]}>Try this instead:</Text>
                  <Text style={[styles.taskText, { color: c.textPrimary }]}>{challengeResult.suggestion}</Text>
                </View>
              </View>
            )}
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 20, paddingTop: 16, borderBottomWidth: 1 },
  heroContent: { marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  heroSubtitle: { fontSize: 14 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { fontSize: 12, fontWeight: '600' },
  xpBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: 'center' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2 },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  subjectScroll: { paddingLeft: 16 },
  subjectScrollContent: { paddingRight: 16, gap: 12 },
  subjectCard: { width: 160, borderRadius: 16, borderWidth: 1, padding: 14, marginRight: 0 },
  subjectEmoji: { fontSize: 32, marginBottom: 8 },
  subjectName: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  subjectDesc: { fontSize: 11, marginBottom: 10 },
  resumeTag: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12, alignSelf: 'flex-start' },
  resumeTagText: { fontSize: 11, fontWeight: '600' },
  deleteSubjectBtn: { marginTop: 8, padding: 6, borderRadius: 8, alignSelf: 'flex-start' },
  createCard: { justifyContent: 'center', alignItems: 'center', minHeight: 140 },
  createIcon: { fontSize: 32, marginBottom: 8 },
  card: { marginHorizontal: 16, marginBottom: 4, borderRadius: 16, borderWidth: 1, padding: 16 },
  barChart: { flexDirection: 'row', height: 100, alignItems: 'flex-end', justifyContent: 'space-between' },
  barGroup: { flex: 1, alignItems: 'center' },
  barTrack: { width: '60%', height: '100%', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 10, marginTop: 4 },
  missionCard: { borderWidth: 2 },
  missionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  missionEmoji: { fontSize: 28 },
  xpBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  xpBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  missionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  missionDesc: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  startMissionBtn: { paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
  startMissionText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  aiCoachBanner: { borderWidth: 2 },
  aiCoachRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiCoachAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiCoachInfo: { flex: 1 },
  aiCoachTitle: { fontSize: 16, fontWeight: '800' },
  aiCoachDesc: { fontSize: 12, marginTop: 2 },
  coachQuote: { fontSize: 13, fontStyle: 'italic', marginBottom: 14 },
  chatCoachBtn: { paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
  chatCoachBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  quickBtn: { width: (width - 52) / 3, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center' },
  quickBtnIcon: { fontSize: 28, marginBottom: 6 },
  quickBtnLabel: { fontSize: 12, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { fontSize: 14 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 14, marginBottom: 4 },
  textarea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, textAlignVertical: 'top', minHeight: 100 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  outlineBtn: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  outlineBtnText: { fontSize: 14, fontWeight: '600' },
  primaryBtn: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  loadingState: { alignItems: 'center', paddingVertical: 32 },
  loadingText: { fontSize: 17, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  loadingSubtext: { fontSize: 13, textAlign: 'center' },
  closeBtn: { alignSelf: 'flex-end', padding: 4, marginBottom: 10 },
  closeBtnText: { fontSize: 20, fontWeight: '600' },
  taskBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 },
  taskLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  taskText: { fontSize: 14, lineHeight: 20 },
  resultBox: { borderRadius: 12, borderWidth: 2, padding: 14, marginTop: 16 },
  resultScore: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  resultFeedback: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  suggestionBox: { borderRadius: 8, padding: 12 },
});
