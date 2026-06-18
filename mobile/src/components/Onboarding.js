/**
 * mobile/src/components/Onboarding.js
 * Onboarding form overlay to complete user profiles.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useApp } from '../context/AppContext.js';

const LANGUAGES = ['Tamil', 'Hindi', 'Malayalam', 'Telugu', 'Kannada', 'Spanish', 'French', 'Other'];
const GOALS = [
  'Improve Fluency',
  'Pass an Exam (IELTS/TOEFL)',
  'Business Communication',
  'Daily Conversation',
  'Public Speaking',
  'Other'
];

export default function Onboarding({ onComplete }) {
  const { currentUser, handleSaveProfile, activeColors } = useApp();
  const [formData, setFormData] = useState({
    name: currentUser?.full_name || '',
    occupation: '',
    age: '',
    language: 'Tamil',
    goal: 'Improve Fluency'
  });

  const [activePicker, setActivePicker] = useState(null); // 'language' or 'goal' or null

  const handleFinish = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }

    const profileData = {
      full_name: formData.name,
      occupation: formData.occupation,
      age: formData.age ? parseInt(formData.age) : null,
      native_language: formData.language,
      learning_goal: formData.goal,
      updated_at: new Date().toISOString()
    };

    try {
      await handleSaveProfile(profileData);
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to save profile:", err);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const renderPickerModal = () => {
    const isLang = activePicker === 'language';
    const list = isLang ? LANGUAGES : GOALS;
    const title = isLang ? 'Select Native Language' : 'Select Learning Goal';
    
    return (
      <Modal
        visible={!!activePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActivePicker(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActivePicker(null)}
        >
          <View style={[styles.modalCard, { backgroundColor: activeColors.bgSecondary }]}>
            <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>{title}</Text>
            <ScrollView style={styles.modalScroll}>
              {list.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.modalItem,
                    (isLang ? formData.language : formData.goal) === item && { backgroundColor: activeColors.bgTertiary }
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, [isLang ? 'language' : 'goal']: item }));
                    setActivePicker(null);
                  }}
                >
                  <Text style={[
                    styles.modalItemText, 
                    { color: activeColors.textPrimary },
                    (isLang ? formData.language : formData.goal) === item && { color: activeColors.primary, fontWeight: '700' }
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(15, 23, 42, 0.85)' }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: activeColors.bgSecondary, borderColor: activeColors.borderLight }]}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: activeColors.primary }]}>
              <Text style={styles.logoText}>V</Text>
            </View>
            <Text style={[styles.title, { color: activeColors.textPrimary }]}>Complete Your Profile</Text>
            <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>Help us personalize your learning journey</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: activeColors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { color: activeColors.textPrimary, borderColor: activeColors.borderLight, backgroundColor: activeColors.bgTertiary }]}
              placeholder="e.g. Shandosh Aathi"
              placeholderTextColor={activeColors.textTertiary}
              value={formData.name}
              onChangeText={(txt) => setFormData(prev => ({ ...prev, name: txt }))}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
              <Text style={[styles.label, { color: activeColors.textSecondary }]}>Study / Job</Text>
              <TextInput
                style={[styles.input, { color: activeColors.textPrimary, borderColor: activeColors.borderLight, backgroundColor: activeColors.bgTertiary }]}
                placeholder="Software Developer"
                placeholderTextColor={activeColors.textTertiary}
                value={formData.occupation}
                onChangeText={(txt) => setFormData(prev => ({ ...prev, occupation: txt }))}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: activeColors.textSecondary }]}>Age</Text>
              <TextInput
                style={[styles.input, { color: activeColors.textPrimary, borderColor: activeColors.borderLight, backgroundColor: activeColors.bgTertiary }]}
                placeholder="20"
                placeholderTextColor={activeColors.textTertiary}
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(txt) => setFormData(prev => ({ ...prev, age: txt }))}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: activeColors.textSecondary }]}>Native Language</Text>
            <TouchableOpacity
              style={[styles.selectBtn, { borderColor: activeColors.borderLight, backgroundColor: activeColors.bgTertiary }]}
              onPress={() => setActivePicker('language')}
            >
              <Text style={[styles.selectText, { color: activeColors.textPrimary }]}>{formData.language}</Text>
              <Text style={{ color: activeColors.primary, fontSize: 16 }}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: activeColors.textSecondary }]}>Learning Goal</Text>
            <TouchableOpacity
              style={[styles.selectBtn, { borderColor: activeColors.borderLight, backgroundColor: activeColors.bgTertiary }]}
              onPress={() => setActivePicker('goal')}
            >
              <Text style={[styles.selectText, { color: activeColors.textPrimary }]}>{formData.goal}</Text>
              <Text style={{ color: activeColors.primary, fontSize: 16 }}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: activeColors.primary }]}
            onPress={handleFinish}
          >
            <Text style={styles.btnText}>Finish Setup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderPickerModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9000,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    width: Dimensions.get('window').width,
  },
  card: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  selectBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  btn: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Modal Select list styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
