/**
 * mobile/src/screens/FlashcardsScreen.js
 * Spaced Repetition flashcards screen for VaaniAI mobile.
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Animated
} from 'react-native';
import { useApp } from '../context/AppContext.js';
import { speak } from '../services/voice.js';

export default function FlashcardsScreen() {
  const { flashcards, dueWords, addWordToFlashcards, updateWordSRS, activeColors, settings } = useApp();
  const c = activeColors;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newDef, setNewDef] = useState('');
  const [studyIdx, setStudyIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [studyMode, setStudyMode] = useState(false);

  const handleAddWord = async () => {
    if (!newWord.trim() || !newDef.trim()) {
      Alert.alert("Required", "Please enter both word and definition.");
      return;
    }
    await addWordToFlashcards(newWord.trim(), newDef.trim());
    setNewWord('');
    setNewDef('');
    setShowAddModal(false);
  };

  const handleReveal = () => {
    setShowBack(true);
    if (settings.aiVoice && dueWords[studyIdx]) {
      speak(dueWords[studyIdx].definition);
    }
  };

  const handleAnswer = async (remembered) => {
    if (dueWords[studyIdx]) {
      await updateWordSRS(dueWords[studyIdx].word, remembered);
    }
    setShowBack(false);
    if (studyIdx < dueWords.length - 1) {
      setStudyIdx(s => s + 1);
    } else {
      setStudyMode(false);
      setStudyIdx(0);
      Alert.alert("Session Complete!", "You've reviewed all due words! 🎉");
    }
  };

  const currentCard = dueWords[studyIdx];
  const totalWords = flashcards.length;
  const dueCount = dueWords.length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bgPrimary }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: c.bgSecondary, borderBottomColor: c.borderLight }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>🗂️ Flashcards</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>Spaced Repetition System</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
          <Text style={[styles.statNum, { color: c.primary }]}>{totalWords}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Total Words</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
          <Text style={[styles.statNum, { color: '#f59e0b' }]}>{dueCount}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Due Now</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
          <Text style={[styles.statNum, { color: '#10b981' }]}>{totalWords - dueCount}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Mastered</Text>
        </View>
      </View>

      {/* Study Mode */}
      {studyMode && dueCount > 0 && (
        <View style={styles.studyArea}>
          <Text style={[styles.studyProgress, { color: c.textTertiary }]}>
            Card {studyIdx + 1} of {dueCount}
          </Text>
          <TouchableOpacity
            style={[styles.flashcard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}
            onPress={handleReveal}
          >
            <Text style={[styles.cardWord, { color: c.primary }]}>{currentCard?.word}</Text>
            {showBack ? (
              <Text style={[styles.cardDef, { color: c.textPrimary }]}>{currentCard?.definition}</Text>
            ) : (
              <Text style={[styles.tapHint, { color: c.textTertiary }]}>Tap to reveal</Text>
            )}
          </TouchableOpacity>

          {showBack && (
            <View style={styles.answerBtns}>
              <TouchableOpacity
                style={[styles.answerBtn, styles.wrongBtn]}
                onPress={() => handleAnswer(false)}
              >
                <Text style={styles.answerBtnText}>✗ Forgot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerBtn, styles.correctBtn]}
                onPress={() => handleAnswer(true)}
              >
                <Text style={styles.answerBtnText}>✓ Got it!</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {!studyMode && (
        <>
          {dueCount > 0 && (
            <TouchableOpacity style={[styles.studyBtn, { backgroundColor: c.primary }]} onPress={() => { setStudyIdx(0); setShowBack(false); setStudyMode(true); }}>
              <Text style={styles.studyBtnText}>📚 Start Review Session ({dueCount} due)</Text>
            </TouchableOpacity>
          )}

          {/* Word List */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Your Vocabulary</Text>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: c.primary }]} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addBtnText}>+ Add Word</Text>
            </TouchableOpacity>
          </View>

          {flashcards.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>No flashcards yet</Text>
              <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>Add your first word to start building your vocabulary!</Text>
            </View>
          )}

          {flashcards.map((card, idx) => (
            <View key={idx} style={[styles.wordCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
              <View style={styles.wordRow}>
                <View style={styles.wordLeft}>
                  <Text style={[styles.word, { color: c.textPrimary }]}>{card.word}</Text>
                  <Text style={[styles.def, { color: c.textSecondary }]}>{card.definition}</Text>
                </View>
                <View style={styles.wordMeta}>
                  <View style={[styles.levelBadge, { backgroundColor: `hsl(${card.level * 40}, 70%, 50%)` }]}>
                    <Text style={styles.levelText}>L{card.level}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { speak(card.word + '. ' + card.definition); }}>
                    <Text style={{ fontSize: 20 }}>🔊</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 100 }} />

      {/* Add Word Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.bgSecondary }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary }]}>+ Add Flashcard</Text>
            <Text style={[styles.label, { color: c.textSecondary }]}>Word</Text>
            <TextInput
              style={[styles.input, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgTertiary }]}
              placeholder="e.g. Ephemeral"
              placeholderTextColor={c.textTertiary}
              value={newWord}
              onChangeText={setNewWord}
            />
            <Text style={[styles.label, { color: c.textSecondary, marginTop: 12 }]}>Definition</Text>
            <TextInput
              style={[styles.textarea, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgTertiary }]}
              placeholder="Lasting for a very short time"
              placeholderTextColor={c.textTertiary}
              multiline
              numberOfLines={3}
              value={newDef}
              onChangeText={setNewDef}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: c.borderLight }]} onPress={() => setShowAddModal(false)}>
                <Text style={[styles.cancelBtnText, { color: c.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: c.primary }]} onPress={handleAddWord}>
                <Text style={styles.confirmBtnText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 4 },
  studyArea: { padding: 16 },
  studyProgress: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
  flashcard: { borderRadius: 20, borderWidth: 1, padding: 40, alignItems: 'center', minHeight: 200, justifyContent: 'center', elevation: 4 },
  cardWord: { fontSize: 32, fontWeight: '900', marginBottom: 16 },
  cardDef: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
  tapHint: { fontSize: 14, fontStyle: 'italic' },
  answerBtns: { flexDirection: 'row', gap: 16, marginTop: 20 },
  answerBtn: { flex: 1, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  wrongBtn: { backgroundColor: '#ef4444' },
  correctBtn: { backgroundColor: '#10b981' },
  answerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  studyBtn: { marginHorizontal: 16, marginTop: 8, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  studyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  addBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { fontSize: 13, textAlign: 'center' },
  wordCard: { marginHorizontal: 16, marginBottom: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  wordRow: { flexDirection: 'row', alignItems: 'center' },
  wordLeft: { flex: 1 },
  word: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  def: { fontSize: 13, lineHeight: 18 },
  wordMeta: { alignItems: 'center', gap: 8 },
  levelBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 },
  levelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 14 },
  textarea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, textAlignVertical: 'top', minHeight: 80 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  confirmBtn: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
