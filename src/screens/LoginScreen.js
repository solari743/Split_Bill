import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api/client';
import Wave from '../components/wavify';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
      <View style={styles.wavesContainer}>
        <View style={styles.wave1}>
          <Wave width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.3} color="rgba(0, 200, 5, 0.08)" />
        </View>
        <View style={styles.wave2}>
          <Wave width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.35} color="rgba(0, 200, 5, 0.12)" />
        </View>
        <View style={styles.wave3}>
          <Wave width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.4} color="rgba(0, 200, 5, 0.15)" />
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="wallet" size={48} color={theme.primary} />
            </View>
            <Text style={styles.title}>Split Bill</Text>
          </View>

          <View style={styles.formContainer}>
            {isSignUp && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor={theme.textTertiary}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Optional phone number"
                      placeholderTextColor={theme.textTertiary}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputContainer, isEmailFocused && styles.inputContainerFocused]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={isEmailFocused ? theme.primary : theme.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, isPasswordFocused && styles.inputContainerFocused]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={isPasswordFocused ? theme.primary : theme.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} activeOpacity={0.8} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.loginButtonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={[styles.socialButton, !googleConfigured && styles.socialButtonDisabled]}
                onPress={() => promptGoogle()}
                disabled={!googleConfigured || !googleRequest || loading}
              >
                <Ionicons name="logo-google" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp((value) => !value)}>
              <Text style={styles.signUpText}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            API: {getApiUrl()}
            {'\n'}
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  wavesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  wave1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 1,
  },
  wave2: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    opacity: 1,
  },
  wave3: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    opacity: 1,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.cardAccentDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: theme.primary,
    backgroundColor: theme.cardDark,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: theme.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    fontSize: 13,
    color: theme.textTertiary,
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 15,
    color: theme.textSecondary,
  },
  signUpText: {
    fontSize: 15,
    color: theme.primary,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: theme.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: theme.primary,
    fontWeight: '500',
  },
});
