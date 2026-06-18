/**
 * mobile/src/screens/PracticeScreen.js
 * Voice practice & roleplay for VaaniAI mobile.
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useApp } from '../context/AppContext.js';
import { generatePracticePassage } from '../services/ai.js';
import { startListening, stopListening, speak } from '../services/voice.js';

export default function PracticeScreen() {
  const { currentUser, addXPPoints, activeColors, settings } = useApp();
  const c = activeColors;

  const [passage, setPassage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [practiced, setPracticed] = useState(false);

  const fetchPassage = async () => {
    setLoading(true);
    setTranscript('');
    setAccuracy(null);
    setPracticed(false);
    try {
      const text = await generatePracticePassage(currentUser);
      if (text) {
        setPassage(text);
        if (settings.aiVoice) {
          speak("Here is your practice passage. Please repeat after me: " + text);
        }
      } else {
        Alert.alert("Error", "Could not generate passage. Please check your API key.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Could not generate passage.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      startListening(
        (result) => {
          setTranscript(result);
          setIsListening(false);
          // Calculate simulated accuracy
          const words1 = passage.toLowerCase().split(' ');
          const words2 = result.toLowerCase().split(' ');
          const common = words2.filter(w => words1.includes(w)).length;
          const pct = Math.min(100, Math.round((common / words1.length) * 100));
          setAccuracy(pct);
          setPracticed(true);
          addXPPoints(pct >= 70 ? 60 : 30);
        },
        () => setIsListening(false),
        passage
      );
    }
  };

  const listenToPassage = () => {
    if (passage) speak(passage);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bgPrimary }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: c.bgSecondary, borderBottomColor: c.borderLight }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>🎙️ Voice Practice</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>AI-generated reading & speaking</Text>
      </View>

      {/* Generate passage */}
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: c.primary }]}
          onPress={fetchPassage}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>✨ Generate Practice Passage</Text>}
        </TouchableOpacity>

        {passage !== '' && (
          <>
            {/* Passage Card */}
            <View style={[styles.passageCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
              <View style={styles.passageHeader}>
                <Text style={[styles.passageLabel, { color: c.primary }]}>📄 Practice Passage</Text>
                <TouchableOpacity style={[styles.speakBtn, { backgroundColor: c.bgTertiary }]} onPress={listenToPassage}>
                  <Text style={{ fontSize: 20 }}>🔊</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.passageText, { color: c.textPrimary }]}>{passage}</Text>
            </View>

            {/* Mic Button */}
            <View style={styles.micSection}>
              <Text style={[styles.micHint, { color: c.textSecondary }]}>
                {isListening ? 'Listening... speak clearly' : 'Tap the microphone and repeat the passage'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.micBtn,
                  { backgroundColor: isListening ? '#ef4444' : c.primary },
                ]}
                onPress={toggleMic}
              >
                <Text style={styles.micBtnText}>{isListening ? '⏹ Stop' : '🎙️ Speak'}</Text>
              </TouchableOpacity>
            </View>

            {/* Transcript */}
            {transcript !== '' && (
              <View style={[styles.resultCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
                <Text style={[styles.resultLabel, { color: c.textSecondary }]}>What we heard:</Text>
                <Text style={[styles.transcriptText, { color: c.textPrimary }]}>{transcript}</Text>
              </View>
            )}

            {/* Accuracy Score */}
            {accuracy !== null && (
              <View style={[
                styles.scoreCard,
                { borderColor: accuracy >= 70 ? '#10b981' : '#f59e0b', backgroundColor: accuracy >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }
              ]}>
                <Text style={[styles.scoreNum, { color: accuracy >= 70 ? '#10b981' : '#f59e0b' }]}>{accuracy}%</Text>
                <Text style={[styles.scoreLabel, { color: c.textPrimary }]}>
                  {accuracy >= 85 ? '🏆 Excellent pronunciation!' : accuracy >= 70 ? '👍 Good job, keep practicing!' : '💪 Try reading slower and clearer'}
                </Text>
                {practiced && (
                  <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: c.primary }]}
                    onPress={fetchPassage}
                  >
                    <Text style={styles.nextBtnText}>Next Passage →</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        {passage === '' && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗣️</Text>
            <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Ready to Practice?</Text>
            <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>
              Generate an AI passage tailored to your level, then speak it aloud for feedback.
            </Text>
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4 },
  content: { padding: 16 },
  generateBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4 },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  passageCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  passageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  passageLabel: { fontSize: 13, fontWeight: '700' },
  speakBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  passageText: { fontSize: 16, lineHeight: 26 },
  micSection: { alignItems: 'center', marginBottom: 20 },
  micHint: { fontSize: 13, marginBottom: 16, textAlign: 'center' },
  micBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  micBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  resultCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  resultLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  transcriptText: { fontSize: 15, lineHeight: 22 },
  scoreCard: { borderRadius: 16, borderWidth: 2, padding: 20, alignItems: 'center', marginBottom: 16 },
  scoreNum: { fontSize: 56, fontWeight: '900', marginBottom: 8 },
  scoreLabel: { fontSize: 15, textAlign: 'center', marginBottom: 16 },
  nextBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 25 },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
