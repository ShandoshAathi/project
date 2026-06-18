/**
 * mobile/src/screens/ProfileScreen.js
 * User profile and settings overview for VaaniAI mobile.
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Switch, ActivityIndicator
} from 'react-native';
import { useApp } from '../context/AppContext.js';

const PERSONALITIES = [
  { id: 'Friendly', label: '😊 Friendly', desc: 'Warm and encouraging' },
  { id: 'Professional', label: '💼 Professional', desc: 'Formal and precise' },
  { id: 'Strict', label: '🎓 Strict', desc: 'Focused correction' },
];

export default function ProfileScreen() {
  const {
    currentUser, xp, level, xpProgress, streak,
    settings, updateSettings, coachPersonality, setCoachPersonality,
    handleSaveProfile, logoutUser,
    activeColors
  } = useApp();
  const c = activeColors;

  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [groqKey, setGroqKey] = useState(settings.groqKey || '');

  const saveProfile = async () => {
    setSaving(true);
    try {
      await handleSaveProfile({ full_name: fullName });
      setEditMode(false);
    } catch (err) {
      Alert.alert("Error", "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveApiKey = async () => {
    await updateSettings({ groqKey });
    setShowKeyModal(false);
    Alert.alert("Saved!", "Your Groq API key has been saved.");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bgPrimary }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: c.bgSecondary, borderBottomColor: c.borderLight }]}>
        <View style={[styles.avatar, { backgroundColor: c.primary }]}>
          <Text style={styles.avatarText}>
            {(currentUser?.full_name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        {editMode ? (
          <TextInput
            style={[styles.nameInput, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgTertiary }]}
            value={fullName}
            onChangeText={setFullName}
            autoFocus
          />
        ) : (
          <Text style={[styles.name, { color: c.textPrimary }]}>{currentUser?.full_name || 'Learner'}</Text>
        )}
        <Text style={[styles.email, { color: c.textSecondary }]}>{currentUser?.email || currentUser?.phone || ''}</Text>

        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: c.bgTertiary }]}>
            <Text style={[styles.badgeText, { color: c.primary }]}>✨ Level {level}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: c.bgTertiary }]}>
            <Text style={[styles.badgeText, { color: '#f59e0b' }]}>🔥 {streak} Day Streak</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: c.bgTertiary }]}>
            <Text style={[styles.badgeText, { color: c.textPrimary }]}>{xp.toLocaleString()} XP</Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={[styles.xpBar, { backgroundColor: c.bgTertiary }]}>
          <View style={[styles.xpFill, { width: `${xpProgress}%`, backgroundColor: c.primary }]} />
        </View>
        <Text style={[styles.xpNote, { color: c.textTertiary }]}>{Math.round(xpProgress)}% to Level {level + 1}</Text>

        <View style={styles.profileActions}>
          {editMode ? (
            <>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={saveProfile} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: c.borderLight }]} onPress={() => setEditMode(false)}>
                <Text style={[styles.cancelBtnText, { color: c.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.editBtn, { borderColor: c.primary }]} onPress={() => setEditMode(true)}>
              <Text style={[styles.editBtnText, { color: c.primary }]}>✏️ Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>App Settings</Text>

        {/* Dark Mode */}
        <View style={[styles.settingRow, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
          <View>
            <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Dark Mode</Text>
            <Text style={[styles.settingDesc, { color: c.textSecondary }]}>Switch between light and dark theme</Text>
          </View>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={(val) => updateSettings({ theme: val ? 'dark' : 'light' })}
            trackColor={{ false: c.bgTertiary, true: c.primary }}
            thumbColor="#ffffff"
          />
        </View>

        {/* AI Voice Output */}
        <View style={[styles.settingRow, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
          <View>
            <Text style={[styles.settingLabel, { color: c.textPrimary }]}>AI Voice Output</Text>
            <Text style={[styles.settingDesc, { color: c.textSecondary }]}>Enable text-to-speech responses</Text>
          </View>
          <Switch
            value={settings.aiVoice}
            onValueChange={(val) => updateSettings({ aiVoice: val })}
            trackColor={{ false: c.bgTertiary, true: c.primary }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Font Size */}
        <View style={[styles.settingCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
          <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Text Size</Text>
          <View style={styles.fontRow}>
            {['small', 'medium', 'large'].map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.fontBtn,
                  { backgroundColor: settings.fontSize === size ? c.primary : c.bgTertiary }
                ]}
                onPress={() => updateSettings({ fontSize: size })}
              >
                <Text style={[styles.fontBtnText, { color: settings.fontSize === size ? '#fff' : c.textSecondary }]}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* AI Coach Personality */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>AI Coach Personality</Text>
        {PERSONALITIES.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.personalityCard,
              { backgroundColor: c.bgSecondary, borderColor: c.borderLight },
              coachPersonality === p.id && { borderColor: c.primary, borderWidth: 2 }
            ]}
            onPress={() => { setCoachPersonality(p.id); updateSettings({ aiPersonality: p.id }); }}
          >
            <Text style={[styles.personalityLabel, { color: c.textPrimary }]}>{p.label}</Text>
            <Text style={[styles.personalityDesc, { color: c.textSecondary }]}>{p.desc}</Text>
            {coachPersonality === p.id && (
              <View style={[styles.activeTag, { backgroundColor: c.primary }]}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* API Keys */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>API Keys</Text>
        <TouchableOpacity
          style={[styles.apiKeyCard, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}
          onPress={() => setShowKeyModal(true)}
        >
          <Text style={{ fontSize: 24, marginBottom: 8 }}>🔑</Text>
          <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Groq API Key</Text>
          <Text style={[styles.settingDesc, { color: c.textSecondary }]}>
            {settings.groqKey ? `••••••••${settings.groqKey.slice(-4)}` : 'Not set — tap to configure'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: '#ef4444' }]}
        onPress={() => {
          Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logoutUser }
          ]);
        }}
      >
        <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />

      {/* API Key Modal */}
      <Modal visible={showKeyModal} animationType="slide" transparent onRequestClose={() => setShowKeyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.bgSecondary }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary }]}>🔑 Set Groq API Key</Text>
            <Text style={[styles.settingDesc, { color: c.textSecondary, marginBottom: 16 }]}>
              Get your free API key from console.groq.com
            </Text>
            <TextInput
              style={[styles.nameInput, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgTertiary }]}
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
              placeholderTextColor={c.textTertiary}
              value={groqKey}
              onChangeText={setGroqKey}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: c.borderLight }]} onPress={() => setShowKeyModal(false)}>
                <Text style={[styles.cancelBtnText, { color: c.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={saveApiKey}>
                <Text style={styles.saveBtnText}>Save Key</Text>
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
  profileHeader: { padding: 24, alignItems: 'center', borderBottomWidth: 1 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 6 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  email: { fontSize: 13, marginBottom: 12 },
  nameInput: { height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16, marginBottom: 12, width: '100%' },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  xpBar: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden', marginBottom: 4 },
  xpFill: { height: '100%', borderRadius: 3 },
  xpNote: { fontSize: 11, marginBottom: 16 },
  profileActions: { flexDirection: 'row', gap: 10, width: '100%' },
  editBtn: { flex: 1, height: 44, borderRadius: 22, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  editBtnText: { fontSize: 14, fontWeight: '700' },
  saveBtn: { flex: 1, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cancelBtn: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  section: { padding: 16, paddingBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  settingCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  settingLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  settingDesc: { fontSize: 12, lineHeight: 16 },
  fontRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  fontBtn: { flex: 1, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  fontBtnText: { fontSize: 13, fontWeight: '600' },
  personalityCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  personalityLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  personalityDesc: { fontSize: 12 },
  activeTag: { position: 'absolute', top: 12, right: 12, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  activeTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  apiKeyCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 10, alignItems: 'center' },
  logoutBtn: { marginHorizontal: 16, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  logoutBtnText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
});
