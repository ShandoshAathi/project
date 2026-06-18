/**
 * mobile/src/screens/AuthScreen.js
 * Sign-in / Sign-up screen for VaaniAI mobile.
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext.js';

const COUNTRY_CODES = [
  { label: '🇮🇳 +91', value: '+91' },
  { label: '🇺🇸 +1',  value: '+1'  },
  { label: '🇬🇧 +44', value: '+44' },
  { label: '🇦🇺 +61', value: '+61' },
  { label: '🇦🇪 +971',value: '+971'},
];

export default function AuthScreen() {
  const { setCurrentUser, setActivePage, activeColors } = useApp();
  const [authType, setAuthType] = useState('email'); // 'email' or 'phone'
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkOnboarding = async (user) => {
    const profile = await AsyncStorage.getItem('vaaniai_simulated_profile');
    if (profile) {
      setActivePage('dashboard');
    } else {
      setActivePage('onboarding');
    }
  };

  const handleEmailAction = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      const user = { id: 'sim-email-1', email, full_name: 'Email Learner' };
      setCurrentUser(user);
      if (!isSignUp) {
        await AsyncStorage.setItem('vaaniai_simulated_profile', JSON.stringify({ full_name: 'Email Learner', learning_goal: 'Improve Fluency' }));
      }
      setLoading(false);
      checkOnboarding(user);
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(async () => {
      const user = { id: 'sim-1', email: 'user@gmail.com', full_name: 'Google User' };
      setCurrentUser(user);
      await AsyncStorage.setItem('vaaniai_simulated_profile', JSON.stringify({ full_name: 'Google User', learning_goal: 'Improve Fluency' }));
      setLoading(false);
      checkOnboarding(user);
    }, 1000);
  };

  const handleSendOTP = () => {
    if (!phone || phone.length < 5) {
      Alert.alert('Required', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Required', 'Please enter a 6-digit code.');
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      if (otp === '123456') {
        const user = { id: 'sim-2', phone: countryCode + phone, full_name: 'Mobile Learner' };
        setCurrentUser(user);
        await AsyncStorage.setItem('vaaniai_simulated_profile', JSON.stringify({ full_name: 'Mobile Learner', learning_goal: 'Daily Conversation' }));
        checkOnboarding(user);
      } else {
        Alert.alert('Invalid Code', "For simulation, use '123456'.");
      }
    }, 1000);
  };

  const c = activeColors;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.bgPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: c.primary }]}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <Text style={[styles.title, { color: c.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>Sign in to continue your learning journey</Text>
        </View>

        {/* Social Login */}
        <TouchableOpacity style={[styles.googleBtn, { borderColor: c.borderLight, backgroundColor: c.bgSecondary }]} onPress={handleGoogleLogin} disabled={loading}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>G</Text>
          <Text style={[styles.socialBtnText, { color: c.textPrimary }]}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: c.borderLight }]} />
          <Text style={[styles.dividerText, { color: c.textTertiary }]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: c.borderLight }]} />
        </View>

        {/* Toggle Email / Phone */}
        <View style={[styles.toggle, { backgroundColor: c.bgTertiary }]}>
          {['email', 'phone'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.toggleBtn, authType === type && { backgroundColor: c.bgSecondary, shadowColor: c.primary, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 }]}
              onPress={() => { setAuthType(type); setOtpSent(false); }}
            >
              <Text style={[styles.toggleBtnText, { color: authType === type ? c.primary : c.textSecondary, fontWeight: authType === type ? '700' : '500' }]}>
                {type === 'email' ? '✉ Email' : '📱 Mobile'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Email Form */}
        {authType === 'email' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgSecondary }]}
                placeholder="you@example.com"
                placeholderTextColor={c.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
              <TextInput
                style={[styles.input, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgSecondary }]}
                placeholder="••••••••"
                placeholderTextColor={c.textTertiary}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: c.primary }]} onPress={handleEmailAction} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switchBtn}>
              <Text style={[styles.switchText, { color: c.textSecondary }]}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={{ color: c.primary, fontWeight: '700' }}>{isSignUp ? 'Log In' : 'Sign Up'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phone Form */}
        {authType === 'phone' && !otpSent && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Mobile Number</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity style={[styles.codeBtn, { backgroundColor: c.bgSecondary, borderColor: c.borderLight }]}>
                  <Text style={{ color: c.textPrimary, fontSize: 14 }}>{countryCode}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, styles.phoneInput, { color: c.textPrimary, borderColor: c.borderLight, backgroundColor: c.bgSecondary }]}
                  placeholder="98765 43210"
                  placeholderTextColor={c.textTertiary}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: c.primary }]} onPress={handleSendOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>📱 Send Verification Code</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* OTP Form */}
        {authType === 'phone' && otpSent && (
          <View style={styles.form}>
            <Text style={[styles.subtitle, { color: c.textSecondary, textAlign: 'center', marginBottom: 12 }]}>
              We sent a 6-digit code to your phone. (Simulation: use 123456)
            </Text>
            <TextInput
              style={[styles.otpInput, { color: c.textPrimary, borderColor: c.primary, backgroundColor: c.bgSecondary }]}
              placeholder="123456"
              placeholderTextColor={c.textTertiary}
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity style={[styles.btn, { backgroundColor: c.primary }]} onPress={handleVerifyOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.switchBtn}>
              <Text style={[styles.switchText, { color: c.primary }]}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 8 },
  logoText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  socialBtnText: { fontSize: 15, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13, fontWeight: '600' },
  toggle: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  toggleBtnText: { fontSize: 14 },
  form: { gap: 0 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 14 },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  codeBtn: { height: 48, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, justifyContent: 'center', marginRight: 8 },
  phoneInput: { flex: 1 },
  otpInput: { height: 64, borderRadius: 16, borderWidth: 2, fontSize: 28, letterSpacing: 10, marginBottom: 16 },
  btn: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 14, textAlign: 'center' },
});
