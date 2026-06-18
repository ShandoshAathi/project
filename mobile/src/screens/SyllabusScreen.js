/**
 * mobile/src/screens/SyllabusScreen.js
 * Course modules overview screen.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext.js';
import { getModules } from '../services/studyData.js';

export default function SyllabusScreen() {
  const { currentSubject, customSubjects, setActivePage, activeColors } = useApp();
  const c = activeColors;

  const modules = getModules(currentSubject, customSubjects);

  const statusColors = {
    'Completed': '#10b981',
    'In Progress': c.primary,
    'Locked': c.textTertiary,
    'default': c.textSecondary,
  };

  const getStatusColor = (status) => {
    if (status.includes('Completed') || status === '100') return statusColors.Completed;
    if (status.includes('Progress') || status.includes('Done') && !status.includes('0%')) return statusColors['In Progress'];
    if (status === 'Locked') return statusColors.Locked;
    return statusColors.default;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bgPrimary }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: c.bgSecondary, borderBottomColor: c.borderLight }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>{currentSubject}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>Course Modules & Chapters</Text>
      </View>

      <View style={styles.moduleList}>
        {modules.map((mod, idx) => {
          const isLocked = mod.status === 'Locked';
          const isActive = mod.class === 'active-unit';
          const isCompleted = mod.progress >= 100;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.moduleCard,
                { backgroundColor: c.bgSecondary, borderColor: c.borderLight },
                isActive && { borderColor: c.primary, borderWidth: 2 },
                isLocked && { opacity: 0.5 }
              ]}
              onPress={() => !isLocked && setActivePage('study')}
              disabled={isLocked}
            >
              <View style={styles.moduleTop}>
                <View style={[
                  styles.moduleNum,
                  { backgroundColor: isCompleted ? '#10b981' : isActive ? c.primary : c.bgTertiary }
                ]}>
                  <Text style={[styles.moduleNumText, { color: isCompleted || isActive ? '#fff' : c.textTertiary }]}>
                    {isCompleted ? '✓' : isLocked ? '🔒' : (idx + 1)}
                  </Text>
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={[styles.moduleNum2, { color: c.textTertiary }]}>{mod.num}</Text>
                  <Text style={[styles.moduleTitle, { color: c.textPrimary }]}>{mod.title}</Text>
                  <Text style={[styles.moduleDesc, { color: c.textSecondary }]}>{mod.desc}</Text>
                </View>
                <Text style={{ fontSize: 20 }}>{mod.icon}</Text>
              </View>

              {!isLocked && (
                <>
                  <View style={[styles.progressBar, { backgroundColor: c.bgTertiary }]}>
                    <View style={[
                      styles.progressFill,
                      { width: `${mod.progress}%`, backgroundColor: isCompleted ? '#10b981' : c.primary }
                    ]} />
                  </View>
                  <View style={styles.moduleBottom}>
                    <Text style={[styles.statusText, { color: getStatusColor(mod.status) }]}>{mod.status}</Text>
                    <Text style={[styles.progressText, { color: c.textTertiary }]}>{mod.progress}%</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: c.primary }]}
        onPress={() => setActivePage('study')}
      >
        <Text style={styles.startBtnText}>Open Study Reader →</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4 },
  moduleList: { padding: 16, gap: 12 },
  moduleCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  moduleTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  moduleNum: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  moduleNumText: { fontSize: 16, fontWeight: '700' },
  moduleInfo: { flex: 1, marginRight: 8 },
  moduleNum2: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  moduleTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  moduleDesc: { fontSize: 12, lineHeight: 16 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  moduleBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  statusText: { fontSize: 12, fontWeight: '700' },
  progressText: { fontSize: 12 },
  startBtn: { marginHorizontal: 16, marginTop: 8, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
