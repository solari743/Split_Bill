import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api/client';
import { Field, PrimaryButton, SecondaryButton } from '../components/FinanceUI';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const { login, register, loginWithGoogle } = useAuth();
  const styles = createStyles(theme);

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const googleConfigured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  const [googleRequest, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'not-configured',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    const runGoogleLogin = async () => {
      if (googleResponse?.type === 'success' && googleResponse.params?.id_token) {
        try {
          setLoading(true);
          await loginWithGoogle(googleResponse.params.id_token);
        } catch (error) {
          Alert.alert('Google sign-in failed', error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    runGoogleLogin();
  }, [googleResponse]);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Email required', 'Enter an email address to continue.');
      return;
    }
    if (isSignUp && password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters for the demo account password.');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await register({ email: trimmedEmail, password, name, phone });
      } else {
        await login(trimmedEmail, password);
      }
    } catch (error) {
      Alert.alert(isSignUp ? 'Sign up failed' : 'Sign in failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="receipt-outline" size={30} color="#000" />
            </View>
            <Text style={styles.title}>Split Bill</Text>
            <Text style={styles.subtitle}>Scan receipts, split totals, and track every open tab.</Text>
          </View>

          <View style={styles.formCard}>
            {isSignUp && (
              <>
                <Field
                  icon="person-outline"
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  focused={focused === 'name'}
                  autoCapitalize="words"
                  placeholder="Your name"
                  containerStyle={styles.fieldSpacing}
                />
                <Field
                  icon="call-outline"
                  label="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                  focused={focused === 'phone'}
                  keyboardType="phone-pad"
                  placeholder="Optional"
                  containerStyle={styles.fieldSpacing}
                />
              </>
            )}

            <Field
              icon="mail-outline"
              label="Email"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              focused={focused === 'email'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@example.com"
              containerStyle={styles.fieldSpacing}
            />

            <View style={styles.fieldSpacing}>
              <Field
                icon="lock-closed-outline"
                label="Password"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                focused={focused === 'password'}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="8+ characters"
              />
              <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword((value) => !value)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            <PrimaryButton
              label={isSignUp ? 'Create account' : 'Sign in'}
              icon={isSignUp ? 'person-add-outline' : 'log-in-outline'}
              loading={loading}
              onPress={handleSubmit}
              style={styles.submitButton}
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <SecondaryButton
              label={googleConfigured ? 'Continue with Google' : 'Google not configured'}
              icon="logo-google"
              onPress={() => promptGoogle()}
              disabled={!googleConfigured || !googleRequest || loading}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</Text>
            <TouchableOpacity onPress={() => setIsSignUp((value) => !value)}>
              <Text style={styles.switchLink}>{isSignUp ? 'Sign in' : 'Sign up'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.debugText}>API: {getApiUrl()}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32 },
  header: { marginBottom: 28 },
  logoContainer: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 36, fontWeight: '800', color: theme.text },
  subtitle: { color: theme.textSecondary, fontSize: 16, lineHeight: 22, marginTop: 8, maxWidth: 360 },
  formCard: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 16,
  },
  fieldSpacing: { marginBottom: 16 },
  passwordToggle: { position: 'absolute', right: 14, bottom: 15, padding: 4 },
  submitButton: { marginTop: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divider: { flex: 1, height: 1, backgroundColor: theme.divider },
  dividerText: { color: theme.textTertiary, marginHorizontal: 12, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 6 },
  switchText: { color: theme.textSecondary },
  switchLink: { color: theme.primary, fontWeight: '800' },
  debugText: { color: theme.textTertiary, textAlign: 'center', fontSize: 11, marginTop: 18 },
});
