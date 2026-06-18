/**
 * mobile/src/screens/StudyScreen.js
 * Chapter reader for VaaniAI mobile.
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions
} from 'react-native';
import { useApp } from '../context/AppContext.js';
import { getChapters } from '../services/studyData.js';

const { width } = Dimensions.get('window');

// Strips HTML tags for plain text rendering in React Native
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<h4>/g, '\n\n📌 ')
    .replace(/<\/h4>/g, '\n')
    .replace(/<strong>/g, '')
    .replace(/<\/strong>/g, '')
    .replace(/<em>/g, '')
    .replace(/<\/em>/g, '')
    .replace(/<\/?(ul|li|ol|p|div|pre|code|h[1-6])>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function StudyScreen() {
  const { currentSubject, customSubjects, setActivePage, addXPPoints, activeColors } = useApp();
  const c = activeColors;

  const chapters = getChapters(currentSubject, customSubjects);
  const [activeChapter, setActiveChapter] = useState(0);

  const chapter = chapters[activeChapter];
  const chapterText = chapter ? stripHtml(chapter.body) : '';

  const prev = () => setActiveChapter(i => Math.max(0, i - 1));
  const next = async () => {
    if (activeChapter < chapters.length - 1) {
      setActiveChapter(i => i + 1);
      await addXPPoints(20);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bgPrimary }]}>
      {/* Chapter List Sidebar (Horizontal scroll) */}
      <View style={[styles.chapterList, { backgroundColor: c.bgSecondary, borderBottomColor: c.borderLight }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterListContent}>
          {chapters.map((ch, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.chapterTab,
                { backgroundColor: c.bgTertiary },
                activeChapter === idx && { backgroundColor: c.primary }
              ]}
              onPress={() => setActiveChapter(idx)}
            >
              <Text style={[
                styles.chapterTabText,
                { color: activeChapter === idx ? '#fff' : c.textSecondary }
              ]}>
                Ch.{idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reading Area */}
      <ScrollView style={styles.reader} contentContainerStyle={styles.readerContent}>
        {/* Chapter Header */}
        <View style={[styles.chapterHeader, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
          <Text style={[styles.chapterNum, { color: c.primary }]}>Chapter {activeChapter + 1} of {chapters.length}</Text>
          <Text style={[styles.chapterTitle, { color: c.textPrimary }]}>{chapter?.title}</Text>
          <View style={[styles.progressBar, { backgroundColor: c.bgTertiary }]}>
            <View style={[styles.progressFill, { width: `${((activeChapter + 1) / chapters.length) * 100}%`, backgroundColor: c.primary }]} />
          </View>
        </View>

        {/* Content */}
        <View style={[styles.contentCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
          <Text style={[styles.content, { color: c.textPrimary }]}>{chapterText}</Text>
        </View>

        {/* Navigation */}
        <View style={styles.navBtns}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }, activeChapter === 0 && styles.navBtnDisabled]}
            onPress={prev}
            disabled={activeChapter === 0}
          >
            <Text style={[styles.navBtnText, { color: activeChapter === 0 ? c.textTertiary : c.textPrimary }]}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: c.primary }, activeChapter >= chapters.length - 1 && styles.navBtnDisabled]}
            onPress={next}
            disabled={activeChapter >= chapters.length - 1}
          >
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Next → +20XP</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={[styles.quickLink, { backgroundColor: c.bgTertiary }]} onPress={() => setActivePage('practice')}>
            <Text style={[styles.quickLinkText, { color: c.textSecondary }]}>🎙️ Practice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickLink, { backgroundColor: c.bgTertiary }]} onPress={() => setActivePage('quiz')}>
            <Text style={[styles.quickLinkText, { color: c.textSecondary }]}>🧠 Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickLink, { backgroundColor: c.bgTertiary }]} onPress={() => setActivePage('flashcards')}>
            <Text style={[styles.quickLinkText, { color: c.textSecondary }]}>🗂️ Cards</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chapterList: { borderBottomWidth: 1, paddingVertical: 10 },
  chapterListContent: { paddingHorizontal: 16, gap: 8 },
  chapterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chapterTabText: { fontSize: 13, fontWeight: '600' },
  reader: { flex: 1 },
  readerContent: { padding: 16 },
  chapterHeader: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  chapterNum: { fontSize: 12, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  chapterTitle: { fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 12 },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  contentCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  content: { fontSize: 15, lineHeight: 24 },
  navBtns: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  navBtn: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: '700' },
  quickLinks: { flexDirection: 'row', gap: 10 },
  quickLink: { flex: 1, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  quickLinkText: { fontSize: 13, fontWeight: '600' },
});
