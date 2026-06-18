/**
 * mobile/src/screens/QuizScreen.js
 * AI-generated quiz for VaaniAI mobile.
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useApp } from '../context/AppContext.js';
import { generateQuizQuestions } from '../services/ai.js';

export default function QuizScreen() {
  const { currentUser, currentSubject, recordResult, addXPPoints, activeColors } = useApp();
  const c = activeColors;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState({}); // { qIdx: optIdx }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const generateQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setSelected({});
    setScore(null);
    try {
      const qs = await generateQuizQuestions(currentUser);
      if (qs && qs.length > 0) {
        setQuestions(qs);
      } else {
        Alert.alert("Error", "Failed to generate questions. Please check your API key in settings.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Could not generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setSelected(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = async () => {
    if (Object.keys(selected).length < questions.length) {
      Alert.alert("Incomplete", "Please answer all questions before submitting.");
      return;
    }
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selected[idx] === q.ans) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    await recordResult(pct, 'quiz');
    await addXPPoints(pct >= 70 ? 80 : 40);
  };

  const getOptionStyle = (qIdx, optIdx) => {
    if (!submitted) {
      return selected[qIdx] === optIdx
        ? [styles.option, { backgroundColor: c.bgTertiary, borderColor: c.primary, borderWidth: 2 }]
        : [styles.option, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }];
    }
    const q = questions[qIdx];
    if (optIdx === q.ans) return [styles.option, { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: '#10b981', borderWidth: 2 }];
    if (selected[qIdx] === optIdx && optIdx !== q.ans) return [styles.option, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444', borderWidth: 2 }];
    return [styles.option, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }];
  };

  const getOptionTextColor = (qIdx, optIdx) => {
    if (!submitted) return selected[qIdx] === optIdx ? c.primary : c.textPrimary;
    if (optIdx === questions[qIdx].ans) return '#10b981';
    if (selected[qIdx] === optIdx) return '#ef4444';
    return c.textSecondary;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bgPrimary }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: c.bgSecondary, borderBottomColor: c.borderLight }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>🧠 AI Quiz</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{currentSubject} — 10 Questions</Text>
      </View>

      {questions.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>AI-Powered Quiz</Text>
          <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>
            Tap below to generate a personalized 10-question quiz for {currentSubject}.
          </Text>
          <TouchableOpacity style={[styles.generateBtn, { backgroundColor: c.primary }]} onPress={generateQuiz}>
            <Text style={styles.generateBtnText}>Generate Quiz</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>AI is generating your quiz…</Text>
        </View>
      )}

      {submitted && score !== null && (
        <View style={[styles.resultBanner, { backgroundColor: score >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderColor: score >= 70 ? '#10b981' : '#ef4444' }]}>
          <Text style={[styles.resultScore, { color: score >= 70 ? '#10b981' : '#ef4444' }]}>{score}%</Text>
          <Text style={[styles.resultLabel, { color: c.textPrimary }]}>{score >= 80 ? '🏆 Excellent!' : score >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}</Text>
          <Text style={[styles.resultSub, { color: c.textSecondary }]}>
            {Math.round((score / 100) * questions.length)} / {questions.length} correct
          </Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: c.primary }]} onPress={generateQuiz}>
            <Text style={styles.generateBtnText}>New Quiz</Text>
          </TouchableOpacity>
        </View>
      )}

      {questions.length > 0 && (
        <View style={styles.questionList}>
          {questions.map((q, qIdx) => (
            <View key={qIdx} style={[styles.questionCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
              <Text style={[styles.qNum, { color: c.primary }]}>Q{qIdx + 1}</Text>
              <Text style={[styles.qText, { color: c.textPrimary }]}>{q.q}</Text>
              {q.opts.map((opt, optIdx) => (
                <TouchableOpacity
                  key={optIdx}
                  style={getOptionStyle(qIdx, optIdx)}
                  onPress={() => selectAnswer(qIdx, optIdx)}
                >
                  <View style={[styles.optionDot, { borderColor: getOptionTextColor(qIdx, optIdx) }]}>
                    {selected[qIdx] === optIdx && !submitted && (
                      <View style={[styles.optionDotFill, { backgroundColor: c.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.optionText, { color: getOptionTextColor(qIdx, optIdx) }]}>
                    {String.fromCharCode(65 + optIdx)}. {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {!submitted && (
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: c.primary }]}
              onPress={submitQuiz}
            >
              <Text style={styles.generateBtnText}>Submit Quiz</Text>
            </TouchableOpacity>
          )}
        </View>
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
  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  generateBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 25, elevation: 4 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingState: { alignItems: 'center', padding: 60 },
  loadingText: { marginTop: 16, fontSize: 15 },
  resultBanner: { margin: 16, borderRadius: 16, borderWidth: 2, padding: 20, alignItems: 'center' },
  resultScore: { fontSize: 56, fontWeight: '900' },
  resultLabel: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  resultSub: { fontSize: 14, marginBottom: 16 },
  retryBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 25 },
  questionList: { padding: 16 },
  questionCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  qNum: { fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  qText: { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 14 },
  option: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  optionDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  optionDotFill: { width: 10, height: 10, borderRadius: 5 },
  optionText: { fontSize: 14, flex: 1 },
  submitBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 5 },
});
